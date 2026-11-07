import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Edit3, 
  Trash2, 
  TrendingUp, 
  AlertTriangle, 
  Package, 
  Layers, 
  RefreshCw,
  ShoppingCart,
  Sprout,
  Calendar,
  Globe,
  Sparkles,
  History
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AppleCard } from '../UI/AppleCard';
import { AppleButton } from '../UI/AppleButton';
import { Badge } from '../UI/Badge';
import { SegmentedControl } from '../UI/SegmentedControl';
import { SeedProduct, ProductOriginType, ProductCategory } from '../../types';
import { ProductModal } from './ProductModal';
import { StockUpdateModal } from './StockUpdateModal';
import { formatTaka } from '../../utils/format';

interface ProductsTabProps {
  onOpenNewSaleForProduct: (product: SeedProduct) => void;
  searchQuery: string;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  onOpenNewSaleForProduct,
  searchQuery: externalSearch
}) => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    adjustStock,
    stockAdjustments 
  } = useData();

  const [originFilter, setOriginFilter] = useState<'all' | 'imported' | 'own_production'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low_stock' | 'in_stock'>('all');
  const [internalSearch, setInternalSearch] = useState('');
  const [showAdjustmentLog, setShowAdjustmentLog] = useState(false);

  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SeedProduct | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockTargetProduct, setStockTargetProduct] = useState<SeedProduct | null>(null);

  const activeSearch = externalSearch || internalSearch;

  // Filtered list
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Origin filter
      if (originFilter !== 'all' && p.type !== originFilter) return false;
      // Category filter
      if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
      // Stock status filter
      if (stockStatusFilter === 'low_stock' && p.stockQuantity > p.minStockAlert) return false;
      if (stockStatusFilter === 'in_stock' && p.stockQuantity <= 0) return false;

      // Text search
      if (activeSearch.trim()) {
        const q = activeSearch.toLowerCase();
        const matchName = p.name.toLowerCase().includes(q);
        const matchSub = p.subProductName.toLowerCase().includes(q);
        const matchBatch = p.batchNumber.toLowerCase().includes(q);
        const matchOrigin = p.originOrSupplier.toLowerCase().includes(q);
        const matchCategory = p.category.toLowerCase().includes(q);
        return matchName || matchSub || matchBatch || matchOrigin || matchCategory;
      }
      return true;
    });
  }, [products, originFilter, categoryFilter, stockStatusFilter, activeSearch]);

  const importedCount = products.filter(p => p.type === 'imported').length;
  const ownProdCount = products.filter(p => p.type === 'own_production').length;
  const lowStockCount = products.filter(p => p.stockQuantity <= p.minStockAlert).length;

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  const handleSaveProduct = (data: Omit<SeedProduct, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, data);
    } else {
      addProduct(data);
    }
  };

  const handleDeleteProduct = (product: SeedProduct) => {
    if (window.confirm(`Are you sure you want to delete "${product.name} (${product.subProductName})"? This will remove it from inventory.`)) {
      deleteProduct(product.id);
    }
  };

  const handleOpenStockUpdate = (product: SeedProduct) => {
    setStockTargetProduct(product);
    setIsStockModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card & Filter Bar */}
      <AppleCard padding="md" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Segmented Origin Filter (All, Imported, Own Production) */}
          <SegmentedControl
            options={[
              { value: 'all', label: 'All Seeds', count: products.length },
              { 
                value: 'imported', 
                label: 'Imported Products', 
                count: importedCount,
                icon: <Globe className="w-3.5 h-3.5 text-[#007AFF]" />
              },
              { 
                value: 'own_production', 
                label: 'Own Production', 
                count: ownProdCount,
                icon: <Sprout className="w-3.5 h-3.5 text-[#34C759]" />
              }
            ]}
            value={originFilter}
            onChange={(val) => setOriginFilter(val as typeof originFilter)}
          />

          <div className="flex items-center gap-2 flex-wrap">
            {/* Toggle Adjustment Log */}
            <AppleButton
              variant={showAdjustmentLog ? 'secondary' : 'outline'}
              size="sm"
              onClick={() => setShowAdjustmentLog(prev => !prev)}
              icon={<History className="w-3.5 h-3.5" />}
            >
              {showAdjustmentLog ? 'Hide Stock Logs' : 'Stock Audit Logs'}
            </AppleButton>

            {/* Add Seed Product Button */}
            <AppleButton
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              icon={<Plus className="w-4 h-4" />}
            >
              Add Seed Product
            </AppleButton>
          </div>
        </div>

        {/* Secondary Filter Chips */}
        <div className="flex items-center gap-2 pt-2 border-t border-black/[0.05] overflow-x-auto pb-1 text-xs">
          <span className="text-[#8E8E93] font-medium shrink-0">Category:</span>
          <button
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
              categoryFilter === 'all'
                ? 'bg-[#1C1C1E] text-white'
                : 'bg-black/5 text-[#636366] hover:bg-black/10'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-[#007AFF] text-white'
                  : 'bg-black/5 text-[#636366] hover:bg-black/10'
              }`}
            >
              {cat}
            </button>
          ))}

          <div className="h-4 w-px bg-black/[0.1] shrink-0 mx-1" />

          <button
            onClick={() => setStockStatusFilter(prev => prev === 'low_stock' ? 'all' : 'low_stock')}
            className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 flex items-center gap-1 transition-colors cursor-pointer ${
              stockStatusFilter === 'low_stock'
                ? 'bg-[#FF9500] text-white'
                : 'bg-[#FF9500]/15 text-[#D97706] hover:bg-[#FF9500]/25'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>Low Stock ({lowStockCount})</span>
          </button>
        </div>
      </AppleCard>

      {/* Stock Adjustments Audit Log Accordion (if open) */}
      {showAdjustmentLog && (
        <AppleCard padding="md" className="border-l-4 border-l-[#007AFF]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-[#1C1C1E] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-4 h-4 text-[#007AFF]" />
              <span>Recent Inventory Stock Adjustments & Yield Logs</span>
            </h4>
            <span className="text-[11px] text-[#8E8E93]">{stockAdjustments.length} total entries</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {stockAdjustments.slice(0, 8).map((adj) => (
              <div key={adj.id} className="p-2.5 rounded-xl bg-[#F9F9FB] border border-black/[0.04] text-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#1C1C1E] truncate">{adj.productName} ({adj.subProductName})</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      adj.type.includes('import') || adj.type.includes('harvest') || adj.type === 'stock_in'
                        ? 'bg-[#34C759]/15 text-[#28A745]'
                        : 'bg-[#FF3B30]/15 text-[#DC2626]'
                    }`}>
                      {adj.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8E8E93] truncate mt-0.5">
                    {adj.reason} • Adjusted by: {adj.adjustedBy} • {adj.date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`font-bold block ${
                    adj.newStock > adj.previousStock ? 'text-[#34C759]' : 'text-[#FF3B30]'
                  }`}>
                    {adj.newStock > adj.previousStock ? `+${adj.quantity}` : `-${adj.quantity}`}
                  </span>
                  <span className="text-[10px] text-[#8E8E93]">
                    {adj.previousStock} → {adj.newStock}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </AppleCard>
      )}

      {/* Products Table Card */}
      <AppleCard padding="none" className="overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-black/[0.06] flex items-center justify-between bg-white/80 backdrop-blur-sm">
          <div>
            <h3 className="font-bold text-sm text-[#1C1C1E] tracking-tight">
              Seed Products Roster ({filteredProducts.length})
            </h3>
            <p className="text-xs text-[#8E8E93]">
              Listing registered seed genotypes, stock levels, and unit economics
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-10 h-10 text-[#8E8E93] mx-auto mb-3 opacity-60" />
            <h4 className="text-sm font-semibold text-[#1C1C1E]">No seed products match your filter</h4>
            <p className="text-xs text-[#8E8E93] mt-1">Try clearing search terms or adding a new seed product.</p>
            <AppleButton
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="mt-4"
            >
              + Add Seed Product
            </AppleButton>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-black/[0.06] bg-[#F9F9FB] text-[#8E8E93] font-semibold">
                  <th className="py-3 px-4">Product & Variety</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4">Origin / Farm Source</th>
                  <th className="py-3 px-4">Batch #</th>
                  <th className="py-3 px-4">Quality & Germ.</th>
                  <th className="py-3 px-4 text-right">Current Stock</th>
                  <th className="py-3 px-4 text-right">Price / Unit</th>
                  <th className="py-3 px-4 text-center">Quick Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.04]">
                {filteredProducts.map((prod) => {
                  const isLowStock = prod.stockQuantity <= prod.minStockAlert;
                  return (
                    <tr 
                      key={prod.id} 
                      className="hover:bg-[#F5F5F7]/80 transition-colors group"
                    >
                      {/* Product Name & Sub Product */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-sm text-[#1C1C1E]">{prod.name}</div>
                        <div className="text-[11px] text-[#007AFF] font-medium mt-0.5">
                          {prod.subProductName}
                        </div>
                        <div className="text-[10px] text-[#8E8E93] mt-0.5">{prod.category}</div>
                      </td>

                      {/* Origin Type Badge */}
                      <td className="py-3.5 px-4">
                        <Badge 
                          variant={prod.type === 'imported' ? 'blue' : 'green'} 
                          size="sm"
                          icon={prod.type === 'imported' ? <Globe className="w-3 h-3" /> : <Sprout className="w-3 h-3" />}
                        >
                          {prod.type === 'imported' ? 'Imported' : 'Own Farm'}
                        </Badge>
                      </td>

                      {/* Origin Details */}
                      <td className="py-3.5 px-4 max-w-[160px]">
                        <span className="text-xs text-[#3A3A3C] font-medium truncate block" title={prod.originOrSupplier}>
                          {prod.originOrSupplier}
                        </span>
                        <span className="text-[10px] text-[#8E8E93] block">
                          Exp: {prod.expiryDate}
                        </span>
                      </td>

                      {/* Batch Number */}
                      <td className="py-3.5 px-4">
                        <code className="text-[11px] font-mono bg-black/[0.05] px-2 py-0.5 rounded text-[#1C1C1E]">
                          {prod.batchNumber}
                        </code>
                      </td>

                      {/* Quality & Germination Rate */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1 text-xs font-semibold text-[#1C1C1E]">
                          <span className="text-[#34C759]">{prod.germinationRate}%</span>
                          <span className="text-[#8E8E93] text-[10px]">Germ.</span>
                        </div>
                        <div className="text-[10px] text-[#8E8E93]">
                          {prod.purityRate}% Purity
                        </div>
                      </td>

                      {/* Current Stock */}
                      <td className="py-3.5 px-4 text-right">
                        <div className={`text-sm font-bold ${isLowStock ? 'text-[#FF3B30]' : 'text-[#1C1C1E]'}`}>
                          {prod.stockQuantity.toLocaleString()} {prod.unit}
                        </div>
                        {isLowStock && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-[#FF9500]">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        )}
                      </td>

                      {/* Pricing */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="text-sm font-bold text-[#1C1C1E]">
                          {formatTaka(prod.sellingPrice)}
                        </div>
                        <div className="text-[10px] text-[#8E8E93]">
                          Cost: {formatTaka(prod.costPrice)}
                        </div>
                      </td>

                      {/* Quick Stock Update */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => handleOpenStockUpdate(prod)}
                          className="px-2.5 py-1 rounded-lg bg-black/5 hover:bg-[#007AFF] hover:text-white text-[#1C1C1E] text-xs font-semibold transition-all cursor-pointer"
                        >
                          ± Update Stock
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onOpenNewSaleForProduct(prod)}
                            title="Sell this seed product"
                            className="p-1.5 rounded-lg bg-[#007AFF]/10 text-[#007AFF] hover:bg-[#007AFF] hover:text-white transition-colors cursor-pointer"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setIsProductModalOpen(true);
                            }}
                            title="Edit specifications"
                            className="p-1.5 rounded-lg bg-black/5 text-[#636366] hover:bg-black/10 hover:text-[#1C1C1E] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod)}
                            title="Delete seed product"
                            className="p-1.5 rounded-lg bg-[#FF3B30]/10 text-[#FF3B30] hover:bg-[#FF3B30] hover:text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </AppleCard>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        initialProduct={editingProduct}
      />

      {/* Quick Stock Update Modal */}
      <StockUpdateModal
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        product={stockTargetProduct}
        onAdjustStock={adjustStock}
      />
    </div>
  );
};
