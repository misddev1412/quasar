import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import React, { ReactNode } from 'react';

interface DropdownItem {
  label: string;
  onClick: (e?: React.MouseEvent) => void;
  icon?: ReactNode;
  className?: string;
  disabled?: boolean;
  tooltip?: string;
}

interface DropdownProps {
  button: ReactNode;
  items: DropdownItem[];
  menuClassName?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  button,
  items,
  menuClassName,
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>{button}</DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className={clsx(
            'w-48 z-50 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none',
            'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
            menuClassName
          )}
          sideOffset={5}
        >
          {items.map((item, index) => (
            <div key={`${item.label}-${index}`} title={item.tooltip || undefined}>
              <DropdownMenu.Item
                onClick={(e) => {
                  if (!item.disabled) {
                    e.stopPropagation();
                    item.onClick(e);
                  }
                }}
                disabled={item.disabled}
                className={clsx(
                  'w-full text-left flex items-center gap-2 px-4 py-2 text-sm focus:bg-blue-500 hover:bg-blue-500 focus:text-white hover:text-white focus:outline-none transition-colors',
                  'dark:focus:bg-blue-600 dark:hover:bg-blue-600',
                  item.disabled 
                    ? 'cursor-not-allowed opacity-50 text-gray-400' 
                    : 'cursor-pointer text-gray-700 dark:text-gray-200',
                  item.className
                )}
              >
                {item.icon}
                {item.label}
              </DropdownMenu.Item>
            </div>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}; 