// src/contentful/contentful.service.ts
import { Injectable } from '@nestjs/common';
import { createClient, EntryFieldTypes } from 'contentful';

type ProductEntrySkeleton = {
  contentTypeId: 'product';
  id: EntryFieldTypes.Text;
  fields: {
    sku: EntryFieldTypes.Number;
    name: EntryFieldTypes.Text;
    brand: EntryFieldTypes.Text;
    model: EntryFieldTypes.Text;
    category: EntryFieldTypes.Text;
    color: EntryFieldTypes.Text;
    price: EntryFieldTypes.Number;
    currency: EntryFieldTypes.Text;
    stock: EntryFieldTypes.Number;
  };
};

@Injectable()
export class ContentfulService {
  private readonly client = createClient({
    space: process.env.CONTENTFUL_SPACE_ID || '',
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || '',
    environment: process.env.CONTENTFUL_ENVIRONMENT,
  });

  async getEntries(query?: any) {
    return await this.client.getEntries<ProductEntrySkeleton>(query);
  }
}
