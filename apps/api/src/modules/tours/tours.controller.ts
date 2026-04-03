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
import { ToursService } from './tours.service';
import {
    CreateTourDto,
    UpdateTourDto,
    SetTourPoisDto,
    QueryTourDto,
    CreateTourStopDto,
    UpdateTourStopDto,
    ReorderTourStopsDto,
} from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role } from '@prisma/client';

@Controller('tours')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ToursController {
    constructor(private readonly toursService: ToursService) { }

    @Post()
    create(@Body() dto: CreateTourDto, @CurrentUser('id') userId: string) {
        return this.toursService.create(dto, userId);
    }

    @Get()
    findAll(@Query() query: QueryTourDto) {
        return this.toursService.findAll(query);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.toursService.findOne(id);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTourDto) {
        return this.toursService.update(id, dto);
    }

    @Put(':id/pois')
    setPois(@Param('id') id: string, @Body() dto: SetTourPoisDto) {
        return this.toursService.setPois(id, dto);
    }

    @Post(':id/stops')
    addStop(@Param('id') id: string, @Body() dto: CreateTourStopDto) {
        return this.toursService.addStop(id, dto);
    }

    @Patch(':id/stops/reorder')
    reorderStops(@Param('id') id: string, @Body() dto: ReorderTourStopsDto) {
        return this.toursService.reorderStops(id, dto);
    }

    @Patch(':id/stops/:stopId')
    updateStop(
        @Param('id') id: string,
        @Param('stopId') stopId: string,
        @Body() dto: UpdateTourStopDto,
    ) {
        return this.toursService.updateStop(id, stopId, dto);
    }

    @Delete(':id/stops/:stopId')
    removeStop(@Param('id') id: string, @Param('stopId') stopId: string) {
        return this.toursService.removeStop(id, stopId);
    }

    @Patch(':id/publish')
    publish(@Param('id') id: string) {
        return this.toursService.publish(id);
    }

    @Patch(':id/unpublish')
    unpublish(@Param('id') id: string) {
        return this.toursService.unpublish(id);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.toursService.remove(id);
    }
}
