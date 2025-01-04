import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { WithdrawalMessage } from './withdrawal-message.model';
import { Transform } from 'src/utils/transform';
import { handleApplicationError } from 'src/utils/handle-application-error.util';
import { Request } from 'express';

@Injectable()
export class WithdrawalMessageService {
  constructor(
    @InjectModel(WithdrawalMessage.name)
    private readonly withdrawalMessageModel: Model<WithdrawalMessage>,
  ) {}

  public async create(
    user_id: mongoose.Types.ObjectId,
    message: string,
    amount: number,
  ) {
    try {
      if (!user_id || !message || !amount) {
        throw new BadRequestException(
          "The 'user_id', 'message' and 'amount' fields are required",
        );
      }

      if (!mongoose.isValidObjectId(user_id)) {
        throw new BadRequestException('Invalid user_id provided');
      }

      const withdrawalMessageExists = await this.withdrawalMessageModel.findOne(
        {
          user_id: new mongoose.Types.ObjectId(user_id),
        },
      );

      if (withdrawalMessageExists) {
        withdrawalMessageExists.message = message;
        withdrawalMessageExists.amount = amount;
        await withdrawalMessageExists.save();
        return {
          success: true,
          message: 'Withdrawal message updated successfully',
          data: withdrawalMessageExists,
        };
      }

      const withdrawalMessage = await this.withdrawalMessageModel.create({
        user_id: new mongoose.Types.ObjectId(user_id),
        message,
        amount,
      });
      return {
        success: true,
        message: 'Withdrawal message added successfully',
        data: withdrawalMessage,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async get(user_id: mongoose.Types.ObjectId) {
    try {
      if (!user_id) {
        throw new BadRequestException("The 'user_id' field is required");
      }

      if (!mongoose.isValidObjectId(user_id)) {
        throw new BadRequestException('Invalid user_id provided');
      }

      const withdrawalMessage = await this.withdrawalMessageModel
        .findOne({
          user_id: new mongoose.Types.ObjectId(user_id),
        })
        .populate('user_id');

      if (!withdrawalMessage) {
        throw new NotFoundException('No withdrawal message found for the user');
      }

      const transformedWithdrawalMessage = Transform.data(withdrawalMessage, [
        ['user_id', 'user'],
      ]);

      return {
        success: true,
        message: 'Withdrawal message retrieved successfully',
        data: transformedWithdrawalMessage,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async getForUser(req: Request) {
    try {
      const user_id = req.user._id;

      const withdrawalMessage = await this.withdrawalMessageModel
        .findOne({
          user_id: new mongoose.Types.ObjectId(user_id),
        })
        .populate('user_id');

      if (!withdrawalMessage) {
        throw new NotFoundException('No KYC set for you yet');
      }

      const transformedWithdrawalMessage = Transform.data(withdrawalMessage, [
        ['user_id', 'user'],
      ]);

      return {
        success: true,
        message: 'Withdrawal message retrieved successfully',
        data: transformedWithdrawalMessage,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async delete(user_id: mongoose.Types.ObjectId) {
    try {
      if (!user_id) {
        throw new BadRequestException("The 'user_id' field is required");
      }

      if (!mongoose.isValidObjectId(user_id)) {
        throw new BadRequestException('Invalid user_id provided');
      }

      const withdrawalMessage =
        await this.withdrawalMessageModel.findOneAndDelete({
          user_id,
        });

      if (!withdrawalMessage) {
        return {
          success: false,
          message: 'No withdrawal message found for the user_id provided',
          data: null,
        };
      }

      return {
        success: true,
        message: 'Withdrawal message deleted successfully',
        data: withdrawalMessage,
      };
    } catch (error) {
      handleApplicationError(error);
    }
  }
}
