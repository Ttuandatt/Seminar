import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ParseUUIDPipe } from '@nestjs/common';
import { MerchantsService } from './merchants.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role } from '@prisma/client';
import { CreateMerchantDto, UpdateMerchantDto } from './dto';

@Controller('merchants')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class MerchantsController {
    constructor(private readonly merchantsService: MerchantsService) { }

    @Post()
    create(@Body() dto: CreateMerchantDto) {
        return this.merchantsService.create(dto);
    }

    @Get()
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        return this.merchantsService.findAll({
            page: page ? Number(page) : 1,
            limit: limit ? Number(limit) : 10,
            search
        });
    }

    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.merchantsService.findOne(id);
    }

    @Put(':id')
    update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMerchantDto) {
        return this.merchantsService.update(id, dto);
    }

    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string) {
        return this.merchantsService.delete(id);
    }
}
