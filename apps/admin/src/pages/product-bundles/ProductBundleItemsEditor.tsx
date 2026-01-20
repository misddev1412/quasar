import React, { useCallback, useEffect, useRef } from 'react';
import { useFieldArray, useFormContext, Controller } from 'react-hook-form';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import {
    Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { trpc, trpcClient } from '../../utils/trpc'; // Ensure correct import path for trpc

// Common Components
import FormInput from '../../components/common/FormInput';
import { Select } from '../../components/common/Select';
import AsyncSearchSelect from '../../components/common/AsyncSearchSelect';
import { Button } from '../../components/common/Button';

// Sortable Item Component
// Fix for TS2786: 'SortableContext' cannot be used as a JSX component
const SortableList = SortableContext as any;

const SortableItem = ({
    id,
    index,
    remove,
    control,
    register,
    t,
    categoryOptions,
    productOptions,
    watch,
    errors,
    styles,
    loadCategoryOptions,
    loadProductOptions,
    getCategoryOptionsForValue,
    getProductOptionsForValue,
}: any) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const currentMode = watch(`items.${index}.mode`);

    return (
        <div ref={setNodeRef} style={style} className="relative mb-4 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
            <div
                className="absolute left-2 top-11 cursor-move text-neutral-400 p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded"
                {...attributes}
                {...listeners}
            >
                <DragIndicatorIcon fontSize="small" />
            </div>

            <div className="pl-10 space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <FormInput
                            id={`items.${index}.label`}
                            label={t('product_bundles.item_label', 'Label')}
                            type="text"
                            {...register(`items.${index}.label` as const, { required: true })}
                            placeholder="e.g. CPU, RAM"
                            size="md"
                            error={errors?.items?.[index]?.label?.message}
                        />
                    </div>

                    <div className="flex-1">
                        <Controller
                            name={`items.${index}.mode` as const}
                            control={control}
                            render={({ field: selectField }) => (
                                <Select
                                    label={t('product_bundles.mode', 'Mode')}
                                    options={[
                                        { value: 'category', label: t('product_bundles.mode_category', 'Select from Category') },
                                        { value: 'product', label: t('product_bundles.mode_product', 'Specific Products') }
                                    ]}
                                    value={selectField.value}
                                    onChange={selectField.onChange}
                                    size="md" // Match FormInput size
                                />
                            )}
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="block text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400 invisible mb-2">
                            Delete
                        </label>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => remove(index)}
                            className="h-11 w-11 text-red-500 hover:text-red-700 hover:bg-red-50 !p-0 flex items-center justify-center border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 rounded-lg"
                        >
                            <DeleteIcon fontSize="small" />
                        </Button>
                    </div>
                </div>

                {/* Custom Multiple Select using React Select */}
                <div className="w-full">
                    {currentMode === 'category' ? (
                        <Controller
                            name={`items.${index}.categoryIds` as const}
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <AsyncSearchSelect
                                    isMulti
                                    label={t('product_bundles.select_categories', 'Select Categories')}
                                    defaultOptions={categoryOptions}
                                    loadOptions={loadCategoryOptions}
                                    cacheOptions={false}
                                    value={getCategoryOptionsForValue(value || [])}
                                    onChange={(newValue: any) => {
                                        onChange(newValue.map((v: any) => v.value));
                                    }}
                                    placeholder={t('product_bundles.select_categories_placeholder', 'Select categories...')}
                                    styles={styles}
                                />
                            )}
                        />
                    ) : (
                        <Controller
                            name={`items.${index}.productIds` as const}
                            control={control}
                            render={({ field: { value, onChange } }) => (
                                <AsyncSearchSelect
                                    isMulti
                                    label={t('product_bundles.select_products', 'Select Products')}
                                    defaultOptions={productOptions}
                                    loadOptions={loadProductOptions}
                                    cacheOptions={false}
                                    value={getProductOptionsForValue(value || [])}
                                    onChange={(newValue: any) => {
                                        onChange(newValue.map((v: any) => v.value));
                                    }}
                                    placeholder={t('product_bundles.select_products_placeholder', 'Select products...')}
                                    styles={styles}
                                />
                            )}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export const ProductBundleItemsEditor: React.FC = () => {
    // We use useFormContext instead of passing props
    const { control, register, watch, formState: { errors } } = useFormContext();
    const { t } = useTranslationWithBackend();


    const { fields, append, remove, move } = useFieldArray({
        control,
        name: 'items',
    });

    // DND Sensors
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = fields.findIndex((item) => item.id === active.id);
            const newIndex = fields.findIndex((item) => item.id === over.id);
            move(oldIndex, newIndex);
        }
    };

    const RESULT_LIMIT = 10;

    // Fetch Categories and Products (latest 10)
    const { data: categories } = (trpc as any).adminProductCategories.getAll.useQuery({
        limit: RESULT_LIMIT,
        page: 1,
        sortBy: 'createdAt',
        sortOrder: 'DESC',
    });
    const { data: products } = (trpc as any).adminProducts.list.useQuery({
        limit: RESULT_LIMIT,
        page: 1,
    });

    const categoryItems = (categories as any)?.data?.items || (categories as any)?.items || [];
    const productItems = (products as any)?.data?.items || (products as any)?.items || [];

    const categoryOptions = categoryItems.map((c: any) => ({ label: c.name, value: c.id }));
    const productOptions = productItems.map((p: any) => ({ label: p.name, value: p.id }));

    const categoryOptionCache = useRef(new Map<string, string>());
    const productOptionCache = useRef(new Map<string, string>());

    useEffect(() => {
        categoryOptions.forEach((opt: any) => {
            categoryOptionCache.current.set(opt.value, opt.label);
        });
    }, [categoryOptions]);

    useEffect(() => {
        productOptions.forEach((opt: any) => {
            productOptionCache.current.set(opt.value, opt.label);
        });
    }, [productOptions]);

    const getCategoryOptionsForValue = useCallback((ids: string[]) => {
        return ids.map((id) => ({
            value: id,
            label: categoryOptionCache.current.get(id) || id,
        }));
    }, []);

    const getProductOptionsForValue = useCallback((ids: string[]) => {
        return ids.map((id) => ({
            value: id,
            label: productOptionCache.current.get(id) || id,
        }));
    }, []);

    const loadCategoryOptions = useCallback(
        async (inputValue: string) => {
            const search = inputValue.trim();
            if (!search) {
                return categoryOptions;
            }

            try {
                const result = await (trpcClient as any).adminProductCategories.getAll.query({
                    limit: RESULT_LIMIT,
                    page: 1,
                    search,
                    sortBy: 'createdAt',
                    sortOrder: 'DESC',
                });
                const items = result?.data?.items || result?.items || [];
                const options = items.map((c: any) => ({ label: c.name, value: c.id }));
                options.forEach((opt: any) => {
                    categoryOptionCache.current.set(opt.value, opt.label);
                });
                return options;
            } catch {
                return [];
            }
        },
        [RESULT_LIMIT, categoryOptions],
    );

    const loadProductOptions = useCallback(
        async (inputValue: string) => {
            const search = inputValue.trim();
            if (!search) {
                return productOptions;
            }

            try {
                const result = await (trpcClient as any).adminProducts.list.query({
                    limit: RESULT_LIMIT,
                    page: 1,
                    search,
                });
                const items = result?.data?.items || result?.items || [];
                const options = items.map((p: any) => ({ label: p.name, value: p.id }));
                options.forEach((opt: any) => {
                    productOptionCache.current.set(opt.value, opt.label);
                });
                return options;
            } catch {
                return [];
            }
        },
        [RESULT_LIMIT, productOptions],
    );

    const selectStyles = {
        multiValue: (base: any) => ({
            ...base,
            backgroundColor: '#eef2ff',
            borderRadius: '9999px',
            padding: '2px 6px',
        }),
        multiValueLabel: (base: any) => ({
            ...base,
            color: '#4338ca',
            fontWeight: 500,
        }),
        multiValueRemove: (base: any) => ({
            ...base,
            color: '#4338ca',
            borderRadius: '9999px',
            ':hover': {
                backgroundColor: '#c7d2fe',
                color: '#312e81',
            },
        }),
    };

    return (
        <div className="space-y-4">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableList items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
                    {fields.map((field, index) => (
                        <SortableItem
                            key={field.id}
                            id={field.id}
                            index={index}
                            remove={remove}
                            control={control}
                            register={register}
                            watch={watch}
                            errors={errors}
                            t={t}
                            categoryOptions={categoryOptions}
                            productOptions={productOptions}
                            styles={selectStyles}
                            loadCategoryOptions={loadCategoryOptions}
                            loadProductOptions={loadProductOptions}
                            getCategoryOptionsForValue={getCategoryOptionsForValue}
                            getProductOptionsForValue={getProductOptionsForValue}
                        />
                    ))}
                </SortableList>
            </DndContext>

            <Button
                variant="secondary"
                onClick={() => append({ label: '', mode: 'category', categoryIds: [], productIds: [] })} // Ensure default structure matches validation
                disabled={false}
                type="button" // Important preventing form submit
                className="w-full"
            >
                <div className="flex items-center justify-center gap-2">
                    <AddIcon fontSize="small" />
                    <span>{t('product_bundles.add_item', 'Add Item')}</span>
                </div>
            </Button>

            {fields.length === 0 && (
                <div className="text-center py-8 text-neutral-500 border-2 border-dashed border-neutral-200 dark:border-neutral-700 rounded-lg">
                    <p>{t('product_bundles.no_items', 'No items in this bundle yet.')}</p>
                </div>
            )}
        </div>
    );
};
