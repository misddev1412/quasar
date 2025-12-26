import React from 'react';
import clsx from 'clsx';
import { Button } from './Button';
import { Image as ImageIcon } from 'lucide-react';
import { FiTrash2 } from 'react-icons/fi';

interface ImageActionButtonsProps {
    hasImage: boolean;
    selectLabel: string;
    changeLabel?: string;
    removeLabel?: string;
    onSelect: () => void;
    onRemove?: () => void;
    className?: string;
}

export const ImageActionButtons: React.FC<ImageActionButtonsProps> = ({
    hasImage,
    selectLabel,
    changeLabel,
    removeLabel,
    onSelect,
    onRemove,
    className,
}) => {
    const displaySelectLabel = hasImage ? (changeLabel || selectLabel) : selectLabel;

    return (
        <div className={clsx('flex flex-wrap items-center gap-2', className)}>
            <Button
                variant="outline"
                size="md"
                startIcon={<ImageIcon className="h-4 w-4" />}
                onClick={onSelect}
            >
                {displaySelectLabel}
            </Button>
            {hasImage && removeLabel && onRemove && (
                <Button
                    variant="outline"
                    size="md"
                    startIcon={<FiTrash2 className="h-4 w-4" />}
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={onRemove}
                >
                    {removeLabel}
                </Button>
            )}
        </div>
    );
};
