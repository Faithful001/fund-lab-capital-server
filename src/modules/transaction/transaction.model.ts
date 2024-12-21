import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import mongoose, { Document } from 'mongoose';
import { User } from '../user/user.model';
import { Wallet } from '../wallet/wallet.model';
import { Gateway } from '../gateway/gateway.model';

class Image {
  @Prop({ type: String, required: false, default: null })
  url: string;

  @Prop({ type: String, required: false, default: null })
  alt_text: string;

  @Prop({ type: String, required: false, default: null })
  thumbnail: string;

  @Prop({ type: String, required: false, default: null })
  public_id: string;
}

enum TypeEnum {
  Deposit = 'deposit',
  Withdrawal = 'withdrawal',
  ReferralBonus = 'referral-bonus',
  InvestmentBonus = 'investment-bonus',
}

enum StatusEnum {
  Pending = 'pending',
  Approved = 'approved',
  Declined = 'declined',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Image, default: null })
  image: Image;

  @Prop({ required: true })
  @IsEnum(TypeEnum, { message: 'Invalid type provided' })
  type: string;

  @Prop({ required: true, type: Number })
  amount: number;

  @Prop({ required: false, default: 0, type: Number })
  fee: number;

  @Prop({ required: true, ref: User.name })
  user_id: mongoose.Types.ObjectId;

  @Prop({ required: false, ref: Wallet.name, default: null })
  wallet_id: mongoose.Types.ObjectId;

  @Prop({ required: false, ref: Gateway.name, default: null })
  gateway_id: mongoose.Types.ObjectId;

  @Prop({ required: false, default: null })
  user_wallet_address: string;

  @Prop({ required: false, default: 'pending' })
  @IsEnum(StatusEnum, { message: 'Invalid status provided' })
  status: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
