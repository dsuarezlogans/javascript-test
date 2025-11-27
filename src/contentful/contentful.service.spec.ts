import { Test, TestingModule } from '@nestjs/testing';
import { ContentfulService } from './contentful.service';
import { createClient } from 'contentful';

jest.mock('contentful');

describe('ContentfulService', () => {
  let service: ContentfulService;
  const mockGetEntries = jest.fn();

  beforeEach(async () => {
    (createClient as jest.Mock).mockReturnValue({
      getEntries: mockGetEntries,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [ContentfulService],
    }).compile();

    service = module.get<ContentfulService>(ContentfulService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should call getEntries with query', async () => {
    const query = { content_type: 'product' };
    const mockResult = { items: [{ fields: { sku: 1 } }] };
    mockGetEntries.mockResolvedValue(mockResult);

    const result = await service.getEntries(query);

    expect(mockGetEntries).toHaveBeenCalledWith(query);
    expect(result).toBe(mockResult);
  });

  it('should call getEntries without query', async () => {
    const mockResult = { items: [] };
    mockGetEntries.mockResolvedValue(mockResult);

    const result = await service.getEntries();

    expect(mockGetEntries).toHaveBeenCalledWith(undefined);
    expect(result).toBe(mockResult);
  });
});
