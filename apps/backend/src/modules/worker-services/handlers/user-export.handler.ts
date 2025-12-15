import { Injectable, OnModuleInit } from '@nestjs/common';
import { BaseExportHandler, ExportPageResult } from '../../export/handlers/base-export.handler';
import { ExportHandlerRegistry } from '../../export/services/export-handler.registry';
import { ExportColumnDefinition } from '../../export/entities/data-export-job.entity';
import { UserRepository, UserFilters } from '../../user/repositories/user.repository';
import { User } from '../../user/entities/user.entity';
import { USER_EXPORT_COLUMNS } from '../../user/export/user-export.columns';

@Injectable()
export class UserExportHandler extends BaseExportHandler<Record<string, any>, User> implements OnModuleInit {
  readonly resource = 'users';

  constructor(
    private readonly userRepository: UserRepository,
    private readonly registry: ExportHandlerRegistry,
  ) {
    super();
  }

  onModuleInit(): void {
    this.registry.register(this);
  }

  getColumns(): ExportColumnDefinition[] {
    return USER_EXPORT_COLUMNS;
  }

  async fetchPage(
    params: { page: number; limit: number },
    filters?: Record<string, any>
  ): Promise<ExportPageResult<User>> {
    const parsedFilters: UserFilters = {
      page: params.page,
      limit: params.limit,
      search: typeof filters?.search === 'string' ? filters.search : undefined,
      isActive:
        typeof filters?.isActive === 'boolean'
          ? filters.isActive
          : filters?.isActive === 'true'
            ? true
            : filters?.isActive === 'false'
              ? false
              : undefined,
    };

    const result = await this.userRepository.findUsersWithFilters(parsedFilters);
    return {
      items: result.items,
      total: result.total,
    };
  }

  transformRecord(user: User): Record<string, any> {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      isActive: user.isActive,
      createdAt: user.createdAt,
      profile: {
        firstName: user.profile?.firstName,
        lastName: user.profile?.lastName,
        phoneNumber: user.profile?.phoneNumber,
      },
    };
  }
}
