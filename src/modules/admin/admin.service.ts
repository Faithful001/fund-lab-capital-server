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
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import JWT from 'src/utils/jwt.util';
import { JwtPayload } from 'jsonwebtoken';
import { Transaction } from '../transaction/transaction.model';
import { Referral } from '../referral/referral.model';
import { Investment } from '../investment/investment.model';
import { User } from '../user/user.model';

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

  private generateToken(payload: string) {
    const token = JWT.createToken({ id: payload });
    return token;
  }

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

      const token = this.generateToken(newAdmin.id);

      return {
        success: true,
        message: 'Admin created successfully',
        data: { admin: restAdmin, token },
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

      const user = await this.adminModel.findOne({ email }).exec();

      if (!user) {
        throw new UnauthorizedException('Incorrect credentials provided');
      }

      const comparedPassword = await bcrypt.compare(password, user.password);

      if (!comparedPassword) {
        throw new UnauthorizedException('Incorrect credentials provided');
      }

      const { password: _, ...restUser } = user.toObject();

      const token = this.generateToken(user.id);

      return {
        success: true,
        message: 'Login successful',
        data: { admin: restUser, token },
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
      const { id } = JWT.verifyToken(token) as JwtPayload;
      const user = await this.adminModel.findById(id).exec();
      if (!user) {
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
