import { Module, MiddlewareConsumer, NestModule, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { User } from '@backend/modules/user/entities/user.entity';
import { UserProfile } from '@backend/modules/user/entities/user-profile.entity';
import { Permission } from '@backend/modules/user/entities/permission.entity';
import { Role } from '@backend/modules/user/entities/role.entity';
import { UserRole } from '@backend/modules/user/entities/user-role.entity';
import { RolePermission } from '@backend/modules/user/entities/role-permission.entity';
import { UserActivity } from '@backend/modules/user/entities/user-activity.entity';
import { UserSession } from '@backend/modules/user/entities/user-session.entity';
import { UserLoginProvider } from '@backend/modules/user/entities/user-login-provider.entity';
import { UserImpersonationLog } from '@backend/modules/user/entities/user-impersonation-log.entity';
import { Customer } from '@backend/modules/products/entities/customer.entity';
import { AddressBook } from '@backend/modules/user/entities/address-book.entity';
import { AddressBookConfig } from '@backend/modules/user/entities/address-book-config.entity';
import { UserSecurity } from '@backend/modules/user/entities/user-security.entity';
import { Country } from '@backend/modules/products/entities/country.entity';
import { AdministrativeDivision } from '@backend/modules/products/entities/administrative-division.entity';
import { CustomerTransaction, CustomerTransactionEntry } from '@backend/modules/user/entities/customer-transaction.entity';
import { UserRepository } from '@backend/modules/user/repositories/user.repository';
import { PermissionRepository } from '@backend/modules/user/repositories/permission.repository';
import { RoleRepository } from '@backend/modules/user/repositories/role.repository';
import { UserActivityRepository } from '@backend/modules/user/repositories/user-activity.repository';
import { UserSessionRepository } from '@backend/modules/user/repositories/user-session.repository';
import { UserImpersonationRepository } from '@backend/modules/user/repositories/user-impersonation.repository';
import { CustomerRepository } from '@backend/modules/products/repositories/customer.repository';
import { AddressBookRepository } from '@backend/modules/user/repositories/address-book.repository';
import { AddressBookConfigRepository } from '@backend/modules/user/repositories/address-book-config.repository';
import { UserSecurityRepository } from '@backend/modules/user/repositories/user-security.repository';
import { CountryRepository } from '@backend/modules/products/repositories/country.repository';
import { AdministrativeDivisionRepository } from '@backend/modules/products/repositories/administrative-division.repository';
import { CustomerTransactionRepository } from '@backend/modules/user/repositories/customer-transaction.repository';
import { ActivityTrackingService } from '@backend/modules/user/services/activity-tracking.service';
import { UserActivityTrackingService } from '@backend/modules/user/services/user-activity-tracking.service';
import { UserActivityStatusService } from '@backend/modules/user/services/user-activity-status.service';
import { FirebaseAuthService } from '@backend/modules/user/services/firebase-auth.service';
import { UserService } from '@backend/modules/user/services/user.service';
import { ActivityTrackingMiddleware } from '@backend/modules/user/middleware/activity-tracking.middleware';
import { AdminActivityInterceptor } from '@backend/modules/user/interceptors/admin-activity.interceptor';
import { ActivityTrackingGuard, AdminActivityTrackingGuard } from '@backend/modules/user/guards/activity-tracking.guard';
import { AdminUserController } from '@backend/modules/user/controllers/admin-user.controller';
import { AdminPermissionService } from '@backend/modules/user/services/admin/admin-permission.service';
import { AdminRoleService } from '@backend/modules/user/services/admin/admin-role.service';
import { PermissionCheckerService } from '@backend/modules/shared/services/permission-checker.service';
import { AdminUserService } from '@backend/modules/user/services/admin/admin-user.service';
import { AdminUserStatisticsService } from '@backend/modules/user/services/admin/admin-user-statistics.service';
import { AdminCustomerTransactionService } from '@backend/modules/user/services/admin/admin-customer-transaction.service';
import { ClientUserService } from '@backend/modules/user/services/client/client-user.service';
import { AdminAddressBookService } from '@backend/modules/user/services/admin-address-book.service';
import { ClientAddressBookService } from '@backend/modules/user/services/client-address-book.service';
import { ClientSecurityService } from '@backend/modules/user/services/client-security.service';
import { UserImpersonationService } from '@backend/modules/user/services/user-impersonation.service';
import { AdminUserRouter, AdminUserPermissions } from '@backend/modules/user/routers/admin-user.router';
import { AdminUserStatisticsRouter } from '@backend/modules/user/routers/admin-user-statistics.router';
import { AdminUserActivityRouter } from '@backend/modules/user/routers/admin-user-activity.router';
import { AdminPermissionRouter } from '@backend/modules/user/routers/admin-permission.router';
import { AdminRoleRouter, AdminRolePermissions } from '@backend/modules/user/routers/admin-role.router';
import { AdminAddressBookRouter } from '@backend/modules/user/routers/admin-address-book.router';
import { ClientAddressBookRouter } from '@backend/modules/user/routers/client-address-book.router';
import { ClientSecurityRouter } from '@backend/modules/user/routers/client-security.router';
import { AdminCustomerTransactionsRouter } from '@backend/modules/user/routers/admin-customer-transactions.router';
import { AdminImpersonationRouter } from '@backend/modules/user/routers/admin-impersonation.router';
import { ClientUserRouter } from '@backend/trpc/routers/client';
import { SuperAdminMiddleware } from '@backend/trpc/middlewares/super-admin.middleware';
import { SharedModule } from '@backend/modules/shared/shared.module';
import { AuthModule } from '@backend/auth/auth.module';
import { FirebaseModule } from '@backend/modules/firebase/firebase.module';
import { ProductsModule } from '@backend/modules/products/products.module';
import { DataExportModule } from '@backend/modules/export/data-export.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserProfile, Permission, Role, UserRole, RolePermission, UserActivity, UserSession, UserLoginProvider, UserImpersonationLog, Customer, AddressBook, AddressBookConfig, UserSecurity, Country, AdministrativeDivision, CustomerTransaction, CustomerTransactionEntry]),
    SharedModule,
    forwardRef(() => AuthModule),
    FirebaseModule,
    forwardRef(() => ProductsModule),
    DataExportModule,
  ],
  controllers: [AdminUserController],
  providers: [
    // Repositories
    UserRepository,
    PermissionRepository,
    RoleRepository,
    UserActivityRepository,
    UserSessionRepository,
    UserImpersonationRepository,
    CustomerRepository,
    AddressBookRepository,
    AddressBookConfigRepository,
    UserSecurityRepository,
    CustomerTransactionRepository,

    // Services
    UserService,
    PermissionCheckerService,
    AdminPermissionService,
    AdminRoleService,
    AdminUserService,
    AdminUserStatisticsService,
    AdminCustomerTransactionService,
    ClientUserService,
    UserActivityTrackingService,
    ActivityTrackingService,
    UserActivityStatusService,
    FirebaseAuthService,
    AdminAddressBookService,
    ClientAddressBookService,
    ClientSecurityService,
    UserImpersonationService,

    // Activity Tracking Components
    AdminActivityInterceptor,
    ActivityTrackingGuard,
    AdminActivityTrackingGuard,

    // Global interceptor for admin activity tracking
    {
      provide: APP_INTERCEPTOR,
      useClass: AdminActivityInterceptor,
    },

    // TRPC Routers
    ...AdminUserPermissions,
    AdminUserRouter,
    AdminUserStatisticsRouter,
    AdminUserActivityRouter,
    ClientUserRouter,
    AdminPermissionRouter,
    ...AdminRolePermissions,
    AdminRoleRouter,
    AdminAddressBookRouter,
    ClientAddressBookRouter,
    ClientSecurityRouter,
    AdminCustomerTransactionsRouter,
    AdminImpersonationRouter,

    // TRPC Middlewares
    SuperAdminMiddleware,
  ],
  exports: [
    // Repositories
    UserRepository,
    PermissionRepository,
    RoleRepository,
    UserActivityRepository,
    UserSessionRepository,
    UserImpersonationRepository,
    CustomerTransactionRepository,

    // Services
    UserService,
    PermissionCheckerService,
    AdminPermissionService,
    AdminRoleService,
    AdminUserService,
    AdminUserStatisticsService,
    AdminCustomerTransactionService,
    ClientUserService,
    UserActivityTrackingService,
    ActivityTrackingService,
    UserActivityStatusService,
    FirebaseAuthService,
    UserImpersonationService,

    // Activity Tracking Components
    AdminActivityInterceptor,
    ActivityTrackingGuard,
    AdminActivityTrackingGuard,

    // TRPC Routers
    AdminUserRouter,
    AdminUserStatisticsRouter,
    AdminUserActivityRouter,
    ClientUserRouter,
    AdminPermissionRouter,
    AdminRoleRouter,
    AdminAddressBookRouter,
    ClientAddressBookRouter,
    ClientSecurityRouter,
    AdminCustomerTransactionsRouter,
    AdminImpersonationRouter,
  ],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply activity tracking middleware to admin routes
    consumer
      .apply(ActivityTrackingMiddleware)
      .forRoutes('admin/*', 'api/admin/*', 'trpc/admin/*');
  }
}
