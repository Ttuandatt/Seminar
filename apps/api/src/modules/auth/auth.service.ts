import {
    Injectable,
    UnauthorizedException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { PrismaService } from '../../prisma';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, RefreshTokenDto } from './dto';
import { Role, TokenType } from '@prisma/client';

@Injectable()
export class AuthService {
    private readonly accessTokenTtlSeconds = 15 * 60;
    private readonly refreshTokenTtlSeconds = 7 * 24 * 60 * 60;

    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        // Check existing email
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        // Validate shop owner fields
        if (dto.role === Role.SHOP_OWNER && !dto.shopName) {
            throw new BadRequestException('shopName is required for SHOP_OWNER');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                fullName: dto.fullName,
                role: dto.role,
                ...(dto.role === Role.SHOP_OWNER
                    ? {
                        shopOwnerProfile: {
                            create: { shopName: dto.shopName! },
                        },
                    }
                    : {}),
                ...(dto.role === Role.TOURIST
                    ? {
                        touristProfile: {
                            create: { displayName: dto.fullName },
                        },
                    }
                    : {}),
            },
        });

        return {
            id: user.id,
            email: user.email,
            role: user.role,
            message: 'Registration successful',
        };
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            throw new UnauthorizedException(
                `Account locked until ${user.lockedUntil.toISOString()}`,
            );
        }

        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            // Increment failed attempts
            const newCount = user.failedLoginCount + 1;
            const updateData: Record<string, unknown> = {
                failedLoginCount: newCount,
            };
            // Lock after 5 failed attempts (30 min)
            if (newCount >= 5) {
                updateData.lockedUntil = new Date(Date.now() + 30 * 60 * 1000);
                updateData.status = 'LOCKED';
            }
            await this.prisma.user.update({
                where: { id: user.id },
                data: updateData,
            });
            throw new UnauthorizedException('Invalid credentials');
        }

        // Reset failed attempts on success
        if (user.failedLoginCount > 0) {
            await this.prisma.user.update({
                where: { id: user.id },
                data: { failedLoginCount: 0, lockedUntil: null, status: 'ACTIVE' },
            });
        }

        const tokens = await this.generateTokens(user.id, user.email, user.role);

        await this.storeRefreshToken(user.id, tokens.refreshToken, tokens.refreshTokenId);

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
            },
        };
    }

    async refreshToken(dto: RefreshTokenDto) {
        try {
            const payload = this.jwtService.verify(dto.refreshToken, {
                secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
            }) as {
                sub: string;
                email: string;
                role: Role;
                jti?: string;
                exp?: number;
                tokenType?: TokenType;
            };

            if (payload.tokenType !== TokenType.REFRESH) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            await this.ensureTokenNotRevoked(payload.jti);

            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
                select: {
                    id: true,
                    email: true,
                    role: true,
                    refreshToken: true,
                    refreshTokenId: true,
                },
            });

            if (!user || !user.refreshToken || !user.refreshTokenId) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            if (user.refreshTokenId !== payload.jti) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            const tokenValid = await bcrypt.compare(dto.refreshToken, user.refreshToken);
            if (!tokenValid) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            await this.revokeToken({
                tokenId: payload.jti,
                userId: user.id,
                type: TokenType.REFRESH,
                reason: 'ROTATED',
                expiresAt: this.expToDate(payload.exp, this.refreshTokenTtlSeconds),
            });

            const tokens = await this.generateTokens(user.id, user.email, user.role);

            await this.storeRefreshToken(user.id, tokens.refreshToken, tokens.refreshTokenId);

            return {
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            };
        } catch {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async forgotPassword(dto: ForgotPasswordDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        // Always return success (don't leak email existence)
        if (!user) {
            return { message: 'If email exists, reset link has been sent' };
        }

        const token = randomUUID();
        await this.prisma.passwordResetToken.create({
            data: {
                userId: user.id,
                token,
                expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
            },
        });

        // TODO: Send email with reset link
        // For POC, return token directly
        return {
            message: 'If email exists, reset link has been sent',
            _devToken: token, // Remove in production
        };
    }

    async resetPassword(dto: ResetPasswordDto) {
        const resetToken = await this.prisma.passwordResetToken.findUnique({
            where: { token: dto.token },
        });

        if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
            throw new BadRequestException('Invalid or expired reset token');
        }

        const passwordHash = await bcrypt.hash(dto.newPassword, 12);

        await this.prisma.$transaction([
            this.prisma.user.update({
                where: { id: resetToken.userId },
                data: { passwordHash, failedLoginCount: 0, lockedUntil: null, status: 'ACTIVE' },
            }),
            this.prisma.passwordResetToken.update({
                where: { id: resetToken.id },
                data: { usedAt: new Date() },
            }),
        ]);

        return { message: 'Password reset successful' };
    }

    async logout(userId: string, accessTokenId?: string, accessTokenExp?: number) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { refreshTokenId: true },
        });

        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null, refreshTokenId: null },
        });

        if (user?.refreshTokenId) {
            await this.revokeToken({
                tokenId: user.refreshTokenId,
                userId,
                type: TokenType.REFRESH,
                reason: 'LOGOUT',
            });
        }

        if (accessTokenId) {
            await this.revokeToken({
                tokenId: accessTokenId,
                userId,
                type: TokenType.ACCESS,
                reason: 'LOGOUT',
                expiresAt: this.expToDate(accessTokenExp, this.accessTokenTtlSeconds),
            });
        }

        return { message: 'Logged out successfully' };
    }

    async revokeUserSessions(userId: string, reason = 'ACCOUNT_DISABLED') {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { refreshTokenId: true },
        });

        if (user?.refreshTokenId) {
            await this.revokeToken({
                tokenId: user.refreshTokenId,
                userId,
                type: TokenType.REFRESH,
                reason,
            });
        }

        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: null, refreshTokenId: null },
        });
    }

    private async generateTokens(userId: string, email: string, role: Role) {
        const accessTokenId = randomUUID();
        const refreshTokenId = randomUUID();

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, email, role, tokenType: TokenType.ACCESS },
                {
                    secret: this.configService.get<string>('JWT_SECRET'),
                    expiresIn: this.accessTokenTtlSeconds,
                    jwtid: accessTokenId,
                },
            ),
            this.jwtService.signAsync(
                { sub: userId, email, role, tokenType: TokenType.REFRESH },
                {
                    secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
                    expiresIn: this.refreshTokenTtlSeconds,
                    jwtid: refreshTokenId,
                },
            ),
        ]);

        return { accessToken, refreshToken, accessTokenId, refreshTokenId };
    }

    private async storeRefreshToken(userId: string, refreshToken: string, refreshTokenId: string) {
        const refreshHash = await bcrypt.hash(refreshToken, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { refreshToken: refreshHash, refreshTokenId },
        });
    }

    private async revokeToken(params: {
        tokenId?: string | null;
        userId: string;
        type: TokenType;
        reason: string;
        expiresAt?: Date;
    }) {
        const { tokenId, userId, type, reason, expiresAt } = params;
        if (!tokenId) return;

        await this.prisma.revokedToken.upsert({
            where: { tokenId },
            update: {},
            create: {
                tokenId,
                userId,
                type,
                reason,
                expiresAt: expiresAt ?? this.calculateExpiry(type),
            },
        });
    }

    private async ensureTokenNotRevoked(tokenId?: string) {
        if (!tokenId) {
            throw new UnauthorizedException('Invalid token');
        }

        const revoked = await this.prisma.revokedToken.findUnique({
            where: { tokenId },
        });

        if (revoked) {
            throw new UnauthorizedException('Token revoked');
        }
    }

    private calculateExpiry(type: TokenType) {
        const seconds = type === TokenType.ACCESS ? this.accessTokenTtlSeconds : this.refreshTokenTtlSeconds;
        return new Date(Date.now() + seconds * 1000);
    }

    private expToDate(expSeconds?: number, fallbackSeconds?: number) {
        if (expSeconds) {
            return new Date(expSeconds * 1000);
        }
        const seconds = fallbackSeconds ?? this.accessTokenTtlSeconds;
        return new Date(Date.now() + seconds * 1000);
    }
}
