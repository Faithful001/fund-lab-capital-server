import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, mongo } from 'mongoose';
import { User } from './user.model';
import * as bcrypt from 'bcrypt';
import { handleApplicationError } from 'src/utils/handle-application-error.util';
import * as validator from 'validator';
import JWT from 'src/utils/jwt.util';
import { config } from 'dotenv';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtPayload } from 'jsonwebtoken';
import { Wallet } from '../wallet/wallet.model';
import { Referral } from '../referral/referral.model';
import { Generate } from 'src/utils/generate';
import { Transform } from 'src/utils/transform';
import { Transaction, TypeEnum } from '../transaction/transaction.model';
import { sendBulkEmails, sendEmail } from 'src/services/send-email.service';
import { Token } from 'src/enums/token.enum';
import { OtpService } from '../otp/otp.service';
import { Request } from 'express';
import { Otp } from '../otp/otp.model';
import { UpdateUserDto } from './dto/update-user.dto';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { KycDocument } from 'src/kyc-document/kyc-document.model';
import { Gateway } from '../gateway/gateway.model';
config();

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(Referral.name) private readonly referralModel: Model<Referral>,
    @InjectModel(Gateway.name) private readonly gatewayModel: Model<Gateway>,
    @InjectModel(Otp.name) private readonly otpModel: Model<Otp>,
    @InjectModel(KycDocument.name)
    private readonly kycDocumentModel: Model<KycDocument>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    private readonly otpService: OtpService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  // private generateToken(payload: string | mongoose.Types.ObjectId) {
  //   const token = JWT.createToken({ id: payload });
  //   return token;
  // }

  public async register(
    createUserDto: CreateUserDto,
    referrer_referral_code?: string,
  ) {
    try {
      // Check if the email already exists
      const userExists = await this.userModel.exists({
        email: createUserDto.email,
      });
      if (userExists) {
        throw new ConflictException('Email already in use');
      }

      // Validate phone number length
      if (createUserDto.phone_number.length > 19) {
        throw new BadRequestException('Incorrect phone number provided');
      }

      // Validate password strength
      if (!validator.isStrongPassword(createUserDto.password)) {
        throw new BadRequestException(
          'Password must contain at least one lowercase and uppercase letter, a number, and a symbol',
        );
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(
        createUserDto.password.trim(),
        10,
      );

      // Trim all string fields in the DTO
      Object.keys(createUserDto).forEach((key) => {
        if (typeof createUserDto[key] === 'string') {
          createUserDto[key] = createUserDto[key].trim();
        }
      });

      // Generate a referral code
      const generatedReferralCode = Generate.randomString('alphanumeric', 6);

      // Create a new user instance
      const newUser = new this.userModel({
        ...createUserDto,
        email: createUserDto.email.toLowerCase(),
        referral_code: generatedReferralCode,
        password: hashedPassword,
      });

      // Handle referrer referral code logic
      if (referrer_referral_code) {
        const referrer = await this.userModel.findOne({
          referral_code: referrer_referral_code,
        });
        if (!referrer) {
          throw new NotFoundException('Invalid referral code');
        }

        await this.referralModel.create({
          user_id: referrer._id,
          referred_user_id: newUser._id,
        });

        await this.transactionModel.create({
          user_id: referrer._id,
          amount: 5,
          type: 'referral-bonus',
        });
      }

      // Save the user to the database
      await newUser.save();

      await newUser.populate('plan_id', 'name');

      await this.walletModel.insertMany([
        { user_id: newUser._id, name: 'MAIN' },
        { user_id: newUser._id, name: 'PROFIT', balance: 10 },
      ]);

      // Generate a token
      // const token = this.generateToken(newUser._id);
      // const { otpDoc: _, stringifiedOtp } =
      //   await this.otpService.createOrUpdate(
      //     newUser._id,
      //     'account-verification',
      //   );

      // await sendEmail({
      //   email: newUser.email,
      //   subject: 'Account verification OTP',
      //   message: `Your Otp for verification is: ${stringifiedOtp}. \n Your Otp expires in 5 minutes.`,
      // });

      // const fiveMinutes = 300000;
      // setTimeout(() => {
      //   this.otpService.delete(newUser._id, 'account-verification');
      // }, fiveMinutes);

      const { password, ...userWithoutPassword } = newUser.toObject();
      // const transformedUser = Transform.data(userWithoutPassword, [
      //   ['plan_id', 'plan'],
      // ]);

      return {
        success: true,
        message: 'User registered successfully',
        data: { user_id: userWithoutPassword._id },
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async payForAccountVerification(
    req: Request,
    files: { kyc: Express.Multer.File; transaction: Express.Multer.File },
    amount: number,
    gateway: string,
  ) {
    try {
      const user_id = req.user._id;

      // Validate amount
      if (!amount || !gateway) {
        throw new BadRequestException(
          'The amount and gateway fields are required',
        );
      }

      // Validate files
      if (!files.kyc || !files.transaction) {
        throw new BadRequestException(
          'Both KYC document and payment proof document are required',
        );
      }

      if (!mongoose.isValidObjectId(user_id)) {
        throw new BadRequestException('Invalid user_id provided');
      }

      // Fetch user
      const user = await this.userModel.findById(user_id).exec();
      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      const gatewayDoc = await this.gatewayModel.findOne({ name: gateway });
      if (!gatewayDoc) {
        throw new NotFoundException('Gateway does not exist');
      }

      // Helper function to handle file upload
      const uploadFile = async (
        file: Express.Multer.File,
        fileType: string,
      ) => {
        const { originalname, buffer } = file;
        const imageName = originalname?.includes('.')
          ? originalname.split('.')?.[0]
          : originalname;

        const { url, alt_text, public_id } =
          await this.cloudinaryService.uploadStream(
            `${fileType}-${imageName}`, // Prefix to distinguish file types
            buffer,
          );

        return { url, alt_text, public_id };
      };

      // Upload KYC document
      const kycUploadResult = await uploadFile(files.kyc, 'kyc');
      await this.kycDocumentModel.create({
        image: kycUploadResult,
        user_id: user._id,
      });

      // Upload transaction proof
      const transactionUploadResult = await uploadFile(
        files.transaction,
        'transaction',
      );
      await this.transactionModel.create({
        image: transactionUploadResult,
        gateway_id: gatewayDoc._id,
        type: TypeEnum.AccountVerification,
        amount,
        user_id: user._id,
      });

      return {
        success: true,
        message: 'Payment successful. We are processing your KYC',
        data: null,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async verifyAccount(otp: string, user_id: mongoose.Types.ObjectId) {
    try {
      if (!otp || !user_id) {
        throw new BadRequestException(
          'The otp and user_id fields are required',
        );
      }

      if (!mongoose.isValidObjectId(user_id)) {
        throw new BadRequestException('Invalid user_id provided');
      }

      const user = await this.userModel.findById(user_id);
      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      const otpDoc = await this.otpModel.findOne({
        // otp,
        user_id,
        purpose: 'account-verification',
      });
      const comparedOtp = await bcrypt.compare(otp, otpDoc.otp);

      if (!otpDoc) {
        throw new UnauthorizedException('Incorrect otp provided');
      }

      if (!comparedOtp) {
        throw new UnauthorizedException('Incorrect otp provided');
      }

      user.verified = true;
      await user.save();

      return {
        success: true,
        message: 'User verified successfully',
        data: null,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async login(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new BadRequestException('All fields are required');
      }

      // Find user by email and populate `plan_id`
      const user = await this.userModel
        .findOne({ email })
        .populate('plan_id', 'name')
        .exec();

      if (!user) {
        throw new BadRequestException('Invalid email or password');
      }

      const isPasswordCorrect = await bcrypt.compare(password, user.password);
      if (!isPasswordCorrect) {
        throw new BadRequestException('Invalid email or password');
      }

      const token = Generate.token({
        _id: user._id,
        purpose: Token.AUTHORIZATION,
      });

      const { password: _, ...userWithoutPassword } = user.toObject();
      const transformedUser = Transform.data(userWithoutPassword, [
        ['plan_id', 'plan'],
      ]);

      return {
        success: true,
        message: 'User logged in successfully',
        data: { user: transformedUser, token },
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async getUser(req: Request) {
    try {
      const user_id = req.user._id;

      const user = await this.userModel.findById(user_id);
      return {
        success: true,
        message: 'User retrieved',
        data: user,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }
  public async updateUser(req: Request, updateUserDto: UpdateUserDto) {
    try {
      const user_id = req.user._id;

      const user = await this.userModel.findOneAndUpdate(
        { _id: user_id },
        { ...updateUserDto },
        { new: true },
      );
      return {
        success: true,
        message: 'User updated successfully',
        data: user,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async verifyToken(token: string) {
    try {
      if (!token) {
        throw new BadRequestException('Token is required');
      }
      const { _id, purpose } = JWT.verifyToken(token) as JwtPayload;

      if (purpose !== Token.AUTHORIZATION) {
        throw new UnauthorizedException('Invalid token provided');
      }
      const user = await this.userModel.findById(_id).exec();
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      // if (!user.verified) {
      //   throw new ForbiddenException('User is not verified');
      // }
      return {
        success: true,
        message: 'User is authorized',
        data: null,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async sendEmail(emails: string[], subject: string, message: string) {
    try {
      if (!emails || !subject || !message) {
        throw new BadRequestException(
          'The emails, subject and message fields is required',
        );
      }

      if (!Array.isArray(emails)) {
        throw new BadRequestException('Email should be a string array');
      }

      await sendBulkEmails({
        emails,
        subject,
        message,
      });

      return {
        success: true,
        message: 'Email sent successfully',
        data: null,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  /*
   * Admin endpoint to find all user
   */
  public async findUsers(amount?: number) {
    try {
      let users: any;

      if (amount) {
        users = await this.userModel.find().limit(amount).exec();
      } else {
        users = await this.userModel.find();
      }

      return {
        success: true,
        message: 'Users retrieved successfully',
        data: users,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  /*
   * Admin endpoint to get the total of all documents
   */
  public async getTotalUsers() {
    try {
      const users = await this.userModel.find();
      return {
        success: true,
        message: 'All users retrieved',
        data: users,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }
}
