import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let errorResponse: Record<string, unknown> = {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            code: 'INTERNAL_ERROR',
            message: 'Internal server error',
        };

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();

            if (typeof res === 'object' && res !== null) {
                const obj = res as Record<string, unknown>;
                errorResponse = {
                    statusCode: status,
                    code: this.getErrorCode(status),
                    message: obj.message || exception.message,
                    ...(obj.details ? { details: obj.details } : {}),
                };
            } else {
                errorResponse = {
                    statusCode: status,
                    code: this.getErrorCode(status),
                    message: String(res),
                };
            }
        }

        // Log all errors so they appear in the backend terminal
        const logMessage = `${request.method} ${request.url} ${status} — ${errorResponse.message}`;
        if (status >= 500) {
            this.logger.error(logMessage, exception instanceof Error ? exception.stack : undefined);
        } else {
            this.logger.warn(logMessage);
        }

        response.status(status).json(errorResponse);
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
