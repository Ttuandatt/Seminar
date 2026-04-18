import { Controller, Get, UseGuards } from '@nestjs/common';
import { ActiveUsersGateway } from './active-users.gateway';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@Controller('admin/tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrackingController {
    constructor(private readonly gateway: ActiveUsersGateway) { }

    @Get('active-devices')
    @Roles(Role.ADMIN)
    getActiveDevicesCount() {
        return { count: this.gateway.getActiveDeviceCount() };
    }
}
