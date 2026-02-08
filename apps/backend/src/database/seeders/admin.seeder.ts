import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@backend/modules/user/entities/user.entity';
import { Role } from '@backend/modules/user/entities/role.entity';
import { UserProfile } from '@backend/modules/user/entities/user-profile.entity';
import { UserRole as UserRoleEntity } from '@backend/modules/user/entities/user-role.entity';
import { UserRole } from '@shared/enums/user.enums';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminSeeder {
  private readonly logger = new Logger(AdminSeeder.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @InjectRepository(UserRoleEntity)
    private readonly userRoleRepository: Repository<UserRoleEntity>,
  ) {}

  
  async seed(): Promise<void> {
    this.logger.log('🔑 创建root admin账户...');
    
    const existingAdmin = await this.userRepository.findOne({
      where: { username: 'rootadmin' }
    });

    if (existingAdmin) {
      this.logger.log('⚠️ Root admin账户已存在，跳过创建');
      return;
    }

    const superAdminRole = await this.roleRepository.findOne({
      where: { code: UserRole.SUPER_ADMIN }
    });

    if (!superAdminRole) {
      this.logger.error('❌ 未找到SUPER_ADMIN角色，请先运行权限种子');
      return;
    }

    try {
      const password = await bcrypt.hash('Quasar@123', 10);
      
      const admin = this.userRepository.create({
        email: 'rootadmin@quasar.com',
        username: 'rootadmin',
        password,
        isActive: true
      });
      
      const savedAdmin = await this.userRepository.save(admin);
      
      const profile = this.userProfileRepository.create({
        userId: savedAdmin.id,
        firstName: 'Root',
        lastName: 'Admin',
        phoneNumber: null,
        bio: 'System root administrator'
      });
      
      await this.userProfileRepository.save(profile);
      
      const userRole = this.userRoleRepository.create({
        userId: savedAdmin.id,
        roleId: superAdminRole.id,
        isActive: true
      });
      
      await this.userRoleRepository.save(userRole);
      
      this.logger.log(`✅ 成功创建root admin账户 (${savedAdmin.username})`);
    } catch (error) {
      this.logger.error(`❌ 创建root admin账户失败: ${error.message}`);
      throw error;
    }
  }

  
  async seedIfEmpty(): Promise<void> {
    const count = await this.userRepository.count();
    
    if (count === 0) {
      this.logger.log('💡 数据库为空，创建root admin账户...');
      await this.seed();
    } else {
      this.logger.log('⚠️ 数据库不为空，跳过root admin创建');
    }
  }
} 