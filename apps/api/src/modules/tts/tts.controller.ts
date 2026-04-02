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
import { GenerateTtsDto, GenerateTranslatedTtsDto } from './dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';
import { Role } from '@prisma/client';

@Controller('tts')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TtsController {
    constructor(private readonly ttsService: TtsService) {}

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

    /**
     * Generate TTS with auto-translation.
     * User writes Vietnamese text → system translates to target language → generates audio.
     * POST /tts/generate-translated/:poiId
     */
    @Post('generate-translated/:poiId')
    @Roles(Role.ADMIN, Role.SHOP_OWNER)
    generateTranslated(
        @Param('poiId') poiId: string,
        @Body() dto: GenerateTranslatedTtsDto,
    ) {
        return this.ttsService.generateWithTranslation(
            poiId,
            dto.targetLanguage,
            dto.text,
            dto.sourceLanguage || 'VI',
            dto.voice,
        );
    }

    /**
     * Get supported TTS languages with voice info.
     * GET /tts/languages
     */
    @Get('languages')
    @Roles(Role.ADMIN, Role.SHOP_OWNER)
    getSupportedLanguages() {
        return this.ttsService.getSupportedTtsLanguages();
    }

    @Get('voices')
    @Roles(Role.ADMIN, Role.SHOP_OWNER)
    getVoices(@Query('language') language?: string) {
        return this.ttsService.getAvailableVoices(language);
    }
}
