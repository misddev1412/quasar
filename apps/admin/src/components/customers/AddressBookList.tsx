import React, { useState } from 'react';
import { PencilIcon, TrashIcon, StarIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { trpc } from '../../utils/trpc';
import { AddressBook } from '../../types/address-book';

interface AddressBookListProps {
  customerId: string;
  addressType?: 'BILLING' | 'SHIPPING' | 'BOTH';
  allowSelection?: boolean;
  selectedAddressId?: string;
  onAddressSelect?: (addressBook: AddressBook) => void;
  onAddressEdit?: (addressBook: AddressBook) => void;
  onAddressDelete?: (addressBookId: string) => void;
  onSetDefault?: (addressBookId: string) => void;
}

export const AddressBookList: React.FC<AddressBookListProps> = ({
  customerId,
  addressType,
  allowSelection = false,
  selectedAddressId,
  onAddressSelect,
  onAddressEdit,
  onAddressDelete,
  onSetDefault
}) => {
  const { t } = useTranslationWithBackend();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: addressBooksData,
    isLoading,
    refetch
  } = trpc.adminAddressBook.getByCustomerId.useQuery(
    { customerId },
    { enabled: !!customerId }
  );

  const setDefaultMutation = trpc.adminAddressBook.setAsDefault.useMutation({
    onSuccess: () => {
      refetch();
    }
  });

  const deleteAddressBookMutation = trpc.adminAddressBook.delete.useMutation({
    onSuccess: () => {
      refetch();
      setDeletingId(null);
    }
  });

  const handleSetDefault = async (addressBookId: string) => {
    try {
      await setDefaultMutation.mutateAsync({ id: addressBookId });
      onSetDefault?.(addressBookId);
    } catch (error) {
      console.error('Error setting default address:', error);
    }
  };

  const handleDelete = async (addressBookId: string) => {
    if (!confirm(t('address_book.confirm_delete'))) {
      return;
    }

    setDeletingId(addressBookId);
    try {
      await deleteAddressBookMutation.mutateAsync({ id: addressBookId });
      onAddressDelete?.(addressBookId);
    } catch (error) {
      console.error('Error deleting address:', error);
      setDeletingId(null);
    }
  };

  const handleSelect = (addressBook: AddressBook) => {
    if (allowSelection && onAddressSelect) {
      onAddressSelect(addressBook);
    }
  };

  const getAddressTypeColor = (type: string) => {
    switch (type) {
      case 'BILLING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPING':
        return 'bg-green-100 text-green-800';
      case 'BOTH':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAddressTypeLabel = (type: string) => {
    switch (type) {
      case 'BILLING':
        return t('address_book.billing_address');
      case 'SHIPPING':
        return t('address_book.shipping_address');
      case 'BOTH':
        return t('address_book.both_address');
      default:
        return type;
    }
  };

  // Type-safe data access
  const addressBooksResponse = (addressBooksData as any)?.data;
  const allAddresses = addressBooksResponse || [];

  const filteredAddresses = allAddresses.filter((addr: any) => {
    if (!addressType) return true;
    return addr.addressType === addressType || addr.addressType === 'BOTH';
  }) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (filteredAddresses.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('address_book.no_addresses')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('address_book.no_addresses_description')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredAddresses.map((addressBook) => (
        <div
          key={addressBook.id}
          className={`border rounded-lg p-4 transition-colors ${
            allowSelection
              ? selectedAddressId === addressBook.id
                ? 'border-blue-500 bg-blue-50 cursor-pointer'
                : 'border-gray-200 hover:border-gray-300 cursor-pointer'
              : 'border-gray-200'
          }`}
          onClick={() => handleSelect(addressBook)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-medium text-gray-900">
                  {addressBook.fullName}
                </h4>

                {addressBook.isDefault && (
                  <StarIconSolid className="h-4 w-4 text-yellow-400" />
                )}

                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAddressTypeColor(addressBook.addressType)}`}>
                  {getAddressTypeLabel(addressBook.addressType)}
                </span>

                {allowSelection && selectedAddressId === addressBook.id && (
                  <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                )}
              </div>

              {addressBook.companyName && (
                <p className="text-sm text-gray-600 mb-1">
                  {addressBook.companyName}
                </p>
              )}

              <div className="text-sm text-gray-600 space-y-1">
                <p>{addressBook.addressLine1}</p>
                {addressBook.addressLine2 && <p>{addressBook.addressLine2}</p>}
                <p>
                  {[
                    addressBook.ward?.name,
                    addressBook.province?.name,
                    addressBook.country?.name,
                    addressBook.postalCode
                  ].filter(Boolean).join(', ')}
                </p>
              </div>

              {addressBook.phoneNumber && (
                <p className="text-sm text-gray-600 mt-1">
                  {t('address_book.phone')}: {addressBook.phoneNumber}
                </p>
              )}

              {addressBook.email && (
                <p className="text-sm text-gray-600">
                  {t('address_book.email')}: {addressBook.email}
                </p>
              )}

              {addressBook.label && (
                <p className="text-sm text-gray-500 mt-1">
                  {t('address_book.label')}: {addressBook.label}
                </p>
              )}

              {addressBook.deliveryInstructions && (
                <p className="text-sm text-gray-500 mt-1">
                  {t('address_book.delivery_instructions')}: {addressBook.deliveryInstructions}
                </p>
              )}
            </div>

            {!allowSelection && (
              <div className="flex items-center space-x-2 ml-4">
                {!addressBook.isDefault && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetDefault(addressBook.id);
                    }}
                    disabled={setDefaultMutation.isPending}
                    className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                    title={t('address_book.set_as_default')}
                  >
                    <StarIcon className="h-4 w-4" />
                  </button>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddressEdit?.(addressBook);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  title={t('common.edit')}
                >
                  <PencilIcon className="h-4 w-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(addressBook.id);
                  }}
                  disabled={deletingId === addressBook.id}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
                  title={t('common.delete')}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};