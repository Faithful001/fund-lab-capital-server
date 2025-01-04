import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { handleApplicationError } from 'src/utils/handle-application-error.util';
import { InjectModel } from '@nestjs/mongoose';
import { Admin } from './admin.model';
import mongoose, { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import JWT from 'src/utils/jwt.util';
import { JwtPayload } from 'jsonwebtoken';
import { Transaction } from '../transaction/transaction.model';
import { Referral } from '../referral/referral.model';
import { Investment } from '../investment/investment.model';
import { User } from '../user/user.model';
import { Generate } from 'src/utils/generate';
import { Token } from 'src/enums/token.enum';
import { sendBulkEmails } from 'src/services/send-email.service';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(Admin.name) private readonly adminModel: Model<Admin>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(Referral.name) private readonly referralModel: Model<Referral>,
    @InjectModel(Investment.name)
    private readonly investmentModel: Model<Investment>,
  ) {}

  // private generateToken(payload: string | mongoose.Types.ObjectId) {
  //   const token = JWT.createToken({ _id: payload });
  //   return token;
  // }

  async register(createAdminDto: CreateAdminDto) {
    try {
      const { first_name, last_name, user_name, email, password } =
        createAdminDto;

      const emailExists = await this.adminModel.findOne({ email });
      if (emailExists) {
        throw new ConflictException('Admin with this email already exists');
      }
      const usernameExists = await this.adminModel.findOne({ user_name });
      if (usernameExists) {
        throw new ConflictException('Admin with this user name already exists');
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newAdmin = new this.adminModel({
        first_name,
        last_name,
        user_name,
        email,
        password: hashedPassword,
      });

      const { password: _, ...restAdmin } = newAdmin.toObject();

      await newAdmin.save();

      // const token = this.generateToken(newAdmin._id);
      // const token = Generate.token({
      //   _id: newAdmin._id,
      //   purpose: Token.AUTHORIZATION,
      // });

      return {
        success: true,
        message: 'Admin created successfully',
        data: { admin: restAdmin },
      };
    } catch (error) {
      handleApplicationError(error);
    }
  }

  async login(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new BadRequestException('Email and password are required');
      }

      const admin = await this.adminModel.findOne({ email }).exec();

      if (!admin) {
        throw new UnauthorizedException('Incorrect credentials provided');
      }

      const comparedPassword = await bcrypt.compare(password, admin.password);

      if (!comparedPassword) {
        throw new UnauthorizedException('Incorrect credentials provided');
      }

      const { password: _, ...restUser } = admin.toObject();

      // const token = this.generateToken(user._id);
      const token = Generate.token({
        _id: admin._id,
        purpose: Token.AUTHORIZATION,
      });

      return {
        success: true,
        message: 'Login successful',
        data: { admin: restUser, token },
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  async verifyUser(user_id: mongoose.Types.ObjectId) {
    try {
      if (!user_id) {
        throw new BadRequestException('User ID is required');
      }

      const user = await this.userModel
        .findById(new mongoose.Types.ObjectId(user_id))
        .exec();
      if (!user) {
        throw new BadRequestException('User not found');
      }

      user.verified = true;
      user.paid_for_verification = true;
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

  async verifyToken(token: string) {
    try {
      if (!token) {
        throw new BadRequestException('Token is required');
      }
      const { _id } = JWT.verifyToken(token) as JwtPayload;
      const admin = await this.adminModel.findById(_id).exec();
      if (!admin) {
        throw new UnauthorizedException('Invalid token');
      }
      return {
        success: true,
        message: 'Admin is authorized',
        data: null,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async getTotalDocuments(
    module?: 'users' | 'deposits' | 'withdrawals' | 'referrals' | 'investments',
  ) {
    try {
      const validModules = [
        'users',
        'deposits',
        'withdrawals',
        'referrals',
        'investments',
      ];
      if (module && !validModules.includes(module)) {
        throw new BadRequestException('Invalid module provided');
      }

      if (module) {
        let count: number;

        switch (module) {
          case 'users':
            count = await this.userModel.countDocuments().exec();
            return { success: true, message: 'Total users', data: count };

          case 'deposits':
            count = await this.transactionModel
              .countDocuments({ type: 'deposit' })
              .exec();
            return { success: true, message: 'Total deposits', data: count };

          case 'withdrawals':
            count = await this.transactionModel
              .countDocuments({ type: 'withdrawal' })
              .exec();
            return { success: true, message: 'Total withdrawals', data: count };

          case 'referrals':
            count = await this.referralModel.countDocuments().exec();
            return { success: true, message: 'Total referrals', data: count };

          case 'investments':
            count = await this.investmentModel.countDocuments().exec();
            return { success: true, message: 'Total investments', data: count };
        }
      }

      const [users, deposits, withdrawals, referrals, investments] =
        await Promise.all([
          this.userModel.countDocuments().exec(),
          this.transactionModel.countDocuments({ type: 'deposit' }).exec(),
          this.transactionModel.countDocuments({ type: 'withdrawal' }).exec(),
          this.referralModel.countDocuments().exec(),
          this.investmentModel.countDocuments().exec(),
        ]);

      return {
        success: true,
        message: 'Total counts',
        data: { users, deposits, withdrawals, referrals, investments },
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }
}
