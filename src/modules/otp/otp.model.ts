import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import mongoose, { Document } from 'mongoose';
import { User } from '../user/user.model';

export enum PurposeEnum {
  ForgotPassword = 'forgot-password',
  Withdrawal = 'withdrawal',
}

export enum StatusEnum {
  Active = 'active',
  Used = 'used',
}

@Schema({ timestamps: true })
export class Otp {
  @Prop({ required: true, type: String })
  otp: string;

  @Prop({ required: true, enum: PurposeEnum, type: String })
  @IsEnum(PurposeEnum, { message: 'Invalid purpose provided' })
  purpose: PurposeEnum;

  @Prop({
    required: true,
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    unique: true,
  })
  user_id: mongoose.Types.ObjectId;

  @Prop({
    required: false,
    default: StatusEnum.Active,
    enum: StatusEnum,
    type: String,
  })
  @IsEnum(StatusEnum, { message: 'Invalid status provided' })
  status: StatusEnum;
}

export type OtpDocument = Otp & Document;

export const OtpSchema = SchemaFactory.createForClass(Otp);
