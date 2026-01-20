
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslationWithBackend } from '../../../../hooks/useTranslationWithBackend';
import { Input } from '../../../common/Input';
import { Toggle } from '../../../common/Toggle';
import { trpc } from '../../../../utils/trpc';
import SelectComponent, { components as selectComponents, type MenuListProps } from 'react-select';
import { ConfigChangeHandler } from '../types';
import { ensureNumber } from '../utils';

interface ServiceListEditorProps {
    value: Record<string, unknown>;
    onChange: ConfigChangeHandler;
}

interface ServiceListConfig {
    serviceIds?: string[];
    showHeader?: boolean;
}

interface ServiceOption {
    value: string;
    label: string;
}

export const ServiceListEditor: React.FC<ServiceListEditorProps> = ({ value, onChange }) => {
    const { t } = useTranslationWithBackend();

    const config = useMemo<ServiceListConfig>(() => ({
        serviceIds: Array.isArray(value?.serviceIds) ? value.serviceIds : [],
        showHeader: value?.showHeader !== false,
    }), [value]);

    const selectedIds = config.serviceIds || [];
    const [optionsMap, setOptionsMap] = useState<Record<string, ServiceOption>>({});
    const [searchOptions, setSearchOptions] = useState<ServiceOption[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(false);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const menuPortalTarget = typeof window !== 'undefined' ? window.document.body : undefined;

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm.trim());
        }, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    React.useEffect(() => {
        setPage(1);
        setSearchOptions([]);
    }, [debouncedSearch]);

    // Query for searching services
    const servicesQuery = trpc.services.getServices.useQuery(
        {
            page,
            limit: 12,
            search: debouncedSearch || undefined,
            isActive: true,
        },
    );

    React.useEffect(() => {
        const payload = (servicesQuery.data as any)?.data;
        if (!payload) {
            if (!servicesQuery.isFetching && !servicesQuery.isLoading) {
                setSearchOptions((prev) => (page === 1 ? [] : prev));
                setHasMore(false);
            }
            return;
        }

        const items = Array.isArray(payload.items) ? payload.items : [];

        const mapServiceToOption = (service: any): ServiceOption => {
            // Find english or first translation for label
            const trans = service.translations?.find((t: any) => t.locale === 'en') || service.translations?.[0];
            return {
                value: service.id,
                label: trans?.name || 'Untitled Service',
            }
        };

        const mapped = items.map(mapServiceToOption);

        setOptionsMap((prev) => {
            const next = { ...prev };
            mapped.forEach((option: any) => {
                next[option.value] = option;
            });
            return next;
        });

        setSearchOptions((prev) => {
            if (page === 1) {
                return mapped;
            }
            const existing = new Map(prev.map((option: any) => [option.value, option]));
            mapped.forEach((option: any) => {
                if (!existing.has(option.value)) {
                    existing.set(option.value, option);
                }
            });
            return Array.from(existing.values());
        });

        setHasMore(payload.page < payload.totalPages);
    }, [servicesQuery.data, page, servicesQuery.isFetching, servicesQuery.isLoading]);

    // Query for fetching details of selected IDs (if not already in map)
    React.useEffect(() => {
        const missing = selectedIds.filter((id) => !optionsMap[id]);
        if (missing.length === 0) return;

        let cancelled = false;
        (async () => {
            try {
                const { trpcClient } = await import('../../../../utils/trpc');
                const results = await Promise.all(
                    missing.map(async (id) => {
                        try {
                            const response = await trpcClient.services.getServiceById.query({ id });
                            const service = (response as any)?.data;
                            if (!service) return null;
                            const trans = service.translations?.find((t: any) => t.locale === 'en') || service.translations?.[0];
                            return {
                                value: service.id,
                                label: trans?.name || 'Untitled Service',
                            }
                        } catch (error) {
                            console.error('Failed to fetch service detail', error);
                            return null;
                        }
                    })
                );
                if (cancelled) return;
                const filtered = results.filter(Boolean) as ServiceOption[];
                if (filtered.length > 0) {
                    setOptionsMap((prev) => {
                        const next = { ...prev };
                        filtered.forEach((option) => {
                            next[option.value] = option;
                        });
                        return next;
                    });
                }
            } catch (error) {
                console.error('Failed to load selected services', error);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [selectedIds.join(','), optionsMap]);


    const allOptions = useMemo(() => {
        const map = new Map<string, ServiceOption>();
        searchOptions.forEach((option) => {
            map.set(option.value, option);
        });
        selectedIds.forEach((id) => {
            const option = optionsMap[id];
            if (option) {
                map.set(id, option);
            }
        });
        return Array.from(map.values());
    }, [searchOptions, selectedIds, optionsMap]);

    const selectedOptions = useMemo(() => {
        return selectedIds.map((id) => optionsMap[id] || { value: id, label: `Service ${id}` });
    }, [optionsMap, selectedIds]);

    const handleConfigChange = (newConfig: Partial<ServiceListConfig>) => {
        onChange({
            ...value,
            ...newConfig,
        });
    };

    const handleSelectionChange = (items: readonly ServiceOption[] | null) => {
        const ids = (items ?? []).map((item) => item.value);
        handleConfigChange({ serviceIds: ids });
    };

    const loadMore = useCallback(() => {
        if (hasMore && !servicesQuery.isFetching) {
            setPage((prev) => prev + 1);
        }
    }, [hasMore, servicesQuery.isFetching]);

    const MenuList = (props: MenuListProps<ServiceOption>) => (
        <selectComponents.MenuList {...props}>
            {props.children}
            {hasMore && (
                <div className="px-2 pb-2">
                    <button
                        type="button"
                        onMouseDown={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            loadMore();
                        }}
                        className="w-full text-sm text-blue-600 hover:text-blue-700 flex items-center justify-center gap-2 py-2"
                        disabled={servicesQuery.isFetching}
                    >
                        {servicesQuery.isFetching ? 'Loading...' : 'Load more services'}
                    </button>
                </div>
            )}
        </selectComponents.MenuList>
    );

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                    {t('sections.manager.featuredProducts.selectProducts', 'Select Services')}
                </label>
                <SelectComponent<ServiceOption, true>
                    isMulti
                    placeholder="Search services..."
                    value={selectedOptions}
                    onChange={(items) => handleSelectionChange(items as ServiceOption[])}
                    options={allOptions}
                    inputValue={searchTerm}
                    onInputChange={(val, actionMeta) => {
                        if (actionMeta.action === 'input-change') {
                            setSearchTerm(val);
                        }
                    }}
                    closeMenuOnSelect={false}
                    hideSelectedOptions={false}
                    isLoading={servicesQuery.isLoading && page === 1}
                    isClearable={false}
                    components={{ MenuList }}
                    menuPortalTarget={menuPortalTarget}
                    styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    }}
                    className="react-select-container"
                    classNamePrefix="react-select"
                />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700">
                <span>{t('sections.manager.config.productList.showHeader', 'Show Header')}</span>
                <Toggle
                    checked={config.showHeader}
                    onChange={(checked) => handleConfigChange({ showHeader: checked })}
                    size="sm"
                />
            </div>
        </div>
    );
};
