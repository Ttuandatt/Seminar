import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AnalyticsController {
    constructor(private prisma: PrismaService) { }

    @Get('overview')
    async getOverview(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const dateFilter: Record<string, Date> = {};
        if (startDate) dateFilter.gte = new Date(startDate);
        if (endDate) dateFilter.lte = new Date(endDate);

        const viewWhere = startDate ? { viewedAt: dateFilter } : {};
        const triggerWhere = startDate ? { createdAt: dateFilter } : {};

        const [totalPOIs, totalTours, totalTourists, totalViews, totalAudioPlays] =
            await Promise.all([
                this.prisma.poi.count({ where: { deletedAt: null } }),
                this.prisma.tour.count({ where: { deletedAt: null } }),
                this.prisma.touristUser.count(),
                this.prisma.viewHistory.count({ where: viewWhere }),
                this.prisma.viewHistory.count({ where: { ...viewWhere, audioPlayed: true } }),
            ]);

        // Top POIs
        const topPois = await this.prisma.poi.findMany({
            where: { deletedAt: null },
            select: {
                id: true,
                nameVi: true,
                _count: { select: { viewHistory: true } },
            },
            orderBy: { viewHistory: { _count: 'desc' } },
            take: 10,
        });

        // Trigger stats
        const [gps, qr, manual] = await Promise.all([
            this.prisma.triggerLog.count({ where: { ...triggerWhere, triggerType: 'GPS' } }),
            this.prisma.triggerLog.count({ where: { ...triggerWhere, triggerType: 'QR' } }),
            this.prisma.triggerLog.count({ where: { ...triggerWhere, triggerType: 'MANUAL' } }),
        ]);

        return {
            totalPOIs,
            totalTours,
            totalTourists,
            totalViews,
            totalAudioPlays,
            topPOIs: topPois.map((p) => ({
                id: p.id,
                nameVi: p.nameVi,
                viewCount: p._count.viewHistory,
            })),
            triggerStats: { gps, qr, manual },
        };
    }
}
