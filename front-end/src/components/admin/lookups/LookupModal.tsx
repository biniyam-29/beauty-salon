import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import type { LookupItem } from '../../../hooks/UseLookups';
import { Button } from '../../ui/button';

interface LookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => Promise<void> | void;
  isLoading: boolean;
  initialData?: LookupItem | null;
  itemType: string;
}

const LookupModal: React.FC<LookupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
  initialData,
  itemType,
}) => {
  const [name, setName] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
    } else {
      setName('');
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;
    
    setLocalLoading(true);
    try {
      await onSave(name);
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setLocalLoading(false);
    }
  };

  if (!isOpen) return null;

  const isSaving = isLoading || localLoading;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? 'Edit' : 'Add'} {itemType}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
            disabled={isSaving}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter ${itemType.toLowerCase()} name...`}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-rose-300 focus:outline-none transition mb-2"
            required
            autoFocus
            disabled={isSaving}
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={16} />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LookupModal;