import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateGatewayDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  wallet_address: string;

  @IsNumber()
  @IsOptional()
  charge: number;

  @IsNumber()
  @IsOptional()
  conversion_rate: number;
}
