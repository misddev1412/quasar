import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterSubscription } from './entities/newsletter-subscription.entity';
import { NewsletterSubscriptionRepository } from './repositories/newsletter-subscription.repository';
import { NewsletterService } from './services/newsletter.service';

@Module({
    imports: [TypeOrmModule.forFeature([NewsletterSubscription])],
    providers: [NewsletterService, NewsletterSubscriptionRepository],
    exports: [NewsletterService],
})
export class NewsletterModule { }
