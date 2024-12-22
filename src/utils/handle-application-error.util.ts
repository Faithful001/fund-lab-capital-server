import {
  BadRequestException,
  ConflictException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

export function handleApplicationError(error: any): never {
  // Handle Mongoose validation errors
  // if (error.name === 'ValidationError') {
  //   const messages = Object.values(error.errors).map((err: any) => err.message);
  //   throw new BadRequestException({
  //     success: false,
  //     message: 'Validation failed',
  //     error: messages,
  //     // statusCode: HttpStatus.BAD_REQUEST,
  //     // errors: messages,
  //   });
  // }

  // // Handle duplicate key errors (MongoDB unique constraint violations)
  // if (error.code === 11000) {
  //   const field = Object.keys(error.keyValue)[0];
  //   throw new ConflictException({
  //     success: false,
  //     message: `Duplicate value for field: ${field}`,
  //     error: 'Conflict',
  //     // statusCode: HttpStatus.CONFLICT,
  //   });
  // }

  // Handle known exceptions and customize response
  switch (true) {
    case error instanceof BadRequestException:
      throw new BadRequestException({
        success: false,
        message: error?.message,
        error: 'Bad Request Error',
        // statusCode: HttpStatus.BAD_REQUEST,
      });
    case error instanceof NotFoundException:
      throw new NotFoundException({
        success: false,
        message: error?.message,
        error: 'Not Found Error',
        // statusCode: HttpStatus.NOT_FOUND,
      });
    case error instanceof ConflictException:
      throw new ConflictException({
        success: false,
        message: error?.message,
        error: 'Conflict Error',
        // statusCode: HttpStatus.CONFLICT,
      });
    case error instanceof UnauthorizedException:
      throw new UnauthorizedException({
        success: false,
        message: error?.message,
        error: 'Unauthorized Error',
        // statusCode: HttpStatus.UNAUTHORIZED,
      });
    default:
      throw new InternalServerErrorException({
        success: false,
        message: error?.message,
        error: 'An unexpected error occurred',
        // statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      });
  }
}
