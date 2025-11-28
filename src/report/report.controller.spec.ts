import { Test, TestingModule } from '@nestjs/testing';
import { ReportController } from './report.controller';
import { ProductRepository } from '../product/product.repository';

describe('ReportController', () => {
  let controller: ReportController;
  let productRepository: {
    countDocuments: jest.Mock;
    find: jest.Mock;
  };

  beforeEach(async () => {
    productRepository = {
      countDocuments: jest.fn(),
      find: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReportController],
      providers: [{ provide: ProductRepository, useValue: productRepository }],
    }).compile();

    controller = module.get<ReportController>(ReportController);
  });

  describe('getDeletedProducts', () => {
    it('should return correct deleted products percentage and counts', async () => {
      productRepository.countDocuments
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(2);

      const result = await controller.getDeletedProducts();
      expect(result).toEqual({
        'Deleted products %': 20,
        'Total of products': 10,
        'Total of deleted products': 2,
      });
    });

    it('should handle zero total products', async () => {
      productRepository.countDocuments
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      const result = await controller.getDeletedProducts();
      expect(result).toEqual({
        'Deleted products %': 0,
        'Total of products': 0,
        'Total of deleted products': 0,
      });
    });
  });

  describe('getExistingProducts', () => {
    it('should return correct existing products percentage and counts (no filters)', async () => {
      productRepository.countDocuments
        .mockResolvedValueOnce(10)
        .mockResolvedValueOnce(8);

      const result = await controller.getExistingProducts();
      expect(result).toEqual({
        'Existing products %': 80,
        'Total of products': 10,
        'Total of existing products': 8,
      });
    });

    it('should apply withPrice=true filter', async () => {
      productRepository.countDocuments
        .mockResolvedValueOnce(5)
        .mockResolvedValueOnce(4);

      const result = await controller.getExistingProducts('true');
      expect(productRepository.countDocuments).toHaveBeenCalledWith({
        price: { $ne: null },
      });
      expect(productRepository.countDocuments).toHaveBeenCalledWith({
        deleted: { $ne: true },
        price: { $ne: null },
      });
      expect(result).toEqual({
        'Existing products %': 80,
        'Total of products': 5,
        'Total of existing products': 4,
      });
    });

    it('should apply withPrice=false filter', async () => {
      productRepository.countDocuments
        .mockResolvedValueOnce(2)
        .mockResolvedValueOnce(2);

      const result = await controller.getExistingProducts('false');
      expect(productRepository.countDocuments).toHaveBeenCalledWith({
        price: null,
      });
      expect(productRepository.countDocuments).toHaveBeenCalledWith({
        deleted: { $ne: true },
        price: null,
      });
      expect(result).toEqual({
        'Existing products %': 100,
        'Total of products': 2,
        'Total of existing products': 2,
      });
    });

    it('should handle date range filters', async () => {
      productRepository.countDocuments
        .mockResolvedValueOnce(3)
        .mockResolvedValueOnce(2);

      const startDate = '2023-01-01T00:00:00.000Z';
      const endDate = '2023-12-31T23:59:59.999Z';

      const result = await controller.getExistingProducts(
        undefined,
        startDate,
        endDate,
      );

      expect(productRepository.countDocuments).toHaveBeenCalledWith({
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });
      expect(productRepository.countDocuments).toHaveBeenCalledWith({
        deleted: { $ne: true },
        createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
      });
      expect(result).toEqual({
        'Existing products %': 66.66666666666666,
        'Total of products': 3,
        'Total of existing products': 2,
      });
    });
  });

  describe('getStockSummary', () => {
    it('should return stock summary with correct calculations', async () => {
      const products = [
        { name: 'A', stock: 10, contentfulId: '1' },
        { name: 'B', stock: 2, contentfulId: '2' },
        { name: 'C', stock: 0, contentfulId: '3' },
      ];
      productRepository.find.mockResolvedValue(products);

      const result = await controller.getStockSummary();

      expect(result).toEqual({
        totalStock: 12,
        averageStock: 4,
        lowStockProducts: [
          { name: 'B', stock: 2, contentfulId: '2' },
          { name: 'C', stock: 0, contentfulId: '3' },
        ],
      });
    });

    it('should apply filters for minStock, maxStock, and category', async () => {
      productRepository.find.mockResolvedValue([]);

      await controller.getStockSummary('5', '20', 'Electronics');
      expect(productRepository.find).toHaveBeenCalledWith({
        deleted: { $ne: true },
        category: 'Electronics',
        stock: { $gte: 5, $lte: 20 },
      });
    });
  });
});
