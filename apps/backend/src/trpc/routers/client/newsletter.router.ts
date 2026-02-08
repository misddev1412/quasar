import { Inject, Injectable } from '@nestjs/common';
import { Router, Mutation, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '../../../modules/shared/services/response.service';
import { NewsletterService } from '../../../modules/newsletter/services/newsletter.service';
import { apiResponseSchema } from '../../schemas/response.schemas';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared/enums/error-codes.enums';

const subscribeSchema = z.object({
    email: z.string().email(),
});

@Router({ alias: 'clientNewsletter' })
@Injectable()
export class ClientNewsletterRouter {
    constructor(
        @Inject(ResponseService)
        private readonly responseHandler: ResponseService,
        private readonly newsletterService: NewsletterService,
    ) { }

    @Mutation({
        input: subscribeSchema,
        output: apiResponseSchema,
    })
    async subscribe(
        @Input() input: z.infer<typeof subscribeSchema>
    ): Promise<z.infer<typeof apiResponseSchema>> {
        try {
            await this.newsletterService.subscribe(input.email);
            return this.responseHandler.createTrpcSuccess({
                message: 'Subscribed successfully',
            });
        } catch (error) {
            throw this.responseHandler.createTRPCError(
                ModuleCode.NEWSLETTER,
                OperationCode.CREATE,
                ErrorLevelCode.BUSINESS_LOGIC_ERROR,
                error.message || 'Failed to subscribe'
            );
        }
    }
}
