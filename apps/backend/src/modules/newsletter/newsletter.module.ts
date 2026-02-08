import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsletterSubscription } from '@backend/modules/newsletter/entities/newsletter-subscription.entity';
import { NewsletterSubscriptionRepository } from '@backend/modules/newsletter/repositories/newsletter-subscription.repository';
import { NewsletterService } from '@backend/modules/newsletter/services/newsletter.service';

@Module({
    imports: [TypeOrmModule.forFeature([NewsletterSubscription])],
    providers: [NewsletterService, NewsletterSubscriptionRepository],
    exports: [NewsletterService],
})
export class NewsletterModule { }
