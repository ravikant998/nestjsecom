import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Response } from 'express';
import { map, Observable } from 'rxjs';
import type { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class ResponseTransformInterceptor<T> implements NestInterceptor<
  T,
  ApiResponse
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiResponse> {
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      map((data) => {
        const body = data as Record<string, unknown> | null;
        const hasPagination = body && 'pagination' in body && 'data' in body;

        const result: ApiResponse = {
          status: response.statusCode,
          message: (body?.message as string) ?? 'Request completed successfully',
          data: hasPagination ? body.data : (data ?? null),
        };

        if (hasPagination) {
          result.pagination = body.pagination as ApiResponse['pagination'];
        }

        if (body?.meta) {
          result.meta = body.meta as Record<string, unknown>;
        }

        return result;
      }),
    );
  }
}
