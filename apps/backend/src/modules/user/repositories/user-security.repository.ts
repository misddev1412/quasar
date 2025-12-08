import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserSecurity } from '../entities/user-security.entity';

@Injectable()
export class UserSecurityRepository {
  constructor(
    @InjectRepository(UserSecurity)
    private readonly userSecurityRepository: Repository<UserSecurity>,
  ) {}

  async findByUserId(userId: string): Promise<UserSecurity | null> {
    return this.userSecurityRepository.findOne({
      where: { userId },
      relations: ['user']
    });
  }

  async createSecuritySettings(userId: string): Promise<UserSecurity> {
    const securitySettings = this.userSecurityRepository.create({
      userId,
      twoFactorEnabled: false,
      failedLoginAttempts: 0
    });

    return this.userSecurityRepository.save(securitySettings);
  }

  async updateSecuritySettings(userId: string, updates: Partial<UserSecurity>): Promise<UserSecurity> {
    await this.userSecurityRepository.update(
      { userId },
      updates
    );

    return this.findByUserId(userId);
  }

  async incrementFailedAttempts(userId: string): Promise<void> {
    await this.userSecurityRepository.increment(
      { userId },
      'failedLoginAttempts',
      1
    );
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.userSecurityRepository.update(
      { userId },
      { failedLoginAttempts: 0, accountLockedUntil: null }
    );
  }

  async lockAccount(userId: string, lockUntil: Date): Promise<void> {
    await this.userSecurityRepository.update(
      { userId },
      { accountLockedUntil: lockUntil }
    );
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const security = await this.findByUserId(userId);
    if (!security?.accountLockedUntil) {
      return false;
    }

    return security.accountLockedUntil > new Date();
  }

  async remove(userId: string): Promise<void> {
    await this.userSecurityRepository.delete({ userId });
  }
}