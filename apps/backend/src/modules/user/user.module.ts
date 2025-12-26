import { Module, MiddlewareConsumer, NestModule, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { User } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { Permission } from './entities/permission.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { UserActivity } from './entities/user-activity.entity';
import { UserSession } from './entities/user-session.entity';
import { UserLoginProvider } from './entities/user-login-provider.entity';
import { UserImpersonationLog } from './entities/user-impersonation-log.entity';
import { Customer } from '../products/entities/customer.entity';
import { AddressBook } from './entities/address-book.entity';
import { AddressBookConfig } from './entities/address-book-config.entity';
import { UserSecurity } from './entities/user-security.entity';
import { Country } from '../products/entities/country.entity';
import { AdministrativeDivision } from '../products/entities/administrative-division.entity';
import { CustomerTransaction, CustomerTransactionEntry } from './entities/customer-transaction.entity';
import { UserRepository } from './repositories/user.repository';
import { PermissionRepository } from './repositories/permission.repository';
import { RoleRepository } from './repositories/role.repository';
import { UserActivityRepository } from './repositories/user-activity.repository';
import { UserSessionRepository } from './repositories/user-session.repository';
import { UserImpersonationRepository } from './repositories/user-impersonation.repository';
import { CustomerRepository } from '../products/repositories/customer.repository';
import { AddressBookRepository } from './repositories/address-book.repository';
import { AddressBookConfigRepository } from './repositories/address-book-config.repository';
import { UserSecurityRepository } from './repositories/user-security.repository';
import { CountryRepository } from '../products/repositories/country.repository';
import { AdministrativeDivisionRepository } from '../products/repositories/administrative-division.repository';
import { CustomerTransactionRepository } from './repositories/customer-transaction.repository';
import { ActivityTrackingService } from './services/activity-tracking.service';
import { UserActivityTrackingService } from './services/user-activity-tracking.service';
import { UserActivityStatusService } from './services/user-activity-status.service';
import { FirebaseAuthService } from './services/firebase-auth.service';
import { UserService } from './services/user.service';
import { ActivityTrackingMiddleware } from './middleware/activity-tracking.middleware';
import { AdminActivityInterceptor } from './interceptors/admin-activity.interceptor';
import { ActivityTrackingGuard, AdminActivityTrackingGuard } from './guards/activity-tracking.guard';
import { AdminUserController } from './controllers/admin-user.controller';
import { AdminPermissionService } from './services/admin/admin-permission.service';
import { AdminRoleService } from './services/admin/admin-role.service';
import { PermissionCheckerService } from '../shared/services/permission-checker.service';
import { AdminUserService } from './services/admin/admin-user.service';
import { AdminUserStatisticsService } from './services/admin/admin-user-statistics.service';
import { AdminCustomerTransactionService } from './services/admin/admin-customer-transaction.service';
import { ClientUserService } from './services/client/client-user.service';
import { AdminAddressBookService } from './services/admin-address-book.service';
import { ClientAddressBookService } from './services/client-address-book.service';
import { ClientSecurityService } from './services/client-security.service';
import { UserImpersonationService } from './services/user-impersonation.service';
import { AdminUserRouter, AdminUserPermissions } from './routers/admin-user.router';
import { AdminUserStatisticsRouter } from './routers/admin-user-statistics.router';
import { AdminUserActivityRouter } from './routers/admin-user-activity.router';
import { AdminPermissionRouter } from './routers/admin-permission.router';
import { AdminRoleRouter, AdminRolePermissions } from './routers/admin-role.router';
import { AdminAddressBookRouter } from './routers/admin-address-book.router';
import { ClientAddressBookRouter } from './routers/client-address-book.router';
import { ClientSecurityRouter } from './routers/client-security.router';
import { AdminCustomerTransactionsRouter } from './routers/admin-customer-transactions.router';
import { AdminImpersonationRouter } from './routers/admin-impersonation.router';
import { ClientUserRouter } from '../../trpc/routers/client';
import { SuperAdminMiddleware } from '../../trpc/middlewares/super-admin.middleware';
import { SharedModule } from '../shared/shared.module';
import { AuthModule } from '../../auth/auth.module';
import { FirebaseModule } from '../firebase/firebase.module';
import { ProductsModule } from '../products/products.module';
import { DataExportModule } from '../export/data-export.module';

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
