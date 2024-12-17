import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

enum ReturnType {
  Lifetime = 'lifetime',
}

enum ProfitWithdraw {
  Anytime = 'anytime',
}

export class CreatePlanDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  min_deposit: number;

  @IsNumber()
  @IsNotEmpty()
  max_deposit: number;

  @IsNumber()
  @IsNotEmpty()
  roi: number;

  @IsNumber()
  @IsNotEmpty()
  roi_duration: number;

  @IsString()
  @IsNotEmpty()
  @IsEnum(ReturnType, { message: 'return_type must be "lifetime"' })
  return_type: string;

  @IsString()
  @IsNotEmpty()
  @IsEnum(ProfitWithdraw, {
    message: 'profit_withdraw must be "anytime"',
  })
  profit_withdraw: string;
}
