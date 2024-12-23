import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
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
import { Transaction } from '../transaction/transaction.model';
config();

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(Referral.name) private readonly referralModel: Model<Referral>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
  ) {}

  private generateToken(payload: string | mongoose.Types.ObjectId) {
    const token = JWT.createToken({ id: payload });
    return token;
  }

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
      const token = this.generateToken(newUser._id);

      const { password, ...userWithoutPassword } = newUser.toObject();
      const transformedUser = Transform.data(userWithoutPassword, [
        ['plan_id', 'plan'],
      ]);

      return {
        success: true,
        message: 'User registered successfully',
        data: { user: transformedUser, token },
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

      const token = this.generateToken(user._id);

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

  public async verifyToken(token: string) {
    try {
      if (!token) {
        throw new BadRequestException('Token is required');
      }
      const { id } = JWT.verifyToken(token) as JwtPayload;
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      return {
        success: true,
        message: 'User is authorized',
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
      }
      users = await this.userModel.find();
      return {
        success: true,
        message: 'All users retrieved',
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
