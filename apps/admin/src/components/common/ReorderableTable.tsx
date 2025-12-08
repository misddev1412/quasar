import React, { useCallback } from 'react';
import { GripVertical } from 'lucide-react';
import { cn } from '@admin/lib/utils';
import { Table, type Column, type TableProps } from './Table';

export interface DragState {
  draggedId?: string | number | null;
  dragOverId?: string | number | null;
  disabled?: boolean;
}

export interface ReorderableTableProps<T extends { id: string | number }>
  extends Omit<TableProps<T>, 'rowProps'> {
  dragState?: DragState;
  onDragStart?: (event: React.DragEvent<HTMLTableRowElement>, item: T, index: number) => void;
  onDragEnd?: (event: React.DragEvent<HTMLTableRowElement>, item: T, index: number) => void;
  onDragOver?: (event: React.DragEvent<HTMLTableRowElement>, item: T, index: number) => void;
  onDrop?: (event: React.DragEvent<HTMLTableRowElement>, item: T, index: number) => void;
  onDragLeave?: (event: React.DragEvent<HTMLTableRowElement>, item: T, index: number) => void;
  getRowId?: (item: T) => string | number;
  getRowProps?: (item: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
}

export interface DragHandleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isDragging?: boolean;
  label?: React.ReactNode;
}

export const DragHandle = React.forwardRef<HTMLButtonElement, DragHandleProps>(
  ({ className, disabled, isDragging, label, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      data-drag-handle
      className={cn(
        'inline-flex items-center gap-2 rounded-md border border-transparent bg-transparent px-2 py-1 text-gray-500 transition-colors',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab hover:bg-gray-100 hover:text-gray-700',
        isDragging && 'cursor-grabbing opacity-80',
        className,
      )}
      disabled={disabled}
      {...props}
    >
      <GripVertical className="h-4 w-4" />
      {label !== undefined ? (
        <span className="text-xs font-medium text-gray-500">{label}</span>
      ) : null}
    </button>
  ),
);

DragHandle.displayName = 'DragHandle';

export function ReorderableTable<T extends { id: string | number }>(
  { dragState, onDragStart, onDragEnd, onDragOver, onDrop, onDragLeave, getRowId, getRowProps, ...tableProps }:
  ReorderableTableProps<T>,
) {
  const combinedRowProps = useCallback((item: T, index: number) => {
    const baseProps = getRowProps?.(item, index) ?? {};
    const rowId = getRowId ? getRowId(item) : item.id;
    const isDragging = dragState?.draggedId === rowId;
    const isDragOver = dragState?.dragOverId === rowId && dragState?.draggedId !== rowId;
    const disabled = !!dragState?.disabled;

    const handleDragStart = (event: React.DragEvent<HTMLTableRowElement>) => {
      if (disabled) {
        event.preventDefault();
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-drag-ignore]')) {
        event.preventDefault();
        return;
      }
      onDragStart?.(event, item, index);
      if (typeof baseProps.onDragStart === 'function') {
        baseProps.onDragStart(event);
      }
    };

    const handleDragOver = (event: React.DragEvent<HTMLTableRowElement>) => {
      event.preventDefault();
      if (disabled) {
        return;
      }
      onDragOver?.(event, item, index);
      if (typeof baseProps.onDragOver === 'function') {
        baseProps.onDragOver(event);
      }
    };

    const handleDrop = (event: React.DragEvent<HTMLTableRowElement>) => {
      event.preventDefault();
      if (disabled) {
        return;
      }
      onDrop?.(event, item, index);
      if (typeof baseProps.onDrop === 'function') {
        baseProps.onDrop(event);
      }
    };

    const handleDragLeave = (event: React.DragEvent<HTMLTableRowElement>) => {
      if (disabled) {
        return;
      }
      onDragLeave?.(event, item, index);
      if (typeof baseProps.onDragLeave === 'function') {
        baseProps.onDragLeave(event);
      }
    };

    const handleDragEnd = (event: React.DragEvent<HTMLTableRowElement>) => {
      onDragEnd?.(event, item, index);
      if (typeof baseProps.onDragEnd === 'function') {
        baseProps.onDragEnd(event);
      }
    };

    return {
      ...baseProps,
      draggable: baseProps.draggable ?? !disabled,
      className: cn(
        'transition-colors',
        disabled ? 'cursor-not-allowed opacity-75' : 'cursor-grab',
        isDragging && 'cursor-grabbing opacity-60',
        isDragOver && 'ring-2 ring-blue-300 dark:ring-blue-600',
        baseProps.className,
      ),
      onDragStart: handleDragStart,
      onDragOver: handleDragOver,
      onDrop: handleDrop,
      onDragLeave: handleDragLeave,
      onDragEnd: handleDragEnd,
    } as React.HTMLAttributes<HTMLTableRowElement>;
  }, [dragState?.dragOverId, dragState?.draggedId, dragState?.disabled, getRowId, getRowProps, onDragEnd, onDragLeave, onDragOver, onDragStart, onDrop]);

  return (
    <Table<T>
      {...tableProps}
      rowProps={combinedRowProps}
    />
  );
}

export type { Column as ReorderableColumn };
