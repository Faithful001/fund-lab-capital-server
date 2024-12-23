import { Injectable, UseGuards } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Referral } from './referral.model';
import { Model } from 'mongoose';
import { handleApplicationError } from 'src/utils/handle-application-error.util';
import { Request } from 'express';
import { Transform } from 'src/utils/transform';

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(Referral.name) private readonly referralModel: Model<Referral>,
  ) {}

  public async get(req: Request) {
    try {
      const user_id = req.user._id;
      const referrals = await this.referralModel
        .find({ user_id })
        .sort({ createdAt: -1 })
        .populate('referred_user_id', 'first_name last_name user_name')
        .exec();

      const transformedReferrals = Transform.data(referrals, [
        ['referred_user_id', 'referred_user'],
      ]);
      return {
        success: true,
        message: 'All referrals',
        data: transformedReferrals,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  public async getAll() {
    try {
      const referrals = await this.referralModel
        .find()
        .sort({ createdAt: -1 })
        .exec();

      return {
        success: true,
        message: 'All referrals retrieved',
        data: referrals,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }
}
