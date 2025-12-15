import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { PaymentMethod } from './payment-method.entity';

@Entity('payment_method_providers')
@Index('IDX_payment_method_providers_provider_key', ['providerKey'])
@Index('IDX_payment_method_providers_provider_type', ['providerType'])
@Index('IDX_payment_method_providers_environment', ['environment'])
@Index('IDX_payment_method_providers_is_active', ['isActive'])
@Index('IDX_payment_method_providers_payment_method_id', ['paymentMethodId'])
@Index('UQ_payment_method_providers_method_id', ['paymentMethodId'], { unique: true })
export class PaymentMethodProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_method_id', type: 'uuid' })
  paymentMethodId: string;

  @OneToOne(() => PaymentMethod, (paymentMethod) => paymentMethod.providerConfig, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod;

  @Column({ name: 'provider_key', type: 'varchar', length: 100 })
  providerKey: string;

  @Column({ name: 'display_name', type: 'varchar', length: 255 })
  displayName: string;

  @Column({
    name: 'provider_type',
    type: 'varchar',
    length: 100,
    default: () => "'PAYMENT_GATEWAY'",
    comment: 'gateway, bank_transfer_switch, wallet, etc.',
  })
  providerType: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: () => "'production'",
    comment: 'production, sandbox, staging, etc.',
  })
  environment: string;

  @Column({ name: 'api_key', type: 'varchar', length: 500, nullable: true })
  apiKey?: string;

  @Column({ name: 'api_secret', type: 'varchar', length: 500, nullable: true })
  apiSecret?: string;

  @Column({ name: 'client_id', type: 'varchar', length: 255, nullable: true })
  clientId?: string;

  @Column({ name: 'client_secret', type: 'varchar', length: 255, nullable: true })
  clientSecret?: string;

  @Column({
    name: 'checksum_key',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Signature or checksum key used by providers like PayOS',
  })
  checksumKey?: string;

  @Column({ name: 'public_key', type: 'text', nullable: true })
  publicKey?: string;

  @Column({ name: 'webhook_url', type: 'varchar', length: 500, nullable: true })
  webhookUrl?: string;

  @Column({ name: 'webhook_secret', type: 'varchar', length: 255, nullable: true })
  webhookSecret?: string;

  @Column({ name: 'callback_url', type: 'varchar', length: 500, nullable: true })
  callbackUrl?: string;

  @Column({ type: 'jsonb', nullable: true, comment: 'Encrypted credential payload stored by application service' })
  credentials?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true, comment: 'Provider specific toggles or metadata' })
  settings?: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;
}
