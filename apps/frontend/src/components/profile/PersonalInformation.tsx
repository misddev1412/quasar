import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardBody, CardHeader } from '@heroui/react';
import { Button } from '../common/Button';
import { useToast } from '../../contexts/ToastContext';
import { useTranslations } from 'next-intl';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  X,
  Plus,
  Trash2
} from 'lucide-react';

interface Address {
  id: string;
  type: 'home' | 'work' | 'other';
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface PersonalInformationProps {
  onSectionChange: (section: string) => void;
}

export const PersonalInformation: React.FC<PersonalInformationProps> = ({ onSectionChange }) => {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();
  const t = useTranslations();

  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    bio: '',
    avatar: ''
  });

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newAddress, setNewAddress] = useState<Partial<Address>>({
    type: 'home',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    isDefault: false
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        bio: '', // bio property doesn't exist in User interface
        avatar: user.avatar || ''
      });
    }
  }, [user]);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      updateUser({
        ...user!,
        ...profileData
      });

      showToast({
        type: 'success',
        title: t('profile.personal_info.update_success'),
        description: t('profile.personal_info.update_success_desc')
      });
    } catch (error) {
      showToast({
        type: 'error',
        title: t('profile.personal_info.update_error'),
        description: t('profile.personal_info.update_error_desc')
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAddress = () => {
    if (!newAddress.street || !newAddress.city || !newAddress.zipCode) {
      showToast({
        type: 'error',
        title: t('profile.addresses.incomplete_address'),
        description: t('profile.addresses.incomplete_address_desc')
      });
      return;
    }

    const address: Address = {
      id: Date.now().toString(),
      type: newAddress.type as Address['type'],
      street: newAddress.street!,
      city: newAddress.city!,
      state: newAddress.state || '',
      zipCode: newAddress.zipCode!,
      country: newAddress.country || '',
      isDefault: addresses.length === 0 || newAddress.isDefault || false
    };

    setAddresses([...addresses, address]);
    setNewAddress({
      type: 'home',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      isDefault: false
    });
    setShowAddAddress(false);

    showToast({
      type: 'success',
      title: t('profile.addresses.added_success'),
      description: t('profile.addresses.added_success_desc')
    });
  };

  const handleRemoveAddress = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id));
    showToast({
      type: 'success',
      title: t('profile.addresses.removed_success'),
      description: t('profile.addresses.removed_success_desc')
    });
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  return (
    <div className="space-y-6">
      {/* Personal Information Form */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('profile.personal_info.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('profile.personal_info.subtitle')}
              </p>
            </div>
            <button
              onClick={() => onSectionChange('overview')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                {profileData.avatar ? (
                  <img
                    src={profileData.avatar}
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover border-4 border-gray-200"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <button
                  type="button"
                  className="absolute bottom-0 right-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                >
                  <Camera className="w-3 h-3" />
                </button>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">
                  {t('profile.personal_info.profile_picture')}
                </h3>
                <p className="text-sm text-gray-500">
                  {t('profile.personal_info.profile_picture_desc')}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.personal_info.full_name')} *
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.personal_info.email')} *
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.personal_info.phone')}
                </label>
                <input
                  type="tel"
                  value={profileData.phoneNumber}
                  onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('profile.personal_info.avatar_url')}
                </label>
                <input
                  type="url"
                  value={profileData.avatar}
                  onChange={(e) => setProfileData({ ...profileData, avatar: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('profile.personal_info.bio')}
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors resize-none"
                placeholder={t('profile.personal_info.bio_placeholder')}
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="submit"
                loading={isLoading}
                color="primary"
                icon={<Save className="w-4 h-4" />}
                className="px-6 py-2.5 font-medium"
              >
                {t('profile.personal_info.save_changes')}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      {/* Addresses Section */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('profile.addresses.title')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('profile.addresses.subtitle')}
              </p>
            </div>
            <Button
              onClick={() => setShowAddAddress(true)}
              color="primary"
              variant="flat"
              icon={<Plus className="w-4 h-4" />}
              className="px-4 py-2"
            >
              {t('profile.addresses.add_address')}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {/* Add Address Form */}
          {showAddAddress && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('profile.addresses.add_new_address')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.addresses.address_type')}
                  </label>
                  <select
                    value={newAddress.type}
                    onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as Address['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="home">{t('profile.addresses.type_home')}</option>
                    <option value="work">{t('profile.addresses.type_work')}</option>
                    <option value="other">{t('profile.addresses.type_other')}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.addresses.street')} *
                  </label>
                  <input
                    type="text"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.addresses.city')} *
                  </label>
                  <input
                    type="text"
                    value={newAddress.city}
                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.addresses.state')}
                  </label>
                  <input
                    type="text"
                    value={newAddress.state}
                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.addresses.zip_code')} *
                  </label>
                  <input
                    type="text"
                    value={newAddress.zipCode}
                    onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('profile.addresses.country')}
                  </label>
                  <input
                    type="text"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center mt-4">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={newAddress.isDefault}
                  onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                  {t('profile.addresses.set_as_default')}
                </label>
              </div>
              <div className="flex justify-end space-x-2 mt-4">
                <Button
                  onClick={() => setShowAddAddress(false)}
                  variant="ghost"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  onClick={handleAddAddress}
                  color="primary"
                >
                  {t('profile.addresses.add_address')}
                </Button>
              </div>
            </div>
          )}

          {/* Saved Addresses */}
          <div className="space-y-4">
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {t('profile.addresses.no_addresses')}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t('profile.addresses.no_addresses_desc')}
                </p>
                <Button
                  onClick={() => setShowAddAddress(true)}
                  color="primary"
                  icon={<Plus className="w-4 h-4" />}
                >
                  {t('profile.addresses.add_first_address')}
                </Button>
              </div>
            ) : (
              addresses.map((address) => (
                <div key={address.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {address.type.charAt(0).toUpperCase() + address.type.slice(1)}
                        </span>
                        {address.isDefault && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {t('profile.addresses.default')}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-900 font-medium">{address.street}</p>
                      <p className="text-gray-600 text-sm">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      {address.country && (
                        <p className="text-gray-600 text-sm">{address.country}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {!address.isDefault && (
                        <button
                          onClick={() => handleSetDefaultAddress(address.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          {t('profile.addresses.set_default')}
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveAddress(address.id)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>
    </div>
  );
};