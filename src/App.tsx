import React, { useState } from 'react';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/Auth/LoginScreen';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { Header } from './components/Header';
import { OverviewTab } from './components/Dashboard/OverviewTab';
import { ProductsTab } from './components/Inventory/ProductsTab';
import { SalesDashboardTab } from './components/Sales/SalesDashboardTab';
import { InvoicesTab } from './components/Invoices/InvoicesTab';
import { CustomersTab } from './components/Customers/CustomersTab';
import { EmployeesTab } from './components/Employees/EmployeesTab';
import { ReportsTab } from './components/Reports/ReportsTab';
import { NewSaleModal } from './components/Sales/NewSaleModal';
import { InvoicePreviewModal } from './components/Invoices/InvoicePreviewModal';
import { ProductModal } from './components/Inventory/ProductModal';
import { StockUpdateModal } from './components/Inventory/StockUpdateModal';
import { SeedProduct, CustomerLead, InvoiceDetails } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout } from 'lucide-react';

function DashboardApp() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { updateInvoiceStatus, addProduct, adjustStock } = useData();

  // Modals state
  const [isNewSaleOpen, setIsNewSaleOpen] = useState(false);
  const [selectedProductForSale, setSelectedProductForSale] = useState<SeedProduct | null>(null);
  const [selectedCustomerForSale, setSelectedCustomerForSale] = useState<CustomerLead | null>(null);
  
  // Product creation modal state
  const [isNewProductOpen, setIsNewProductOpen] = useState(false);
  
  // Stock adjustment modal state
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockTargetProduct, setStockTargetProduct] = useState<SeedProduct | null>(null);

  // Invoice preview modal
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceDetails | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#F5F5F7] flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-[#34C759] to-[#30D158] flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white animate-pulse">
            <Sprout className="w-7 h-7" />
          </div>
          <div className="text-center">
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">Loading SeedFlow CRM</h2>
            <p className="text-xs text-gray-400 mt-0.5">Authenticating session securely...</p>
          </div>
          <div className="w-6 h-6 border-2 border-gray-300 border-t-emerald-600 rounded-full animate-spin mt-2" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  // Handle sale triggers
  const handleOpenSaleForProduct = (product: SeedProduct) => {
    setSelectedProductForSale(product);
    setSelectedCustomerForSale(null);
    setIsNewSaleOpen(true);
  };

  const handleOpenSaleForCustomer = (customer: CustomerLead) => {
    setSelectedCustomerForSale(customer);
    setSelectedProductForSale(null);
    setIsNewSaleOpen(true);
  };

  const handleOpenNewSale = () => {
    setSelectedProductForSale(null);
    setSelectedCustomerForSale(null);
    setIsNewSaleOpen(true);
  };

  const handleOpenNewProduct = () => {
    setIsNewProductOpen(true);
  };

  const handleQuickStockUpdate = (product: SeedProduct) => {
    setStockTargetProduct(product);
    setIsStockModalOpen(true);
  };

  const handleInvoiceCreated = (invoice: InvoiceDetails) => {
    setPreviewInvoice(invoice);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1C1C1E] flex flex-col antialiased selection:bg-[#007AFF]/20">
      {/* Apple Styled Desktop & Mobile Navigation Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={(tab: ActiveTab) => {
          setActiveTab(tab);
          setSearchQuery('');
        }}
        onOpenNewSale={handleOpenNewSale}
        onOpenNewProduct={handleOpenNewProduct}
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Content Area (offset left for 64w fixed sidebar on lg screens) */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header
          activeTab={activeTab}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenNewSale={handleOpenNewSale}
          onOpenNewProduct={handleOpenNewProduct}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'overview' && (
                <OverviewTab
                  setActiveTab={setActiveTab}
                  onOpenNewSale={handleOpenNewSale}
                  onOpenNewProduct={handleOpenNewProduct}
                  onViewInvoice={(inv) => setPreviewInvoice(inv)}
                  onQuickStockUpdate={handleQuickStockUpdate}
                />
              )}

              {activeTab === 'products' && (
                <ProductsTab
                  onOpenNewSaleForProduct={handleOpenSaleForProduct}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === 'sales' && (
                <SalesDashboardTab
                  onOpenNewSale={handleOpenNewSale}
                  onViewInvoice={(inv) => setPreviewInvoice(inv)}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === 'invoices' && (
                <InvoicesTab
                  onOpenNewSale={handleOpenNewSale}
                  onViewInvoice={(inv) => setPreviewInvoice(inv)}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === 'customers' && (
                <CustomersTab
                  onOpenNewSaleForCustomer={handleOpenSaleForCustomer}
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === 'employees' && (
                <EmployeesTab
                  searchQuery={searchQuery}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsTab />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Global Application Footer */}
        <footer className="mt-auto border-t border-gray-200/80 bg-[#F5F5F7]/80 backdrop-blur-md px-6 py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
              <span>Created by</span>
              <span className="font-semibold text-gray-800">Abir Das</span>
              <span>by</span>
              <a 
                href="https://animesoft.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#007AFF] hover:underline font-semibold"
              >
                animesoft.com
              </a>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/profile.php?id=100087771241931"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium transition-all shadow-2xs border border-blue-200/60"
              >
                <span>Facebook Profile</span>
              </a>
              <a
                href="https://www.instagram.com/anemosoft?fbclid=IwY2xjawT-muJwZG9mBWV4dG4DYWVtAjEwAGJyaWQRMWZvVUVMN0lOQ051eEo2WHlzcnRjBmFwcF9pZBAyMjIwMzkxNzg4MjAwODkyAAEeGF4v2QLluqE3gDmLjTq1caN-APyroH8uWCmn5OgwNIEzrwvMbYpgqpUsa58_aem_KMBcjCDK-Fk76FBxL2V5vQ"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-50 text-pink-700 hover:bg-pink-100 font-medium transition-all shadow-2xs border border-pink-200/60"
              >
                <span>Instagram Profile</span>
              </a>
            </div>
          </div>
        </footer>
      </div>

      {/* Global New Sale & Invoice Generation Modal */}
      <NewSaleModal
        isOpen={isNewSaleOpen}
        onClose={() => {
          setIsNewSaleOpen(false);
          setSelectedProductForSale(null);
          setSelectedCustomerForSale(null);
        }}
        preSelectedProduct={selectedProductForSale}
        preSelectedCustomer={selectedCustomerForSale}
        onSuccessInvoice={handleInvoiceCreated}
      />

      {/* Interactive & Printable Demo Invoice Modal */}
      <InvoicePreviewModal
        isOpen={!!previewInvoice}
        onClose={() => setPreviewInvoice(null)}
        invoice={previewInvoice}
        onUpdateStatus={(status) => {
          if (previewInvoice) {
            updateInvoiceStatus(previewInvoice.id, status);
            setPreviewInvoice(prev => prev ? { ...prev, paymentStatus: status } : null);
          }
        }}
      />

      {/* Global Add Product Modal */}
      <ProductModal
        isOpen={isNewProductOpen}
        onClose={() => setIsNewProductOpen(false)}
        onSave={(prodData) => {
          addProduct(prodData);
          setIsNewProductOpen(false);
        }}
      />

      {/* Global Quick Stock Update Modal */}
      <StockUpdateModal
        isOpen={isStockModalOpen}
        onClose={() => {
          setIsStockModalOpen(false);
          setStockTargetProduct(null);
        }}
        product={stockTargetProduct}
        onAdjustStock={(productId, delta, reason, type, adjustedBy) => {
          const success = adjustStock(productId, delta, reason, type, adjustedBy);
          if (success) {
            setIsStockModalOpen(false);
            setStockTargetProduct(null);
          }
          return success;
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <DashboardApp />
      </DataProvider>
    </AuthProvider>
  );
}


