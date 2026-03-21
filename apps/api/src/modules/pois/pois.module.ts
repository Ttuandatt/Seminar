import { Module } from '@nestjs/common';
import { PoisService } from './pois.service';
import { PoisController } from './pois.controller';
import { TtsModule } from '../tts/tts.module';

@Module({
    imports: [TtsModule],
    controllers: [PoisController],
    providers: [PoisService],
    exports: [PoisService],
})
export class PoisModule { }
