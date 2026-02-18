import {
    BadRequestException,
    Controller,
    Get,
    Put,
    Post,
    Body,
    UploadedFile,
    UseGuards,
    UseInterceptors,
    NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';
import { PrismaService } from '../../prisma';
import { UpdateProfileDto, OpeningHourDto } from './dto/update-profile.dto';

const uploadDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
}

type ProfileJson = {
    phone?: string;
    birthDate?: string;
    gender?: string;
    address?: {
        line1?: string;
        line2?: string;
        city?: string;
        country?: string;
    };
    avatarUrl?: string;
    lastLoginAt?: string;
};

@UseGuards(JwtAuthGuard)
@Controller()
export class ProfileController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('me')
    async getProfile(@CurrentUser('id') userId: string) {
        return this.buildProfileResponse(userId);
    }

    @Put('me')
    async updateProfile(@CurrentUser('id') userId: string, @Body() payload: UpdateProfileDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { shopOwnerProfile: true },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const profileJson = this.parseProfile((user as any).profile ?? null);

        if (payload.phone !== undefined) {
            const trimmed = payload.phone.trim();
            if (trimmed) {
                profileJson.phone = trimmed;
            } else {
                delete profileJson.phone;
            }
        }

        if (payload.birthDate !== undefined) {
            profileJson.birthDate = payload.birthDate || undefined;
            if (!profileJson.birthDate) {
                delete profileJson.birthDate;
            }
        }

        if (payload.gender) {
            profileJson.gender = payload.gender;
        }

        if (payload.address) {
            const normalizedAddress = this.normalizeAddress(payload.address);
            if (normalizedAddress) {
                profileJson.address = normalizedAddress;
            } else {
                delete profileJson.address;
            }
        }

        const userUpdate: Prisma.UserUpdateInput = {};
        if (payload.fullName?.trim()) {
            userUpdate.fullName = payload.fullName.trim();
        }
        userUpdate.profile = this.normalizeProfile(profileJson);

        await this.prisma.user.update({ where: { id: userId }, data: userUpdate });

        if (payload.phone && user.shopOwnerProfile) {
            const trimmed = payload.phone.trim();
            await this.prisma.shopOwner.update({
                where: { userId },
                data: { phone: trimmed || null },
            });
        }

        if (payload.shop && user.shopOwnerProfile) {
            const shopUpdates: Prisma.ShopOwnerUpdateInput = {};
            if (payload.shop.name?.trim()) {
                shopUpdates.shopName = payload.shop.name.trim();
            }
            if (payload.shop.address !== undefined) {
                shopUpdates.shopAddress = payload.shop.address?.trim() || null;
            }
            if (payload.shop.openingHours !== undefined) {
                shopUpdates.openingHours = this.normalizeOpeningHours(payload.shop.openingHours) as any;
            }
            await this.prisma.shopOwner.update({
                where: { userId },
                data: shopUpdates,
            });
        }

        return this.buildProfileResponse(userId);
    }

    @Post('me/avatar')
    @UseInterceptors(
        FileInterceptor('avatar', {
            storage: diskStorage({
                destination: uploadDir,
                filename: (_req, file, cb) => cb(null, `${randomUUID()}${extname(file.originalname)}`),
            }),
            limits: { fileSize: 5 * 1024 * 1024 },
        }),
    )
    async uploadAvatar(@CurrentUser('id') userId: string, @UploadedFile() file?: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('Avatar image is required');
        }

        const avatarUrl = `/uploads/${file.filename}`;

        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { shopOwnerProfile: true },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const profileJson = this.parseProfile((user as any).profile ?? null);
        profileJson.avatarUrl = avatarUrl;

        await this.prisma.user.update({
            where: { id: userId },
            data: { profile: this.normalizeProfile(profileJson) },
        });

        if (user.shopOwnerProfile) {
            await this.prisma.shopOwner.update({ where: { userId }, data: { avatarUrl } });
        }

        return { avatarUrl };
    }

    private async buildProfileResponse(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { shopOwnerProfile: true },
        });
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const profileJson = this.parseProfile((user as any).profile ?? null);
        const shopOwner = user.shopOwnerProfile;

        const openingHoursRaw = shopOwner ? (shopOwner as any).openingHours : undefined;
        const openingHours = Array.isArray(openingHoursRaw)
            ? (openingHoursRaw as OpeningHourDto[])
            : [];

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            role: user.role,
            status: user.status,
            avatarUrl: profileJson.avatarUrl ?? shopOwner?.avatarUrl ?? undefined,
            phone: profileJson.phone ?? shopOwner?.phone ?? undefined,
            birthDate: profileJson.birthDate,
            gender: profileJson.gender ?? 'PREFER_NOT_SAY',
            address: profileJson.address,
            shop: shopOwner
                ? {
                    name: shopOwner.shopName,
                    address: shopOwner.shopAddress ?? undefined,
                    openingHours,
                }
                : undefined,
            createdAt: user.createdAt.toISOString(),
            lastUpdatedAt: user.updatedAt.toISOString(),
            lastLoginAt: profileJson.lastLoginAt,
        };
    }

    private parseProfile(value: Prisma.JsonValue | null): ProfileJson {
        if (
            value === null ||
            Array.isArray(value) ||
            typeof value === 'number' ||
            typeof value === 'string' ||
            typeof value === 'boolean'
        ) {
            return {};
        }
        return (value as ProfileJson) ?? {};
    }

    private normalizeProfile(
        profile: ProfileJson,
    ): Prisma.NullableJsonNullValueInput | Prisma.InputJsonValue {
        const clone: ProfileJson = { ...profile };
        Object.keys(clone).forEach((key) => {
            const typedKey = key as keyof ProfileJson;
            if (clone[typedKey] === undefined) {
                delete clone[typedKey];
            }
        });
        return Object.keys(clone).length
            ? (clone as Prisma.InputJsonValue)
            : (Prisma.JsonNull as Prisma.NullableJsonNullValueInput);
    }

    private normalizeAddress(address?: ProfileJson['address']) {
        if (!address) return undefined;
        const pairs = Object.entries(address)
            .map(([key, value]) => [key, typeof value === 'string' ? value.trim() : ''])
            .filter(([, value]) => Boolean(value));
        if (!pairs.length) {
            return undefined;
        }
        return Object.fromEntries(pairs) as ProfileJson['address'];
    }

    private normalizeOpeningHours(hours: OpeningHourDto[] = []) {
        const seenDays = new Set<string>();
        return hours
            .filter((hour) => {
                if (!hour.day || !hour.open || !hour.close) {
                    return false;
                }
                if (seenDays.has(hour.day)) {
                    return false;
                }
                seenDays.add(hour.day);
                return hour.open < hour.close;
            })
            .map((hour) => ({ day: hour.day, open: hour.open, close: hour.close }));
    }
}
