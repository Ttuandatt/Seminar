import { Module } from '@nestjs/common';
import { PoisService } from './pois.service';
import { PoisController } from './pois.controller';
import { TtsModule } from '../tts/tts.module';
import { QrModule } from '../qr/qr.module';

@Module({
    imports: [TtsModule, QrModule],
    controllers: [PoisController],
    providers: [PoisService],
    exports: [PoisService],
})
export class PoisModule { }
