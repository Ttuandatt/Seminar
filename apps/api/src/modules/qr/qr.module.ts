import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { QrService } from './qr.service';
import { QrController } from './qr.controller';

@Module({
    imports: [JwtModule.register({})],
    controllers: [QrController],
    providers: [QrService],
    exports: [QrService],
})
export class QrModule { }
