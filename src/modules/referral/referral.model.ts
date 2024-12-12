import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../user/user.model';

@Schema({ timestamps: true })
export class Referral {
  @Prop({ required: false })
  referral_code: string;

  //   @Prop({ required: true, ref: User.name })
  //   referrer_user_id: mongoose.Types.ObjectId;

  @Prop({ required: true, ref: User.name })
  referred_user_id: mongoose.Types.ObjectId;
}

export const ReferralSchema = SchemaFactory.createForClass(Referral);
