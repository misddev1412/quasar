import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AdminActivityTrackingGuard } from '../guards/activity-tracking.guard';
import { AdminActivityInterceptor } from '../interceptors/admin-activity.interceptor';
import {
  TrackCreate,
  TrackUpdate,
  TrackDelete,
  TrackView,
  TrackSearch,
  TrackExport,
  TrackUserManagementAction,
  CurrentUser,
  ActivityContext,
} from '../decorators/track-activity.decorator';
import { AdminUserService } from '../services/admin/admin-user.service';
import { ActivityTrackingService } from '../services/activity-tracking.service';

@Controller('admin/users')
@UseGuards(AdminActivityTrackingGuard)
@UseInterceptors(AdminActivityInterceptor)
export class AdminUserController {
  constructor(
    private readonly adminUserService: AdminUserService,
    private readonly activityTrackingService: ActivityTrackingService,
  ) {}

  /**
   * Get all users with pagination and filtering
   */
  @Get()
  @TrackView('user', 'Admin viewed user list')
  async getUsers(
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    // The activity tracking is handled automatically by the decorator and interceptor
    const result = await this.adminUserService.getAllUsers({
      page,
      limit,
      search,
      role: role as any, // Cast to handle enum conversion
      isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
    });

    // Optionally track search if search term is provided
    if (search) {
      await this.activityTrackingService.trackActivity(
        'search' as any,
        context,
        `Admin searched users: "${search}"`,
        {
          action: 'search_users',
          resource: 'user',
          changes: { searchTerm: search, resultsCount: result.total },
        }
      );
    }

    return result;
  }

  /**
   * Get user by ID
   */
  @Get(':id')
  @TrackView('user', 'Admin viewed user details')
  async getUserById(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
  ) {
    return await this.adminUserService.getUserById(id);
  }

  /**
   * Create new user
   */
  @Post()
  @TrackUserManagementAction('create', 'Admin created new user')
  @HttpCode(HttpStatus.CREATED)
  async createUser(
    @Body() createUserDto: any,
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any,
  ) {
    const newUser = await this.adminUserService.createUser(createUserDto);

    // Track additional details about user creation
    await this.activityTrackingService.trackUserManagement(
      context,
      'create',
      newUser.id,
      {
        email: createUserDto.email,
        username: createUserDto.username,
        role: createUserDto.role,
        createdBy: currentUser.id,
      }
    );

    return newUser;
  }

  /**
   * Update user
   */
  @Put(':id')
  @TrackUserManagementAction('update', 'Admin updated user')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: any,
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any,
  ) {
    // Get current user data for comparison
    const currentUserData = await this.adminUserService.getUserById(id);

    const updatedUser = await this.adminUserService.updateUser(id, updateUserDto);

    // Track specific changes made
    const changes = this.getChanges(currentUserData, updateUserDto);
    await this.activityTrackingService.trackUserManagement(
      context,
      'update',
      id,
      {
        changes,
        updatedBy: currentUser.id,
        previousValues: this.extractPreviousValues(currentUserData, Object.keys(changes)),
      }
    );

    return updatedUser;
  }

  /**
   * Delete user
   */
  @Delete(':id')
  @TrackUserManagementAction('delete', 'Admin deleted user')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any,
  ) {
    // Get user data before deletion for audit trail
    const userToDelete = await this.adminUserService.getUserById(id);

    await this.adminUserService.deleteUser(id);

    // Track deletion with user details
    await this.activityTrackingService.trackUserManagement(
      context,
      'delete',
      id,
      {
        deletedUser: {
          email: userToDelete.email,
          username: userToDelete.username,
          role: userToDelete.role,
        },
        deletedBy: currentUser.id,
        deletedAt: new Date().toISOString(),
      }
    );
  }

  /**
   * Assign role to user
   */
  @Post(':id/roles')
  @TrackUserManagementAction('assign_role', 'Admin assigned role to user')
  async assignRole(
    @Param('id') userId: string,
    @Body() assignRoleDto: { roleId: string },
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any,
  ) {
    const result = await this.adminUserService.assignRole(userId, assignRoleDto.roleId);

    // Track role assignment
    await this.activityTrackingService.trackRolePermissionChange(
      context,
      'assign',
      'role',
      assignRoleDto.roleId,
      {
        targetUserId: userId,
        roleId: assignRoleDto.roleId,
        assignedBy: currentUser.id,
      }
    );

    return result;
  }

  /**
   * Remove role from user
   */
  @Delete(':id/roles/:roleId')
  @TrackUserManagementAction('remove_role', 'Admin removed role from user')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeRole(
    @Param('id') userId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any,
  ) {
    await this.adminUserService.removeRole(userId, roleId);

    // Track role removal
    await this.activityTrackingService.trackRolePermissionChange(
      context,
      'remove',
      'role',
      roleId,
      {
        targetUserId: userId,
        roleId,
        removedBy: currentUser.id,
      }
    );
  }

  /**
   * Activate/Deactivate user
   */
  @Put(':id/status')
  @TrackUserManagementAction('status_change', 'Admin changed user status')
  async changeUserStatus(
    @Param('id') userId: string,
    @Body() statusDto: { isActive: boolean },
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any,
  ) {
    const result = await this.adminUserService.updateUserStatus(userId, statusDto.isActive);

    // Track status change
    await this.activityTrackingService.trackUserManagement(
      context,
      statusDto.isActive ? 'activate' : 'deactivate',
      userId,
      {
        newStatus: statusDto.isActive ? 'active' : 'inactive',
        changedBy: currentUser.id,
      }
    );

    return result;
  }

  /**
   * Export users data
   */
  @Get('export/:format')
  @TrackExport('user', 'Admin exported users data')
  async exportUsers(
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any,
    @Param('format') format: string,
    @Query('filters') filters?: string,
  ) {
    const exportData = await this.adminUserService.exportUsers(format, filters);

    // Track export operation
    await this.activityTrackingService.trackDataExport(
      context,
      'users',
      exportData.recordCount
    );

    return exportData;
  }

  /**
   * Bulk operations on users
   */
  @Post('bulk/:action')
  @TrackUserManagementAction('bulk_operation', 'Admin performed bulk operation on users')
  async bulkOperation(
    @Param('action') action: string,
    @Body() bulkDto: { userIds: string[]; data?: any },
    @CurrentUser() currentUser: any,
    @ActivityContext() context: any,
  ) {
    const result = await this.adminUserService.bulkOperation(action, bulkDto.userIds, bulkDto.data);

    // Track bulk operation
    await this.activityTrackingService.trackUserManagement(
      context,
      `bulk_${action}`,
      'multiple',
      {
        action,
        targetUserIds: bulkDto.userIds,
        affectedCount: bulkDto.userIds.length,
        operationData: bulkDto.data,
        performedBy: currentUser.id,
      }
    );

    return result;
  }

  /**
   * Helper method to detect changes between current and new data
   */
  private getChanges(currentData: any, newData: any): Record<string, any> {
    const changes: Record<string, any> = {};

    Object.keys(newData).forEach(key => {
      if (key !== 'password' && currentData[key] !== newData[key]) {
        changes[key] = newData[key];
      }
    });

    return changes;
  }

  /**
   * Helper method to extract previous values for audit trail
   */
  private extractPreviousValues(currentData: any, changedKeys: string[]): Record<string, any> {
    const previousValues: Record<string, any> = {};

    changedKeys.forEach(key => {
      if (key !== 'password') {
        previousValues[key] = currentData[key];
      }
    });

    return previousValues;
  }
}
