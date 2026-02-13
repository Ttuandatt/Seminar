import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorResponse: Record<string, unknown> = {
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
        };

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'object' && res !== null) {
                const obj = res as Record<string, unknown>;
                errorResponse = {
                    code: this.getErrorCode(status),
                    message: obj.message || exception.message,
                    ...(obj.details ? { details: obj.details } : {}),
                };
            } else {
                errorResponse = {
                    code: this.getErrorCode(status),
                    message: String(res),
                };
            }
        }

        response.status(status).json({ error: errorResponse });
    }

    private getErrorCode(status: number): string {
        const codeMap: Record<number, string> = {
            400: 'VALIDATION_ERROR',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            429: 'RATE_LIMITED',
        };
        return codeMap[status] || 'INTERNAL_ERROR';
    }
}
