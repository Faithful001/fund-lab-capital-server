import { Type } from 'class-transformer';
import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

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

export class CreateInvestmentDto {
  // @ValidateNested()
  // @Type(() => ImageDto)
  // @IsNotEmpty()
  // image: ImageDto;

  @IsNotEmpty()
  @IsString()
  amount: string;

  @IsNotEmpty()
  @IsString()
  plan: string;

  @IsNotEmpty()
  @IsString()
  gateway: string;

  @IsOptional()
  @IsString()
  wallet: string;
}
