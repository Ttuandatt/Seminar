import { Module } from '@nestjs/common';
import { ToursService } from './tours.service';
import { ToursController } from './tours.controller';
import { NarrationModule } from './narration/narration.module';

@Module({
    imports: [NarrationModule],
    controllers: [ToursController],
    providers: [ToursService],
    exports: [ToursService],
})
export class ToursModule { }
