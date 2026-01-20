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
}
