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

  it('should sync content from Contentful and upsert products (with pagination)', async () => {
    const mockEntriesPage1 = {
      items: [
        { sys: { id: '1' }, fields: { sku: 1 } },
        { sys: { id: '2' }, fields: { sku: 2 } },
      ],
      total: 4,
    };
    const mockEntriesPage2 = {
      items: [
        { sys: { id: '3' }, fields: { sku: 3 } },
        { sys: { id: '4' }, fields: { sku: 4 } },
      ],
      total: 4,
    };

    contentfulService.getEntries
      .mockResolvedValueOnce(mockEntriesPage1)
      .mockResolvedValueOnce(mockEntriesPage2);

    await service.syncContent();

    expect(contentfulService.getEntries).toHaveBeenCalledWith({
      content_type: 'product',
      skip: 0,
      limit: 1000,
    });
    expect(contentfulService.getEntries).toHaveBeenCalledWith({
      content_type: 'product',
      skip: 1000,
      limit: 1000,
    });

    expect(productRepository.upsertByContentfulId).toHaveBeenCalledTimes(4);
    expect(productRepository.upsertByContentfulId).toHaveBeenCalledWith(
      mockEntriesPage1.items[0],
    );
    expect(productRepository.upsertByContentfulId).toHaveBeenCalledWith(
      mockEntriesPage1.items[1],
    );
    expect(productRepository.upsertByContentfulId).toHaveBeenCalledWith(
      mockEntriesPage2.items[0],
    );
    expect(productRepository.upsertByContentfulId).toHaveBeenCalledWith(
      mockEntriesPage2.items[1],
    );
  });
});
