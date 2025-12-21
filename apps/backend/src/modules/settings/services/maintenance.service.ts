import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SettingService } from './setting.service';
import * as bcrypt from 'bcryptjs';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const MAINTENANCE_ENABLED_KEY = 'storefront.maintenance_enabled';
const MAINTENANCE_PASSWORD_KEY = 'storefront.maintenance_password';
const MAINTENANCE_MESSAGE_KEY = 'storefront.maintenance_message';

@Injectable()
export class MaintenanceService {
  constructor(private readonly settingService: SettingService) {}

  async getStatus(): Promise<{
    enabled: boolean;
    passwordRequired: boolean;
    message: string | null;
  }> {
    const [enabledValue, passwordHash, messageValue] = await Promise.all([
      this.settingService.getValueByKey(MAINTENANCE_ENABLED_KEY),
      this.settingService.getValueByKey(MAINTENANCE_PASSWORD_KEY),
      this.settingService.getValueByKey(MAINTENANCE_MESSAGE_KEY),
    ]);

    const enabled = enabledValue === 'true';
    const passwordRequired = enabled && !!passwordHash;

    return {
      enabled,
      passwordRequired,
      message: messageValue,
    };
  }

  async verifyPassword(password: string): Promise<{
    token: string;
    expiresAt: number;
  }> {
    if (!password) {
      throw new BadRequestException('Password is required');
    }

    const storedHash = await this.settingService.getValueByKey(MAINTENANCE_PASSWORD_KEY);

    if (!storedHash) {
      throw new UnauthorizedException('Maintenance password has not been configured');
    }

    const isValid = await bcrypt.compare(password, storedHash);

    if (!isValid) {
      throw new UnauthorizedException('Invalid maintenance password');
    }

    return this.generateToken();
  }

  async validateToken(token: string | undefined | null): Promise<boolean> {
    if (!token) {
      return false;
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    const [nonce, expiresAt, signature] = parts;
    if (!nonce || !expiresAt || !signature) {
      return false;
    }

    const expiresAtMs = Number(expiresAt);
    if (!Number.isFinite(expiresAtMs) || Date.now() > expiresAtMs) {
      return false;
    }

    const payload = `${nonce}.${expiresAt}`;
    const expectedSignature = this.signPayload(payload);

    return this.safeCompare(expectedSignature, signature);
  }

  private generateToken(): { token: string; expiresAt: number } {
    const nonce = randomBytes(8).toString('hex');
    const expiresAt = Date.now() + this.getTokenTtlMs();
    const payload = `${nonce}.${expiresAt}`;
    const signature = this.signPayload(payload);

    return {
      token: `${payload}.${signature}`,
      expiresAt,
    };
  }

  private signPayload(payload: string): string {
    return createHmac('sha256', this.getTokenSecret()).update(payload).digest('hex');
  }

  private getTokenSecret(): string {
    return process.env.MAINTENANCE_TOKEN_SECRET || process.env.JWT_SECRET || 'quasar-maintenance-secret';
  }

  private getTokenTtlMs(): number {
    const ttlMinutes = Number(process.env.MAINTENANCE_TOKEN_TTL_MINUTES ?? 720);
    const safeMinutes = Number.isFinite(ttlMinutes) && ttlMinutes > 0 ? ttlMinutes : 720;
    return safeMinutes * 60 * 1000;
  }

  private safeCompare(expected: string, actual: string): boolean {
    const a = Buffer.from(expected);
    const b = Buffer.from(actual);

    if (a.length !== b.length) {
      return false;
    }

    return timingSafeEqual(a, b);
  }
}
