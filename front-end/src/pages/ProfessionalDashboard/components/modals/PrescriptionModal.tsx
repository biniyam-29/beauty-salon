import { useState } from "react";
import type { FC } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, Search, X } from "lucide-react";
import { toast } from "sonner";
import type { Product, SelectedPrescriptionItem } from "../../types";
import {
  fetchProducts,
  addPrescriptionToConsultation,
} from "../../services/api";
import { Button } from "../ui/Button";

interface PrescriptionModalProps {
  consultationId: number;
  patientName: string;
  onClose: () => void;
}

export const PrescriptionModal: FC<PrescriptionModalProps> = ({
  consultationId,
  patientName,
  onClose,
}) => {
  const [selectedProducts, setSelectedProducts] = useState<
    SelectedPrescriptionItem[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customProductName, setCustomProductName] = useState("");
  const queryClient = useQueryClient();

  const { data: allProducts, isLoading: isLoadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: () => fetchProducts(),
  });

  const addPrescriptionMutation = useMutation({
    mutationFn: addPrescriptionToConsultation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSoldPrescriptions"] });
    },
    onError: (error: Error) =>
      toast.error(error.message || "Failed to add prescription item."),
  });

  const handleSelectProduct = (product: Product) => {
    if (!selectedProducts.find((p) => p.productId === product.id)) {
      const newItem: SelectedPrescriptionItem = {
        tempId: product.id,
        productId: product.id,
        name: product.name,
        brand: product.brand,
        quantity: 1,
        instructions: "",
        isCustom: false,
      };
      setSelectedProducts([...selectedProducts, newItem]);
    } else {
      toast.info("Product already selected.");
    }
  };

  const handleAddCustomProduct = () => {
    if (!customProductName.trim()) return;
    if (
      selectedProducts.find(
        (p) => p.name.toLowerCase() === customProductName.trim().toLowerCase()
      )
    ) {
      toast.warning("This product is already in the list.");
      return;
    }
    const newCustomProduct: SelectedPrescriptionItem = {
      tempId: `custom-${Date.now()}`,
      name: customProductName.trim(),
      quantity: 1,
      instructions: "",
      isCustom: true,
    };
    setSelectedProducts([...selectedProducts, newCustomProduct]);
    setCustomProductName("");
  };

  const handleUpdatePrescriptionItem = (
    tempId: number | string,
    field: "quantity" | "instructions",
    value: string | number
  ) => {
    setSelectedProducts(
      selectedProducts.map((p) =>
        p.tempId === tempId ? { ...p, [field]: value } : p
      )
    );
  };

  const handleRemoveProduct = (tempId: number | string) => {
    setSelectedProducts(selectedProducts.filter((p) => p.tempId !== tempId));
  };

  const handleSavePrescription = () => {
    const prescriptionPromises = selectedProducts.map((p) => {
      const payload = {
        consultationId,
        quantity: p.quantity,
        instructions: p.instructions,
        ...(p.isCustom
          ? { product_name_custom: p.name }
          : { productId: p.productId }),
      };
      return addPrescriptionMutation.mutateAsync(payload);
    });

    toast.promise(Promise.all(prescriptionPromises), {
      loading: "Saving prescription...",
      success: () => {
        onClose();
        return "Prescription saved successfully!";
      },
      error: "Could not save the full prescription.",
    });
  };

  const filteredProducts = allProducts?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-4xl h-[90vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-800">
            Add Prescription for {patientName}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
          <div className="flex flex-col overflow-hidden">
            <div className="relative mb-2">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 pl-10 focus:ring-2 focus:ring-rose-300 focus:outline-none"
              />
            </div>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Or add a custom product name..."
                value={customProductName}
                onChange={(e) => setCustomProductName(e.target.value)}
                className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-rose-300 focus:outline-none"
              />
              <Button
                type="button"
                onClick={handleAddCustomProduct}
                disabled={!customProductName.trim()}
                className="px-4"
              >
                Add
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {isLoadingProducts && <p>Loading products...</p>}
              {filteredProducts?.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 border rounded-lg"
                >
                  <div className="flex items-center">
                    <div>
                      <p className="font-semibold text-gray-700">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.brand}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSelectProduct(p)}
                    className="p-1 text-rose-500 hover:text-rose-700"
                  >
                    <PlusCircle size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col overflow-hidden bg-gray-50/50 p-4 rounded-lg">
            <h3 className="font-bold mb-4 text-gray-700 flex-shrink-0">
              Selected for Prescription
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {selectedProducts.length === 0 ? (
                <p className="text-center text-sm text-gray-500 pt-10">
                  No products selected.
                </p>
              ) : (
                selectedProducts.map((p) => (
                  <div
                    key={p.tempId}
                    className="bg-white p-3 rounded-lg border"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-700">{p.name}</p>
                        {p.brand && (
                          <p className="text-xs text-gray-500">{p.brand}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(p.tempId)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <div className="mt-3 grid grid-cols-5 gap-2 items-center">
                      <label className="text-sm col-span-1">Qty:</label>
                      <input
                        type="number"
                        min="1"
                        value={p.quantity}
                        onChange={(e) =>
                          handleUpdatePrescriptionItem(
                            p.tempId,
                            "quantity",
                            parseInt(e.target.value) || 1
                          )
                        }
                        className="w-full border rounded-md p-1 col-span-4"
                      />
                    </div>
                    <div className="mt-2 grid grid-cols-5 gap-2 items-start">
                      <label className="text-sm col-span-1 pt-1">
                        Notes:
                      </label>
                      <textarea
                        placeholder="Instructions..."
                        rows={2}
                        value={p.instructions}
                        onChange={(e) =>
                          handleUpdatePrescriptionItem(
                            p.tempId,
                            "instructions",
                            e.target.value
                          )
                        }
                        className="w-full border rounded-md p-1 col-span-4 text-sm"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 flex-shrink-0">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSavePrescription}
            disabled={
              addPrescriptionMutation.isPending ||
              selectedProducts.length === 0
            }
          >
            {addPrescriptionMutation.isPending
              ? "Saving..."
              : "Save Prescription"}
          </Button>
        </div>
      </div>
    </div>
  );
};