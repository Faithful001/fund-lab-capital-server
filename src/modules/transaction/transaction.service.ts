import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { handleApplicationError } from 'src/utils/handle-application-error.util';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Transaction } from './transaction.model';
import { CloudinaryService } from 'src/services/cloudinary.service';
import { UserRequestService } from 'src/contexts/services/user-request.service';
import { Request } from 'express';
import { Transform } from 'src/utils/transform';
import { Wallet } from '../wallet/wallet.model';

enum StatusEnum {
  Pending = 'pending',
  Approved = 'approved',
  Declined = 'declined',
}

enum TypeEnum {
  Deposit = 'deposit',
  Withdrawal = 'withdrawal',
  ReferralBonus = 'referral-bonus',
  Investment = 'investment',
  FirstTradingBonus = 'first-trading-bonus',
}

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
  ) {}

  async findAll(req: Request) {
    try {
      const user_id = req?.user._id;
      const transactions = await this.transactionModel
        .find({ user_id })
        .sort({ createdAt: -1 })
        .exec();

      return {
        success: true,
        message: 'All transactions retrieved',
        data: transactions,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  async findOne(req: Request, id: string) {
    try {
      const user_id = req.user._id;
      const transaction = await this.transactionModel
        .findOne({ id, user_id })
        .exec();

      return {
        success: true,
        message: 'Transaction retrieved',
        data: transaction,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  async findByType(
    req: Request,
    type: string,
    status?: 'pending' | 'approved' | 'declined',
  ) {
    try {
      const user_id = req.user._id;

      const transactionTypes = [
        'deposit',
        'withdrawal',
        'referral-bonus',
        'investment',
      ];

      if (!transactionTypes.includes(type)) {
        throw new BadRequestException('Invalid type provided');
      }

      const query: Record<string, any> = { type, user_id };
      if (status) {
        query.status = status;
      }

      const transactions = await this.transactionModel
        .find(query)
        .populate('gateway_id', 'name')
        .sort({ createdAt: -1 })
        .exec();

      const transformedTransactions = Transform.data(transactions, [
        ['gateway_id', 'gateway'],
      ]);

      return {
        success: true,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} transactions retrieved successfully`,
        data: transformedTransactions,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  async updateStatus(
    id: string,
    status: StatusEnum,
    user_id: mongoose.Types.ObjectId,
    transaction_type: TypeEnum,
  ) {
    try {
      if (!id || !status) {
        throw new BadRequestException(
          'The id route param and status query param are required',
        );
      }

      if (!mongoose.isValidObjectId(id)) {
        throw new BadRequestException('Invalid transaction id provided');
      }

      if (!Object.values(StatusEnum).includes(status)) {
        throw new BadRequestException('Invalid status provided');
      }

      const transaction = await this.transactionModel.findById(id);

      const wallet = await this.walletModel.findOne({ user_id, name: 'MAIN' });

      if (transaction.status !== StatusEnum.Pending) {
        throw new BadRequestException(
          'Only pending transactions can be changed in status',
        );
      }

      if (status === StatusEnum.Approved) {
        transaction.status = StatusEnum.Approved;
        await transaction.save();

        switch (transaction_type) {
          case TypeEnum.Deposit:
          case TypeEnum.Investment:
          case TypeEnum.FirstTradingBonus:
          case TypeEnum.ReferralBonus:
            transaction.amount += wallet.balance;
            break;
          case TypeEnum.Withdrawal:
            // transaction.amount -= wallet.balance
            break;
          default:
            throw new BadRequestException('Invalid status provided');
        }
      } else if (status === StatusEnum.Declined) {
        transaction.status = StatusEnum.Declined;
        await transaction.save();
      }

      return {
        success: true,
        message: `${status.charAt(0) + status.slice(1)} transaction updated successfully`,
        data: transaction,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  async remove(id: string) {
    try {
      const deletedTransaction = await this.transactionModel.deleteOne({ id });
      return {
        success: true,
        message: 'Transaction deleted',
        data: deletedTransaction,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }
}
