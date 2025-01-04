import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';
import mongoose, { Document } from 'mongoose';
import { User } from '../user/user.model';

export enum PurposeEnum {
  ResetPassword = 'reset-password',
  Withdrawal = 'withdrawal',
  AccountVerification = 'account-verification',
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
    type: mongoose.Types.ObjectId,
    ref: User.name,
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

// Add a compound unique index to enforce one OTP per user and purpose
OtpSchema.index({ user_id: 1, purpose: 1 }, { unique: true });
