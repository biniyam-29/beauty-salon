import React from 'react';
import { Tag, Edit, Trash2 } from 'lucide-react';
import type { LookupItem, LookupType } from '../../../hooks/UseLookups';
import { Button } from '../../ui/button';

interface LookupListProps {
  items: LookupItem[];
  type: LookupType;
  onEdit: (item: LookupItem) => void;
  onDelete: (id: number) => void;
  itemTypeName: string;
  isLoading?: boolean;
  isError?: boolean;
  error?: Error;
}

export const LookupList: React.FC<LookupListProps> = ({
  items,
  type,
  onEdit,
  onDelete,
  itemTypeName,
  isLoading,
  isError,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
        <span className="ml-3 text-gray-600">Loading {itemTypeName}s...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500 font-medium">
          Error loading {itemTypeName.toLowerCase()}s: {error?.message}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <Tag size={48} className="mx-auto text-rose-300 mb-4" />
        <h3 className="mt-2 text-lg font-semibold text-gray-700">No items found.</h3>
        <p className="mt-1 text-gray-500">
          Click "Add New" to create your first {itemTypeName.toLowerCase()}.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
      {items.map((item) => (
        <div
          key={`${type}-${item.id}`}
          className="group bg-white text-gray-700 font-semibold p-3 rounded-lg border-2 border-rose-100/80 flex justify-between items-center transition-all hover:border-rose-300/60 hover:shadow-sm"
        >
          <span className="truncate">{item.name}</span>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(item)}
              aria-label={`Edit ${item.name}`}
            >
              <Edit size={14} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(item.id)}
              aria-label={`Delete ${item.name}`}
            >
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};