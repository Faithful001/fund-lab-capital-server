import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

// class ImageDto {
//   @IsNotEmpty()
//   @IsString()
//   url: string;

//   @IsOptional()
//   @IsString()
//   alt_text?: string;

//   @IsOptional()
//   @IsString()
//   thumbnail?: string;

//   @IsOptional()
//   @IsString()
//   public_id?: string;
// }

export class CreateGatewayDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
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
