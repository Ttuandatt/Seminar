import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptionsWithoutRequest } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma';
import { TokenType } from '@prisma/client';

export interface JwtPayload {
    sub: string;
    email: string;
    role: string;
    tokenType?: TokenType;
    jti?: string;
    exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService, private prisma: PrismaService) {
        const options: StrategyOptionsWithoutRequest = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        };
        super(options);
    }

    async validate(payload: JwtPayload) {
        if (payload.tokenType !== TokenType.ACCESS) {
            throw new UnauthorizedException('Invalid token');
        }

        await this.ensureTokenActive(payload.jti);

        return {
            id: payload.sub,
            email: payload.email,
            role: payload.role,
            tokenId: payload.jti,
            tokenExp: payload.exp,
        };
    }

    private async ensureTokenActive(tokenId?: string) {
        if (!tokenId) {
            throw new UnauthorizedException('Invalid token');
        }

        const revoked = await this.prisma.revokedToken.findUnique({ where: { tokenId } });
        if (revoked) {
            throw new UnauthorizedException('Token revoked');
        }
    }
}
