import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, UpdateWriteOpResult } from 'mongoose';
import { ProductDocument } from './product.schema';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel('Product') private productModel: Model<ProductDocument>,
  ) {}

  async upsertByContentfulId(entry: any): Promise<UpdateWriteOpResult | null> {
    const contentfulId = entry.sys.id;

    // Check if the product is marked as deleted
    const existing = await this.productModel.findOne({ contentfulId }).lean();
    if (existing && existing.deleted) {
      // Skip upsert if deleted
      return null;
    }

    const results = await this.productModel.updateOne(
      { contentfulId },
      {
        $set: {
          contentfulId,
          createdAt: new Date(String(entry.sys.createdAt)),
          updatedAt: new Date(String(entry.sys.updatedAt)),
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

  async countDocuments(filter: Record<string, any> = {}): Promise<number> {
    return this.productModel.countDocuments(filter).exec();
  }

  async softDelete(id: string): Promise<boolean> {
    const res = await this.productModel.updateOne(
      { contentfulId: id, deleted: { $ne: true } },
      { $set: { deleted: true } },
    );
    return res.modifiedCount > 0;
  }
}
