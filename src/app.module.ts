import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClubsModule } from './modules/clubs/clubs.module';
import { DatabaseModule } from './modules/database/database.module';
import { EventRegistrationsModule } from './modules/event-registrations/event-registrations.module';
import { EventsModule } from './modules/events/events.module';
import { GalleryImagesModule } from './modules/gallery-images/gallery-images.module';
import { HomeStatisticsModule } from './modules/home-statistics/home-statistics.module';
import { LicensesModule } from './modules/licenses/licenses.module';
import { MapLocationsModule } from './modules/map-locations/map-locations.module';
import { ModalitiesModule } from './modules/modalities/modalities.module';
import { NewsArticlesModule } from './modules/news-articles/news-articles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { PilotsModule } from './modules/pilots/pilots.module';

import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ClubsModule,
    DatabaseModule,
    EventRegistrationsModule,
    EventsModule,
    GalleryImagesModule,
    HomeStatisticsModule,
    LicensesModule,
    MapLocationsModule,
    ModalitiesModule,
    NewsArticlesModule,
    PermissionsModule,
    PilotsModule,

    UsersModule,
  ],
})
export class AppModule {}
