import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

class ImageDto {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  alt_text?: string;

  @IsOptional()
  @IsString()
  thumbnail?: string;

  @IsOptional()
  @IsString()
  public_id?: string;
}

enum TypeEnum {
  Deposit = 'deposit',
  Withdrawal = 'withdrawal',
  ReferralBonus = 'referral-bonus',
  Investment = 'investment',
  FirstTradingBonus = 'first-trading-bonus',
}

enum StatusEnum {
  Pending = 'pending',
  Approved = 'approved',
  Declined = 'declined',
}

export class CreateTransactionDto {
  @IsNotEmpty()
  image: ImageDto;

  @IsNotEmpty()
  @IsString()
  @IsEnum(TypeEnum, { message: 'Invalid type provided' })
  type: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsOptional()
  @IsNumber()
  fee: number;

  @IsString()
  @IsNotEmpty()
  user_id: string;

  @IsString()
  @IsNotEmpty()
  wallet_id: string;

  @IsString()
  @IsOptional()
  gateway_id: string;

  @IsString()
  @IsOptional()
  user_wallet_address: string;

  @IsOptional()
  @IsString()
  @IsEnum(StatusEnum, { message: 'Invalid status provided' })
  status: string;
}
