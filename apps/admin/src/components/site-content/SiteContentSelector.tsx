import React, { useState } from 'react';
import { Search, ChevronDown } from 'lucide-react';
import { useSiteContentOptions, SiteContentOption } from '../../hooks/useSiteContentOptions';
import { Select, SelectOption } from '../common/Select';
import { Input } from '../common/Input';

interface SiteContentSelectorProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const SiteContentSelector: React.FC<SiteContentSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Select site content...',
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { siteContentOptions, isLoading } = useSiteContentOptions({
    enabled: isOpen,
    search: searchTerm || undefined,
    status: 'published',
  });

  const options: SelectOption[] = siteContentOptions.map((content: SiteContentOption) => ({
    value: content.id,
    label: `${content.title} (${content.code})`,
    description: `${content.category} - ${content.languageCode}`,
  }));

  const selectedOption = options.find(option => option.value === value);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelectChange = (selectedValue: string) => {
    onChange(selectedValue === '' ? undefined : selectedValue);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Site Content</label>

      <div className="relative">
        <Select
          value={value || ''}
          onChange={handleSelectChange}
          options={options}
          placeholder={placeholder}
          disabled={disabled}
          isLoading={isLoading}
          className="w-full"
          onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setSearchTerm('');
            }
          }}
        />

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search site content..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="pl-10"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedOption && (
        <p className="text-xs text-gray-500 mt-1">
          {selectedOption.description}
        </p>
      )}

      <p className="text-xs text-gray-500 mt-1">
        Select a site content page to link to. This will create a menu item that navigates to the selected page.
      </p>
    </div>
  );
};