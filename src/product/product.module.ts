import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductSchema } from './product.schema';
import { ProductRepository } from './product.repository';
import { ProductController } from './product.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
  ],
  providers: [ProductRepository],
  exports: [ProductRepository],
  controllers: [ProductController],
})
export class ProductModule {}
