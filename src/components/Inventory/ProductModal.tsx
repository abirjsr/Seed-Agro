import React, { useState, useEffect } from 'react';
import { Modal } from '../UI/Modal';
import { AppleButton } from '../UI/AppleButton';
import { SeedProduct, ProductOriginType, ProductCategory } from '../../types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Omit<SeedProduct, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialProduct?: SeedProduct | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct
}) => {
  const [name, setName] = useState('');
  const [subProductName, setSubProductName] = useState('');
  const [type, setType] = useState<ProductOriginType>('imported');
  const [category, setCategory] = useState<ProductCategory>('Vegetable Seeds');
  const [originOrSupplier, setOriginOrSupplier] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [stockQuantity, setStockQuantity] = useState<number>(100);
  const [unit, setUnit] = useState<SeedProduct['unit']>('packet');
  const [costPrice, setCostPrice] = useState<number>(15.00);
  const [sellingPrice, setSellingPrice] = useState<number>(28.50);
  const [germinationRate, setGerminationRate] = useState<number>(95);
  const [purityRate, setPurityRate] = useState<number>(99.0);
  const [minStockAlert, setMinStockAlert] = useState<number>(50);
  const [expiryDate, setExpiryDate] = useState('2027-12-31');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialProduct) {
      setName(initialProduct.name);
      setSubProductName(initialProduct.subProductName);
      setType(initialProduct.type);
      setCategory(initialProduct.category);
      setOriginOrSupplier(initialProduct.originOrSupplier);
      setBatchNumber(initialProduct.batchNumber);
      setStockQuantity(initialProduct.stockQuantity);
      setUnit(initialProduct.unit);
      setCostPrice(initialProduct.costPrice);
      setSellingPrice(initialProduct.sellingPrice);
      setGerminationRate(initialProduct.germinationRate);
      setPurityRate(initialProduct.purityRate);
      setMinStockAlert(initialProduct.minStockAlert);
      setExpiryDate(initialProduct.expiryDate);
      setDescription(initialProduct.description || '');
    } else {
      setName('');
      setSubProductName('');
      setType('imported');
      setCategory('Vegetable Seeds');
      setOriginOrSupplier('Enza Zaden (Netherlands)');
      setBatchNumber(`BATCH-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
      setStockQuantity(100);
      setUnit('packet');
      setCostPrice(15.00);
      setSellingPrice(28.50);
      setGerminationRate(96);
      setPurityRate(99.2);
      setMinStockAlert(50);
      setExpiryDate('2027-12-31');
      setDescription('');
    }
  }, [initialProduct, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subProductName.trim()) {
      alert('Please fill in both Product Name and Sub-Product / Variety Name.');
      return;
    }

    onSave({
      name: name.trim(),
      subProductName: subProductName.trim(),
      type,
      category,
      originOrSupplier: originOrSupplier.trim() || (type === 'imported' ? 'International Supplier' : 'Own Production Farm'),
      batchNumber: batchNumber.trim() || `BATCH-${Date.now()}`,
      stockQuantity: Number(stockQuantity) || 0,
      unit,
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      germinationRate: Number(germinationRate) || 90,
      purityRate: Number(purityRate) || 98,
      minStockAlert: Number(minStockAlert) || 20,
      expiryDate,
      description: description.trim()
    });

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct ? 'Edit Seed Product' : 'Add New Seed Product'}
      subtitle={
        initialProduct
          ? `Updating specifications for ${initialProduct.name} (${initialProduct.subProductName})`
          : 'Register imported hybrid seed shipment or local farm production batch'
      }
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Product Type Selector (Segmented Apple Style) */}
        <div>
          <label className="block text-xs font-semibold text-[#1C1C1E] mb-1.5">
            Seed Production Classification *
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#F2F2F7] rounded-xl border border-black/[0.04]">
            <button
              type="button"
              onClick={() => {
                setType('imported');
                if (!originOrSupplier || originOrSupplier.includes('Farm')) {
                  setOriginOrSupplier('Sakata Seeds (Japan)');
                }
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'imported'
                  ? 'bg-white text-[#007AFF] shadow-xs border border-black/[0.04]'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
            >
              📦 Imported Product (International Genetics)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('own_production');
                if (!originOrSupplier || originOrSupplier.includes('Seeds')) {
                  setOriginOrSupplier('Own Production Plot Block-A');
                }
              }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                type === 'own_production'
                  ? 'bg-white text-[#34C759] shadow-xs border border-black/[0.04]'
                  : 'text-[#8E8E93] hover:text-[#1C1C1E]'
              }`}
            >
              🌱 Own Production Product (Local Farm Harvest)
            </button>
          </div>
        </div>

        {/* Product Name & Sub Product Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Hybrid Tomato, Golden Corn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Sub-Product Name (Variety / Cultivar) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. F1-Apex Cluster, SuperGold-99"
              value={subProductName}
              onChange={(e) => setSubProductName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>
        </div>

        {/* Category & Origin */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Crop Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            >
              <option value="শসা (Cucumber)">শসা (Cucumber)</option>
              <option value="করলা (উচ্ছা) (Bitter Gourd)">করলা (উচ্ছা) (Bitter Gourd)</option>
              <option value="মরিচ (Chilli)">মরিচ (Chilli)</option>
              <option value="ঢেঁড়স (ভেন্ডি) (Okra)">ঢেঁড়স (ভেন্ডি) (Okra)</option>
              <option value="বরবটি (Yardlong Bean)">বরবটি (Yardlong Bean)</option>
              <option value="লাউ (Bottle Gourd)">লাউ (Bottle Gourd)</option>
              <option value="তরমুজ (Watermelon)">তরমুজ (Watermelon)</option>
              <option value="ঝিঙা (Luffa)">ঝিঙা (Luffa)</option>
              <option value="Vegetable Seeds">Vegetable Seeds</option>
              <option value="Grain & Cereal">Grain & Cereal</option>
              <option value="Fruit Seeds">Fruit Seeds</option>
              <option value="Flower Seeds">Flower Seeds</option>
              <option value="Legumes & Pulses">Legumes & Pulses</option>
              <option value="Oilseeds & Spices">Oilseeds & Spices</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              {type === 'imported' ? 'Origin / Import Supplier' : 'Production Farm Plot / Breeder'}
            </label>
            <input
              type="text"
              placeholder={type === 'imported' ? 'e.g. Enza Zaden (Netherlands)' : 'e.g. Own Farm Field Block-B'}
              value={originOrSupplier}
              onChange={(e) => setOriginOrSupplier(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>
        </div>

        {/* Batch, Stock Quantity & Unit */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Batch / Lot Number
            </label>
            <input
              type="text"
              placeholder="e.g. BATCH-2026-081"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Current Stock Quantity
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Unit of Measure
            </label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as SeedProduct['unit'])}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            >
              <option value="packet">Packets / Pouches</option>
              <option value="kg">Kilograms (kg)</option>
              <option value="bag">Bags (50kg / 25kg)</option>
              <option value="metric_ton">Metric Tons (MT)</option>
              <option value="gram">Grams (g)</option>
            </select>
          </div>
        </div>

        {/* Pricing (Cost Price & Selling Price) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 bg-[#F9F9FB] rounded-xl border border-black/[0.05]">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Cost Price (৳ Taka)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={costPrice}
              onChange={(e) => setCostPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Selling Price (৳ Taka) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              required
              value={sellingPrice}
              onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] font-semibold text-[#007AFF] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Estimated Margin
            </label>
            <div className="px-3 py-2 text-sm font-semibold text-[#34C759] bg-white border border-black/[0.08] rounded-xl flex items-center justify-between">
              <span>
                ৳{(sellingPrice - costPrice).toFixed(2)}
              </span>
              <span className="text-xs text-[#636366]">
                {costPrice > 0 ? `${(((sellingPrice - costPrice) / costPrice) * 100).toFixed(0)}%` : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Quality Certifications: Germination Rate, Purity & Min Stock Alert */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Germination Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={germinationRate}
              onChange={(e) => setGerminationRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Purity Rate (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={purityRate}
              onChange={(e) => setPurityRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Min Stock Alert Threshold
            </label>
            <input
              type="number"
              min="0"
              value={minStockAlert}
              onChange={(e) => setMinStockAlert(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>
        </div>

        {/* Expiry / Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Seed Lot Expiration / Best Sowing Date
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#1C1C1E] mb-1">
              Agronomic Description & Notes
            </label>
            <input
              type="text"
              placeholder="e.g. High brix sweetness, TYLCV resistance"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-black/[0.12] rounded-xl text-[#1C1C1E] focus:outline-none focus:ring-2 focus:ring-[#007AFF]/30 focus:border-[#007AFF]"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/[0.06]">
          <AppleButton variant="outline" type="button" onClick={onClose}>
            Cancel
          </AppleButton>
          <AppleButton variant="primary" type="submit">
            {initialProduct ? 'Update Product' : 'Save & Register Seed Product'}
          </AppleButton>
        </div>
      </form>
    </Modal>
  );
};
