import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Referral } from './referral.model';
import { Model } from 'mongoose';
import { handleApplicationError } from 'src/utils/handle-application-error.util';

@Injectable()
export class ReferralService {
  constructor(
    @InjectModel(Referral.name) private readonly referralModel: Model<Referral>,
  ) {}

  public async get() {
    try {
      const referrals = await this.referralModel
        .find()
        .sort({ createdAt: -1 })
        .exec();
      return {
        success: true,
        message: 'All referrals',
        data: referrals,
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }
}
