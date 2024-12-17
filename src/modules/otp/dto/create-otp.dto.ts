import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { PurposeEnum, StatusEnum } from '../otp.model';

export class CreateOtpDto {
  @IsNotEmpty()
  @IsString()
  otp: string;

  @IsEnum(PurposeEnum, { message: 'Invalid purpose provided' })
  @IsString()
  purpose: string;

  @IsOptional()
  @IsEnum(StatusEnum, { message: 'Invalid status provided' })
  status: string;
}
