import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../user/user.model';

@Schema({ timestamps: true })
export class WithdrawalMessage {
  @Prop({ type: String, required: true })
  message: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: mongoose.Types.ObjectId, required: true, ref: User.name })
  user_id: mongoose.Types.ObjectId;
}

export const WithdrawalMessageSchema =
  SchemaFactory.createForClass(WithdrawalMessage);
