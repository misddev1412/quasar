import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { trpc } from '../../utils/trpc';
import { useToast } from '../../contexts/ToastContext';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { ServiceForm } from '../../components/services/ServiceForm';
import { CreatePageTemplate } from '../../components/common/CreatePageTemplate';
import { FileText } from 'lucide-react';
import { Loading } from '../../components/common/Loading';

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

    const { data: serviceResponse, isLoading, error } = trpc.services.getServiceById.useQuery(
        { id: id! },
        { enabled: !!id }
    );
    const service = (serviceResponse as { data?: ServiceEntity } | undefined)?.data;

    const updateMutation = trpc.services.updateService.useMutation({
        onSuccess: () => {
            addToast({ title: t('services.update_success', 'Service updated successfully'), type: 'success' });
            navigate('/services');
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

    const handleSubmit = async (data: any) => {
        const {
            unitPrice, isContactPrice, isActive, thumbnail, currencyId, items, translations
        } = data;

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

    return (
        <CreatePageTemplate
            title={t('services.edit_title', 'Edit Service')}
            description={t('services.edit_desc', 'Update service details')}
            icon={<FileText className="w-5 h-5" />}
            entityName={t('services.entity_name', 'Service')}
            entityNamePlural={t('services.entity_name_plural', 'Services')}
            backUrl="/services"
            onBack={() => navigate('/services')}
        >
            <ServiceForm
                initialValues={initialValues}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/services')}
                isSubmitting={updateMutation.isPending}
                mode="edit"
            />
        </CreatePageTemplate>
    );
};

export default EditServicePage;
