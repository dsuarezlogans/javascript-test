import {
  Controller,
  Get,
  Query,
  Delete,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ProductRepository } from './product.repository';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductController {
  constructor(private readonly productRepository: ProductRepository) {}

  @Get()
  @ApiOperation({ summary: 'Get all products with pagination and filters' })
  @ApiQuery({
    name: 'page',
    required: false,
    type: String,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by product name (partial match)',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'minPrice',
    required: false,
    type: String,
    description: 'Minimum price',
  })
  @ApiQuery({
    name: 'maxPrice',
    required: false,
    type: String,
    description: 'Maximum price',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of products' })
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

    // Build filter object
    const filter: Record<string, any> = { deleted: { $ne: true } };
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

    // Apply filters to both find and countDocuments
    const [items, total] = await Promise.all([
      this.productRepository.find(filter, undefined, { skip, limit: pageSize }),
      this.productRepository.countDocuments(filter),
    ]);

    return {
      items,
      total,
      page: pageNumber,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a product by ID' })
  @ApiParam({
    name: 'id',
    required: true,
    description: 'Product ID (contentfulId)',
  })
  @ApiResponse({ status: 200, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async softDelete(@Param('id') id: string) {
    const result = await this.productRepository.softDelete(id);
    if (!result) {
      throw new NotFoundException('Product not found');
    }
    return { message: 'Product deleted' };
  }
}
