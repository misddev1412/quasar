import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Select, SelectOption } from '../common/Select';
import { Input } from '../common/Input';
import { trpc } from '../../utils/trpc';
import { Post, PostStatus } from '../../types/post';

interface PostSelectorProps {
  value?: string;
  onChange: (value: string | undefined, option?: SelectOption) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const PostSelector: React.FC<PostSelectorProps> = ({
  value,
  onChange,
  placeholder = 'Select post...',
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const postsQuery = trpc.adminPosts.getPosts.useQuery(
    {
      page: 1,
      limit: 50,
      search: searchTerm || undefined,
      status: PostStatus.PUBLISHED,
    },
    {
      enabled: isOpen,
    }
  );

  const options = useMemo<SelectOption[]>(() => {
    const items = ((postsQuery.data as any)?.data?.items || []) as Post[];
    return items
      .map((post) => {
        const translation = post.translations?.[0];
        const slug = translation?.slug || '';
        return {
          value: slug || post.id,
          label: translation?.title || 'Untitled',
          description: slug ? `/blog/${slug}` : undefined,
        };
      })
      .filter((option) => option.value);
  }, [postsQuery.data]);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Post</label>

      <div className="relative">
        <Select
          value={value || ''}
          onChange={(selectedValue) => {
            const resolved = selectedValue || undefined;
            const option = options.find((candidate) => candidate.value === resolved);
            onChange(resolved, option);
          }}
          options={options}
          placeholder={placeholder}
          disabled={disabled}
          isLoading={postsQuery.isLoading}
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
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="pl-10"
                  onClick={(event) => event.stopPropagation()}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedOption?.description && (
        <p className="text-xs text-gray-500 mt-1">{selectedOption.description}</p>
      )}
    </div>
  );
};
