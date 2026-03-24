import { Module } from '@nestjs/common';
import { ShopOwnerController } from './shop-owner.controller';
import { QrModule } from '../qr/qr.module';

@Module({
    imports: [QrModule],
    controllers: [ShopOwnerController],
})
export class ShopOwnerModule { }
