import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { UserSecurity, TwoFactorMethod } from '../entities/user-security.entity';
import { UserSession } from '../entities/user-session.entity';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';

@Injectable()
export class ClientSecurityService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserSecurity)
    private readonly userSecurityRepository: Repository<UserSecurity>,
    @InjectRepository(UserSession)
    private readonly userSessionRepository: Repository<UserSession>,
  ) {}

  async getSecurityStatus(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['loginProviders']
    });

    const security = await this.userSecurityRepository.findOne({
      where: { userId }
    });

    const sessions = await this.userSessionRepository.find({
      where: { userId },
      order: { lastActivityAt: 'DESC' }
    });

    return {
      hasPassword: !!user?.password,
      hasTwoFactor: !!security?.twoFactorEnabled,
      twoFactorMethod: security?.twoFactorMethod,
      lastPasswordChange: security?.lastPasswordChange,
      loginProviders: user?.loginProviders?.map(provider => ({
        provider: provider.provider,
        email: provider.providerEmail,
        lastLogin: provider.lastUsedAt
      })) || []
    };
  }

  async changePassword(userId: string, data: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password']
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (!user.password) {
      throw new Error('No password set for this user');
    }

    const isCurrentPasswordValid = await this.validatePassword(user.password, data.currentPassword);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    if (data.newPassword !== data.confirmPassword) {
      throw new Error('New passwords do not match');
    }

    if (data.newPassword.length < 8) {
      throw new Error('New password must be at least 8 characters long');
    }

    const hashedPassword = await this.hashPassword(data.newPassword);
    user.password = hashedPassword;
    await this.userRepository.save(user);

    let security = await this.userSecurityRepository.findOne({
      where: { userId }
    });

    if (!security) {
      security = this.userSecurityRepository.create({
        userId,
        lastPasswordChange: new Date()
      });
    } else {
      security.lastPasswordChange = new Date();
    }

    await this.userSecurityRepository.save(security);
  }

  async setup2FA(userId: string, method: TwoFactorMethod) {
    let security = await this.userSecurityRepository.findOne({
      where: { userId }
    });

    if (!security) {
      security = this.userSecurityRepository.create({
        userId
      });
    }

    const backupCodes = this.generateBackupCodes();

    if (method === TwoFactorMethod.AUTHENTICATOR) {
      const secret = speakeasy.generateSecret({
        name: `Your App:${userId}`,
        issuer: 'Your App'
      });

      security.twoFactorSecret = secret.base32;
      security.twoFactorBackupCodes = backupCodes;
      await this.userSecurityRepository.save(security);

      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      return {
        method,
        qrCode,
        secret: secret.base32,
        backupCodes,
        instructions: 'Scan the QR code with your authenticator app or enter the secret manually.'
      };
    } else {
      security.twoFactorMethod = method;
      security.twoFactorBackupCodes = backupCodes;
      await this.userSecurityRepository.save(security);

      return {
        method,
        backupCodes,
        instructions: `A verification code will be sent to your ${method}. Save these backup codes in case you lose access.`
      };
    }
  }

  async verify2FA(userId: string, method: TwoFactorMethod, token: string) {
    const security = await this.userSecurityRepository.findOne({
      where: { userId }
    });

    if (!security) {
      throw new Error('2FA not set up for this user');
    }

    let isValid = false;

    if (method === TwoFactorMethod.AUTHENTICATOR) {
      isValid = speakeasy.totp.verify({
        secret: security.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2
      });
    } else {
      isValid = this.validateExternalToken(token, method);
    }

    if (!isValid) {
      throw new Error('Invalid verification code');
    }

    security.twoFactorEnabled = true;
    security.twoFactorMethod = method;
    await this.userSecurityRepository.save(security);
  }

  async disable2FA(userId: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password']
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.password && !await this.validatePassword(user.password, password)) {
      throw new Error('Password is incorrect');
    }

    const security = await this.userSecurityRepository.findOne({
      where: { userId }
    });

    if (security) {
      security.twoFactorEnabled = false;
      security.twoFactorMethod = null;
      security.twoFactorSecret = null;
      security.twoFactorBackupCodes = [];
      await this.userSecurityRepository.save(security);
    }
  }

  async getActiveSessions(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [sessions, total] = await this.userSessionRepository.findAndCount({
      where: { userId },
      order: { lastActivityAt: 'DESC' },
      skip,
      take: limit
    });

    const totalPages = Math.ceil(total / limit);

    return {
      sessions: sessions.map(session => ({
        id: session.id,
        browser: session.userAgent,
        device: session.deviceType,
        location: session.ipAddress,
        lastActive: session.lastActivityAt,
        isCurrent: session.isCurrent
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    };
  }

  async revokeSession(userId: string, sessionId: string) {
    const session = await this.userSessionRepository.findOne({
      where: { id: sessionId, userId }
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.isCurrent) {
      throw new Error('Cannot revoke current session');
    }

    await this.userSessionRepository.remove(session);
  }

  async revokeAllSessions(userId: string) {
    await this.userSessionRepository.delete({
      userId,
      isCurrent: false
    });
  }

  private async hashPassword(password: string): Promise<string> {
    const bcrypt = require('bcrypt');
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  private async validatePassword(hashedPassword: string, plainPassword: string): Promise<boolean> {
    const bcrypt = require('bcrypt');
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 8).toUpperCase());
    }
    return codes;
  }

  private validateExternalToken(token: string, method: TwoFactorMethod): boolean {
    return token.length === 6 && /^\d{6}$/.test(token);
  }
}