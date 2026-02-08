import { Inject, Injectable } from '@nestjs/common';
import { Router, Mutation, Input } from 'nestjs-trpc';
import { z } from 'zod';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { InquiryService, CreateInquiryDto } from '@backend/modules/support/services/inquiry.service';
import { apiResponseSchema } from '@backend/trpc/schemas/response.schemas';
import { ModuleCode, OperationCode, ErrorLevelCode } from '@shared';

const inquirySubmitSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(1, 'Phone number is required'),
    message: z.string().optional(),
    subject: z.string().optional(),
    productId: z.string().uuid().optional(),
    serviceId: z.string().uuid().optional(),
    url: z.string().optional(),
    metadata: z.record(z.any()).optional(),
});

@Router({ alias: 'inquiry' })
@Injectable()
export class ClientInquiryRouter {
    constructor(
        @Inject(ResponseService)
        private readonly responseHandler: ResponseService,
        private readonly inquiryService: InquiryService,
    ) { }

    @Mutation({
        input: inquirySubmitSchema,
        output: apiResponseSchema,
    })
    async submit(
        @Input() input: z.infer<typeof inquirySubmitSchema>
    ): Promise<z.infer<typeof apiResponseSchema>> {
        try {
            const inquiry = await this.inquiryService.createInquiry(input as CreateInquiryDto);
            return this.responseHandler.createTrpcSuccess({
                id: inquiry.id,
                message: 'Inquiry submitted successfully',
            });
        } catch (error) {
            throw this.responseHandler.createTRPCError(
                ModuleCode.SUPPORT,
                OperationCode.CREATE,
                ErrorLevelCode.BUSINESS_LOGIC_ERROR,
                error.message || 'Failed to submit inquiry'
            );
        }
    }
}
