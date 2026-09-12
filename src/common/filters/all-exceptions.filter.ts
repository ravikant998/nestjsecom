import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';
import type { ApiResponse } from '../interfaces/api-response.interface';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Something went wrong. Please try again later';
    let errors: unknown[] = [];

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        message = payload;
      } else {
        const body = payload as Record<string, unknown>;
        const rawMessage = body.message;
        message = Array.isArray(rawMessage)
          ? ((rawMessage[0] as string) ?? message)
          : ((rawMessage as string) ?? message);
        const rawErrors = body.errors;
        errors = Array.isArray(rawErrors)
          ? rawErrors
          : Array.isArray(rawMessage)
            ? rawMessage
            : [];
      }
    } else if (exception instanceof Error) {
      message =
        process.env.NODE_ENV === 'production'
          ? 'Something went wrong. Please try again later'
          : exception.message;
    }

    const body: ApiResponse & { errors: unknown[] } = {
      status: statusCode,
      message,
      data: null,
      errors,
    };

    response.status(statusCode).json(body);
  }
}
