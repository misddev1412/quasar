import React, { useState } from 'react';
import { Check, ChevronDown, File, Image, FileText, Music, Video, Archive, Code, FileType } from 'lucide-react';
import clsx from 'clsx';

// Common file types with user-friendly names and MIME types
export const FILE_TYPE_CATEGORIES = {
  images: {
    label: 'Images',
    icon: <Image className="w-4 h-4" />,
    types: [
      { label: 'JPEG Images', mimeTypes: ['image/jpeg'], extensions: ['.jpg', '.jpeg'] },
      { label: 'PNG Images', mimeTypes: ['image/png'], extensions: ['.png'] },
      { label: 'GIF Images', mimeTypes: ['image/gif'], extensions: ['.gif'] },
      { label: 'WebP Images', mimeTypes: ['image/webp'], extensions: ['.webp'] },
      { label: 'BMP Images', mimeTypes: ['image/bmp'], extensions: ['.bmp'] },
      { label: 'SVG Images', mimeTypes: ['image/svg+xml'], extensions: ['.svg'] },
      { label: 'TIFF Images', mimeTypes: ['image/tiff'], extensions: ['.tiff', '.tif'] },
    ]
  },
  documents: {
    label: 'Documents',
    icon: <FileText className="w-4 h-4" />,
    types: [
      { label: 'PDF Documents', mimeTypes: ['application/pdf'], extensions: ['.pdf'] },
      { label: 'Word Documents', mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'], extensions: ['.docx', '.doc'] },
      { label: 'Excel Spreadsheets', mimeTypes: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'], extensions: ['.xlsx', '.xls'] },
      { label: 'PowerPoint Presentations', mimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.ms-powerpoint'], extensions: ['.pptx', '.ppt'] },
      { label: 'Text Files', mimeTypes: ['text/plain'], extensions: ['.txt'] },
      { label: 'RTF Documents', mimeTypes: ['application/rtf'], extensions: ['.rtf'] },
    ]
  },
  audio: {
    label: 'Audio',
    icon: <Music className="w-4 h-4" />,
    types: [
      { label: 'MP3 Audio', mimeTypes: ['audio/mpeg'], extensions: ['.mp3'] },
      { label: 'WAV Audio', mimeTypes: ['audio/wav'], extensions: ['.wav'] },
      { label: 'OGG Audio', mimeTypes: ['audio/ogg'], extensions: ['.ogg'] },
      { label: 'FLAC Audio', mimeTypes: ['audio/flac'], extensions: ['.flac'] },
      { label: 'AAC Audio', mimeTypes: ['audio/aac'], extensions: ['.aac'] },
    ]
  },
  video: {
    label: 'Video',
    icon: <Video className="w-4 h-4" />,
    types: [
      { label: 'MP4 Video', mimeTypes: ['video/mp4'], extensions: ['.mp4'] },
      { label: 'WebM Video', mimeTypes: ['video/webm'], extensions: ['.webm'] },
      { label: 'AVI Video', mimeTypes: ['video/x-msvideo'], extensions: ['.avi'] },
      { label: 'MOV Video', mimeTypes: ['video/quicktime'], extensions: ['.mov'] },
      { label: 'WMV Video', mimeTypes: ['video/x-ms-wmv'], extensions: ['.wmv'] },
    ]
  },
  archives: {
    label: 'Archives',
    icon: <Archive className="w-4 h-4" />,
    types: [
      { label: 'ZIP Archives', mimeTypes: ['application/zip'], extensions: ['.zip'] },
      { label: 'RAR Archives', mimeTypes: ['application/x-rar-compressed'], extensions: ['.rar'] },
      { label: 'TAR Archives', mimeTypes: ['application/x-tar'], extensions: ['.tar'] },
      { label: '7Z Archives', mimeTypes: ['application/x-7z-compressed'], extensions: ['.7z'] },
    ]
  },
  code: {
    label: 'Code & Data',
    icon: <Code className="w-4 h-4" />,
    types: [
      { label: 'JSON Files', mimeTypes: ['application/json'], extensions: ['.json'] },
      { label: 'XML Files', mimeTypes: ['application/xml', 'text/xml'], extensions: ['.xml'] },
      { label: 'CSV Files', mimeTypes: ['text/csv'], extensions: ['.csv'] },
      { label: 'JavaScript Files', mimeTypes: ['text/javascript'], extensions: ['.js'] },
      { label: 'CSS Files', mimeTypes: ['text/css'], extensions: ['.css'] },
      { label: 'HTML Files', mimeTypes: ['text/html'], extensions: ['.html', '.htm'] },
    ]
  }
};

// Flatten all file types for easy access
export const ALL_FILE_TYPES = Object.values(FILE_TYPE_CATEGORIES).flatMap(category => 
  category.types.map(type => ({
    ...type,
    categoryLabel: category.label
  }))
);

interface FileTypeSelectorProps {
  value: string[]; // Array of MIME types
  onChange: (mimeTypes: string[]) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  description?: string;
  error?: string;
}

export const FileTypeSelector: React.FC<FileTypeSelectorProps> = ({
  value = [],
  onChange,
  label,
  placeholder = "Select allowed file types...",
  required = false,
  disabled = false,
  description,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Get selected file types info for display
  const getSelectedTypesInfo = () => {
    const selectedTypes = ALL_FILE_TYPES.filter(type => 
      type.mimeTypes.some(mimeType => value.includes(mimeType))
    );
    return selectedTypes;
  };

  const selectedTypes = getSelectedTypesInfo();

  // Handle file type selection
  const handleTypeToggle = (fileType: { label: string; mimeTypes: string[]; extensions: string[]; categoryLabel?: string }) => {
    const newValue = [...value];
    
    // Check if any of this type's MIME types are selected
    const isSelected = fileType.mimeTypes.some(mimeType => value.includes(mimeType));
    
    if (isSelected) {
      // Remove all MIME types for this file type
      fileType.mimeTypes.forEach(mimeType => {
        const index = newValue.indexOf(mimeType);
        if (index > -1) {
          newValue.splice(index, 1);
        }
      });
    } else {
      // Add all MIME types for this file type
      fileType.mimeTypes.forEach(mimeType => {
        if (!newValue.includes(mimeType)) {
          newValue.push(mimeType);
        }
      });
    }
    
    onChange(newValue);
  };

  // Handle category toggle (select/deselect all in category)
  const handleCategoryToggle = (categoryKey: string) => {
    const category = FILE_TYPE_CATEGORIES[categoryKey as keyof typeof FILE_TYPE_CATEGORIES];
    const categoryMimeTypes = category.types.flatMap(type => type.mimeTypes);
    
    // Check if all types in this category are selected
    const allSelected = categoryMimeTypes.every(mimeType => value.includes(mimeType));
    
    let newValue = [...value];
    
    if (allSelected) {
      // Remove all MIME types from this category
      categoryMimeTypes.forEach(mimeType => {
        const index = newValue.indexOf(mimeType);
        if (index > -1) {
          newValue.splice(index, 1);
        }
      });
    } else {
      // Add all MIME types from this category
      categoryMimeTypes.forEach(mimeType => {
        if (!newValue.includes(mimeType)) {
          newValue.push(mimeType);
        }
      });
    }
    
    onChange(newValue);
  };

  const isFileTypeSelected = (fileType: { label: string; mimeTypes: string[]; extensions: string[]; categoryLabel?: string }) => {
    return fileType.mimeTypes.some(mimeType => value.includes(mimeType));
  };

  const isCategorySelected = (categoryKey: string) => {
    const category = FILE_TYPE_CATEGORIES[categoryKey as keyof typeof FILE_TYPE_CATEGORIES];
    const categoryMimeTypes = category.types.flatMap(type => type.mimeTypes);
    return categoryMimeTypes.every(mimeType => value.includes(mimeType));
  };

  const isCategoryPartiallySelected = (categoryKey: string) => {
    const category = FILE_TYPE_CATEGORIES[categoryKey as keyof typeof FILE_TYPE_CATEGORIES];
    const categoryMimeTypes = category.types.flatMap(type => type.mimeTypes);
    const selectedCount = categoryMimeTypes.filter(mimeType => value.includes(mimeType)).length;
    return selectedCount > 0 && selectedCount < categoryMimeTypes.length;
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          disabled={disabled}
          className={clsx(
            "group w-full px-3 py-2 border rounded-md text-left bg-white dark:bg-gray-800 transition-colors",
            "flex items-center justify-between",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20",
            error ? "border-red-300 focus:border-red-500 focus:ring-red-500" : "border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500",
            "focus:outline-none focus:ring-2 focus:ring-opacity-50"
          )}
        >
          <span className={clsx(
            "truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors",
            selectedTypes.length === 0 ? "text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-gray-100"
          )}>
            {selectedTypes.length === 0 
              ? placeholder
              : `${selectedTypes.length} file type${selectedTypes.length === 1 ? '' : 's'} selected`
            }
          </span>
          <ChevronDown className={clsx(
            "w-4 h-4 text-gray-400 group-hover:text-blue-500 transition-all",
            isOpen && "transform rotate-180"
          )} />
        </button>

        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-96 overflow-y-auto">
            <div className="p-2">
              {Object.entries(FILE_TYPE_CATEGORIES).map(([categoryKey, category]) => (
                <div key={categoryKey} className="mb-4 last:mb-0">
                  {/* Category Header */}
                  <div
                    onClick={() => handleCategoryToggle(categoryKey)}
                    className="group category-item flex items-center gap-2 p-2 rounded cursor-pointer transition-all duration-200 hover:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    <div className={clsx(
                      "w-4 h-4 border-2 rounded flex items-center justify-center",
                      isCategorySelected(categoryKey) 
                        ? "bg-blue-500 border-blue-500" 
                        : isCategoryPartiallySelected(categoryKey)
                        ? "bg-blue-200 border-blue-500"
                        : "border-gray-300 group-hover:border-white"
                    )}>
                      {(isCategorySelected(categoryKey) || isCategoryPartiallySelected(categoryKey)) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="text-gray-600 group-hover:!text-white transition-colors">
                      {category.icon}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:!text-white transition-colors">
                      {category.label}
                    </span>
                    <span className="text-xs text-gray-500 ml-auto group-hover:!text-white transition-colors">
                      {category.types.filter(type => isFileTypeSelected(type)).length}/{category.types.length}
                    </span>
                  </div>

                  {/* File Types */}
                  <div className="ml-6 space-y-1">
                    {category.types.map((fileType, index) => (
                      <div
                        key={index}
                        onClick={() => handleTypeToggle(fileType)}
                        className="group file-type-item flex items-center gap-2 p-2 rounded cursor-pointer transition-all duration-200 hover:bg-blue-500 dark:hover:bg-blue-600"
                      >
                        <div className={clsx(
                          "w-4 h-4 border-2 rounded flex items-center justify-center transition-colors",
                          isFileTypeSelected(fileType) 
                            ? "bg-blue-500 border-blue-500" 
                            : "border-gray-300 group-hover:border-white"
                        )}>
                          {isFileTypeSelected(fileType) && (
                            <Check className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <FileType className="w-4 h-4 text-gray-400 group-hover:!text-white transition-colors" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-900 dark:text-gray-100 group-hover:!text-white transition-colors">
                            {fileType.label}
                          </span>
                          <div className="text-xs text-gray-500 group-hover:!text-white transition-colors">
                            {fileType.extensions.join(', ')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected types display */}
      {selectedTypes.length > 0 && (
        <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
          {selectedTypes.map((type, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
            >
              {type.label}
            </span>
          ))}
        </div>
      )}

      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
};