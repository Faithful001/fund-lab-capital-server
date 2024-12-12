import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  full_name: string;

  @Prop({ required: true, unique: true })
  user_name: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ required: true })
  phone_number: string;

  @Prop({ required: true })
  country: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  referral_code: string;

  @Prop({ required: true, default: 'USER' })
  @IsEnum(['USER', 'ADMIN'])
  role: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
