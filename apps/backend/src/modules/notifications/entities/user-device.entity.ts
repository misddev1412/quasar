import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
    Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('user_devices')
@Index(['userId'])
@Index(['token'])
@Unique(['userId', 'token'])
export class UserDeviceEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'user_id' })
    userId: string;

    @Column({ type: 'text' })
    token: string;

    @Column({ nullable: true })
    platform?: string; // android, ios, web

    @Column({ nullable: true, name: 'device_id' })
    deviceId?: string;

    @Column({ nullable: true, name: 'device_model' })
    deviceModel?: string;

    @Column({ nullable: true, name: 'os_version' })
    osVersion?: string;

    @Column({ nullable: true, name: 'app_version' })
    appVersion?: string;

    @Column({ name: 'last_active_at', default: () => 'CURRENT_TIMESTAMP' })
    lastActiveAt: Date;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;
}
