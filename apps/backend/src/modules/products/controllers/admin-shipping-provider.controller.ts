import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AdminShippingProviderService } from '../services/admin-shipping-provider.service';
import { CreateShippingProviderDto } from '../dto/create-shipping-provider.dto';
import { UpdateShippingProviderDto } from '../dto/update-shipping-provider.dto';
import { ShippingProvider } from '../entities/shipping-provider.entity';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';

@ApiTags('Admin Shipping Providers')
@UseGuards(JwtAuthGuard)
@Controller('admin/shipping-providers')
export class AdminShippingProviderController {
  constructor(
    private readonly adminShippingProviderService: AdminShippingProviderService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new shipping provider' })
  @ApiResponse({ status: 201, description: 'Shipping provider created successfully', type: ShippingProvider })
  create(@Body() createShippingProviderDto: CreateShippingProviderDto) {
    return this.adminShippingProviderService.create(createShippingProviderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all shipping providers' })
  @ApiResponse({ status: 200, description: 'List of all shipping providers', type: [ShippingProvider] })
  findAll() {
    return this.adminShippingProviderService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a shipping provider by ID' })
  @ApiResponse({ status: 200, description: 'Shipping provider found', type: ShippingProvider })
  findOne(@Param('id') id: string) {
    return this.adminShippingProviderService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a shipping provider' })
  @ApiResponse({ status: 200, description: 'Shipping provider updated successfully', type: ShippingProvider })
  update(
    @Param('id') id: string,
    @Body() updateShippingProviderDto: UpdateShippingProviderDto,
  ) {
    return this.adminShippingProviderService.update(id, updateShippingProviderDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a shipping provider' })
  @ApiResponse({ status: 204, description: 'Shipping provider deleted successfully' })
  remove(@Param('id') id: string) {
    return this.adminShippingProviderService.remove(id);
  }

  @Patch(':id/toggle-active')
  @ApiOperation({ summary: 'Toggle shipping provider active status' })
  @ApiResponse({ status: 200, description: 'Shipping provider status updated', type: ShippingProvider })
  toggleActive(@Param('id') id: string) {
    return this.adminShippingProviderService.toggleActive(id);
  }
}
