import { HttpException, HttpStatus } from '@nestjs/common';

export class BusinessException extends HttpException {
  constructor(
    message: string,
    errors: unknown[] = [],
    statusCode = HttpStatus.BAD_REQUEST,
  ) {
    super(
      {
        success: false,
        statusCode,
        message,
        errors,
      },
      statusCode,
    );
  }
}
