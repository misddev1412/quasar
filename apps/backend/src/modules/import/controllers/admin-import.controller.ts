
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImportJobService } from '@backend/modules/import/services/import-job.service';
import { JwtAuthGuard } from '@backend/auth/guards/jwt-auth.guard';

@ApiTags('Admin Import')
@Controller('admin/import')
@UseGuards(JwtAuthGuard)
export class AdminImportController {
    constructor(private readonly importJobService: ImportJobService) { }

    @Get('jobs/:id')
    @ApiOperation({ summary: 'Get import job status' })
    @ApiResponse({ status: 200, description: 'Return job details' })
    async getJobStatus(@Param('id') id: string) {
        return this.importJobService.getJob(id);
    }
}
