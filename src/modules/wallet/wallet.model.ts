import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User } from '../user/user.model';

@Schema({ timestamps: true })
export class Wallet {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, default: 0 })
  balance: number;

  @Prop({ required: true, ref: User.name })
  user_id: mongoose.Types.ObjectId;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);
