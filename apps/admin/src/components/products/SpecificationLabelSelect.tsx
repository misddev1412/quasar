import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { components as selectComponents, GroupBase, MenuListProps, InputActionMeta, StylesConfig } from 'react-select';
import ModalReactSelect from '../common/ModalReactSelect';
import '../common/CountrySelector.css';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';

export interface SpecificationLabelOption {
  value: string;
  label: string;
  groupName: string;
  groupCode?: string | null;
}

interface SpecificationLabelSelectProps {
  value?: string | null;
  labelName?: string | null;
  labelGroupName?: string | null;
  labelGroupCode?: string | null;
  placeholder?: string;
  cache: Record<string, SpecificationLabelOption>;
  onCacheUpdate: (options: SpecificationLabelOption[]) => void;
  onChange: (option: SpecificationLabelOption | null) => void;
  onAddLabel?: () => void;
  addLabelText?: string;
}

const PAGE_SIZE = 20;

const groupOptions = (
  options: SpecificationLabelOption[],
): GroupBase<SpecificationLabelOption>[] => {
  const grouped = new Map<string, SpecificationLabelOption[]>();

  options.forEach((option) => {
    const key = option.groupName || '';
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)?.push(option);
  });

  return Array.from(grouped.entries()).map(([label, groupOptions]) => ({
    label,
    options: groupOptions.sort((a, b) => a.label.localeCompare(b.label)),
  }));
};

export const SpecificationLabelSelect: React.FC<SpecificationLabelSelectProps> = ({
  value,
  labelName,
  labelGroupName,
  labelGroupCode,
  placeholder,
  cache,
  onCacheUpdate,
  onChange,
  onAddLabel,
  addLabelText,
}) => {
  const { t } = useTranslationWithBackend();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentSearch, setCurrentSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const defaultGroupLabel = t('products.specification_default_group', 'General');

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
    }, 300);

    return () => clearTimeout(handle);
  }, [searchInput]);

  useEffect(() => {
    setCurrentSearch(debouncedSearch);
    setCurrentPage(1);
  }, [debouncedSearch]);

  const fetchOptions = useCallback(async (term: string, page: number) => {
    setIsLoading(true);
    try {
      const { trpcClient } = await import('../../utils/trpc');
      const response = await trpcClient.adminProductSpecificationLabels.search.query({
        page,
        limit: PAGE_SIZE,
        search: term || undefined,
      });

      const payload = (response as any)?.data;
      const items = Array.isArray(payload?.items) ? payload.items : [];
      const mapped: SpecificationLabelOption[] = items
        .filter((item) => item && item.id)
        .map((item) => ({
          value: item.id,
          label: item.label,
          groupName: item.groupName || defaultGroupLabel,
          groupCode: item.groupCode ?? null,
        }));

      if (mapped.length > 0) {
        onCacheUpdate(mapped);
      }

      const totalPages = payload?.totalPages ?? 1;
      const current = payload?.page ?? page;
      setHasMore(current < totalPages);
    } catch (error) {
      console.error('Failed to load specification labels', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [onCacheUpdate, defaultGroupLabel]);

  useEffect(() => {
    fetchOptions(currentSearch, currentPage);
  }, [currentSearch, currentPage, fetchOptions]);

  useEffect(() => {
    if (value && labelName && !cache[value]) {
      onCacheUpdate([{
        value,
        label: labelName,
        groupName: labelGroupName || defaultGroupLabel,
        groupCode: labelGroupCode || null,
      }]);
    }
  }, [value, labelName, labelGroupName, labelGroupCode, cache, onCacheUpdate, defaultGroupLabel]);

  const optionsArray = useMemo(() => Object.values(cache), [cache]);
  const groupedOptions = useMemo(
    () => groupOptions(optionsArray),
    [optionsArray],
  );

  const addLabelButtonText = addLabelText ?? t('products.add_spec_label_option', 'Thêm thông số');

  const selectHeight = 44;
  const selectStyles = useMemo<StylesConfig<SpecificationLabelOption, false>>(() => ({
    control: (base) => ({
      ...base,
      minHeight: selectHeight,
      height: selectHeight,
    }),
    valueContainer: (base) => ({
      ...base,
      minHeight: selectHeight,
      height: selectHeight,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    input: (base) => ({
      ...base,
      margin: 0,
      padding: 0,
    }),
    indicatorsContainer: (base) => ({
      ...base,
      height: selectHeight,
    }),
    dropdownIndicator: (base) => ({
      ...base,
      paddingTop: 8,
      paddingBottom: 8,
    }),
    clearIndicator: (base) => ({
      ...base,
      paddingTop: 8,
      paddingBottom: 8,
    }),
  }), []);

  const selectedOption = useMemo(() => {
    if (value && cache[value]) {
      return cache[value];
    }
    if (value && labelName) {
      return {
        value,
        label: labelName,
        groupName: labelGroupName || defaultGroupLabel,
        groupCode: labelGroupCode || null,
      };
    }
    return null;
  }, [value, cache, labelName, labelGroupName, labelGroupCode, defaultGroupLabel]);

  const MenuList = useMemo(() => {
    const Component: React.FC<MenuListProps<SpecificationLabelOption>> = (props) => (
      <selectComponents.MenuList {...props}>
        {onAddLabel && (
          <div className="px-3 pt-3 pb-2 border-b border-neutral-200 dark:border-neutral-700">
            <button
              type="button"
              className="w-full rounded-lg border border-dashed border-primary-500 px-3 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:border-primary-400 dark:text-primary-300 dark:hover:bg-primary-500/10 transition-colors"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onAddLabel();
              }}
            >
              {addLabelButtonText}
            </button>
          </div>
        )}
        {props.children}
        {hasMore && (
          <div className="px-3 pb-2">
            <button
              type="button"
              className="w-full text-sm text-primary-600 hover:text-primary-700"
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
                if (!isLoading) {
                  setCurrentPage((prev) => prev + 1);
                }
              }}
            >
              {isLoading
                ? t('common.loading', 'Loading...')
                : t('products.load_more_spec_labels', 'Load more specifications')}
            </button>
          </div>
        )}
      </selectComponents.MenuList>
    );
    return Component;
  }, [addLabelButtonText, hasMore, isLoading, onAddLabel, t]);

  const handleInputChange = (inputValue: string, actionMeta: InputActionMeta) => {
    if (actionMeta.action === 'input-change') {
      setSearchInput(inputValue);
    } else if (actionMeta.action === 'menu-close') {
      setSearchInput('');
    }
    return inputValue;
  };

  const handleChange = (option: SpecificationLabelOption | null) => {
    if (option) {
      onCacheUpdate([option]);
    }
    onChange(option);
  };

  return (
    <ModalReactSelect<SpecificationLabelOption, false, GroupBase<SpecificationLabelOption>>
      value={selectedOption}
      onChange={(option) => handleChange(option as SpecificationLabelOption | null)}
      placeholder={placeholder || t('products.specification_label_placeholder', 'Select specification label')}
      options={groupedOptions}
      isLoading={isLoading}
      isClearable
      inputValue={searchInput}
      onInputChange={handleInputChange}
      menuPortalTarget={typeof window !== 'undefined' ? document.body : undefined}
      components={{ MenuList }}
      formatOptionLabel={(option, { context }) => {
        if (context === 'menu') {
          return (
            <div className="flex flex-col">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{option.label}</span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">{option.groupName}</span>
            </div>
          );
        }
        return option.label;
      }}
      noOptionsMessage={() => (
        searchInput
          ? t('products.no_spec_label_found', 'No specifications found for this search')
          : t('products.no_spec_label_available', 'No specification labels available')
      )}
      loadingMessage={() => t('common.loading', 'Loading...')}
      styles={selectStyles}
      className="w-full"
    />
  );
};

export default SpecificationLabelSelect;
