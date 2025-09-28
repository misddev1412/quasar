import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

export enum TwoFactorMethod {
  EMAIL = 'email',
  AUTHENTICATOR = 'authenticator',
  SMS = 'sms'
}

@Entity('user_security')
export class UserSecurity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'two_factor_enabled', default: false })
  twoFactorEnabled: boolean;

  @Column({
    name: 'two_factor_method',
    type: 'enum',
    enum: TwoFactorMethod,
    nullable: true
  })
  twoFactorMethod: TwoFactorMethod | null;

  @Column({ name: 'two_factor_secret', type: 'text', nullable: true })
  twoFactorSecret: string | null;

  @Column({
    name: 'two_factor_backup_codes',
    type: 'simple-array',
    nullable: true
  })
  twoFactorBackupCodes: string[] | null;

  @Column({ name: 'last_password_change', type: 'timestamp', nullable: true })
  lastPasswordChange: Date | null;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts: number;

  @Column({ name: 'account_locked_until', type: 'timestamp', nullable: true })
  accountLockedUntil: Date | null;

  @Column({ name: 'security_questions', type: 'simple-json', nullable: true })
  securityQuestions: any | null;

  @Column({ name: 'last_security_audit', type: 'timestamp', nullable: true })
  lastSecurityAudit: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}