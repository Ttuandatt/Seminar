import {
    Controller,
    Post,
    Get,
    Param,
    Body,
    Query,
    UseGuards,
} from '@nestjs/common';
import { TtsService } from './tts.service';
import { GenerateTtsDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role } from '@prisma/client';

@Controller('tts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TtsController {
    constructor(private ttsService: TtsService) {}

    @Post('generate/:poiId')
    @Roles(Role.ADMIN, Role.SHOP_OWNER)
    generate(@Param('poiId') poiId: string, @Body() dto: GenerateTtsDto) {
        return this.ttsService.generateForPoi(
            poiId,
            dto.language,
            dto.text,
            dto.voice,
        );
    }

    @Get('voices')
    @Roles(Role.ADMIN, Role.SHOP_OWNER)
    getVoices(@Query('language') language?: string) {
        return this.ttsService.getAvailableVoices(language);
    }
}
