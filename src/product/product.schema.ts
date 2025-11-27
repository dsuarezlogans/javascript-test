import { Schema, Document } from 'mongoose';

export interface ProductDocument extends Document {
  contentfulId: string;
  sku: number;
  name: string;
  brand: string;
  modelName: string;
  category: string;
  color: string;
  price: number;
  currency: string;
  stock: number;
}

export const ProductSchema = new Schema<ProductDocument>({
  contentfulId: { type: String, unique: true },
  sku: Number,
  name: String,
  brand: String,
  modelName: String,
  category: String,
  color: String,
  price: Number,
  currency: String,
  stock: Number,
});
