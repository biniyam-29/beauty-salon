import { AlertTriangle, Calendar, Package, Scissors, User } from "lucide-react";
import { checkoutUtils, type Prescription, type ProductPrescription } from "../../hooks/UseCheckout";
import { cn } from "../../lib/utils";

const TypeBadge: React.FC<{ type: 'product' | 'service' }> = ({ type }) => {
  const isProduct = type === 'product';
  
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
      isProduct 
        ? "bg-blue-100 text-blue-800" 
        : "bg-purple-100 text-purple-800"
    )}>
      {isProduct ? <Package size={12} /> : <Scissors size={12} />}
      {isProduct ? 'Product' : 'Service'}
    </span>
  );
};


const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { color, bgColor, label } = checkoutUtils.getStatusBadgeProps(status);
  
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
      color,
      bgColor
    )}>
      {label}
    </span>
  );
};

export const PrescriptionCard: React.FC<{
  prescription: Prescription;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
  isProcessing?: boolean;
}> = ({ prescription, isSelected, onToggleSelect, isProcessing = false }) => {
  const isProduct = prescription.type === 'product';
  const productPrescription = prescription as ProductPrescription;
  
  const canProcess = checkoutUtils.canProcessPrescription(prescription);
  const isOutOfStock = isProduct && productPrescription.stock_quantity < prescription.quantity;

  return (
    <div
      className={cn(
        "group bg-white rounded-2xl shadow-sm border p-6 transition-all duration-300 animate-fade-in",
        isSelected
          ? "border-rose-500 ring-2 ring-rose-200 shadow-lg"
          : "border-gray-100 hover:border-rose-300 hover:shadow-lg",
        !canProcess && "opacity-60"
      )}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        {/* Left Section - Selection & Basic Info */}
        <div className="flex items-start gap-4 flex-1">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggleSelect(prescription.id)}
              disabled={!canProcess || isProcessing}
              className={cn(
                "h-5 w-5 rounded-lg border-2 cursor-pointer transition-colors",
                canProcess
                  ? "border-rose-300 text-rose-600 focus:ring-rose-500"
                  : "border-gray-300 cursor-not-allowed"
              )}
            />
            
            <div className="relative">
              <div className={cn(
                "w-14 h-14 rounded-xl flex items-center justify-center",
                isProduct 
                  ? "bg-gradient-to-br from-blue-50 to-blue-100" 
                  : "bg-gradient-to-br from-purple-50 to-purple-100"
              )}>
                {isProduct ? (
                  <Package size={24} className={cn(
                    "text-blue-600",
                    isOutOfStock && "text-red-400"
                  )} />
                ) : (
                  <Scissors size={24} className="text-purple-600" />
                )}
              </div>
              {isOutOfStock && (
                <div className="absolute -top-1 -right-1">
                  <AlertTriangle size={12} className="text-red-500" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="font-bold text-gray-800 text-lg">{prescription.name}</h3>
              <TypeBadge type={prescription.type} />
              <StatusBadge status={prescription.status} />
            </div>
            
            {prescription.instructions && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {prescription.instructions}
              </p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1.5">
                <User size={14} className="text-gray-400" />
                <span className="text-gray-700">{prescription.doctor_name}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-gray-700">
                  {new Date(prescription.consultation_date).toLocaleDateString()}
                </span>
              </div>
              {isProduct && (
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-500">Quantity:</span>
                  <span className="font-semibold text-gray-800">{prescription.quantity}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Price & Customer Info */}
        <div className="lg:text-right">
          <div className="mb-3">
            <div className="text-2xl font-bold text-rose-600">
              {checkoutUtils.formatPrice(prescription.unit_price)}
            </div>
            {isProduct && productPrescription.stock_quantity !== null && (
              <div className={cn(
                "text-sm mt-1",
                productPrescription.stock_quantity < prescription.quantity
                  ? "text-red-600 font-medium"
                  : "text-gray-500"
              )}>
                Stock: {productPrescription.stock_quantity}
                {isOutOfStock && " (Out of stock)"}
              </div>
            )}
          </div>
          
          <div className="bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <User size={12} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-800">{prescription.customer_name}</span>
            </div>
            <div className="text-xs text-gray-500">ID: #{prescription.customer_id}</div>
          </div>
        </div>
      </div>

      {/* Warning Message */}
      {!canProcess && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-amber-800 text-sm">
          <AlertTriangle size={16} />
          {isOutOfStock 
            ? `Insufficient stock: ${productPrescription.stock_quantity} available, ${prescription.quantity} needed`
            : "Cannot process this prescription in current state"
          }
        </div>
      )}
    </div>
  );
};