import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiHome, FiLayout, FiBox } from 'react-icons/fi';
import BaseLayout from '../../../components/layout/BaseLayout';
import { SectionsManager } from '../../../components/sections/SectionsManager';

const ProductDetailSectionsPage: React.FC = () => {
    const { t } = useTranslation();
    const page = 'product_detail';

    return (
        <BaseLayout
            title={t('sections.pages.product_detail')}
            description={t('sections.pages.product_detail_description', 'Configure content and display order for product detail page sections.')}
            breadcrumbs={[
                {
                    label: t('sections.pages.home'),
                    href: '/',
                    icon: <FiHome className="w-4 h-4" />
                },
                {
                    label: t('sections.page.breadcrumb'),
                    href: '/sections/home',
                    icon: <FiLayout className="w-4 h-4" />
                },
                {
                    label: t('sections.pages.product_detail'),
                    icon: <FiBox className="w-4 h-4" />
                }
            ]}
        >
            <div className="space-y-6">
                <SectionsManager page={page} onPageChange={() => { }} />
            </div>
        </BaseLayout>
    );
};

export default ProductDetailSectionsPage;
