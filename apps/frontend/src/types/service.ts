import { PaginationInfo } from './api';

export interface ServiceTranslation {
    id: string;
    serviceId: string;
    locale: string;
    name?: string;
    content?: string;
    description?: string;
}

export interface ServiceItemTranslation {
    id: string;
    serviceItemId: string;
    locale: string;
    name?: string;
    description?: string;
}

export interface ServiceItem {
    id: string;
    serviceId: string;
    price?: number;
    sortOrder: number;
    translations: ServiceItemTranslation[];
}

export interface Service {
    id: string;
    unitPrice: number;
    currencyId?: string;
    isContactPrice: boolean;
    thumbnail?: string;
    isActive: boolean;
    translations: ServiceTranslation[];
    items: ServiceItem[];
    createdAt: string;
    updatedAt: string;
}

export interface ServiceFilter {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
}

export interface ServiceListResponse {
    items: Service[];
    pagination: PaginationInfo;
}
