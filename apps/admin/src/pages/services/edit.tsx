import React, { useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../contexts/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { ServiceForm, ServiceFormSubmitOptions } from '../../components/services/ServiceForm';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { FileText } from 'lucide-react';
import { Loading } from '../../components/common/Loading';
import { useUrlTabs } from '../../hooks/useUrlTabs';
import { FormSubmitAction } from '../../types/forms';

type ServiceTranslation = {
    id?: string;
    locale?: string;
    name?: string;
    description?: string;
    content?: string;
};

type ServiceEntity = {
    translations?: ServiceTranslation[];
    items?: any[];
} & Record<string, any>;

const EditServicePage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslationWithBackend();
    const { addToast } = useToast();
    const trpcContext = trpc.useContext();
    const lastSubmitActionRef = useRef<FormSubmitAction>('save');

    // Use URL tabs hook with tab keys for clean URLs
    const { activeTab, handleTabChange } = useUrlTabs({
        defaultTab: 0,
        tabParam: 'tab',
        tabKeys: ['general', 'items', 'translations'] // Maps to ServiceForm tab IDs
    });

    const { data: serviceResponse, isLoading, error } = trpc.services.getServiceById.useQuery(
        { id: id! },
        { enabled: !!id }
    );
    const service = (serviceResponse as { data?: ServiceEntity } | undefined)?.data;

    const updateMutation = trpc.services.updateService.useMutation({
        onSuccess: async (_data, variables) => {
            // Invalidate queries
            await Promise.all([
                trpcContext.services.getServiceById.invalidate({ id: id! }),
                trpcContext.services.getServices.invalidate(),
            ]);

            addToast({ title: t('services.update_success', 'Service updated successfully'), type: 'success' });

            const shouldNavigateAway = lastSubmitActionRef.current !== 'save_and_stay';
            if (shouldNavigateAway) {
                navigate('/services');
            }
        },
        onError: (error) => {
            addToast({ title: error.message || 'Failed to update service', type: 'error' });
        }
    });

    if (isLoading) return <Loading />;
    if (error || !service) return <div>{t('common.error', 'Error loading service')}</div>;

    // Prepare initial values
    // We need to extract default translation (EN or matching system default) for the main fields
    // And put others in 'additionalTranslations'
    const defaultLocale = 'en'; // Should ideally come from config

    // Actually, 'service' object structure depends on backend response.
    // It returns Service entity with relations.
    const mainTrans: ServiceTranslation =
        service.translations?.find((tr) => tr.locale === defaultLocale) ??
        service.translations?.[0] ??
        {};
    const otherTrans = service.translations?.filter((tr) => tr.id !== mainTrans.id) ?? [];

    // Map otherTrans to format expected by TranslationsSection (often needs 'title' instead of 'name' if reused directly)
    // But ServiceForm handles mapping back. Here we map forward.
    const additionalTranslations = otherTrans.map((tr) => ({
        ...tr,
        title: tr.name, // Mapping 'name' to 'title' for the UI component if needed
    }));

    const initialValues = {
        ...service,
        name: mainTrans.name,
        description: mainTrans.description,
        content: mainTrans.content,
        languageCode: mainTrans.locale || defaultLocale,
        additionalTranslations,
        items: service.items,
    };

    const handleSubmit = async (data: any, options?: ServiceFormSubmitOptions) => {
        const {
            unitPrice, isContactPrice, isActive, thumbnail, currencyId, items, translations
        } = data;

        lastSubmitActionRef.current = options?.submitAction === 'save_and_stay' ? 'save_and_stay' : 'save';

        await updateMutation.mutateAsync({
            id: id!,
            data: {
                unitPrice: Number(unitPrice),
                isContactPrice: !!isContactPrice,
                isActive: !!isActive,
                thumbnail,
                currencyId,
                translations,
                items
            }
        });
    };

    const handleCancel = () => navigate('/services');

    return (
        <CreatePageTemplate
            title={service.name ? `${t('services.edit_title', 'Edit Service')}: ${service.name}` : t('services.edit_title', 'Edit Service')}
            description={t('services.edit_desc', 'Update service details')}
            icon={<FileText className="w-5 h-5" />}
            entityName={t('services.entity_name', 'Service')}
            entityNamePlural={t('services.entity_name_plural', 'Services')}
            backUrl="/services"
            onBack={handleCancel}
            isSubmitting={updateMutation.isPending}
            mode="update"
            maxWidth="full"
            breadcrumbs={[
                {
                    label: t('navigation.home', 'Home'),
                    href: '/',
                },
                {
                    label: t('services.entity_name_plural', 'Services'),
                    onClick: handleCancel,
                },
                {
                    label: service.name || t('services.edit_title', 'Edit Service'),
                }
            ]}
        >
            <ServiceForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={updateMutation.isPending}
                mode="edit"
                activeTab={activeTab}
                onTabChange={handleTabChange}
            />
        </CreatePageTemplate>
    );
};

export default EditServicePage;
