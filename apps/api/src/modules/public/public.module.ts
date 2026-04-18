import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PublicController } from './public.controller';

@Module({
    imports: [JwtModule.register({})],
    controllers: [PublicController],
})
export class PublicModule { }
