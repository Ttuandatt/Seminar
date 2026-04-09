import { Controller, Get, Param, Query } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('public/sync')
export class SyncController {
    constructor(private syncService: SyncService) { }

    @Get('manifest')
    getManifest() {
        return this.syncService.getManifest();
    }

    @Get('pois')
    getDeltaPois(@Query('since') since: string) {
        if (!since) {
            // If no 'since', we can either return all or return error. 
            // In sync context, usually we want all if first time.
            return this.syncService.getDeltaPois('1970-01-01T00:00:00Z');
        }
        return this.syncService.getDeltaPois(since);
    }

    @Get('tours')
    getDeltaTours(@Query('since') since: string) {
        if (!since) {
            return this.syncService.getDeltaTours('1970-01-01T00:00:00Z');
        }
        return this.syncService.getDeltaTours(since);
    }

    @Get('tour-package/:tourId')
    getTourPackage(@Param('tourId') tourId: string) {
        return this.syncService.getTourPackage(tourId);
    }
}
