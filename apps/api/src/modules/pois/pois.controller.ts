import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { PoisService } from './pois.service';
import { CreatePoiDto, UpdatePoiDto, QueryPoiDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role, PoiStatus } from '@prisma/client';

@Controller('pois')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PoisController {
    constructor(private poisService: PoisService) { }

    @Post()
    @Roles(Role.ADMIN)
    create(@Body() dto: CreatePoiDto, @CurrentUser('id') userId: string) {
        return this.poisService.create(dto, userId);
    }

    @Get()
    @Roles(Role.ADMIN)
    findAll(@Query() query: QueryPoiDto) {
        return this.poisService.findAll(query);
    }

    @Get(':id')
    @Roles(Role.ADMIN)
    findOne(@Param('id') id: string) {
        return this.poisService.findOne(id);
    }

    @Put(':id')
    @Roles(Role.ADMIN)
    update(@Param('id') id: string, @Body() dto: UpdatePoiDto) {
        return this.poisService.update(id, dto);
    }

    @Patch(':id/status')
    @Roles(Role.ADMIN)
    updateStatus(
        @Param('id') id: string,
        @Body('status') status: PoiStatus,
    ) {
        return this.poisService.updateStatus(id, status);
    }

    @Delete(':id')
    @Roles(Role.ADMIN, Role.SHOP_OWNER)
    remove(
        @Param('id') id: string,
        @CurrentUser() user: { id: string; role: Role },
    ) {
        return this.poisService.remove(id, user);
    }
}
