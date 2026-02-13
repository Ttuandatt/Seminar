import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ToursService } from './tours.service';
import { CreateTourDto, UpdateTourDto, SetTourPoisDto, QueryTourDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, CurrentUser } from '../../common/decorators';
import { Role } from '@prisma/client';

@Controller('tours')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class ToursController {
    constructor(private toursService: ToursService) { }

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

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.toursService.remove(id);
    }
}
