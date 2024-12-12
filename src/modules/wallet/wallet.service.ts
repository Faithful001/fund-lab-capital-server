import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet } from './wallet.model';
import { Model } from 'mongoose';
import { handleApplicationError } from 'src/utils/handle-application-error.util';
import { UserRequestService } from 'src/contexts/services/user-request.service';
import { Gateway } from '../gateway/gateway.model';
import { CloudinaryService } from 'src/contexts/services/cloudinary.service';
import { Transaction } from '../transaction/transaction.model';
import { Request } from 'express';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<Wallet>,
    @InjectModel(Gateway.name) private gatewayModel: Model<Gateway>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly userRequest: UserRequestService,
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
        ? originalname.split('.')[0] // Ensure the name is split correctly
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

  public async withdraw(
    req: Request,
    amount: number,
    wallet_name: string,
    user_wallet_address: string,
    otp?: string,
  ) {
    try {
      if (!amount || !wallet_name) {
        throw new BadRequestException('All fields are required');
      }

      const user_id = req.user.id;

      const wallet = await this.walletModel
        .findOne({ name: wallet_name })
        .exec();

      if (!wallet) {
        throw new NotFoundException(
          `Wallet with name ${wallet_name} not found`,
        );
      }

      this.transactionModel.create({
        amount,
        type: 'deposit',
        user_id,
        user_wallet_address,
        wallet_id: wallet.id,
      });

      return {
        success: true,
        message: 'Withdrawal successful',
        data: wallet,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }
}
