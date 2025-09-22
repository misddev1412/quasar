import React, { useState, useEffect, useCallback } from 'react';
import { Search, User, Crown, Phone, Mail, X, Plus, UserPlus } from 'lucide-react';
import { Modal } from '../common/Modal';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { debounce } from 'lodash';
import { CreateCustomerForm, CreateCustomerFormData } from './CreateCustomerForm';
import { useToast } from '../../context/ToastContext';

export interface Customer {
  id: string;
  userId?: string;
  customerNumber?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  companyName?: string;
  jobTitle?: string;
  type: 'INDIVIDUAL' | 'BUSINESS';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'PENDING';
  defaultBillingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  defaultShippingAddress?: {
    firstName: string;
    lastName: string;
    company?: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  marketingConsent: boolean;
  newsletterSubscribed: boolean;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  firstOrderDate?: Date;
  lastOrderDate?: Date;
  loyaltyPoints: number;
  customerTags: string[];
  notes?: string;
  referralSource?: string;
  languagePreference?: string;
  currencyPreference?: string;
  timezone?: string;
  taxExempt: boolean;
  taxId?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: Customer) => void;
  title?: string;
  description?: string;
}

export const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectCustomer,
  title,
  description,
}) => {
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'search' | 'create'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);


  // Use tRPC query hook for customer search
  const [searchQuery, setSearchQuery] = useState('');

  const {
    data: customersData,
    isLoading: isLoadingCustomers,
    refetch
  } = trpc.adminCustomers.search.useQuery(
    {
      search: searchQuery,
      limit: 20
    },
    {
      enabled: !!searchQuery.trim(),
      refetchOnWindowFocus: false,
    }
  );

  // Create customer mutation
  const createCustomerMutation = trpc.adminCustomers.create.useMutation({
    onSuccess: (data) => {
      const newCustomer = (data as any).data;
      addToast({
        type: 'success',
        title: t('admin.customer_created_successfully'),
        description: t('admin.customer_created_successfully_description'),
      });
      onSelectCustomer(newCustomer);
      onClose();
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: t('admin.failed_to_create_customer'),
        description: error.message || t('admin.create_customer_error_description'),
      });
    },
  });

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      setSearchQuery(term);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, debouncedSearch]);

  // Update customers when tRPC data changes
  useEffect(() => {
    if (customersData) {
      // The search endpoint returns customers directly in data, not in data.customers
      const customerList = (customersData as any)?.data || [];
      setCustomers(customerList);
    } else if (!searchQuery.trim()) {
      setCustomers([]);
    }
  }, [customersData, searchQuery]);

  // Update loading state
  useEffect(() => {
    setIsLoading(isLoadingCustomers);
  }, [isLoadingCustomers]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
  };

  const handleConfirmSelection = () => {
    if (selectedCustomer) {
      onSelectCustomer(selectedCustomer);
      onClose();
    }
  };

  const handleCreateCustomer = async (formData: CreateCustomerFormData) => {
    try {
      await createCustomerMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Customer creation error:', error);
    }
  };

  const handleClose = () => {
    setSearchTerm('');
    setCustomers([]);
    setSelectedCustomer(null);
    setActiveTab('search');
    onClose();
  };

  const isVipCustomer = (customer: Customer) => {
    return customer.totalSpent >= 1000 || customer.totalOrders >= 10;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'INACTIVE':
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
      case 'BLOCKED':
        return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30';
      case 'PENDING':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
    >
      <div className="p-6">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <User className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title || t('admin.select_customer')}
                </h2>
                {(description || t('admin.search_and_select_customer')) && (
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {description || t('admin.search_and_select_customer')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6">
            <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setActiveTab('search')}
                className={`flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'search'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Search className="w-4 h-4 mr-2" />
                {t('admin.search_customer')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'create'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                {t('admin.create_customer')}
              </button>
            </div>
          </div>
        </div>
        {/* Tab Content */}
        {activeTab === 'search' ? (
          <>
            {/* Search Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.search_customer')}
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('admin.search_customers_placeholder')}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-11 pr-4 py-3 w-full border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
                  autoFocus
                />
              </div>
            </div>

            {/* Search Results */}
            <div className="min-h-[200px] max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-3"></div>
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('admin.searching')}</span>
            </div>
          ) : customers.length === 0 && searchTerm ? (
            <div className="flex flex-col items-center justify-center p-12">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {t('admin.no_customers_found')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Try adjusting your search terms
              </p>
            </div>
          ) : customers.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12">
              <User className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {t('admin.start_typing_to_search')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Search by name, email, phone, or company
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-600 bg-white dark:bg-gray-800">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className={`p-5 cursor-pointer transition-all duration-200 ${
                    selectedCustomer?.id === customer.id
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-primary-500'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm'
                  }`}
                  onClick={() => handleSelectCustomer(customer)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        selectedCustomer?.id === customer.id
                          ? 'bg-primary-100 dark:bg-primary-900'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        <span className={`text-sm font-medium ${
                          selectedCustomer?.id === customer.id
                            ? 'text-primary-600 dark:text-primary-400'
                            : 'text-gray-600 dark:text-gray-300'
                        }`}>
                          {customer.firstName?.charAt(0) || '?'}{customer.lastName?.charAt(0) || ''}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                            {customer.firstName || 'Unnamed'} {customer.lastName || ''}
                          </h3>
                          {isVipCustomer(customer) && (
                            <div title={t('admin.vip_customer')} className="flex-shrink-0">
                              <Crown className="w-4 h-4 text-yellow-500" />
                            </div>
                          )}
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
                          {t(`admin.customer_status.${customer.status.toLowerCase()}`)}
                        </span>
                      </div>

                      {customer.companyName && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
                          <span className="font-medium">Company:</span> {customer.companyName}
                        </p>
                      )}

                      <div className="space-y-1">
                        {customer.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                              {customer.email}
                            </span>
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {customer.phone}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-6 mt-3 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {customer.totalOrders}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {t('admin.orders')}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(customer.totalSpent)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {t('admin.spent')}
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedCustomer?.id === customer.id && (
                      <div className="flex-shrink-0">
                        <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
            </div>

            {/* Action Buttons for Search */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700 mt-6">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {selectedCustomer ? (
                  <span className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Customer selected</span>
                  </span>
                ) : (
                  <span>Select a customer to continue</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSelection}
                  disabled={!selectedCustomer}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  {t('admin.select_customer')}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Create Customer Tab */
          <div className="max-h-[60vh] overflow-y-auto">
            <CreateCustomerForm
              onSubmit={handleCreateCustomer}
              onCancel={handleClose}
              isSubmitting={createCustomerMutation.isPending}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};