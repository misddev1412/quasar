import React, { useState } from 'react';
import { useTranslationWithBackend } from '@admin/hooks/useTranslationWithBackend';
import { Button } from '@admin/components/common/Button';
import { FiPlus, FiTrash, FiEdit2 } from 'react-icons/fi';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@admin/components/common/Dialog';
import { Input } from '@admin/components/common/Input'; // Assuming exist
import { Label } from '@admin/components/common/Label'; // Assuming exist

// Simplified Item Editor for now
interface ServiceItem {
    id?: string;
    price?: number;
    sortOrder?: number;
    translations: {
        locale: string;
        name: string;
        description?: string;
    }[];
}

interface ServiceItemsEditorProps {
    items: ServiceItem[];
    onChange: (items: ServiceItem[]) => void;
}

const parseLocalizedNumber = (value: unknown): number => {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return Number(value);

    const normalized = value.trim().replace(/\s+/g, '');
    if (!normalized) return NaN;

    const hasComma = normalized.includes(',');
    const hasDot = normalized.includes('.');

    if (hasComma && hasDot) {
        const lastComma = normalized.lastIndexOf(',');
        const lastDot = normalized.lastIndexOf('.');
        const decimalSep = lastComma > lastDot ? ',' : '.';
        const thousandSep = decimalSep === ',' ? '.' : ',';
        const withoutThousands = normalized.replace(new RegExp(`\\${thousandSep}`, 'g'), '');
        const normalizedDecimal = decimalSep === ','
            ? withoutThousands.replace(',', '.')
            : withoutThousands;
        return Number(normalizedDecimal);
    }

    if (hasComma) {
        const commaCount = (normalized.match(/,/g) || []).length;
        if (commaCount > 1) return Number(normalized.replace(/,/g, ''));
        return /^\d{1,3},\d{3}$/.test(normalized)
            ? Number(normalized.replace(',', ''))
            : Number(normalized.replace(',', '.'));
    }

    if (hasDot) {
        const dotCount = (normalized.match(/\./g) || []).length;
        if (dotCount > 1) return Number(normalized.replace(/\./g, ''));
    }

    return Number(normalized);
};

export const ServiceItemsEditor: React.FC<ServiceItemsEditorProps> = ({ items = [], onChange }) => {
    const { t } = useTranslationWithBackend();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<ServiceItem | null>(null);
    const [editingIndex, setEditingIndex] = useState<number>(-1);

    // Temporary state for the modal form (simplified to EN/VI for demo, ideally dynamic)
    // In a real app, I'd use a small form with tabs for locales here too.
    const [tempItem, setTempItem] = useState<any>({
        price: 0,
        nameEn: '',
        descEn: '',
        nameVi: '',
        descVi: '',
    });

    const handleOpenModal = (item?: ServiceItem, index?: number) => {
        if (item && index !== undefined) {
            setEditingItem(item);
            setEditingIndex(index);
            const nameEn = item.translations.find(tr => tr.locale === 'en')?.name || '';
            const descEn = item.translations.find(tr => tr.locale === 'en')?.description || '';
            const nameVi = item.translations.find(tr => tr.locale === 'vi')?.name || '';
            const descVi = item.translations.find(tr => tr.locale === 'vi')?.description || '';
            setTempItem({
                price: item.price || 0,
                nameEn,
                descEn,
                nameVi,
                descVi
            });
        } else {
            setEditingItem(null);
            setEditingIndex(-1);
            setTempItem({ price: 0, nameEn: '', descEn: '', nameVi: '', descVi: '' });
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        const newItem: ServiceItem = {
            ...editingItem,
            price: parseLocalizedNumber(tempItem.price),
            translations: [
                { locale: 'en', name: tempItem.nameEn, description: tempItem.descEn },
                { locale: 'vi', name: tempItem.nameVi, description: tempItem.descVi },
            ].filter(t => t.name) // Only keep if name exists
        };

        if (editingIndex >= 0) {
            const newItems = [...items];
            newItems[editingIndex] = newItem;
            onChange(newItems);
        } else {
            onChange([...items, newItem]);
        }
        setIsModalOpen(false);
    };

    const handleDelete = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        onChange(newItems);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">{t('services.items_list', 'Service Items')}</h3>
                <Button onClick={() => handleOpenModal()} size="sm" startIcon={<FiPlus />}>
                    {t('common.add_item', 'Add Item')}
                </Button>
            </div>

            <div className="border rounded-md divide-y">
                {items.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                        {t('services.no_items', 'No items added yet')}
                    </div>
                )}
                {items.map((item, index) => (
                    <div key={index} className="p-3 flex justify-between items-center hover:bg-gray-50">
                        <div>
                            <div className="font-medium text-sm">
                                {item.translations.find(t => t.locale === 'en')?.name || 'Untitled'}
                                {item.translations.find(t => t.locale === 'vi')?.name && ` / ${item.translations.find(t => t.locale === 'vi')?.name}`}
                            </div>
                            <div className="text-xs text-gray-500">
                                Price: {item.price}
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(item, index)}>
                                <FiEdit2 className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(index)} className="text-red-500">
                                <FiTrash className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingIndex >= 0 ? t('services.edit_item', 'Edit Item') : t('services.add_item', 'Add Item')}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div>
                            <Label>Price</Label>
                            <Input
                                type="number"
                                step="any"
                                value={tempItem.price}
                                onChange={(e) => setTempItem({ ...tempItem, price: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Name (EN)</Label>
                                <Input
                                    value={tempItem.nameEn}
                                    onChange={(e) => setTempItem({ ...tempItem, nameEn: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Description (EN)</Label>
                                <Input
                                    value={tempItem.descEn}
                                    onChange={(e) => setTempItem({ ...tempItem, descEn: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label>Name (VI)</Label>
                                <Input
                                    value={tempItem.nameVi}
                                    onChange={(e) => setTempItem({ ...tempItem, nameVi: e.target.value })}
                                />
                            </div>
                            <div>
                                <Label>Description (VI)</Label>
                                <Input
                                    value={tempItem.descVi}
                                    onChange={(e) => setTempItem({ ...tempItem, descVi: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave}>Save</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};
