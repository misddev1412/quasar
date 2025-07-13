import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import clsx from 'clsx';
import React, { ReactNode } from 'react';

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: ReactNode;
  className?: string;
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
            <DropdownMenu.Item
              key={`${item.label}-${index}`}
              onClick={item.onClick}
              className={clsx(
                'w-full text-left flex items-center gap-2 px-4 py-2 text-sm cursor-pointer focus:bg-gray-100 dark:focus:bg-gray-700 focus:outline-none',
                item.className
              )}
            >
              {item.icon}
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}; 