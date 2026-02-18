import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma';
import { ProfileController } from './profile.controller';

@Module({
    imports: [PrismaModule],
    controllers: [ProfileController],
})
export class ProfileModule { }
