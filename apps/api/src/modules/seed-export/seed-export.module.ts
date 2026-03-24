import { Global, Module } from '@nestjs/common';
import { SeedExportService } from './seed-export.service';

@Global()
@Module({
    providers: [SeedExportService],
    exports: [SeedExportService],
})
export class SeedExportModule { }
