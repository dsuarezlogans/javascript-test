import { Controller, Get, Query } from '@nestjs/common';
import { ProductRepository } from './product.repository';

@Controller('products')
export class ProductController {
  constructor(private readonly productRepository: ProductRepository) {}

  @Get()
  async findAll(
    @Query('page') page: string = '1',
    @Query('name') name?: string,
    @Query('category') category?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    const pageNumber = parseInt(page, 10) || 1;
    const pageSize = 5;
    const skip = (pageNumber - 1) * pageSize;

    const filter: Record<string, any> = {};
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    if (category) {
      filter.category = category;
    }
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const [items, total] = await Promise.all([
      this.productRepository.find(filter, undefined, { skip, limit: pageSize }),
      this.productRepository.countDocuments(),
    ]);

    return {
      items,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
