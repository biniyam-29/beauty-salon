import React, { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tag, Edit, Trash2, Plus, Loader2, X } from "lucide-react";

// --- Type Definitions ---
interface LookupItem {
  id: number;
  name: string;
}
type LookupType = "skin-concerns" | "health-conditions" | "skin-care-history";

// --- API Functions ---
const API_BASE_URL = "https://api.in2skincare.com";
const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  if (!token) throw new Error("Authentication token not found.");
  return token;
};

const fetchLookups = async (type: LookupType): Promise<LookupItem[]> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/lookups/${type}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Failed to fetch ${type}.`);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
};

const addLookupItem = async ({
  type,
  name,
}: {
  type: LookupType;
  name: string;
}): Promise<LookupItem> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/lookups/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(`Failed to add item to ${type}.`);
  return response.json();
};

const updateLookupItem = async ({
  type,
  id,
  name,
}: {
  type: LookupType;
  id: number;
  name: string;
}): Promise<LookupItem> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/lookups/${type}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) throw new Error(`Failed to update item in ${type}.`);
  return response.json();
};

const deleteLookupItem = async ({
  type,
  id,
}: {
  type: LookupType;
  id: number;
}): Promise<void> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}/lookups/${type}/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error(`Failed to delete item from ${type}.`);
};

// --- UI Components ---
const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "outline" | "ghost";
    size?: "icon";
  }
> = ({ children, variant, size, className, ...props }) => (
  <button
    className={cn(
      "inline-flex items-center justify-center rounded-lg text-sm font-semibold px-5 py-2.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-px",
      variant === "ghost"
        ? "bg-transparent shadow-none text-rose-600 hover:bg-rose-100/50"
        : "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-200",
      size === "icon" && "p-2 h-auto w-auto shadow-none",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

const LookupModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isLoading: boolean;
  initialData?: LookupItem | null;
  itemType: string;
}> = ({ isOpen, onClose, onSave, isLoading, initialData, itemType }) => {
  const [name, setName] = useState("");

  React.useEffect(() => {
    if (initialData) setName(initialData.name);
    else setName("");
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(name);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {initialData ? "Edit" : "Add"} {itemType}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={`Enter ${itemType.toLowerCase()} name...`}
            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-2 px-4 focus:ring-2 focus:ring-rose-300 focus:outline-none transition"
            required
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" /> : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- Main Component ---
export const LookupsManagementView: React.FC = () => {
  const [activeList, setActiveList] = useState<LookupType>("skin-concerns");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LookupItem | null>(null);

  const queryClient = useQueryClient();

  const {
    data: items = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["lookups", activeList],
    queryFn: () => fetchLookups(activeList),
  });

  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lookups", activeList] });
      setIsModalOpen(false);
      setEditingItem(null);
    },
    onError: (err: Error) => alert(err.message),
  };

  const addItemMutation = useMutation({
    mutationFn: addLookupItem,
    ...mutationOptions,
  });
  const updateItemMutation = useMutation({
    mutationFn: updateLookupItem,
    ...mutationOptions,
  });
  const deleteItemMutation = useMutation({
    mutationFn: deleteLookupItem,
    ...mutationOptions,
  });

  const handleSave = (name: string) => {
    if (editingItem) {
      updateItemMutation.mutate({ type: activeList, id: editingItem.id, name });
    } else {
      addItemMutation.mutate({ type: activeList, name });
    }
  };

  const getItemTypeName = (type: LookupType): string => {
    switch (type) {
      case "skin-concerns":
        return "Skin Concern";
      case "health-conditions":
        return "Health Condition";
      case "skin-care-history":
        return "Skin Care History";
      default:
        return "Item";
    }
  };

  const itemTypeName = getItemTypeName(activeList);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Customize Options</h1>
      <div className="bg-white rounded-2xl shadow-lg border border-rose-100/60 p-6">
        <div className="flex justify-between items-center border-b border-rose-100 pb-4 mb-6">
          <div className="flex gap-2 p-1 bg-rose-100/40 rounded-lg">
            <button
              onClick={() => setActiveList("skin-concerns")}
              className={cn(
                "px-4 py-1.5 text-sm font-semibold rounded-md transition-colors",
                activeList === "skin-concerns"
                  ? "bg-white shadow text-rose-700"
                  : "text-gray-600 hover:text-rose-700"
              )}
            >
              Skin Concerns
            </button>
            <button
              onClick={() => setActiveList("health-conditions")}
              className={cn(
                "px-4 py-1.5 text-sm font-semibold rounded-md transition-colors",
                activeList === "health-conditions"
                  ? "bg-white shadow text-rose-700"
                  : "text-gray-600 hover:text-rose-700"
              )}
            >
              Health Conditions
            </button>
            <button
              onClick={() => setActiveList("skin-care-history")}
              className={cn(
                "px-4 py-1.5 text-sm font-semibold rounded-md transition-colors",
                activeList === "skin-care-history"
                  ? "bg-white shadow text-rose-700"
                  : "text-gray-600 hover:text-rose-700"
              )}
            >
              Skin Care History
            </button>
          </div>
          <Button
            onClick={() => {
              setEditingItem(null);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} className="mr-2" />
            Add New
          </Button>
        </div>

        {isLoading ? (
          <p className="text-center text-gray-500 py-8">Loading...</p>
        ) : isError ? (
          <p className="text-center text-red-500 py-8">
            Error: {error.message}
          </p>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Tag size={48} className="mx-auto text-rose-300" />
            <h3 className="mt-4 font-semibold">No items found.</h3>
            <p>
              Click "Add New" to create your first {itemTypeName.toLowerCase()}.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="group bg-white text-gray-700 font-semibold p-3 rounded-lg border-2 border-rose-100/80 flex justify-between items-center transition-all hover:border-rose-300/60 hover:shadow-sm"
              >
                <span>{item.name}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      setEditingItem(item);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit size={14} />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      deleteItemMutation.mutate({
                        type: activeList,
                        id: item.id,
                      })
                    }
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <LookupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        isLoading={addItemMutation.isPending || updateItemMutation.isPending}
        initialData={editingItem}
        itemType={itemTypeName}
      />
    </div>
  );
};
