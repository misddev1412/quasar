import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { CustomerRepository } from '../repositories/customer.repository';
import { ResponseService } from '@backend/modules/shared/services/response.service';
import { Customer, CustomerStatus, CustomerType } from '../entities/customer.entity';
import { ApiStatusCodes } from '@shared';

export interface AdminCustomerFilters {
  page: number;
  limit: number;
  search?: string;
  status?: CustomerStatus;
  type?: CustomerType;
  hasOrders?: boolean;
  isVip?: boolean;
}

export interface CustomerStatsResponse {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  vipCustomers: number;
  averageOrderValue: number;
  averageCustomerLifetime: number;
  segments: {
    new: number;
    active: number;
    atRisk: number;
    churned: number;
  };
}

@Injectable()
export class AdminCustomerService {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly responseHandler: ResponseService,
  ) {}

  async getAllCustomers(filters: AdminCustomerFilters) {
    try {
      const result = await this.customerRepository.findAll(
        filters.page,
        filters.limit,
        {
          status: filters.status,
          type: filters.type,
          search: filters.search,
          hasOrders: filters.hasOrders,
          isVip: filters.isVip,
        }
      );

      return {
        items: result.customers,
        total: result.total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(result.total / filters.limit),
      };
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        `Failed to retrieve customers: ${error.message}`,
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getCustomerById(id: string): Promise<Customer> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  async createCustomer(customerData: Partial<Customer>): Promise<Customer> {
    try {
      // Check for duplicate email
      if (customerData.email) {
        const existingCustomer = await this.customerRepository.findByEmail(customerData.email);
        if (existingCustomer) {
          throw this.responseHandler.createError(
            ApiStatusCodes.CONFLICT,
            'Customer with this email already exists',
            'CONFLICT'
          );
        }
      }

      // Generate customer number if not provided
      if (!customerData.customerNumber) {
        customerData.customerNumber = await this.customerRepository.generateCustomerNumber();
      }

      const customer = await this.customerRepository.create(customerData);
      return customer;
    } catch (error) {
      if (error.statusCode === ApiStatusCodes.CONFLICT) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to create customer',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateCustomer(id: string, customerData: Partial<Customer>): Promise<Customer> {
    const existingCustomer = await this.customerRepository.findById(id);
    if (!existingCustomer) {
      throw new NotFoundException('Customer not found');
    }

    try {
      // Check for duplicate email if updating email
      if (customerData.email && customerData.email !== existingCustomer.email) {
        const duplicateCustomer = await this.customerRepository.findByEmail(customerData.email);
        if (duplicateCustomer && duplicateCustomer.id !== id) {
          throw this.responseHandler.createError(
            ApiStatusCodes.CONFLICT,
            'Customer with this email already exists',
            'CONFLICT'
          );
        }
      }

      const updatedCustomer = await this.customerRepository.update(id, customerData);
      if (!updatedCustomer) {
        throw new NotFoundException('Customer not found after update');
      }

      return updatedCustomer;
    } catch (error) {
      if (error.statusCode === ApiStatusCodes.CONFLICT) {
        throw error;
      }
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to update customer',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const customer = await this.customerRepository.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    try {
      return await this.customerRepository.delete(id);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to delete customer',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getCustomerStats(): Promise<CustomerStatsResponse> {
    try {
      const stats = await this.customerRepository.getCustomerStats();
      const segments = await this.customerRepository.getCustomerSegments();

      return {
        ...stats,
        segments,
      };
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve customer statistics',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async updateCustomerStatus(id: string, status: CustomerStatus): Promise<Customer> {
    return this.updateCustomer(id, { status });
  }

  async searchCustomers(searchTerm: string, limit: number = 20): Promise<Customer[]> {
    try {
      return await this.customerRepository.searchCustomers(searchTerm, limit);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to search customers',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    try {
      return await this.customerRepository.findTopCustomers(limit);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve top customers',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getRecentCustomers(limit: number = 10): Promise<Customer[]> {
    try {
      return await this.customerRepository.findRecentCustomers(limit);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve recent customers',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getInactiveCustomers(daysSinceLastOrder: number = 90): Promise<Customer[]> {
    try {
      return await this.customerRepository.findInactiveCustomers(daysSinceLastOrder);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve inactive customers',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async getCustomersByTag(tag: string): Promise<Customer[]> {
    try {
      return await this.customerRepository.findCustomersByTag(tag);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to retrieve customers by tag',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async addLoyaltyPoints(customerId: string, points: number): Promise<void> {
    try {
      await this.customerRepository.addLoyaltyPoints(customerId, points);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to add loyalty points',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async redeemLoyaltyPoints(customerId: string, points: number): Promise<boolean> {
    try {
      return await this.customerRepository.redeemLoyaltyPoints(customerId, points);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to redeem loyalty points',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }

  async bulkUpdateStatus(customerIds: string[], status: CustomerStatus): Promise<void> {
    try {
      await this.customerRepository.bulkUpdateStatus(customerIds, status);
    } catch (error) {
      throw this.responseHandler.createError(
        ApiStatusCodes.INTERNAL_SERVER_ERROR,
        error.message || 'Failed to bulk update customer status',
        'INTERNAL_SERVER_ERROR'
      );
    }
  }
}