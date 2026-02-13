import { Module } from '@nestjs/common';
import { ShopOwnerController } from './shop-owner.controller';

@Module({
    controllers: [ShopOwnerController],
})
export class ShopOwnerModule { }
