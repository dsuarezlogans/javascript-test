import { Test, TestingModule } from '@nestjs/testing';
import { SyncService } from './sync.service';
import { ContentfulService } from '../contentful/contentful.service';
import { ProductRepository } from '../product/product.repository';

describe('SyncService', () => {
  let service: SyncService;
  let contentfulService: { getEntries: jest.Mock };
  let productRepository: { upsertByContentfulId: jest.Mock };

  beforeEach(async () => {
    contentfulService = { getEntries: jest.fn() };
    productRepository = { upsertByContentfulId: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SyncService,
        { provide: ContentfulService, useValue: contentfulService },
        { provide: ProductRepository, useValue: productRepository },
      ],
    }).compile();

    service = module.get<SyncService>(SyncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sync content from Contentful and upsert products', async () => {
    const mockEntries = {
      items: [
        { sys: { id: '1' }, fields: { sku: 1 } },
        { sys: { id: '2' }, fields: { sku: 2 } },
      ],
    };
    contentfulService.getEntries.mockResolvedValue(mockEntries);

    await service.syncContent();

    expect(contentfulService.getEntries).toHaveBeenCalledWith({
      content_type: 'product',
    });
    expect(productRepository.upsertByContentfulId).toHaveBeenCalledTimes(2);
    expect(productRepository.upsertByContentfulId).toHaveBeenCalledWith(
      mockEntries.items[0],
    );
    expect(productRepository.upsertByContentfulId).toHaveBeenCalledWith(
      mockEntries.items[1],
    );
  });
});
