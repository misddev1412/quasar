import React from 'react';
import { SettingsManager } from '../../components/settings/SettingsManager';
import { OrderNumberSettings } from '../../components/settings/OrderNumberSettings';
import { withAdminSeo } from '../../components/SEO/withAdminSeo';
import BaseLayout from '../../components/layout/BaseLayout';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { FiHome, FiSettings, FiShoppingCart } from 'react-icons/fi';

const EcommerceSettingsPage: React.FC = () => {
    const { t } = useTranslationWithBackend();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <BaseLayout
            title={t('settings.ecommerce_and_orders', 'Ecommerce & Orders')}
            description={t('settings.descriptions.ecommerce.description', 'Manage tax, shipping, and other ecommerce configurations.')}
            actions={[
                {
                    label: t('settings.add_setting'),
                    onClick: () => setIsModalOpen(true),
                    primary: true
                }
            ]}
            breadcrumbs={[
                {
                    label: t('navigation.home', 'Home'),
                    href: '/',
                    icon: <FiHome className="h-4 w-4" />
                },
                {
                    label: t('admin.system_settings', 'Settings'),
                    href: '/settings',
                    icon: <FiSettings className="h-4 w-4" />
                },
                {
                    label: t('settings.ecommerce_and_orders', 'Ecommerce & Orders'),
                    icon: <FiShoppingCart className="h-4 w-4" />
                }
            ]}
        >
            <div className="space-y-8">
                {/* General Ecommerce Settings */}
                <section>
                    <SettingsManager
                        isModalOpen={isModalOpen}
                        onOpenCreateModal={() => setIsModalOpen(true)}
                        onCloseModal={() => setIsModalOpen(false)}
                        allowedGroups={['ecommerce']}
                        group="ecommerce"
                    />
                </section>

                {/* Order Settings Section */}
                <section>
                    <OrderNumberSettings />
                </section>
            </div>
        </BaseLayout>
    );
};

export default withAdminSeo(EcommerceSettingsPage, {
    title: 'Ecommerce & Orders | Quasar Admin',
    description: 'Configure ecommerce settings including tax, shipping, and orders.',
    path: '/settings/ecommerce',
});
