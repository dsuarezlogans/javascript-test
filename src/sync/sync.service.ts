import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContentfulService } from '../contentful/contentful.service';
import { ProductRepository } from '../product/product.repository';

@Injectable()
export class SyncService {
  private readonly logger = new Logger(SyncService.name);

  constructor(
    private readonly contentfulService: ContentfulService,
    private readonly productRepository: ProductRepository,
  ) {}

  // Runs every hour
  @Cron(CronExpression.EVERY_HOUR)
  async syncContent() {
    this.logger.log('Starting sync from Contentful...');

    const entries = await this.contentfulService.getEntries({
      content_type: 'product',
    });

    for (const entry of entries.items) {
      await this.productRepository.upsertByContentfulId(entry);
    }

    this.logger.log(`Sync completed. Synced ${entries.items.length} items.`);
  }
}
