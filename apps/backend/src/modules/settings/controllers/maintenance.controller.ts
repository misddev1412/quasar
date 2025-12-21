import { Body, Controller, Get, Post } from '@nestjs/common';
import { MaintenanceService } from '../services/maintenance.service';

@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get('status')
  async getStatus() {
    return this.maintenanceService.getStatus();
  }

  @Post('verify')
  async verify(@Body('password') password: string) {
    return this.maintenanceService.verifyPassword(password);
  }

  @Post('validate')
  async validate(@Body('token') token: string) {
    const valid = await this.maintenanceService.validateToken(token);
    return { valid };
  }
}
