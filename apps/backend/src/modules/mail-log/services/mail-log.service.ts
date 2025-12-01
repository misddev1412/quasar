import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { MailLogRepository } from '../repositories/mail-log.repository';
import { CreateMailLogDto, MailLogFilters } from '../dto/mail-log.dto';
import { MailLog } from '../entities/mail-log.entity';
import { User } from '../../user/entities/user.entity';

@Injectable()
export class MailLogService {
  constructor(
    private readonly mailLogRepository: MailLogRepository,
  ) {}

  async createLog(createDto: CreateMailLogDto): Promise<MailLog> {
    try {
      return await this.mailLogRepository.createLog(createDto);
    } catch (error: any) {
      throw new BadRequestException(`Failed to create mail log: ${error.message}`);
    }
  }

  async getLogs(filters: MailLogFilters) {
    try {
      const result = await this.mailLogRepository.findPaginated(filters);
      const items = result.items.map((log) => this.serializeMailLog(log));
      return {
        success: true,
        data: {
          ...result,
          items,
        },
        message: 'Mail logs retrieved successfully',
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to retrieve mail logs: ${error.message}`);
    }
  }

  async getLogById(id: string) {
    const log = await this.mailLogRepository.findByIdWithRelations(id);
    if (!log) {
      throw new NotFoundException('Mail log not found');
    }

    return {
      success: true,
      data: this.serializeMailLog(log),
      message: 'Mail log retrieved successfully',
    };
  }

  async getStatistics() {
    try {
      const stats = await this.mailLogRepository.getStatistics();
      return {
        success: true,
        data: stats,
        message: 'Mail log statistics retrieved successfully',
      };
    } catch (error: any) {
      throw new BadRequestException(`Failed to retrieve mail log statistics: ${error.message}`);
    }
  }

  private serializeMailLog(log: MailLog) {
    if (!log) {
      return log;
    }
    const { triggeredByUser } = log;
    const formatted = {
      ...log,
      triggeredByUser: triggeredByUser ? this.mapTriggeredByUser(triggeredByUser) : null,
    };
    return formatted;
  }

  private mapTriggeredByUser(user: User) {
    if (!user) {
      return null;
    }
    const profile = user.profile
      ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          avatar: user.profile.avatar,
        }
      : undefined;

    return {
      id: user.id,
      email: user.email,
      username: user.username,
      profile,
    };
  }
}
