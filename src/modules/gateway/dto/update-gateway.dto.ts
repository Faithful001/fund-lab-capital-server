// import { PartialType } from '@nestjs/mapped-types';
// import { CreateGatewayDto } from './create-gateway.dto';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateGatewayDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  wallet_address: string;

  // @IsNotEmpty()
  // image: ImageDto;

  @IsString()
  @IsOptional()
  charge: string;

  @IsString()
  @IsOptional()
  conversion_rate: string;
}
