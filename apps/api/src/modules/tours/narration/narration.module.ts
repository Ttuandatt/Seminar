import { Module } from '@nestjs/common';
import { NarrationService } from './narration.service';
import { NarrationController } from './narration.controller';
import { NarrationGenerator } from './narration-generator';
// Import TtsService when ready

@Module({
  controllers: [NarrationController],
  providers: [NarrationService, NarrationGenerator],
  exports: [NarrationService],
})
export class NarrationModule {}
