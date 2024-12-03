import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

interface ResponseParams {
  message?: string | string[];
  data?: any;
}

@Injectable()
export class ResponseUtil {
  private static defaultMessages: { [key: number]: string } = {
    [HttpStatus.INTERNAL_SERVER_ERROR]: 'An error occurred.',
    [HttpStatus.BAD_REQUEST]: 'Bad request.',
    [HttpStatus.UNAUTHORIZED]: 'Unauthorized.',
    [HttpStatus.NOT_FOUND]: 'Resource not found.',
    [HttpStatus.CONFLICT]: 'Conflict.',
    [HttpStatus.OK]: 'Request successful.',
    [HttpStatus.CREATED]: 'Resource created successfully.',
  };

  private static createResponse(
    success: boolean,
    message: string | string[],
    data: any,
    statusCode: HttpStatus,
  ) {
    if (success) {
      return {
        success: true,
        message: message || this.defaultMessages[statusCode] || 'Success',
        data,
      };
    } else {
      return {
        success: false,
        error: message || this.defaultMessages[statusCode] || 'Error',
        data: null,
      };
    }
  }

  public static OK({ message, data }: ResponseParams) {
    return this.createResponse(true, message, data, HttpStatus.OK);
  }
  public static CREATED({ message, data }: ResponseParams) {
    return this.createResponse(true, message, data, HttpStatus.CREATED);
  }

  public static CUSTOM_ERROR(
    message: string | string[],
    statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ) {
    throw new HttpException(
      this.createResponse(false, message, null, statusCode),
      statusCode,
    );
  }

  public static BAD_REQUEST(message?: string | string[]) {
    return this.CUSTOM_ERROR(message, HttpStatus.BAD_REQUEST);
  }

  public static NOT_FOUND(message?: string | string[]) {
    return this.CUSTOM_ERROR(message, HttpStatus.NOT_FOUND);
  }

  public static UNAUTHORIZED(message?: string | string[]) {
    return this.CUSTOM_ERROR(message, HttpStatus.UNAUTHORIZED);
  }

  public static CONFLICT(message?: string | string[]) {
    return this.CUSTOM_ERROR(message, HttpStatus.CONFLICT);
  }

  public static INTERNAL_SERVER_ERROR(message?: string | string[]) {
    return this.CUSTOM_ERROR(message, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}
