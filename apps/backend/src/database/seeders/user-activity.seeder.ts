import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../modules/user/entities/user.entity';
import { UserProfile } from '../../modules/user/entities/user-profile.entity';
import { UserActivity, ActivityType } from '../../modules/user/entities/user-activity.entity';
import { UserSession, SessionStatus } from '../../modules/user/entities/user-session.entity';
import { Role } from '../../modules/user/entities/role.entity';
import { UserRole as UserRoleEntity } from '../../modules/user/entities/user-role.entity';
import { UserRole } from '@shared';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UserActivitySeeder {
  private readonly logger = new Logger(UserActivitySeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(UserActivity)
    private readonly userActivityRepository: Repository<UserActivity>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
  ) {}

  /**
   * Seed sample users and their activities
   */
  async seed(): Promise<void> {
    this.logger.log('🎯 Creating sample users and user activities...');

    // Check if activities already exist
    const existingActivities = await this.userActivityRepository.count();
    if (existingActivities > 0) {
      this.logger.log('⚠️ User activities already exist, skipping seeding');
      return;
    }

    try {
      // Create sample users first
      const sampleUsers = await this.createSampleUsers();
      
      // Create user sessions
      const sessions = await this.createUserSessions(sampleUsers);
      
      // Create diverse user activities
      await this.createUserActivities(sampleUsers, sessions);
      
      this.logger.log('✅ Successfully created sample users and user activities');
    } catch (error) {
      this.logger.error(`❌ Failed to seed user activities: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create sample users for activity tracking
   */
  private async createSampleUsers(): Promise<User[]> {
    this.logger.log('👥 Creating sample users...');

    const userRole = await this.roleRepository.findOne({
      where: { code: UserRole.USER }
    });

    const adminRole = await this.roleRepository.findOne({
      where: { code: UserRole.ADMIN }
    });

    if (!userRole || !adminRole) {
      throw new Error('Required roles not found. Please run permission seeder first.');
    }

    const sampleUsersData = [
      {
        email: 'john.doe@example.com',
        username: 'johndoe',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
        profile: {
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '+1-555-0101',
          bio: 'Software developer and tech enthusiast',
          city: 'San Francisco',
          country: 'USA'
        },
        role: userRole
      },
      {
        email: 'jane.smith@example.com',
        username: 'janesmith',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
        profile: {
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '+1-555-0102',
          bio: 'Product manager with 5+ years experience',
          city: 'New York',
          country: 'USA'
        },
        role: adminRole
      },
      {
        email: 'mike.wilson@example.com',
        username: 'mikewilson',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
        profile: {
          firstName: 'Mike',
          lastName: 'Wilson',
          phoneNumber: '+1-555-0103',
          bio: 'UX designer passionate about user experience',
          city: 'Austin',
          country: 'USA'
        },
        role: userRole
      },
      {
        email: 'admin.user@example.com',
        username: 'adminuser',
        password: await bcrypt.hash('password123', 10),
        isActive: true,
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          phoneNumber: '+1-555-0104',
          bio: 'System administrator',
          city: 'Seattle',
          country: 'USA'
        },
        role: adminRole
      }
    ];

    const createdUsers: User[] = [];

    for (const userData of sampleUsersData) {
      // Check if user already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: userData.email }
      });

      if (existingUser) {
        createdUsers.push(existingUser);
        continue;
      }

      // Create user
      const user = this.userRepository.create({
        email: userData.email,
        username: userData.username,
        password: userData.password,
        isActive: userData.isActive
      });

      const savedUser = await this.userRepository.save(user);

      // Create user profile
      const profile = this.userProfileRepository.create({
        userId: savedUser.id,
        ...userData.profile
      });

      await this.userProfileRepository.save(profile);

      // Assign role
      const userRole = this.userRoleRepository.create({
        userId: savedUser.id,
        roleId: userData.role.id,
        isActive: true
      });

      await this.userRoleRepository.save(userRole);

      createdUsers.push(savedUser);
    }

    this.logger.log(`✅ Created ${createdUsers.length} sample users`);
    return createdUsers;
  }

  /**
   * Create user sessions for activity tracking
   */
  private async createUserSessions(users: User[]): Promise<UserSession[]> {
    this.logger.log('🔐 Creating user sessions...');

    const sessions: UserSession[] = [];
    const now = new Date();

    for (const user of users) {
      // Create 2-3 sessions per user with different time ranges
      const sessionCount = Math.floor(Math.random() * 2) + 2; // 2-3 sessions

      for (let i = 0; i < sessionCount; i++) {
        const sessionStart = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Last 7 days
        const sessionEnd = new Date(sessionStart.getTime() + Math.random() * 4 * 60 * 60 * 1000); // 0-4 hours duration

        const session = this.userSessionRepository.create({
          userId: user.id,
          sessionToken: `session_${user.id}_${i}_${Date.now()}`,
          ipAddress: this.getRandomIpAddress(),
          userAgent: this.getRandomUserAgent(),
          deviceType: this.getRandomDeviceType(),
          browser: this.getRandomBrowser(),
          operatingSystem: this.getRandomOS(),
          status: Math.random() > 0.3 ? SessionStatus.ACTIVE : SessionStatus.EXPIRED,
          loginAt: sessionStart,
          lastActivityAt: sessionEnd,
          logoutAt: Math.random() > 0.3 ? null : sessionEnd,
          expiresAt: new Date(sessionEnd.getTime() + 24 * 60 * 60 * 1000), // 24 hours from last activity
          isRememberMe: Math.random() > 0.7,
          createdAt: sessionStart,
          updatedAt: sessionEnd
        });

        const savedSession = await this.userSessionRepository.save(session);
        sessions.push(savedSession);
      }
    }

    this.logger.log(`✅ Created ${sessions.length} user sessions`);
    return sessions;
  }

  /**
   * Create diverse user activities
   */
  private async createUserActivities(users: User[], sessions: UserSession[]): Promise<void> {
    this.logger.log('📊 Creating user activities...');

    const activities: Partial<UserActivity>[] = [];
    const now = new Date();

    for (const user of users) {
      const userSessions = sessions.filter(s => s.userId === user.id);
      
      for (const session of userSessions) {
        const sessionStart = session.createdAt;
        const sessionEnd = session.lastActivityAt;
        
        // Generate activities for this session
        const sessionActivities = this.generateSessionActivities(user, session, sessionStart, sessionEnd);
        activities.push(...sessionActivities);
      }
    }

    // Save all activities in batches
    const batchSize = 50;
    for (let i = 0; i < activities.length; i += batchSize) {
      const batch = activities.slice(i, i + batchSize);
      await this.userActivityRepository.save(batch);
    }

    this.logger.log(`✅ Created ${activities.length} user activities`);
  }

  /**
   * Generate activities for a specific user session
   */
  private generateSessionActivities(
    user: User, 
    session: UserSession, 
    sessionStart: Date, 
    sessionEnd: Date
  ): Partial<UserActivity>[] {
    const activities: Partial<UserActivity>[] = [];
    const sessionDuration = sessionEnd.getTime() - sessionStart.getTime();
    
    // Always start with login
    activities.push({
      userId: user.id,
      sessionId: session.sessionToken,
      activityType: ActivityType.LOGIN,
      activityDescription: 'User logged in',
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      requestPath: '/auth/login',
      requestMethod: 'POST',
      responseStatus: 200,
      durationMs: Math.floor(Math.random() * 500) + 100,
      isSuccessful: true,
      metadata: {
        deviceType: session.deviceType,
        browser: session.browser,
        operatingSystem: session.operatingSystem,
        loginMethod: 'email'
      },
      createdAt: sessionStart
    });

    // Generate random activities during the session
    const activityCount = Math.floor(sessionDuration / (5 * 60 * 1000)) + 1; // One activity every ~5 minutes
    
    for (let i = 1; i < activityCount; i++) {
      const activityTime = new Date(sessionStart.getTime() + (sessionDuration * i / activityCount));
      const activity = this.generateRandomActivity(user, session, activityTime);
      activities.push(activity);
    }

    // End with logout (if session is expired)
    if (session.status === SessionStatus.EXPIRED) {
      activities.push({
        userId: user.id,
        sessionId: session.sessionToken,
        activityType: ActivityType.LOGOUT,
        activityDescription: 'User logged out',
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
        requestPath: '/auth/logout',
        requestMethod: 'POST',
        responseStatus: 200,
        durationMs: Math.floor(Math.random() * 200) + 50,
        isSuccessful: true,
        metadata: {
          logoutMethod: 'manual'
        },
        createdAt: sessionEnd
      });
    }

    return activities;
  }

  /**
   * Generate a random activity for a user session
   */
  private generateRandomActivity(user: User, session: UserSession, timestamp: Date): Partial<UserActivity> {
    const activityTypes = [
      ActivityType.PAGE_VIEW,
      ActivityType.API_CALL,
      ActivityType.SEARCH,
      ActivityType.VIEW,
      ActivityType.UPDATE,
      ActivityType.CREATE,
      ActivityType.PROFILE_UPDATE,
      ActivityType.SETTINGS_UPDATE,
      ActivityType.ADMIN_ACTION,
      ActivityType.FILE_UPLOAD,
      ActivityType.FILE_DOWNLOAD,
      ActivityType.EXPORT
    ];

    const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];

    return this.createActivityByType(user, session, activityType, timestamp);
  }

  /**
   * Create activity based on type with realistic data
   */
  private createActivityByType(
    user: User,
    session: UserSession,
    activityType: ActivityType,
    timestamp: Date
  ): Partial<UserActivity> {
    const baseActivity = {
      userId: user.id,
      sessionId: session.sessionToken,
      activityType,
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      isSuccessful: Math.random() > 0.05, // 95% success rate
      createdAt: timestamp
    };

    switch (activityType) {
      case ActivityType.PAGE_VIEW:
        return {
          ...baseActivity,
          activityDescription: 'User viewed a page',
          requestPath: this.getRandomPagePath(),
          requestMethod: 'GET',
          responseStatus: 200,
          durationMs: Math.floor(Math.random() * 1000) + 100,
          metadata: {
            pageTitle: this.getRandomPageTitle(),
            referrer: Math.random() > 0.5 ? 'https://google.com' : null,
            timeOnPage: Math.floor(Math.random() * 300000) + 5000 // 5s to 5min
          }
        };

      case ActivityType.API_CALL:
        return {
          ...baseActivity,
          activityDescription: 'API endpoint called',
          requestPath: this.getRandomApiPath(),
          requestMethod: this.getRandomHttpMethod(),
          responseStatus: Math.random() > 0.1 ? 200 : 400,
          durationMs: Math.floor(Math.random() * 2000) + 50,
          metadata: {
            endpoint: this.getRandomApiPath(),
            responseSize: Math.floor(Math.random() * 10000) + 100
          }
        };

      case ActivityType.SEARCH:
        return {
          ...baseActivity,
          activityDescription: 'User performed search',
          requestPath: '/search',
          requestMethod: 'GET',
          responseStatus: 200,
          durationMs: Math.floor(Math.random() * 1500) + 200,
          metadata: {
            query: this.getRandomSearchQuery(),
            resultsCount: Math.floor(Math.random() * 100) + 1,
            filters: this.getRandomSearchFilters()
          }
        };

      case ActivityType.ADMIN_ACTION:
        return {
          ...baseActivity,
          activityDescription: 'Admin panel action performed',
          requestPath: this.getRandomAdminPath(),
          requestMethod: this.getRandomHttpMethod(),
          responseStatus: 200,
          durationMs: Math.floor(Math.random() * 1000) + 100,
          resourceType: 'admin',
          metadata: {
            adminPanel: true,
            action: this.getRandomAdminAction(),
            targetResource: this.getRandomAdminResource()
          }
        };

      case ActivityType.PROFILE_UPDATE:
        return {
          ...baseActivity,
          activityDescription: 'User updated profile',
          requestPath: '/profile',
          requestMethod: 'PUT',
          responseStatus: 200,
          durationMs: Math.floor(Math.random() * 800) + 200,
          resourceType: 'user-profile',
          resourceId: user.id,
          metadata: {
            fieldsUpdated: this.getRandomProfileFields()
          }
        };

      case ActivityType.FILE_UPLOAD:
        return {
          ...baseActivity,
          activityDescription: 'File uploaded',
          requestPath: '/files/upload',
          requestMethod: 'POST',
          responseStatus: 201,
          durationMs: Math.floor(Math.random() * 5000) + 1000,
          resourceType: 'file',
          metadata: {
            fileName: this.getRandomFileName(),
            fileSize: Math.floor(Math.random() * 10000000) + 1000,
            fileType: this.getRandomFileType()
          }
        };

      case ActivityType.CREATE:
        return {
          ...baseActivity,
          activityDescription: 'Resource created',
          requestPath: this.getRandomCreatePath(),
          requestMethod: 'POST',
          responseStatus: 201,
          durationMs: Math.floor(Math.random() * 1200) + 300,
          resourceType: this.getRandomResourceType(),
          metadata: {
            resourceName: this.getRandomResourceName()
          }
        };

      default:
        return {
          ...baseActivity,
          activityDescription: `${activityType} activity`,
          requestPath: '/',
          requestMethod: 'GET',
          responseStatus: 200,
          durationMs: Math.floor(Math.random() * 1000) + 100
        };
    }
  }

  // Helper methods for generating random data
  private getRandomIpAddress(): string {
    const ips = [
      '192.168.1.100',
      '10.0.0.50',
      '172.16.0.25',
      '203.0.113.45',
      '198.51.100.78',
      '192.0.2.123'
    ];
    return ips[Math.floor(Math.random() * ips.length)];
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  private getRandomDeviceType(): string {
    const devices = ['desktop', 'mobile', 'tablet'];
    return devices[Math.floor(Math.random() * devices.length)];
  }

  private getRandomBrowser(): string {
    const browsers = ['Chrome', 'Firefox', 'Safari', 'Edge', 'Opera'];
    return browsers[Math.floor(Math.random() * browsers.length)];
  }

  private getRandomOS(): string {
    const oses = ['Windows 10', 'macOS', 'Linux', 'iOS', 'Android'];
    return oses[Math.floor(Math.random() * oses.length)];
  }

  private getRandomPagePath(): string {
    const paths = [
      '/',
      '/dashboard',
      '/profile',
      '/settings',
      '/users',
      '/admin',
      '/admin/dashboard',
      '/admin/users',
      '/admin/settings',
      '/admin/analytics',
      '/reports',
      '/help',
      '/about'
    ];
    return paths[Math.floor(Math.random() * paths.length)];
  }

  private getRandomPageTitle(): string {
    const titles = [
      'Dashboard',
      'User Profile',
      'Settings',
      'Admin Panel',
      'User Management',
      'Analytics',
      'Reports',
      'Help Center',
      'About Us'
    ];
    return titles[Math.floor(Math.random() * titles.length)];
  }

  private getRandomApiPath(): string {
    const paths = [
      '/api/users',
      '/api/profile',
      '/api/settings',
      '/api/admin/users',
      '/api/admin/analytics',
      '/api/files',
      '/api/search',
      '/api/reports'
    ];
    return paths[Math.floor(Math.random() * paths.length)];
  }

  private getRandomHttpMethod(): string {
    const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
    const weights = [0.6, 0.2, 0.1, 0.05, 0.05]; // GET is most common

    const random = Math.random();
    let cumulative = 0;

    for (let i = 0; i < methods.length; i++) {
      cumulative += weights[i];
      if (random <= cumulative) {
        return methods[i];
      }
    }

    return 'GET';
  }

  private getRandomSearchQuery(): string {
    const queries = [
      'user management',
      'dashboard analytics',
      'system settings',
      'user profile',
      'admin tools',
      'reports',
      'help documentation',
      'api endpoints'
    ];
    return queries[Math.floor(Math.random() * queries.length)];
  }

  private getRandomSearchFilters(): Record<string, any> {
    const filters = [
      { category: 'users', status: 'active' },
      { dateRange: 'last_week', type: 'analytics' },
      { department: 'IT', role: 'admin' },
      { status: 'pending', priority: 'high' }
    ];
    return filters[Math.floor(Math.random() * filters.length)];
  }

  private getRandomAdminPath(): string {
    const paths = [
      '/admin/dashboard',
      '/admin/users',
      '/admin/users/create',
      '/admin/users/edit',
      '/admin/roles',
      '/admin/permissions',
      '/admin/settings',
      '/admin/analytics',
      '/admin/logs',
      '/admin/system'
    ];
    return paths[Math.floor(Math.random() * paths.length)];
  }

  private getRandomAdminAction(): string {
    const actions = [
      'view_dashboard',
      'create_user',
      'edit_user',
      'delete_user',
      'assign_role',
      'update_permissions',
      'view_analytics',
      'export_data',
      'system_configuration'
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  }

  private getRandomAdminResource(): string {
    const resources = ['user', 'role', 'permission', 'setting', 'report', 'system'];
    return resources[Math.floor(Math.random() * resources.length)];
  }

  private getRandomProfileFields(): string[] {
    const fields = ['firstName', 'lastName', 'email', 'phoneNumber', 'bio', 'avatar'];
    const count = Math.floor(Math.random() * 3) + 1;
    return fields.slice(0, count);
  }

  private getRandomFileName(): string {
    const names = ['document.pdf', 'image.jpg', 'data.xlsx', 'report.docx', 'avatar.png'];
    return names[Math.floor(Math.random() * names.length)];
  }

  private getRandomFileType(): string {
    const types = ['application/pdf', 'image/jpeg', 'application/vnd.ms-excel', 'application/msword', 'image/png'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomCreatePath(): string {
    const paths = ['/users', '/projects', '/reports', '/settings', '/files'];
    return paths[Math.floor(Math.random() * paths.length)];
  }

  private getRandomResourceType(): string {
    const types = ['user', 'project', 'report', 'setting', 'file'];
    return types[Math.floor(Math.random() * types.length)];
  }

  private getRandomResourceName(): string {
    const names = ['New User Account', 'Project Alpha', 'Monthly Report', 'System Configuration', 'Upload File'];
    return names[Math.floor(Math.random() * names.length)];
  }
}
