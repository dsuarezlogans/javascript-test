import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { ContentfulService } from '../contentful/contentful.service';
import { ProductRepository } from '../product/product.repository';
import type { ProductEntrySkeleton } from '../contentful/contentful.service';
import { Entry } from 'contentful';

type ContentfulEntryList = Array<Entry<ProductEntrySkeleton>>;
@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly contentfulService: ContentfulService,
    private readonly productRepository: ProductRepository,
  ) {}

  async onModuleInit() {
    // Run sync once when the module is initialized
    await this.syncContent();
  }

  // Runs every hour
  @Cron(CronExpression.EVERY_HOUR)
  async syncContent() {
    this.logger.log('Starting sync from Contentful...');

    const allItems: ContentfulEntryList = [];
    let skip = 0;
    const limit = 1000;
    let total = 0;

    do {
      const entries = await this.contentfulService.getEntries({
        content_type: 'product',
        skip,
        limit,
      });

      allItems.push(...entries.items);
      total = entries.total;
      skip += limit;
    } while (allItems.length < total);

    for (const entry of allItems) {
      await this.productRepository.upsertByContentfulId(entry);
    }

    this.logger.log(`Sync completed. Synced ${allItems.length} items.`);
  }
}
