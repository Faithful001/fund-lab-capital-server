import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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
config();

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
    @InjectModel(Referral.name) private readonly referralModel: Model<Referral>,
  ) {}

  private generateToken(payload: string) {
    const token = JWT.createToken({ userId: payload });
    return token;
  }

  public async register(
    createUserDto: CreateUserDto,
    referrer_referral_code?: string,
  ) {
    try {
      const userExists = await this.userModel.findOne({
        email: createUserDto.email,
      });
      if (userExists) {
        throw new ConflictException('Email already in use');
      }

      if (createUserDto.phone_number.length > 19) {
        throw new BadRequestException('Incorrect phone number provided');
      }
      const strongPassword = validator.isStrongPassword(createUserDto.password);

      if (!strongPassword) {
        throw new BadRequestException(
          'Password must contain atleast lowercase and uppercase alphabets, a number, and a symbol',
        );
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      for (const key in createUserDto) {
        if (typeof createUserDto[key] === 'string') {
          createUserDto[key] = createUserDto[key].trim();
        }
      }

      const generatedReferralCode = Generate.randomString('alphanumeric', 6);

      // Create a new user
      const newUser = new this.userModel({
        ...createUserDto,
        referral_code: generatedReferralCode,
        password: hashedPassword,
      });

      if (referrer_referral_code) {
        const referrer = await this.userModel.findOne({
          referral_code: referrer_referral_code,
        });
        if (!referrer) {
          throw new NotFoundException('Referrer user not found');
        }
        await this.referralModel.create({
          referral_code: referrer_referral_code,
          referred_user_id: newUser.id,
        });
      }

      const token = this.generateToken(newUser.id);

      // Save user to the database
      await newUser.save();

      await this.walletModel.create({
        user_id: newUser.id,
        name: 'MAIN',
      });

      await this.walletModel.create({
        user_id: newUser.id,
        name: 'PROFIT',
      });

      const { password: userPassword, ...userWithoutPassword } =
        newUser.toObject();

      return {
        success: true,
        message: 'User registered successfully',
        data: { user: userWithoutPassword, token },
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
      const user = await this.userModel.findOne({ email }).exec();

      const passwordIsCorrect = await bcrypt.compare(password, user.password);

      if (!user || !passwordIsCorrect) {
        throw new BadRequestException('Invalid email or password');
      }

      const token = this.generateToken(user.id);

      const { password: _, ...restUserObject } = user.toObject();

      return {
        success: true,
        message: 'User logged in successfully',
        data: { user: restUserObject, token },
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
      const { userId } = JWT.verifyToken(token) as JwtPayload;
      const user = await this.userModel.findById(userId).exec();
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
}
