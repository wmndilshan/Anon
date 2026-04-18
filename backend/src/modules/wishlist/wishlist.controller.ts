import { Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.types';
import { WishlistService } from './wishlist.service';

@ApiTags('wishlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wishlist')
export class WishlistController {
  constructor(private readonly wishlist: WishlistService) {}

  @Get()
  list(@CurrentUser() user: JwtPayload) {
    return this.wishlist.list(user.sub);
  }

  @Post(':productId')
  add(@CurrentUser() user: JwtPayload, @Param('productId') productId: string) {
    return this.wishlist.add(user.sub, productId);
  }

  @Delete(':productId')
  remove(@CurrentUser() user: JwtPayload, @Param('productId') productId: string) {
    return this.wishlist.remove(user.sub, productId);
  }
}
