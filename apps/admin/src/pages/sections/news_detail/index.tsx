import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiHome, FiLayout, FiFileText } from 'react-icons/fi';
import BaseLayout from '../../../components/layout/BaseLayout';
import { SectionsManager } from '../../../components/sections/SectionsManager';

const NewsDetailSectionsPage: React.FC = () => {
    const { t } = useTranslation();
    const page = 'news_detail';

    return (
        <BaseLayout
            title={t('sections.pages.news_detail')}
            description={t('sections.pages.news_detail_description', 'Configure content and display order for news detail page sections.')}
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
                    label: t('sections.pages.news_detail'),
                    icon: <FiFileText className="w-4 h-4" />
                }
            ]}
        >
            <div className="space-y-6">
                <SectionsManager page={page} onPageChange={() => { }} />
            </div>
        </BaseLayout>
    );
};

export default NewsDetailSectionsPage;
