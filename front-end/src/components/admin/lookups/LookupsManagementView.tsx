import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { 
  lookupsService, 
  useAddLookup, 
  useDeleteLookup, 
  useLookups, 
  useUpdateLookup, 
  type LookupType 
} from '../../../hooks/UseLookups';
import { Button } from '../../ui/button';
import { LookupList } from './LookupList';
import LookupModal from './LookupModal';
import ConfirmationModal from '../ConfirmationModal';

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(' ');

export const LookupsManagementPage: React.FC = () => {
  const [activeList, setActiveList] = useState<LookupType>('skin-concerns');
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: number; name: string } | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ id: number; name: string } | null>(null);

  // Fetch data using custom hook
  const { data: items = [], isLoading, isError } = useLookups(activeList);

  // Mutation hooks
  const addMutation = useAddLookup();
  const updateMutation = useUpdateLookup();
  const deleteMutation = useDeleteLookup();

  const handleSave = async (name: string) => {
    try {
      if (editingItem) {
        await updateMutation.mutateAsync({ type: activeList, id: editingItem.id, name });
      } else {
        await addMutation.mutateAsync({ type: activeList, name });
      }
      setIsAddEditModalOpen(false);
      setEditingItem(null);
    } catch (error) {
      // Error is already handled by the mutation onError callback
    }
  };

  const handleEdit = (item: { id: number; name: string }) => {
    setEditingItem(item);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteClick = (item: { id: number; name: string }) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteMutation.mutateAsync({ type: activeList, id: itemToDelete.id });
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      // Error is already handled by the mutation onError callback
    }
  };

  const handleAddNew = () => {
    setEditingItem(null);
    setIsAddEditModalOpen(true);
  };

  const tabs: { key: LookupType; label: string }[] = [
    { key: 'skin-concerns', label: 'Skin Concerns' },
    { key: 'health-conditions', label: 'Health Conditions' },
    { key: 'skin-care-history', label: 'Skin Care History' },
  ];

  const itemTypeName = lookupsService.getItemTypeName(activeList);

  return (
    <div className="space-y-6 p-4 md:p-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-800">Customize Options</h1>
        <p className="text-gray-600 mt-2">
          Manage different types of lookup items used throughout the application.
        </p>
      </header>

      <div className="bg-white rounded-2xl shadow-lg border border-rose-100/60 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-100 pb-4 mb-6">
          <div className="flex gap-2 p-1 bg-rose-100/40 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveList(tab.key)}
                className={cn(
                  'px-4 py-1.5 text-sm font-semibold rounded-md transition-colors whitespace-nowrap',
                  activeList === tab.key
                    ? 'bg-white shadow text-rose-700'
                    : 'text-gray-600 hover:text-rose-700'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Button onClick={handleAddNew}>
            <Plus size={16} className="mr-2" />
            Add New {itemTypeName}
          </Button>
        </div>

        <LookupList
          items={items}
          type={activeList}
          onEdit={handleEdit}
          onDelete={(id) => {
            const item = items.find(item => item.id === id);
            if (item) handleDeleteClick(item);
          }}
          itemTypeName={itemTypeName}
          isLoading={isLoading}
          isError={isError}
        />
      </div>

      {/* Add/Edit Modal */}
      <LookupModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false);
          setEditingItem(null);
        }}
        onSave={handleSave}
        isLoading={addMutation.isPending || updateMutation.isPending}
        initialData={editingItem}
        itemType={itemTypeName}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${itemTypeName}`}
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default LookupsManagementPage;