import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsPhoneNumber,
  Length,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  user_name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsPhoneNumber(null, { message: 'Invalid phone number' })
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  country: string;
}
