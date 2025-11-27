import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { ContentfulModule } from './contentful/contentful.module';
import { SyncModule } from './sync/sync.module';
import { ProductModule } from './product/product.module';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/js-test';

@Module({
  imports: [
    ContentfulModule,
    ProductModule,
    MongooseModule.forRoot(MONGO_URI),
    ScheduleModule.forRoot(),
    SyncModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
