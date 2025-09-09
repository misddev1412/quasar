import { Column, Entity, Index } from 'typeorm';
import { SoftDeletableEntity } from '@shared';
import { Expose } from 'class-transformer';

@Entity('firebase_configs')
export class FirebaseConfigEntity extends SoftDeletableEntity {
  @Expose()
  @Index('IDX_FIREBASE_CONFIG_NAME', { unique: true })
  @Column({ length: 255 })
  name: string;

  @Expose()
  @Column({ name: 'api_key', type: 'text' })
  apiKey: string;

  @Expose()
  @Column({ name: 'auth_domain', length: 255 })
  authDomain: string;

  @Expose()
  @Column({ name: 'project_id', length: 255 })
  projectId: string;

  @Expose()
  @Column({ name: 'storage_bucket', length: 255, nullable: true })
  storageBucket?: string;

  @Expose()
  @Column({ name: 'messaging_sender_id', length: 255, nullable: true })
  messagingSenderId?: string;

  @Expose()
  @Column({ name: 'app_id', length: 255 })
  appId: string;

  @Expose()
  @Column({ name: 'measurement_id', length: 255, nullable: true })
  measurementId?: string;

  @Expose()
  @Column({ name: 'service_account_key', type: 'text', nullable: true })
  serviceAccountKey?: string;

  @Expose()
  @Column({ default: true, name: 'is_active' })
  active: boolean;

  @Expose()
  @Column({ length: 500, nullable: true })
  description?: string;

  /**
   * Get Firebase web config
   */
  getWebConfig() {
    return {
      apiKey: this.apiKey,
      authDomain: this.authDomain,
      projectId: this.projectId,
      storageBucket: this.storageBucket,
      messagingSenderId: this.messagingSenderId,
      appId: this.appId,
      measurementId: this.measurementId,
    };
  }

  /**
   * Get Firebase admin config
   */
  getAdminConfig() {
    if (!this.serviceAccountKey) {
      return null;
    }

    try {
      return JSON.parse(this.serviceAccountKey);
    } catch (e) {
      return null;
    }
  }
}