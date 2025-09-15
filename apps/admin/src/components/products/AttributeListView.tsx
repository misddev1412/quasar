import React from 'react';
import { FiMoreVertical, FiEdit2, FiTrash2, FiTag, FiFilter, FiSettings } from 'react-icons/fi';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Dropdown } from '../common/Dropdown';
import { useTranslationWithBackend } from '../../hooks/useTranslationWithBackend';
import { Attribute } from '../../types/product';

interface AttributeListViewProps {
  attributes: (Attribute & { valueCount?: number })[];
  onEdit: (attribute: Attribute & { valueCount?: number }) => void;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

export const AttributeListView: React.FC<AttributeListViewProps> = ({
  attributes,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const { t } = useTranslationWithBackend();

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      TEXT: 'blue',
      NUMBER: 'green',
      BOOLEAN: 'purple',
      SELECT: 'orange',
      MULTISELECT: 'orange',
      COLOR: 'pink',
      DATE: 'indigo',
    };
    return colors[type] || 'gray';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      TEXT: t('attributes.types.text', 'Text'),
      NUMBER: t('attributes.types.number', 'Number'),
      BOOLEAN: t('attributes.types.boolean', 'Boolean'),
      SELECT: t('attributes.types.select', 'Select'),
      MULTISELECT: t('attributes.types.multiselect', 'Multi-select'),
      COLOR: t('attributes.types.color', 'Color'),
      DATE: t('attributes.types.date', 'Date'),
    };
    return labels[type] || type;
  };

  if (attributes.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <FiTag className="h-12 w-12 text-gray-400" />
          <div className="space-y-2">
            <h3 className="text-lg font-medium">
              {t('attributes.empty.title', 'No attributes found')}
            </h3>
            <p className="text-muted-foreground">
              {t('attributes.empty.description', 'Get started by creating your first product attribute.')}
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium">
                {t('attributes.table.name', 'Name')}
              </th>
              <th className="text-left p-4 font-medium">
                {t('attributes.table.type', 'Type')}
              </th>
              <th className="text-left p-4 font-medium">
                {t('attributes.table.properties', 'Properties')}
              </th>
              <th className="text-left p-4 font-medium">
                {t('attributes.table.values', 'Values')}
              </th>
              <th className="text-left p-4 font-medium">
                {t('attributes.table.created', 'Created')}
              </th>
              <th className="text-right p-4 font-medium">
                {t('common.actions', 'Actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {attributes.map((attribute) => (
              <tr key={attribute.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {attribute.displayName || attribute.name}
                    </div>
                    {attribute.displayName && (
                      <div className="text-sm text-muted-foreground">
                        {attribute.name}
                      </div>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant="outline" className={`bg-${getTypeColor(attribute.type)}-50 text-${getTypeColor(attribute.type)}-700 border-${getTypeColor(attribute.type)}-200`}>
                    {getTypeLabel(attribute.type)}
                  </Badge>
                </td>
                <td className="p-4">
                  <div className="flex space-x-2">
                    {attribute.isRequired && (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        <FiSettings className="h-3 w-3 mr-1" />
                        {t('attributes.required', 'Required')}
                      </Badge>
                    )}
                    {attribute.isFilterable && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <FiFilter className="h-3 w-3 mr-1" />
                        {t('attributes.filterable', 'Filterable')}
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-muted-foreground">
                    {attribute.valueCount || attribute.values?.length || 0} {t('attributes.values', 'values')}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-muted-foreground">
                    {attribute.createdAt instanceof Date ? 
                      attribute.createdAt.toLocaleDateString() :
                      new Date(attribute.createdAt).toLocaleDateString()
                    }
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex justify-end">
                    <Dropdown
                      button={
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isDeleting}
                        >
                          <FiMoreVertical className="h-4 w-4" />
                        </Button>
                      }
                      items={[
                        {
                          label: t('common.edit', 'Edit'),
                          icon: <FiEdit2 className="w-4 h-4" />,
                          onClick: () => onEdit(attribute),
                        },
                        {
                          label: t('common.delete', 'Delete'),
                          icon: <FiTrash2 className="w-4 h-4" />,
                          onClick: () => onDelete(attribute.id),
                          className: 'text-red-600 hover:text-red-700',
                        },
                      ]}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};