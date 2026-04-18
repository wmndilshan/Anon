import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { StaffGuard } from '../../common/guards/staff.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { JwtPayload } from '../auth/auth.types';
import { CreateAddressDto, UpdateAddressDto } from './dto/address.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Get('me')
  me(@CurrentUser() user: JwtPayload) {
    return this.users.getProfile(user.sub);
  }

  @Patch('me')
  updateMe(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.users.updateProfile(user.sub, dto);
  }

  @Get('me/addresses')
  addresses(@CurrentUser() user: JwtPayload) {
    return this.users.listAddresses(user.sub);
  }

  @Post('me/addresses')
  createAddr(@CurrentUser() user: JwtPayload, @Body() dto: CreateAddressDto) {
    return this.users.createAddress(user.sub, dto);
  }

  @Patch('me/addresses/:id')
  updateAddr(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateAddressDto) {
    return this.users.updateAddress(user.sub, id, dto);
  }

  @Delete('me/addresses/:id')
  deleteAddr(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.users.deleteAddress(user.sub, id);
  }
}

@ApiTags('admin-customers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, StaffGuard, PermissionsGuard)
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly users: UsersService) {}

  @Get()
  @RequirePermissions('users.read')
  list(@Query('page') page?: string, @Query('pageSize') ps?: string, @Query('q') q?: string) {
    return this.users.adminListCustomers(
      page ? parseInt(page, 10) : 1,
      ps ? parseInt(ps, 10) : 20,
      q,
    );
  }

  @Get(':id')
  @RequirePermissions('users.read')
  getOne(@Param('id') id: string) {
    return this.users.getProfile(id);
  }
}
