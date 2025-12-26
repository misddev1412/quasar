import React, { useState } from 'react';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Button } from '../common/Button';
import { FiPlus, FiTrash, FiEdit2 } from 'react-icons/fi';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '../common/Dialog';
import { Input } from '../common/Input'; // Assuming exist
import { Label } from '../common/Label'; // Assuming exist

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
            price: Number(tempItem.price),
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
