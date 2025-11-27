import { Module } from '@nestjs/common';

import { SyncService } from './sync.service';
import { ProductModule } from '../product/product.module';
import { ContentfulModule } from '../contentful/contentful.module';

@Module({
  imports: [ProductModule, ContentfulModule],
  providers: [SyncService],
})
export class SyncModule {}
