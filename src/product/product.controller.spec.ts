import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductRepository } from './product.repository';
import { NotFoundException } from '@nestjs/common';

describe('ProductController', () => {
  let controller: ProductController;
  let productRepository: {
    find: jest.Mock;
    countDocuments: jest.Mock;
    softDelete: jest.Mock;
  };

  beforeEach(async () => {
    productRepository = {
      find: jest.fn(),
      countDocuments: jest.fn(),
      softDelete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [{ provide: ProductRepository, useValue: productRepository }],
    }).compile();

    controller = module.get<ProductController>(ProductController);
  });

  describe('findAll', () => {
    it('should return paginated products with filters', async () => {
      const mockItems = [{ name: 'A' }, { name: 'B' }];
      productRepository.find.mockResolvedValue(mockItems);
      productRepository.countDocuments.mockResolvedValue(10);

      const result = await controller.findAll(
        '2',
        'A',
        'Electronics',
        '10',
        '100',
      );

      expect(productRepository.find).toHaveBeenCalledWith(
        {
          deleted: { $ne: true },
          name: { $regex: 'A', $options: 'i' },
          category: 'Electronics',
          price: { $gte: 10, $lte: 100 },
        },
        undefined,
        { skip: 5, limit: 5 },
      );
      expect(productRepository.countDocuments).toHaveBeenCalledWith({
        deleted: { $ne: true },
        name: { $regex: 'A', $options: 'i' },
        category: 'Electronics',
        price: { $gte: 10, $lte: 100 },
      });
      expect(result).toEqual({
        items: mockItems,
        total: 10,
        page: 2,
        pageSize: 5,
        totalPages: 2,
      });
    });

    it('should handle missing filters and default page', async () => {
      productRepository.find.mockResolvedValue([]);
      productRepository.countDocuments.mockResolvedValue(0);

      const result = await controller.findAll();

      expect(productRepository.find).toHaveBeenCalledWith(
        { deleted: { $ne: true } },
        undefined,
        { skip: 0, limit: 5 },
      );
      expect(productRepository.countDocuments).toHaveBeenCalledWith({
        deleted: { $ne: true },
      });
      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        pageSize: 5,
        totalPages: 0,
      });
    });
  });

  describe('softDelete', () => {
    it('should delete product and return message', async () => {
      productRepository.softDelete.mockResolvedValue(true);
      const result = await controller.softDelete('abc123');
      expect(productRepository.softDelete).toHaveBeenCalledWith('abc123');
      expect(result).toEqual({ message: 'Product deleted' });
    });

    it('should throw NotFoundException if product not found', async () => {
      productRepository.softDelete.mockResolvedValue(false);
      await expect(controller.softDelete('notfound')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
