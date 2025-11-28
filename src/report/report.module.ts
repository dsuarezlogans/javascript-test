import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ReportController } from './report.controller';
import { ProductRepository } from '../product/product.repository';
import { ProductSchema } from '../product/product.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([{ name: 'Product', schema: ProductSchema }]),
  ],
  controllers: [ReportController],
  providers: [ProductRepository],
})
export class ReportModule {}
