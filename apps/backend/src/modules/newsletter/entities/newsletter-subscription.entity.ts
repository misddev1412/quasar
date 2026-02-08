import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@shared';

@Entity('newsletter_subscriptions')
export class NewsletterSubscription extends BaseEntity {
    @Column({ unique: true })
    email: string;

    @Column({ default: true })
    isActive: boolean;
}
