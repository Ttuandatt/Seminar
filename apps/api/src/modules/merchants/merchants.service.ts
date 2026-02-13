import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma';
import { Role, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CreateMerchantDto, UpdateMerchantDto } from './dto';

@Injectable()
export class MerchantsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateMerchantDto) {
        const existing = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = await bcrypt.hash(dto.password, 12);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                fullName: dto.fullName,
                role: Role.SHOP_OWNER,
                status: UserStatus.ACTIVE,
                shopOwnerProfile: {
                    create: {
                        shopName: dto.shopName,
                        shopAddress: dto.shopAddress,
                        phone: dto.phone,
                    },
                },
            },
            include: {
                shopOwnerProfile: true,
            },
        });

        const { passwordHash: _, ...result } = user;
        return result;
    }

    async findAll(params: { page?: number; limit?: number; search?: string }) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const search = params.search || '';
        const skip = (page - 1) * limit;

        const where = {
            role: Role.SHOP_OWNER,
            OR: search ? [
                { fullName: { contains: search, mode: 'insensitive' as const } },
                { email: { contains: search, mode: 'insensitive' as const } },
                { shopOwnerProfile: { shopName: { contains: search, mode: 'insensitive' as const } } },
            ] : undefined,
        };

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                skip,
                take: limit,
                include: { shopOwnerProfile: true },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data: data.map(user => {
                const { passwordHash, ...rest } = user;
                return rest;
            }),
            meta: {
                page,
                limit,
                total,
                lastPage: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { shopOwnerProfile: true },
        });

        if (!user || user.role !== Role.SHOP_OWNER) {
            throw new NotFoundException('Merchant not found');
        }

        const { passwordHash, ...result } = user;
        return result;
    }

    async update(id: string, dto: UpdateMerchantDto) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { shopOwnerProfile: true }
        });

        if (!user || user.role !== Role.SHOP_OWNER) {
            throw new NotFoundException('Merchant not found');
        }

        const updated = await this.prisma.user.update({
            where: { id },
            data: {
                fullName: dto.fullName,
                status: dto.status,
                shopOwnerProfile: {
                    update: {
                        shopName: dto.shopName,
                        shopAddress: dto.shopAddress,
                        phone: dto.phone,
                    },
                },
            },
            include: { shopOwnerProfile: true },
        });

        const { passwordHash, ...result } = updated;
        return result;
    }

    async delete(id: string) {
        // Soft delete by setting status to LOCKED or INACTIVE if preferred, 
        // but PRD usually implies ability to remove access. 
        // Here we'll just set status to INACTIVE/LOCKED or actually delete if required.
        // Let's implement soft delete via status for safety.

        return this.prisma.user.update({
            where: { id },
            data: { status: UserStatus.LOCKED },
        });
    }
}
