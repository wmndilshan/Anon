import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CatalogService, ProductListQuery } from './catalog.service';

class ProductQueryDto implements ProductListQuery {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  pageSize?: number;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsString()
  brandSlug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isNew?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  onSale?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStock?: boolean;

  @IsOptional()
  @IsIn(['price_asc', 'price_desc', 'newest', 'popular'])
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

@ApiTags('catalog')
@Controller('catalog')
export class PublicCatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('products')
  products(@Query() query: ProductQueryDto) {
    return this.catalog.listProducts(query);
  }

  @Get('products/:slug')
  async productDetail(@Param('slug') slug: string) {
    const product = await this.catalog.getProductBySlug(slug);
    const categoryIds = product.categories.map((c) => c.categoryId);
    const related = categoryIds.length
      ? await this.catalog.relatedProducts(product.id, categoryIds)
      : [];
    return { product, related };
  }

  @Get('categories')
  categories() {
    return this.catalog.listCategories();
  }

  @Get('brands')
  brands() {
    return this.catalog.listBrands();
  }

  @Get('collections')
  collections(@Query('featured') featured?: string) {
    return this.catalog.listCollections(
      featured === 'true' ? true : featured === 'false' ? false : undefined,
    );
  }

  @Get('homepage')
  homepage() {
    return this.catalog.homepageBlocks();
  }
}
