import { Module } from '@nestjs/common';
import { TtsController } from './tts.controller';
import { TtsService } from './tts.service';
import { TranslateModule } from '../translate/translate.module';

@Module({
    imports: [TranslateModule],
    controllers: [TtsController],
    providers: [TtsService],
    exports: [TtsService],
})
export class TtsModule {}
