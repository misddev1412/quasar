import React from 'react';
import { useNavigate } from 'react-router-dom';
import { trpc } from '@admin/utils/trpc';
import { useToast } from '@admin/contexts/ToastContext';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { ServiceForm } from '@admin/components/services';
import { StandardFormPage } from '@admin/components/common';
import type { ServiceSubmitPayload } from '@admin/types/service';
import { FileText } from 'lucide-react';

const CreateServicePage = () => {
    const navigate = useNavigate();
    const { t } = useTranslationWithBackend();
    const { addToast } = useToast();

    const createMutation = trpc.services.createService.useMutation({
        onSuccess: () => {
            addToast({ title: t('services.create_success', 'Service created successfully'), type: 'success' });
            navigate('/services');
        },
        onError: (error) => {
            addToast({ title: error.message || 'Failed to create service', type: 'error' });
        }
    });

    const handleSubmit = async (data: ServiceSubmitPayload) => {
        // Transform data if needed for backend
        // Backend expects CreateServiceDto which has 'translations' array and 'items' array
        // ServiceForm handleFormSubmit constructs this structure mostly.

        // We need to ensure 'name', 'description' etc from main form are moved to 'translations' array 
        // ACTUALLY, ServiceForm handleFormSubmit DOES that transformation before calling this onSubmit.
        // So 'data' here should be ready-ish, but let's check ServiceForm logic again.
        // Yes, ServiceForm constructs 'translations' array.
        // But we need to separate main fields (price, thumbnail, active) from translation fields used for the default locale.

        const {
            unitPrice, isContactPrice, isActive, thumbnail, currencyId, items, translations
        } = data;

        await createMutation.mutateAsync({
            unitPrice: Number(unitPrice),
            isContactPrice: !!isContactPrice,
            isActive: !!isActive,
            thumbnail,
            currencyId,
            translations, // Already constructed by Form
            items
        });
    };

    const formId = 'service-create-form';

    return (
        <StandardFormPage
            title={t('services.create_title', 'Create Service')}
            description={t('services.create_desc', 'Add a new service to your catalog')}
            icon={<FileText className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
            entityName={t('services.entity_name', 'Service')}
            entityNamePlural={t('services.entity_name_plural', 'Services')}
            backUrl="/services"
            onBack={() => navigate('/services')}
            onCancel={() => navigate('/services')}
            isSubmitting={createMutation.isPending}
            formId={formId}
        >
            <ServiceForm
                onSubmit={handleSubmit}
                onCancel={() => navigate('/services')}
                isSubmitting={createMutation.isPending}
                mode="create"
                showActions={false}
                formId={formId}
            />
        </StandardFormPage>
    );
};

export default CreateServicePage;
