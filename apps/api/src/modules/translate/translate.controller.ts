import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
} from '@nestjs/common';
import { TranslateService } from './translate.service';
import { TranslateDto, TranslateBatchDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role } from '@prisma/client';

@Controller('translate')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TranslateController {
    constructor(private translateService: TranslateService) {}

    /**
     * Translate a single text.
     * POST /translate
     * Body: { text: string, from: 'vi', to: 'en' }
     */
    @Post()
    @Roles(Role.ADMIN, Role.SHOP_OWNER)
    async translate(@Body() dto: TranslateDto) {
        return this.translateService.translate(dto.text, dto.from, dto.to);
    }

    /**
     * Translate multiple texts at once (batch).
     * POST /translate/batch
     * Body: { texts: string[], from: 'vi', to: 'en' }
     */
    @Post('batch')
    @Roles(Role.ADMIN, Role.SHOP_OWNER)
    async translateBatch(@Body() dto: TranslateBatchDto) {
        return this.translateService.translateBatch(dto.texts, dto.from, dto.to);
    }

    /**
     * Get list of supported translation languages.
     * GET /translate/languages
     */
    @Get('languages')
    @Roles(Role.ADMIN, Role.SHOP_OWNER)
    getSupportedLanguages() {
        return this.translateService.getSupportedLanguages();
    }
}
