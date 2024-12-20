import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet } from './wallet.model';
import { Model } from 'mongoose';
import { handleApplicationError } from 'src/utils/handle-application-error.util';
import { UserRequestService } from 'src/contexts/services/user-request.service';
import { Gateway } from '../gateway/gateway.model';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { Transaction } from '../transaction/transaction.model';
import { Request } from 'express';
import { OtpService } from '../otp/otp.service';
import { User } from '../user/user.model';
import { Otp } from '../otp/otp.model';
import * as bcrypt from 'bcrypt';
import { sendEmail } from 'src/services/send-email.service';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(Gateway.name) private gatewayModel: Model<Gateway>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Otp.name) private otpModel: Model<Otp>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly userRequest: UserRequestService,
    private readonly otpService: OtpService,
  ) {}

  public async get(id?: string) {
    try {
      if (id) {
        const wallet = await this.walletModel.findById(id).exec();
        if (!wallet) {
          throw new NotFoundException(`Wallet with id ${id} not found`);
        }
        return {
          success: true,
          message: 'Wallet retrieved',
          data: wallet,
        };
      }
      const wallets = await this.walletModel.find().sort({ createdAt: -1 });
      if (!wallets) {
        throw new NotFoundException(`Wallet with id ${id} not found`);
      }
      return {
        success: true,
        message: 'Wallets retrieved',
        data: wallets,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async getByName(req: Request, name: string) {
    try {
      if (!name) {
        throw new BadRequestException(`Parameter required`);
      }
      // const user = this.userRequest.getUser();
      const user_id = req?.user.id;

      const wallet = await this.walletModel.findOne({ name, user_id }).exec();
      if (!wallet) {
        throw new NotFoundException('Wallet with this name does not exist');
      }
      return {
        success: true,
        message: 'Wallet retrieved',
        data: wallet,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async delete(id: string) {
    try {
      if (!id) {
        throw new BadRequestException(`Wallet id is required`);
      }
      const wallet = await this.walletModel.findByIdAndDelete(id).exec();
      if (!wallet) {
        throw new NotFoundException(`Wallet with id ${id} not found`);
      }
      return {
        success: true,
        message: 'Wallet deleted',
        data: null,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async deposit(
    req: Request,
    file: Express.Multer.File,
    amount: string,
    gateway_name: string,
    fee?: number,
  ) {
    try {
      if (!amount || !gateway_name) {
        throw new BadRequestException('All fields are required');
      }
      const { originalname, buffer } = file;

      const user_id = req.user.id;

      const gateway = await this.gatewayModel
        .findOne({ name: gateway_name })
        .exec();

      if (!gateway) {
        throw new NotFoundException(
          `Gateway with name ${gateway_name} not found`,
        );
      }

      const wallet = await this.walletModel.findOne({ name: 'MAIN', user_id });

      if (!wallet) {
        throw new NotFoundException(`Wallet for this user not found`);
      }

      const imageName = originalname.includes('.')
        ? originalname.split('.')[0]
        : originalname;

      const { url, alt_text, public_id } =
        await this.cloudinaryService.uploadStream(imageName, buffer);

      this.transactionModel.create({
        amount: Number(amount),
        fee,
        type: 'deposit',
        user_id,
        gateway_id: gateway.id,
        image: {
          url,
          alt_text,
          public_id,
        },
        wallet_id: wallet.id,
      });

      return {
        success: true,
        message: 'Deposit successful',
        data: null,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async requestWithdrawalOtp(req: Request) {
    try {
      const user_id = req.user.id;

      const user = await this.userModel.findById(user_id);
      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      const { otpDoc: _, stringifiedOtp } =
        await this.otpService.createOrUpdate(req, 'withdrawal');

      await sendEmail(
        user.email,
        'Withdrawal Otp',
        `Your Otp for withdrawal is: ${stringifiedOtp}. \n Your Otp expires in 5 minutes.`,
      );

      const fiveMinutes = 300000;
      setTimeout(() => {
        this.otpService.delete(req, 'withdrawal');
      }, fiveMinutes);

      return {
        success: true,
        message: `Otp sent to ${user.email}`,
        data: null,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async verifyWithdrawalOtp(req: Request, otp: string) {
    try {
      if (!otp) {
        throw new BadRequestException('An otp is required');
      }
      const user_id = req.user.id;

      const otpDoc = await this.otpModel
        .findOne({
          user_id,
          purpose: 'withdrawal',
        })
        .exec();

      if (!otpDoc) {
        throw new NotFoundException('Invalid otp provided');
      }

      const comparedOtp = await bcrypt.compare(otp, otpDoc.otp);

      if (!comparedOtp) {
        throw new BadRequestException('Invalid otp provided');
      }

      return {
        success: true,
        message: 'Otp verified successfully',
        data: null,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async withdraw(
    req: Request,
    otp: string,
    amount: number,
    gateway_name: string,
    wallet_name: string,
    user_wallet_address: string,
    password: string,
  ) {
    try {
      if (
        !otp ||
        !amount ||
        !gateway_name ||
        !wallet_name ||
        !user_wallet_address ||
        !password
      ) {
        throw new BadRequestException('All fields are required');
      }

      if (amount <= 0) {
        throw new BadRequestException('Amount must be a positive integer');
      }

      const user_id = req.user.id;

      const otpDoc = await this.otpModel.findOne({
        user_id,
        purpose: 'withdrawal',
      });

      if (!otpDoc) {
        throw new NotFoundException('Invalid otp provided');
      }

      const comparedOtp = await bcrypt.compare(otp, otpDoc.otp);

      if (!comparedOtp) {
        throw new NotFoundException('Invalid otp provided');
      }

      const gateway = await this.gatewayModel
        .findOne({ name: gateway_name })
        .exec();

      if (!gateway) {
        throw new NotFoundException(
          `Gateway with name ${wallet_name} not found`,
        );
      }

      const wallet = await this.walletModel
        .findOne({ name: wallet_name })
        .exec();

      if (!wallet) {
        throw new NotFoundException(
          `Wallet with name ${wallet_name} not found`,
        );
      }

      if (amount > wallet.balance) {
        throw new BadRequestException('Insufficient balance');
      }

      if (amount < 10 || amount > 30000) {
        throw new BadRequestException(
          'Amount should be greater than $10 and less than $30,000',
        );
      }

      const userDoc = await this.userModel.findById(user_id);

      if (!userDoc) {
        throw new UnauthorizedException('User not found');
      }

      const comparedPassword = await bcrypt.compare(password, userDoc.password);

      if (!comparedPassword) {
        await this.otpService.delete(req, 'withdrawal');
        throw new UnauthorizedException('Invalid password provided');
      }

      wallet.balance -= amount;
      await wallet.save();

      await this.transactionModel.create({
        amount,
        type: 'withdrawal',
        user_id,
        gateway_id: gateway._id,
        user_wallet_address,
        wallet_id: wallet.id,
      });

      await this.otpService.delete(req, 'withdrawal');

      return {
        success: true,
        message: 'Withdrawal successful',
        data: wallet,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  /**
   *Admin endpoint to add to or subtract from a user's wallet balance
   * @param operation - "add" |"subtract"
   * @param amount - number
   * @param user_id - string
   * @param wallet_id - string
   *
   */
  public async updateWalletBalance(
    operation: 'add' | 'subtract',
    amount: number,
    user_id: string,
    wallet_name: string,
  ) {
    try {
      if (!operation || !user_id || !amount || !wallet_name) {
        throw new BadRequestException('All fields are required');
      }

      if (amount <= 0) {
        throw new BadRequestException('Amount must be greater than zero');
      }

      const user = await this.userModel.findById(user_id).exec();
      if (!user) {
        throw new NotFoundException('User with this ID does not exist');
      }
      const wallet = await this.walletModel
        .findOne({ name: wallet_name, user_id })
        .exec();
      if (!wallet) {
        throw new NotFoundException('Wallet with does not exist');
      }

      switch (operation) {
        case 'add':
          wallet.balance += amount;
          break;
        case 'subtract':
          if (wallet.balance < amount) {
            throw new BadRequestException(
              'Insufficient wallet balance for subtraction',
            );
          }
          wallet.balance -= amount;
          break;
        default:
          throw new BadRequestException('Invalid operation provided');
      }

      await wallet.save();

      return {
        success: true,
        message: 'Wallet balance updated',
        data: wallet,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }
}
