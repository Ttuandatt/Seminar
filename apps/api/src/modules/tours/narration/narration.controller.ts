import { Controller, Get, Put, Post, Delete, Param, Body } from '@nestjs/common';
import { NarrationService } from './narration.service';
import { UpsertNarrationDto } from './dto/upsert-narration.dto';
import { GenerateNarrationDto } from './dto/generate-narration.dto';
import { GenerateTtsDto } from './dto/generate-tts.dto';

// Admin/SO endpoints: /tours/:tourId/narrations
@Controller('tours/:tourId/narrations')
export class NarrationController {
  constructor(private readonly narrationService: NarrationService) {}

  // GET /tours/:tourId/narrations
  @Get()
  async getNarrations(@Param('tourId') tourId: string) {
    return this.narrationService.getTourNarrations(tourId);
  }

  // PUT /tours/:tourId/narrations — Batch upsert
  @Put()
  async upsertNarrations(
    @Param('tourId') tourId: string,
    @Body() dto: UpsertNarrationDto,
  ) {
    return this.narrationService.upsertNarrations(tourId, dto);
  }

  // POST /tours/:tourId/narrations/generate — Auto-generate scripts
  @Post('generate')
  async generateScripts(
    @Param('tourId') tourId: string,
    @Body() dto: GenerateNarrationDto,
  ) {
    return this.narrationService.generateScripts(tourId, dto);
  }

  // POST /tours/:tourId/narrations/generate-tts — TTS for all narrations
  @Post('generate-tts')
  async generateTts(
    @Param('tourId') tourId: string,
    @Body() dto: GenerateTtsDto,
  ) {
    return this.narrationService.generateTts(tourId, dto);
  }

  // POST /tours/:tourId/narrations/:id/tts — TTS for single narration
  @Post(':id/tts')
  async generateSingleTts(
    @Param('tourId') tourId: string,
    @Param('id') id: string,
    @Body() dto: GenerateTtsDto,
  ) {
    return this.narrationService.generateSingleTts(tourId, id, dto);
  }

  // DELETE /tours/:tourId/narrations/:id
  @Delete(':id')
  async deleteNarration(
    @Param('tourId') tourId: string,
    @Param('id') id: string,
  ) {
    return this.narrationService.deleteNarration(tourId, id);
  }
}
