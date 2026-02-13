import { Module } from '@nestjs/common';
import { TouristController } from './tourist.controller';

@Module({
    controllers: [TouristController],
})
export class TouristModule { }
