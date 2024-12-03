import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateGatewayDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  wallet_address: string;

  @IsNumber()
  charge: number;

  @IsNumber()
  conversion_rate: number;
}
