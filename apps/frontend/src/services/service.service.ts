import { trpcClient } from '../utils/trpc';
import type {
    PaginatedApiResponse,
    ApiResponse,
} from '../types/api';
import type {
    Service,
    ServiceFilter,
    ServiceListResponse
} from '../types/service';

export class ServiceService {
    static async getServices(params: ServiceFilter = {}): Promise<ServiceListResponse> {
        try {
            const response = await trpcClient.clientServices.getServices.query(params) as unknown as PaginatedApiResponse<Service>;
            return response.data;
        } catch (error) {
            console.error('Error fetching services:', error);
            throw error;
        }
    }

    static async getServiceById(id: string): Promise<Service | null> {
        try {
            const response = await trpcClient.clientServices.getServiceById.query({ id }) as unknown as ApiResponse<Service>;
            return response.data;
        } catch (error) {
            console.error('Error fetching service by ID:', error);
            throw error;
        }
    }

    static async getServiceBySlug(slug: string, locale?: string): Promise<Service | null> {
        try {
            const clientServices = (trpcClient as any).clientServices;
            const response = await clientServices.getServiceBySlug.query({ slug, locale }) as ApiResponse<Service>;
            return response.data;
        } catch (error) {
            if (locale) {
                try {
                    const clientServices = (trpcClient as any).clientServices;
                    const fallbackResponse = await clientServices.getServiceBySlug.query({ slug }) as ApiResponse<Service>;
                    return fallbackResponse.data;
                } catch (fallbackError) {
                    console.error('Error fetching service by slug:', fallbackError);
                    throw fallbackError;
                }
            }
            console.error('Error fetching service by slug:', error);
            throw error;
        }
    }

    static async getServiceByIdentifier(identifier: string, locale?: string): Promise<Service | null> {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

        if (uuidRegex.test(identifier)) {
            return this.getServiceById(identifier);
        }

        return this.getServiceBySlug(identifier, locale);
    }
}
