import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { PrismaModule } from './prisma';
import { AuthModule } from './modules/auth/auth.module';
import { PoisModule } from './modules/pois/pois.module';
import { MediaModule } from './modules/media/media.module';
import { ToursModule } from './modules/tours/tours.module';
import { PublicModule } from './modules/public/public.module';
import { TouristModule } from './modules/tourist/tourist.module';
import { ShopOwnerModule } from './modules/shop-owner/shop-owner.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { MerchantsModule } from './modules/merchants/merchants.module';
import { ProfileModule } from './modules/profile/profile.module';
import { TtsModule } from './modules/tts/tts.module';
import { QrModule } from './modules/qr/qr.module';
import { SeedExportModule } from './modules/seed-export/seed-export.module';
import { TranslateModule } from './modules/translate/translate.module';
import { MailModule } from './modules/mail';
import { SyncModule } from './modules/sync/sync.module';
import { TrackingModule } from './modules/tracking/tracking.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    PrismaModule,
    MailModule,
    SyncModule,
    SeedExportModule,
    AuthModule,
    PoisModule,
    MediaModule,
    ToursModule,
    PublicModule,
    TouristModule,
    ShopOwnerModule,
    AnalyticsModule,
    MerchantsModule,
    ProfileModule,
    TtsModule,
    QrModule,
    TranslateModule,
    TrackingModule,
  ],
})
export class AppModule { }
