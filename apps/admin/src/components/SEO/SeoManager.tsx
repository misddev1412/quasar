import React, { useState } from 'react';
import { useSeoManager, SeoData } from '../../hooks/useSeoManager';
import { CreateSeoForm } from './CreateSeoForm';
import cn from 'classnames';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Toggle } from '../common/Toggle';
import { useToast } from '../../context/ToastContext';
import type { UpdateSeoDto } from '@backend/modules/seo/dto/seo.dto';
import type { UseMutateAsyncFunction } from '@tanstack/react-query';
import type { TRPCClientErrorLike } from '@trpc/client';
import { Button } from '../common/Button';

interface SeoItemProps {
  seo: SeoData;
  onUpdate: (id: string, data: UpdateSeoDto) => Promise<any>;
  onDelete: (id: string) => Promise<any>;
}

const SeoItem: React.FC<SeoItemProps> = ({ seo, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSeo, setEditedSeo] = useState<Partial<SeoData>>(seo);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslationWithBackend();
  const { addToast } = useToast();

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      // a bit of a hack because the entity is not fully exposed on the DTO
      const { id, createdAt, updatedAt, deletedAt, ...updateData } = editedSeo as any;
      await onUpdate(seo.id, updateData);
      addToast({ type: 'success', title: t('seo.update_success_title'), description: t('seo.update_success_desc') });
      setIsEditing(false);
    } catch (error: any) {
      console.error('Failed to update SEO rule:', error);
      addToast({ type: 'error', title: t('seo.update_failed_title'), description: error.message || t('seo.update_failed_desc') });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('seo.delete_confirm', 'Are you sure you want to delete this SEO rule?'))) {
      setIsLoading(true);
      try {
        await onDelete(seo.id);
        addToast({ type: 'success', title: t('seo.delete_success_title'), description: t('seo.delete_success_desc') });
      } catch (error: any) {
        console.error('Failed to delete SEO rule:', error);
        addToast({ type: 'error', title: t('seo.delete_failed_title'), description: error.message || t('seo.delete_failed_desc') });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedSeo(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (field: keyof UpdateSeoDto, value: boolean) => {
    onUpdate(seo.id, { [field]: value })
      .then(() => {
        addToast({ type: 'success', title: t('seo.update_success_title'), description: t('seo.update_success_desc') });
      })
      .catch((error) => {
        console.error('Failed to update SEO rule:', error);
        addToast({ type: 'error', title: t('seo.update_failed_title'), description: t('seo.update_failed_desc') });
      });
  };

  const renderField = (name: keyof SeoData) => {
    const value = editedSeo[name] as any;
    if (name === 'additionalMetaTags') {
      return (
        <textarea
          name={name}
          value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
          onChange={handleChange}
          rows={5}
          className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      );
    }
    return (
      <input
        type="text"
        name={String(name)}
        value={value || ''}
        onChange={handleChange}
        className="block w-full border border-gray-300 rounded-md shadow-sm px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-4 hover:shadow-md transition-shadow duration-300">
      {isEditing ? (
        <div className="space-y-3">
          {(['title', 'path', 'description', 'keywords', 'group', 'additionalMetaTags'] as const).map(field => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t(`seo.fields.${field}`)}</label>
              {renderField(field)}
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditing(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" size="sm" onClick={handleUpdate} isLoading={isLoading}>
              {t('common.save')}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900">{seo.title}</h3>
              <p className="text-xs text-gray-500 mt-1 font-mono">{seo.path}</p>
              {seo.description && <p className="text-xs text-gray-600 mt-1">{seo.description}</p>}
            </div>
            <div className="flex items-center space-x-2">
              <Toggle checked={seo.active} onChange={() => handleToggleChange('active', !seo.active)} size="sm" />
              <Button variant="ghost" size="sm" className="!p-1" onClick={() => setIsEditing(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
              </Button>
              <Button variant="ghost" size="sm" className="!p-1 text-gray-500 hover:text-red-600" onClick={handleDelete} disabled={isLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const SeoGroupCard: React.FC<{
  title: string;
  seoList: any;
  onUpdate: UseMutateAsyncFunction<unknown, TRPCClientErrorLike<any>, { id: string } & UpdateSeoDto, unknown>;
  onDelete: UseMutateAsyncFunction<unknown, TRPCClientErrorLike<any>, { id: string }, unknown>;
}> = ({ title, seoList, onUpdate, onDelete }) => {
  const { t } = useTranslationWithBackend();
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">{t(`seo.groups.${title}`, title)}</h2>
      <div className="space-y-4">
        {seoList.map((seo) => (
          <SeoItem key={seo.id} seo={seo} onUpdate={(id, data) => onUpdate({ id, data } as any)} onDelete={(id) => onDelete({ id })} />
        ))}
      </div>
    </div>
  );
};

const CategorySidebar: React.FC<{
  groups: string[];
  selectedGroup: string | null;
  onSelectGroup: (group: string | null) => void;
}> = ({ groups, selectedGroup, onSelectGroup }) => {
  const { t } = useTranslationWithBackend();
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-5 h-fit lg:sticky lg:top-20">
      <h2 className="font-medium text-lg mb-4">{t('seo.categories', 'Categories')}</h2>
      <nav className="space-y-2">
        <button onClick={() => onSelectGroup(null)} className={cn("w-full text-left px-3 py-2 rounded-md text-sm font-medium", selectedGroup === null ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100")}>
          {t('seo.all_rules', 'All Rules')}
        </button>
        {groups.map((group) => (
          <button key={group} onClick={() => onSelectGroup(group)} className={cn("w-full text-left px-3 py-2 rounded-md text-sm font-medium", selectedGroup === group ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100")}>
            {t(`seo.groups.${group}`, group)}
          </button>
        ))}
      </nav>
    </div>
  );
};

const EmptyState: React.FC<{ onCreateClick: () => void }> = ({ onCreateClick }) => {
  const { t } = useTranslationWithBackend();
  return (
    <div className="text-center p-8 bg-white rounded-lg shadow-md border">
      <h3 className="text-xl font-medium text-gray-900">{t('seo.no_rules')}</h3>
      <p className="text-gray-500 mt-2 mb-4">{t('seo.empty_state_message')}</p>
      <Button variant="primary" onClick={onCreateClick}>
        {t('seo.add_rule')}
      </Button>
    </div>
  );
};

export const SeoManager: React.FC = () => {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const { groupedSeo, isLoading, updateSeo, deleteSeo } = useSeoManager();
  const { t } = useTranslationWithBackend();
  const groups = Object.keys(groupedSeo);
  const isEmpty = !isLoading && (!groupedSeo || Object.keys(groupedSeo).length === 0);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>;
  }

  return (
    <>
     
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <CategorySidebar groups={groups} selectedGroup={selectedGroup} onSelectGroup={setSelectedGroup} />
        </div>
        <div className="lg:col-span-3">
          {isEmpty ? (
            <EmptyState onCreateClick={() => setCreateModalOpen(true)} />
          ) : (
            <>
              {selectedGroup === null ? (
                Object.entries(groupedSeo).map(([group, seoList]) => (
                  <SeoGroupCard key={group} title={group} seoList={seoList} onUpdate={updateSeo} onDelete={deleteSeo} />
                ))
              ) : (
                <SeoGroupCard title={selectedGroup} seoList={groupedSeo[selectedGroup] || []} onUpdate={updateSeo} onDelete={deleteSeo} />
              )}
            </>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">{t('seo.create_new_rule', 'Create New SEO Rule')}</h2>
              <Button variant="ghost" onClick={() => setCreateModalOpen(false)} className="!p-1.5 text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </Button>
            </div>
            <CreateSeoForm onClose={() => setCreateModalOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}; 