import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { NewsletterSubscription } from '@backend/modules/newsletter/entities/newsletter-subscription.entity';

@Injectable()
export class NewsletterSubscriptionRepository extends Repository<NewsletterSubscription> {
    constructor(private dataSource: DataSource) {
        super(NewsletterSubscription, dataSource.createEntityManager());
    }
}
