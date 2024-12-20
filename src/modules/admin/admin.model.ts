import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEnum } from 'class-validator';

enum RoleEnum {
  Admin = 'ADMIN',
  User = 'USER',
}

@Schema({ timestamps: true })
export class Admin {
  @Prop({ required: true })
  first_name: string;

  @Prop({ required: true })
  last_name: string;

  @Prop({ required: true, unique: true })
  user_name: string;

  @Prop({ required: true, type: String, unique: true })
  email: string;

  @Prop({ required: true, type: String })
  password: string;

  @Prop({ required: false, default: 'ADMIN' })
  @IsEnum(RoleEnum, { message: 'Invalid role provided' })
  role?: string;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);
