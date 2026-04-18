import { Module } from '@nestjs/common';
import { ActiveUsersGateway } from './active-users.gateway';
import { TrackingController } from './tracking.controller';

@Module({
    controllers: [TrackingController],
    providers: [ActiveUsersGateway],
    exports: [ActiveUsersGateway]
})
export class TrackingModule { }
