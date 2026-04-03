import { Module } from '@nestjs/common';
import { TouristController } from './tourist.controller';
import { TouristTourService } from './tourist-tour.service';

@Module({
    controllers: [TouristController],
    providers: [TouristTourService],
})
export class TouristModule { }
