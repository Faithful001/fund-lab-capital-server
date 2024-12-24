import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import mongoose from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  user_name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  phone_number: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  referral_code: string;

  @Prop({ required: false, default: null, type: mongoose.Types.ObjectId })
  plan_id: mongoose.Types.ObjectId;

  @Prop({ required: true, default: 'USER' })
  @IsEnum(['USER', 'ADMIN'])
  role: string;

  @Prop({ required: false, default: false, type: Boolean })
  verified: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
