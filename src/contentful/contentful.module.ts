// src/contentful/contentful.module.ts
import { Module } from '@nestjs/common';
import { ContentfulService } from './contentful.service';

@Module({
  imports: [],
  providers: [ContentfulService],
  exports: [ContentfulService],
})
export class ContentfulModule {}
