import { Injectable, ConflictException } from '@nestjs/common';
import { NewsletterSubscriptionRepository } from '../repositories/newsletter-subscription.repository';

@Injectable()
export class NewsletterService {
    constructor(
        private readonly newsletterRepository: NewsletterSubscriptionRepository,
    ) { }

    async subscribe(email: string) {
        const existing = await this.newsletterRepository.findOne({ where: { email } });
        if (existing) {
            if (!existing.isActive) {
                existing.isActive = true;
                return this.newsletterRepository.save(existing);
            }
            throw new ConflictException('Email already subscribed');
        }

        const subscription = this.newsletterRepository.create({ email });
        return this.newsletterRepository.save(subscription);
    }
}
