import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, UpdateWriteOpResult } from 'mongoose';
import { ProductDocument } from './product.schema';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel('Product') private productModel: Model<ProductDocument>,
  ) {}

  async upsertByContentfulId(entry: any): Promise<UpdateWriteOpResult> {
    const contentfulId = entry.sys.id;

    const results = await this.productModel.updateOne(
      { contentfulId },
      {
        $set: {
          contentfulId,
          ...entry.fields,
        },
      },
      { upsert: true },
    );

    return results;
  }

  async findAll(): Promise<ProductDocument[]> {
    const products = await this.productModel.find().lean().exec();

    return products as unknown as ProductDocument[];
  }

  async find(
    filter: Record<string, any>,
    projection?: Record<string, any>,
    options?: { skip?: number; limit?: number },
  ): Promise<ProductDocument[]> {
    let query = this.productModel.find(filter, projection);

    if (options?.skip !== undefined) {
      query = query.skip(options.skip);
    }
    if (options?.limit !== undefined) {
      query = query.limit(options.limit);
    }

    const result = await query.lean().exec();
    return result as unknown as ProductDocument[];
  }

  async countDocuments(): Promise<number> {
    return this.productModel.countDocuments().exec();
  }
}
