import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { AppleButton } from '../UI/AppleButton';
import { SeedProduct, StockAdjustment } from '../../types';
import { PlusCircle, MinusCircle, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StockUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: SeedProduct | null;
  onAdjustStock: (
    productId: string, 
    delta: number, 
    reason: string, 
    type: StockAdjustment['type'], 
    adjustedBy: string
  ) => boolean;
}

export const StockUpdateModal: React.FC<StockUpdateModalProps> = ({
  isOpen,
  onClose,
  product,
  onAdjustStock
}) => {
  const [actionType, setActionType] = useState<'add' | 'reduce'>('add');
  const [adjustmentCategory, setAdjustmentCategory] = useState<StockAdjustment['type']>('stock_in');
  const [quantity, setQuantity] = useState<number>(50);
  const [reason, setReason] = useState('');
  const [adjustedBy, setAdjustedBy] = useState('David Chen (Warehouse Supervisor)');

  useEffect(() => {
    if (product) {
      if (product.type === 'imported') {
        setAdjustmentCategory('import_arrival');
        setReason('New imported seed consignment received from supplier');
      } else {
        setAdjustmentCategory('harvest_yield');
        setReason('Post-harvest seed processing and conditioning yield');
      }
      setQuantity(50);
      setActionType('add');
    }
  }, [product, isOpen]);

  if (!product) return null;

  const currentStock = product.stockQuantity;
  const delta = actionType === 'add' ? quantity : -quantity;
  const newStock = Math.max(0, currentStock + delta);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      alert('Please enter a quantity greater than 0.');
      return;
    }

    const finalType: StockAdjustment['type'] = 
      actionType === 'add' 
        ? (adjustmentCategory || (product.type === 'imported' ? 'import_arrival' : 'harvest_yield'))
        : (adjustmentCategory === 'damaged' ? 'damaged' : 'stock_out');

    const success = onAdjustStock(
      product.id,
      delta,
      reason.trim() || (actionType === 'add' ? 'Stock Refill' : 'Manual Reduction'),
      finalType,
      adjustedBy
    );

    if (success) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Level Update"
      subtitle={`Adjusting inventory stock for ${product.name} (${product.subProductName})`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Current vs Projected Stock Card */}
        <div className="p-4 rounded-2xl bg-[#F2F2F7] border border-black/[0.05] flex items-center justify-between">
          <div>
            <span className="text-xs text-[#8E8E93] font-medium block">Current Stock</span>
            <span className="text-xl font-bold text-[#1C1C1E]">
              {currentStock} {product.unit}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#8E8E93]">→</span>
          </div>

          <div className="text-right">
            <span className="text-xs text-[#8E8E93] font-medium block">New Projected Stock</span>
            <span className={`text-xl font-bold ${actionType === 'add' ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
              {newStock} {product.unit}
            </span>
          </div>
        </div>

        {/* Action Type Toggle */}
        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1.5">
            Adjustment Operation *
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F2F2F7] rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActionType('add');
                setAdjustmentCategory(product.type === 'imported' ? 'import_arrival' : 'harvest_yield');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                actionType === 'add'
                  ? 'bg-white text-[#34C759] shadow-xs border border-black/[0.04]'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>+ Add / Restock</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActionType('reduce');
                setAdjustmentCategory('stock_out');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                actionType === 'reduce'
                  ? 'bg-white text-[#FF3B30] shadow-xs border border-black/[0.04]'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
            >
              <MinusCircle className="w-3.5 h-3.5" />
              <span>- Reduce / Deduct</span>
            </button>
          </div>
        </div>

        {/* Adjustment Category */}
        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
            Reason Category
          </label>
          <select
            value={adjustmentCategory}
            onChange={(e) => setAdjustmentCategory(e.target.value as StockAdjustment['type'])}
            className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
          >
            {actionType === 'add' ? (
              <>
                <option value="import_arrival">📦 International Import Arrival (Supplier Delivery)</option>
                <option value="harvest_yield">🌱 Farm Harvest / Seed Processing Yield</option>
                <option value="stock_in">📥 General Stock In / Supplier Purchase</option>
                <option value="correction">⚙️ Physical Audit Inventory Correction (+)</option>
              </>
            ) : (
              <>
                <option value="stock_out">📤 Warehouse Dispatch / Transfer</option>
                <option value="damaged">⚠️ Damaged / Expired / Low Germination Discard</option>
                <option value="correction">⚙️ Physical Audit Inventory Correction (-)</option>
              </>
            )}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
            Quantity to {actionType === 'add' ? 'Add' : 'Deduct'} ({product.unit}) *
          </label>
          <input
            type="number"
            min="1"
            step="any"
            required
            value={quantity}
            onChange={(e) => setQuantity(Math.max(0, parseFloat(e.target.value) || 0))}
            className="w-full px-3 py-2 text-base font-semibold bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
          />
        </div>

        {/* Reason / Remarks */}
        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
            Remarks & Audit Notes
          </label>
          <input
            type="text"
            placeholder="e.g. Customs release clearance / Farm Plot B drying batch"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
          />
        </div>

        {/* Staff */}
        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
            Adjusted By Staff Member
          </label>
          <input
            type="text"
            value={adjustedBy}
            onChange={(e) => setAdjustedBy(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-black/[0.06]">
          <AppleButton variant="outline" type="button" onClick={onClose}>
            Cancel
          </AppleButton>
          <AppleButton 
            variant={actionType === 'add' ? 'success' : 'danger'} 
            type="submit"
          >
            {actionType === 'add' ? `Confirm Add (+${quantity} ${product.unit})` : `Confirm Deduct (-${quantity} ${product.unit})`}
          </AppleButton>
        </div>
      </form>
    </Modal>
  );
};
