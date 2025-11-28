import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ProductRepository } from '../product/product.repository';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Report')
@UseGuards(JwtAuthGuard)
@Controller('report')
export class ReportController {
  constructor(private readonly productRepository: ProductRepository) {}

  @Get('deleted-products')
  @ApiOperation({ summary: 'Get percentage and count of deleted products' })
  @ApiResponse({ status: 200, description: 'Deleted products report' })
  async getDeletedProducts() {
    const total = await this.productRepository.countDocuments();
    const deleted = await this.productRepository.countDocuments({
      deleted: true,
    });
    const percentage = total === 0 ? 0 : (deleted / total) * 100;
    return {
      'Deleted products %': percentage,
      'Total of products': total,
      'Total of deleted products': deleted,
    };
  }

  @Get('existing-products')
  @ApiOperation({
    summary:
      'Get percentage and count of non-deleted products with optional filters',
  })
  @ApiQuery({
    name: 'withPrice',
    required: false,
    type: String,
    enum: ['true', 'false'],
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'ISO date string',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'ISO date string',
  })
  @ApiResponse({ status: 200, description: 'Non-deleted products report' })
  async getExistingProducts(
    @Query('withPrice') withPrice?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const dateFilter: Record<string, any> = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const nonDeletedFilter: Record<string, any> = {
      deleted: { $ne: true },
      ...dateFilter,
    };
    const allFilter: Record<string, any> = { ...dateFilter };

    if (withPrice === 'true') {
      nonDeletedFilter.price = { $ne: null };
      allFilter.price = { $ne: null };
    } else if (withPrice === 'false') {
      nonDeletedFilter.price = null;
      allFilter.price = null;
    }

    const [total, nonDeleted] = await Promise.all([
      this.productRepository.countDocuments(allFilter),
      this.productRepository.countDocuments(nonDeletedFilter),
    ]);

    const percentage = total === 0 ? 0 : (nonDeleted / total) * 100;
    return {
      'Existing products %': percentage,
      'Total of products': total,
      'Total of existing products': nonDeleted,
    };
  }

  @Get('stock-summary')
  @ApiOperation({ summary: 'Get stock summary for products' })
  @ApiQuery({
    name: 'minStock',
    required: false,
    type: String,
    description: 'Minimum stock',
  })
  @ApiQuery({
    name: 'maxStock',
    required: false,
    type: String,
    description: 'Maximum stock',
  })
  @ApiQuery({
    name: 'category',
    required: false,
    type: String,
    description: 'Product category',
  })
  @ApiResponse({ status: 200, description: 'Stock summary report' })
  async getStockSummary(
    @Query('minStock') minStock?: string,
    @Query('maxStock') maxStock?: string,
    @Query('category') category?: string,
  ) {
    const filter: Record<string, any> = { deleted: { $ne: true } };
    if (category) filter.category = category;
    if (minStock) filter.stock = { ...filter.stock, $gte: Number(minStock) };
    if (maxStock) filter.stock = { ...filter.stock, $lte: Number(maxStock) };

    const products = await this.productRepository.find(filter);

    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const averageStock = products.length > 0 ? totalStock / products.length : 0;
    const lowStockProducts = products.filter((p) => (p.stock || 0) < 5);

    return {
      totalStock,
      averageStock,
      lowStockProducts: lowStockProducts.map((p) => ({
        name: p.name,
        stock: p.stock,
        contentfulId: p.contentfulId,
      })),
    };
  }
}
