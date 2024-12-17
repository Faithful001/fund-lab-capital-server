import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { handleApplicationError } from 'src/utils/handle-application-error.util';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Transaction } from './transaction.model';
import { CloudinaryService } from 'src/contexts/services/cloudinary.service';
import { UserRequestService } from 'src/contexts/services/user-request.service';
import { Request } from 'express';
import { Transform } from 'src/utils/transform';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<Transaction>,
    private readonly userRequest: UserRequestService,
  ) {}

  async findAll(req: Request) {
    try {
      const user_id = req?.user.id;
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
      const user_id = req.user.id;
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
      const user_id = req.user.id;

      const transactionTypes = [
        'deposit',
        'withdrawal',
        'referral-bonus',
        'first-investment-bonus',
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
        message: 'Transactions retrieved successfully',
        data: transformedTransactions,
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
