import {
  BadRequestException,
  ConflictException,
  HttpCode,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './user.model';
import * as bcrypt from 'bcrypt';
import { handleApplicationError } from 'src/utils/handle-application-error.util';
import * as validator from 'validator';
import { JWT } from 'src/utils/jwt.util';
import { config } from 'dotenv';
import { CreateUserDto } from './dto/create-user.dto';
config();

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  private generateToken(payload: string) {
    const token = new JWT(process.env.JWT_SEC).createToken(payload);
    return token;
  }

  @HttpCode(HttpStatus.CREATED)
  public async register(createUserDto: CreateUserDto) {
    try {
      // const someFieldsAreNotPopulated = Object.values(createUserDto).some(
      //   (value) => !value,
      // );
      // if (someFieldsAreNotPopulated) {
      //   throw new BadRequestException('All fields are required');
      // }

      const userExists = await this.userModel.findOne({
        email: createUserDto.email,
      });
      if (userExists) {
        throw new ConflictException('Email already in use');
      }

      if (createUserDto.email.length > 19) {
        throw new BadRequestException('Incorrect phone number provided');
      }
      const strongPassword = validator.isStrongPassword(createUserDto.email);

      if (!strongPassword) {
        throw new BadRequestException(
          'Password must contain atleast lowercase and uppercase alphabets, a number, and a symbol',
        );
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

      for (const key in createUserDto) {
        if (typeof createUserDto[key] === 'string') {
          createUserDto[key] = createUserDto[key].trim();
        }
      }

      // Create a new user
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
      });

      const token = this.generateToken(newUser.id);

      // Save user to the database
      await newUser.save();

      const { password: userPassword, ...userWithoutPassword } =
        newUser.toObject();

      return {
        success: true,
        message: 'User registered successfully',
        data: { user: userWithoutPassword, token },
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }

  @HttpCode(HttpStatus.OK)
  public async login(email: string, password: string) {
    try {
      if (!email || !password) {
        throw new BadRequestException('All fields are required');
      }
      const user = await this.userModel.findOne({ email, password }).exec();
      if (!user) {
        throw new BadRequestException('Invalid email or password');
      }

      const token = this.generateToken(user.id);

      return {
        success: true,
        message: 'User logged in successfully',
        data: { user, token },
      };
    } catch (error: any) {
      handleApplicationError(error);
    }
  }
}
