import React, { useState, useMemo } from 'react';
import { InventoryItem, InventoryStatus, ProductCategory, AIPredictionType } from '../types';
import { calculateStockStatus, computeStockPercentage } from '../inventoryData';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onAddItem: (item: Omit<InventoryItem, 'id'>) => void;
  onRestockItem: (id: string, amount: number) => void;
  onExport: () => void;
  onViewSpaceSimulation: () => void;
}

type SortField = 'quantity' | 'price' | 'name' | 'sku' | 'percentage' | 'reorder';
type SortOrder = 'asc' | 'desc';

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onAddItem,
  onRestockItem,
  onExport,
  onViewSpaceSimulation
}) => {
  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [aiFilter, setAiFilter] = useState<string>('All');

  // Sorting & Pagination State
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(15);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals & Drawer State
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Restock amount within drawer
  const [customRestockQty, setCustomRestockQty] = useState<number>(25);
  const [activeTabInsight, setActiveTabInsight] = useState<number>(0);

  // New Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ProductCategory>('Electronics');
  const [newItemAvailable, setNewItemAvailable] = useState<number>(50);
  const [newItemReserved, setNewItemReserved] = useState<number>(0);
  const [newItemDamaged, setNewItemDamaged] = useState<number>(0);
  const [newItemReorderLevel, setNewItemReorderLevel] = useState<number>(20);
  const [newItemMaxStock, setNewItemMaxStock] = useState<number>(150);
  const [newItemZone, setNewItemZone] = useState('Zone B');
  const [newItemShelf, setNewItemShelf] = useState('B-01-01-A');
  const [newItemSupplier, setNewItemSupplier] = useState('');
  const [newItemUnitPrice, setNewItemUnitPrice] = useState<number>(45.0);

  // AI Insights data for top card
  const aiInsights = [
    {
      title: 'Space Optimization Available',
      badge: 'Zone B Optimization',
      description: 'Reorganizing Zone B aisle shelving could increase total storage utilization by 12% without structural modifications.',
      actionText: 'View Simulation',
      onAction: onViewSpaceSimulation,
      icon: 'architecture'
    },
    {
      title: 'High Velocity Depletion Alert',
      badge: '3 Critical Items',
      description: 'Demand for Enterprise Workstations & Thermal Supplies surged 34% this week. Stockout expected within 48 hours.',
      actionText: 'Filter Critical Stock',
      onAction: () => setStockFilter('Critical'),
      icon: 'trending_up'
    },
    {
      title: 'Surplus Reallocation Recommended',
      badge: 'Overstock Reduction',
      description: 'Packaging tape and corner protectors have exceeded 90-day threshold. Recommend moving 120 units to secondary depot.',
      actionText: 'Filter Overstock',
      onAction: () => setStockFilter('Oversupplied'),
      icon: 'inventory'
    }
  ];

  // Filter and Sort inventory
  const filteredAndSortedItems = useMemo(() => {
    const result = inventory.filter((item) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q) ||
        item.supplier.toLowerCase().includes(q) ||
        item.shelfBinLocation.toLowerCase().includes(q) ||
        item.id.toLowerCase().includes(q);

      const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
      const matchesStock = stockFilter === 'All' || item.status === stockFilter;
      const matchesZone = zoneFilter === 'All' || item.warehouseZone === zoneFilter;
      const matchesAi =
        aiFilter === 'All' ||
        (aiFilter === 'depletion' && (item.aiPredictionType === 'depletion' || item.aiPredictionType === 'restock')) ||
        (aiFilter === 'overstock' && (item.aiPredictionType === 'overstock' || item.aiPredictionType === 'dead_stock')) ||
        (aiFilter === 'increasing' && item.aiPredictionType === 'increasing') ||
        (aiFilter === 'stable' && item.aiPredictionType === 'stable');

      return matchesSearch && matchesCategory && matchesStock && matchesZone && matchesAi;
    });

    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'quantity':
          comparison = a.quantityAvailable - b.quantityAvailable;
          break;
        case 'price':
          comparison = a.unitPrice - b.unitPrice;
          break;
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'sku':
          comparison = a.sku.localeCompare(b.sku);
          break;
        case 'percentage':
          comparison = a.stockPercentage - b.stockPercentage;
          break;
        case 'reorder':
          comparison = a.reorderLevel - b.reorderLevel;
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [inventory, searchQuery, categoryFilter, stockFilter, zoneFilter, aiFilter, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedItems.slice(start, start + itemsPerPage);
  }, [filteredAndSortedItems, currentPage, itemsPerPage]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalSKUs = inventory.length;
    const totalAvailableUnits = inventory.reduce((sum, i) => sum + i.quantityAvailable, 0);
    const totalInventoryValue = inventory.reduce((sum, i) => sum + i.quantityAvailable * i.unitPrice, 0);
    const lowStockCount = inventory.filter((i) => i.status === 'Low Stock').length;
    const criticalCount = inventory.filter((i) => i.status === 'Critical' || i.status === 'Out of Stock').length;
    const optimalCount = inventory.filter((i) => i.status === 'Optimal').length;

    return {
      totalSKUs,
      totalAvailableUnits,
      totalInventoryValue,
      lowStockCount,
      criticalCount,
      optimalCount
    };
  }, [inventory]);

  // Handlers
  const handleToggleSelectAll = () => {
    if (selectedItems.size === paginatedItems.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(paginatedItems.map((i) => i.id)));
    }
  };

  const handleToggleSelectItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = [
      'Product ID',
      'SKU',
      'Name',
      'Category',
      'Available Qty',
      'Reserved Qty',
      'Damaged Qty',
      'Reorder Level',
      'Max Stock',
      'Status',
      'Zone',
      'Shelf/Bin',
      'Supplier',
      'Unit Price ($)',
      'Total Value ($)',
      'AI Prediction'
    ];

    const rows = filteredAndSortedItems.map((item) => [
      `"${item.id}"`,
      `"${item.sku}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      item.quantityAvailable,
      item.reservedQuantity,
      item.damagedQuantity,
      item.reorderLevel,
      item.maxStock,
      `"${item.status}"`,
      `"${item.warehouseZone}"`,
      `"${item.shelfBinLocation}"`,
      `"${item.supplier.replace(/"/g, '""')}"`,
      item.unitPrice.toFixed(2),
      (item.quantityAvailable * item.unitPrice).toFixed(2),
      `"${item.aiPrediction}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `muthu_inventory_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onExport();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(filteredAndSortedItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `muthu_inventory_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onExport();
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemSku) return;

    const status = calculateStockStatus(newItemAvailable, newItemReorderLevel, newItemMaxStock);
    const stockPercentage = computeStockPercentage(newItemAvailable, newItemMaxStock);

    let aiPrediction = 'Stable Demand';
    let aiPredictionType: AIPredictionType = 'stable';
    if (status === 'Critical' || status === 'Out of Stock') {
      aiPrediction = 'Restock in 3 Days';
      aiPredictionType = 'restock';
    } else if (status === 'Low Stock') {
      aiPrediction = 'Depletion in 2 Days';
      aiPredictionType = 'depletion';
    } else if (status === 'Oversupplied') {
      aiPrediction = 'Overstock Risk';
      aiPredictionType = 'overstock';
    }

    onAddItem({
      name: newItemName.trim(),
      sku: newItemSku.trim().toUpperCase(),
      category: newItemCategory,
      quantityAvailable: newItemAvailable,
      reservedQuantity: newItemReserved,
      damagedQuantity: newItemDamaged,
      reorderLevel: newItemReorderLevel,
      maxStock: newItemMaxStock,
      stockPercentage,
      status,
      warehouseZone: newItemZone,
      shelfBinLocation: newItemShelf,
      supplier: newItemSupplier || 'Direct Logistics Hub',
      unitPrice: newItemUnitPrice,
      aiPrediction,
      aiPredictionType,
      icon:
        newItemCategory === 'Electronics'
          ? 'devices'
          : newItemCategory === 'Furniture'
          ? 'chair'
          : newItemCategory === 'Packaging'
          ? 'inventory_2'
          : newItemCategory === 'Accessories'
          ? 'extension'
          : newItemCategory === 'Equipment'
          ? 'build'
          : 'assignment',
      lastRestocked: new Date().toISOString().slice(0, 10),
      leadTimeDays: 4,
      currentStock: newItemAvailable,
      muthuPredict: aiPrediction,
      muthuPredictType: 'stable',
      locationZone: `${newItemZone} • ${newItemShelf}`,
      unitCost: newItemUnitPrice
    });

    // Reset Form
    setNewItemName('');
    setNewItemSku('');
    setNewItemAvailable(50);
    setNewItemReserved(0);
    setNewItemDamaged(0);
    setNewItemReorderLevel(20);
    setNewItemMaxStock(150);
    setNewItemSupplier('');
    setNewItemUnitPrice(45.0);
    setShowAddModal(false);
  };

  const getStatusBadge = (status: InventoryStatus) => {
    switch (status) {
      case 'Optimal':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#d6e8cf]/50 text-[#2f432c] uppercase tracking-wide border border-[#BACBB4]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#51604D]" />
            Optimal
          </span>
        );
      case 'Low Stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#ffe082]/40 text-[#7c5e10] uppercase tracking-wide border border-[#ffe082]/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b28704]" />
            Low Stock
          </span>
        );
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-error-container/60 text-[#93000a] uppercase tracking-wide border border-error/30 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            Critical
          </span>
        );
      case 'Out of Stock':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-error-container text-[#93000a] uppercase tracking-wide border border-error/50">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            Out of Stock
          </span>
        );
      case 'Oversupplied':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-outline-variant/30 text-on-surface-variant uppercase tracking-wide border border-outline-variant/40">
            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
            Oversupplied
          </span>
        );
      default:
        return null;
    }
  };

  const getAIPredictionPill = (prediction: string, type: AIPredictionType) => {
    let style = 'bg-[#f0f4ee] text-[#3d503a] border-[#bacbb4]/50';
    let icon = 'auto_awesome';

    if (type === 'depletion' || type === 'restock') {
      style = 'bg-error-container/40 text-[#93000a] border-error/20 font-medium';
      icon = 'priority_high';
    } else if (type === 'increasing') {
      style = 'bg-[#e8f5e9] text-[#1b5e20] border-[#a5d6a7]/60';
      icon = 'trending_up';
    } else if (type === 'overstock' || type === 'dead_stock') {
      style = 'bg-[#f3e5f5] text-[#4a148c] border-[#ce93d8]/50';
      icon = 'hourglass_empty';
    }

    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] border ${style}`}>
        <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {icon}
        </span>
        <span className="whitespace-nowrap font-medium">{prediction}</span>
      </div>
    );
  };

  return (
    <div id="inventory-view" className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-headline-md text-headline-md md:text-[34px] leading-tight text-on-background font-bold tracking-tight">
              Inventory Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-outline text-[12px] font-mono font-bold">
              {filteredAndSortedItems.length} Products
            </span>
          </div>
          <p className="font-body-md text-[14px] md:text-[15px] text-on-surface-variant mt-1 max-w-2xl">
            Real-time warehouse registry with predictive demand forecasting, automated reorder thresholds, and bin tracking.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-xl bg-surface border border-outline-variant/30 p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-label-md text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-on-surface hover:bg-surface-container-high'
              }`}
              title="Table View"
            >
              <span className="material-symbols-outlined text-[16px]">view_list</span>
              Table
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-label-md text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid' ? 'bg-primary text-on-primary font-bold shadow-xs' : 'text-on-surface hover:bg-surface-container-high'
              }`}
              title="Grid View"
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              Grid
            </button>
          </div>

          <div className="relative group">
            <button
              id="btn-inventory-export-dropdown"
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface font-label-md text-[13px] hover:bg-surface-container-high transition-colors flex items-center gap-2 bg-surface cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              Export CSV
            </button>
          </div>

          <button
            onClick={handleExportJSON}
            className="px-3 py-2 rounded-xl border border-outline-variant text-on-surface-variant font-label-md text-[13px] hover:bg-surface-container-high transition-colors flex items-center gap-1.5 bg-surface cursor-pointer shadow-xs"
            title="Export full JSON manifest"
          >
            <span className="material-symbols-outlined text-[16px]">code</span>
            JSON
          </button>

          <button
            id="btn-inventory-add-product"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-[13px] hover:bg-primary/90 transition-colors flex items-center gap-2 cursor-pointer shadow-xs font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Product
          </button>
        </div>
      </div>

      {/* AI Insight Card at Top */}
      <div
        id="ai-insight-top-card"
        className="card-surface rounded-[20px] p-5 md:p-6 shadow-ambient border-l-4 border-[#BACBB4] border border-outline-variant/20 relative overflow-hidden bg-gradient-to-r from-surface to-surface-container-lowest"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#BACBB4]/30 border border-[#BACBB4]/60 flex items-center justify-center shrink-0 text-[#3C4B39]">
              <span className="material-symbols-outlined text-[24px]">
                {aiInsights[activeTabInsight].icon}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label-caps text-[11px] text-[#51604D] font-bold uppercase tracking-wider flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  Muthu Observes & Recommends
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#BACBB4]/30 text-[#3C4B39] text-[11px] font-bold">
                  {aiInsights[activeTabInsight].badge}
                </span>
              </div>
              <h3 className="font-headline-sm text-[17px] font-bold text-on-background">
                {aiInsights[activeTabInsight].title}
              </h3>
              <p className="font-body-md text-[13.5px] text-on-surface-variant mt-0.5 max-w-3xl">
                {aiInsights[activeTabInsight].description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
            <div className="flex gap-1 mr-2">
              {aiInsights.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTabInsight(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                    activeTabInsight === idx ? 'bg-primary w-6' : 'bg-outline-variant/60 hover:bg-outline'
                  }`}
                  aria-label={`Switch to Insight ${idx + 1}`}
                />
              ))}
            </div>
            <button
              onClick={aiInsights[activeTabInsight].onAction}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-[13px] hover:bg-primary/90 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs font-bold"
            >
              {aiInsights[activeTabInsight].actionText}
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Bento Grid */}
      <div id="inventory-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* KPI 1 */}
        <div className="card-surface rounded-[18px] p-5 shadow-ambient border border-outline-variant/15 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
              Total Inventory Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">payments</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display-lg text-[26px] md:text-[28px] text-on-background font-bold tracking-tight">
              ${(metrics.totalInventoryValue / 1000).toFixed(1)}k
            </div>
            <p className="font-body-md text-[12px] text-on-surface-variant mt-0.5">
              Across {metrics.totalSKUs} registered SKU items
            </p>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="card-surface rounded-[18px] p-5 shadow-ambient border border-outline-variant/15 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
              Available Units
            </span>
            <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-[#51604D]">
              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display-lg text-[26px] md:text-[28px] text-on-background font-bold tracking-tight">
              {metrics.totalAvailableUnits.toLocaleString()}
            </div>
            <p className="font-body-md text-[12px] text-on-surface-variant mt-0.5">
              Physical stock ready for picking
            </p>
          </div>
        </div>

        {/* KPI 3 */}
        <div
          onClick={() => setStockFilter('Critical')}
          className="card-surface rounded-[18px] p-5 shadow-ambient border-l-4 border-error/60 border border-outline-variant/15 flex flex-col justify-between cursor-pointer hover:bg-surface-container-low/30 transition-colors"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-[11px] text-error font-bold uppercase tracking-wider">
              Critical & Depleted
            </span>
            <div className="w-8 h-8 rounded-xl bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">warning</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display-lg text-[26px] md:text-[28px] text-on-background font-bold tracking-tight">
              {metrics.criticalCount} SKUs
            </div>
            <p className="font-body-md text-[12px] text-error mt-0.5 font-medium">
              Requires immediate purchase order
            </p>
          </div>
        </div>

        {/* KPI 4 */}
        <div
          onClick={() => setStockFilter('Low Stock')}
          className="card-surface rounded-[18px] p-5 shadow-ambient border-l-4 border-[#ffe082] border border-outline-variant/15 flex flex-col justify-between cursor-pointer hover:bg-surface-container-low/30 transition-colors"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-[11px] text-[#7c5e10] font-bold uppercase tracking-wider">
              Low Stock Alerts
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#ffe082]/40 text-[#7c5e10] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">trending_down</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display-lg text-[26px] md:text-[28px] text-on-background font-bold tracking-tight">
              {metrics.lowStockCount} SKUs
            </div>
            <p className="font-body-md text-[12px] text-on-surface-variant mt-0.5">
              Approaching reorder threshold
            </p>
          </div>
        </div>
      </div>

      {/* Toolbar: Search, Filters, Sorters */}
      <div className="bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/30 rounded-[20px] p-3 md:p-4 flex flex-col gap-3 shadow-xs">
        {/* Row 1: Search and Primary Controls */}
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-96">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              id="inventory-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by SKU, Product Name, Shelf Bin, Supplier..."
              className="w-full bg-surface-container-low border border-outline-variant/20 rounded-[14px] pl-10 pr-9 py-2 text-on-surface font-body-md text-[13.5px] focus:ring-2 focus:ring-primary/20 placeholder:text-outline outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5 rounded-full"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
            {/* Category Filter */}
            <select
              id="select-category-filter"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-[13px] shadow-xs cursor-pointer outline-none"
            >
              <option value="All">All Categories</option>
              <option value="Electronics">Electronics</option>
              <option value="Furniture">Furniture</option>
              <option value="Packaging">Packaging</option>
              <option value="Accessories">Accessories</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Equipment">Equipment</option>
              <option value="Hardware">Hardware</option>
            </select>

            {/* Stock Status Filter */}
            <select
              id="select-stock-filter"
              value={stockFilter}
              onChange={(e) => {
                setStockFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-[13px] shadow-xs cursor-pointer outline-none"
            >
              <option value="All">All Stock Levels</option>
              <option value="Optimal">Optimal</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Critical">Critical</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Oversupplied">Oversupplied</option>
            </select>

            {/* Zone Filter */}
            <select
              id="select-zone-filter"
              value={zoneFilter}
              onChange={(e) => {
                setZoneFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-[13px] shadow-xs cursor-pointer outline-none"
            >
              <option value="All">All Warehouse Zones</option>
              <option value="Zone A">Zone A (Furniture & Shelving)</option>
              <option value="Zone B">Zone B (Electronics & IT)</option>
              <option value="Zone C">Zone C (Packaging & Tape)</option>
              <option value="Zone D">Zone D (Accessories & Mounts)</option>
              <option value="Mezzanine">Mezzanine (Office Supplies)</option>
              <option value="Dock Bay">Dock Bay (Heavy Equipment)</option>
            </select>

            {/* AI Prediction Filter */}
            <select
              id="select-ai-filter"
              value={aiFilter}
              onChange={(e) => {
                setAiFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl bg-[#BACBB4]/20 border border-[#BACBB4]/60 text-[#3C4B39] font-label-md text-[13px] shadow-xs cursor-pointer outline-none font-bold"
            >
              <option value="All">All AI Predictions</option>
              <option value="depletion">Depletion & Restock Needed</option>
              <option value="increasing">Demand Increasing</option>
              <option value="stable">Stable Velocity</option>
              <option value="overstock">Overstock & Dead Stock Risk</option>
            </select>

            {/* Reset Filter Button */}
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setStockFilter('All');
                setZoneFilter('All');
                setAiFilter('All');
                setCurrentPage(1);
              }}
              className="h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface flex items-center gap-1.5 shadow-xs hover:bg-surface-variant transition-colors cursor-pointer text-[12px] font-label-md"
              title="Reset all filters"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Reset
            </button>
          </div>
        </div>

        {/* Row 2: Sort and Per-Page Configuration */}
        <div className="flex flex-wrap items-center justify-between text-[13px] text-on-surface-variant pt-2 border-t border-outline-variant/15 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-label-caps text-[11px] text-outline uppercase font-bold">Sort By:</span>
            <button
              onClick={() => handleSort('quantity')}
              className={`px-2.5 py-1 rounded-lg border text-[12px] cursor-pointer flex items-center gap-1 transition-colors ${
                sortField === 'quantity'
                  ? 'bg-primary-container text-on-primary-container border-primary/30 font-bold'
                  : 'bg-surface border-outline-variant/30 hover:bg-surface-container'
              }`}
            >
              Quantity
              {sortField === 'quantity' && (
                <span className="material-symbols-outlined text-[14px]">
                  {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSort('price')}
              className={`px-2.5 py-1 rounded-lg border text-[12px] cursor-pointer flex items-center gap-1 transition-colors ${
                sortField === 'price'
                  ? 'bg-primary-container text-on-primary-container border-primary/30 font-bold'
                  : 'bg-surface border-outline-variant/30 hover:bg-surface-container'
              }`}
            >
              Price
              {sortField === 'price' && (
                <span className="material-symbols-outlined text-[14px]">
                  {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSort('name')}
              className={`px-2.5 py-1 rounded-lg border text-[12px] cursor-pointer flex items-center gap-1 transition-colors ${
                sortField === 'name'
                  ? 'bg-primary-container text-on-primary-container border-primary/30 font-bold'
                  : 'bg-surface border-outline-variant/30 hover:bg-surface-container'
              }`}
            >
              Name (A-Z)
              {sortField === 'name' && (
                <span className="material-symbols-outlined text-[14px]">
                  {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                </span>
              )}
            </button>

            <button
              onClick={() => handleSort('percentage')}
              className={`px-2.5 py-1 rounded-lg border text-[12px] cursor-pointer flex items-center gap-1 transition-colors ${
                sortField === 'percentage'
                  ? 'bg-primary-container text-on-primary-container border-primary/30 font-bold'
                  : 'bg-surface border-outline-variant/30 hover:bg-surface-container'
              }`}
            >
              Stock %
              {sortField === 'percentage' && (
                <span className="material-symbols-outlined text-[14px]">
                  {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[12px] text-outline">Items per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-2 py-1 rounded-lg bg-surface border border-outline-variant/30 text-on-surface text-[12px] cursor-pointer outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Data Display: Table or Grid View */}
      {viewMode === 'table' ? (
        <div className="card-surface rounded-[20px] shadow-ambient border border-outline-variant/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="border-b border-outline-variant/20 bg-surface-container-low/50 text-[12px]">
                  <th className="py-3.5 px-4 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === paginatedItems.length && paginatedItems.length > 0}
                      onChange={handleToggleSelectAll}
                      className="rounded border-outline text-primary focus:ring-primary cursor-pointer"
                    />
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap cursor-pointer hover:text-on-surface"
                  >
                    Product & SKU
                  </th>
                  <th className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap">
                    Category
                  </th>
                  <th
                    onClick={() => handleSort('quantity')}
                    className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap w-52 cursor-pointer hover:text-on-surface"
                  >
                    Stock Level (Available / Max)
                  </th>
                  <th className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap">
                    Status
                  </th>
                  <th className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap">
                    Zone & Bin
                  </th>
                  <th
                    onClick={() => handleSort('price')}
                    className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap cursor-pointer hover:text-on-surface"
                  >
                    Unit Price
                  </th>
                  <th className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap">
                    AI Prediction
                  </th>
                  <th className="py-3.5 px-4 font-label-caps text-label-caps text-outline text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="font-body-md text-[13.5px]">
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-on-surface-variant">
                      <div className="w-12 h-12 rounded-full bg-surface-container mx-auto flex items-center justify-center text-outline mb-2">
                        <span className="material-symbols-outlined text-[24px]">inventory_2</span>
                      </div>
                      <p className="font-bold text-on-surface text-[15px]">No products match your search or filter</p>
                      <p className="text-[13px] text-outline mt-1">Try clearing some filters or searching a different SKU</p>
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const isSelected = selectedItems.has(item.id);
                    const isLowStock = item.status === 'Low Stock' || item.status === 'Critical' || item.status === 'Out of Stock';
                    const isOversupplied = item.status === 'Oversupplied';

                    return (
                      <tr
                        key={item.id}
                        id={`inventory-row-${item.sku}`}
                        onClick={() => setSelectedProduct(item)}
                        className={`border-b border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors group cursor-pointer ${
                          isSelected ? 'bg-primary-container/10' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4 text-center" onClick={(e) => handleToggleSelectItem(item.id, e)}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-outline text-primary focus:ring-primary cursor-pointer"
                          />
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                              <span className="material-symbols-outlined text-[19px]">{item.icon}</span>
                            </div>
                            <div>
                              <div className="font-bold text-on-background text-[14.5px] leading-tight">
                                {item.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[12px] text-on-surface-variant font-mono">{item.sku}</span>
                                <span className="text-[10.5px] px-1.5 py-0.2 rounded bg-surface-container text-outline font-mono">
                                  {item.id}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-on-surface-variant whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-surface-container text-[12px]">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 w-44">
                            <div className="flex justify-between text-[12px]">
                              <span className="text-on-background font-bold">
                                {item.quantityAvailable}{' '}
                                <span className="text-outline font-normal">/ {item.maxStock}</span>
                              </span>
                              <span
                                className={`font-bold ${
                                  isLowStock ? 'text-error' : isOversupplied ? 'text-secondary' : 'text-[#3C4B39]'
                                }`}
                              >
                                {item.stockPercentage}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  item.status === 'Critical' || item.status === 'Out of Stock'
                                    ? 'bg-error'
                                    : item.status === 'Low Stock'
                                    ? 'bg-[#ffe082] bg-amber-500'
                                    : item.status === 'Oversupplied'
                                    ? 'bg-secondary'
                                    : 'bg-[#51604D]'
                                }`}
                                style={{ width: `${Math.min(item.stockPercentage, 100)}%` }}
                              />
                            </div>
                            <div className="flex gap-2 text-[10.5px] text-outline">
                              <span>Res: {item.reservedQuantity}</span>
                              {item.damagedQuantity > 0 && <span className="text-error">Dmg: {item.damagedQuantity}</span>}
                              <span>Min: {item.reorderLevel}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(item.status)}</td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="text-[13px] font-medium text-on-surface">{item.warehouseZone}</div>
                          <div className="text-[11.5px] text-outline font-mono">{item.shelfBinLocation}</div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-bold text-on-surface text-[14px]">${item.unitPrice.toFixed(2)}</div>
                          <div className="text-[11px] text-outline truncate max-w-[120px]">{item.supplier}</div>
                        </td>

                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {getAIPredictionPill(item.aiPrediction, item.aiPredictionType)}
                        </td>

                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProduct(item);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-surface border border-outline-variant/30 text-on-surface hover:bg-surface-container transition-colors text-[12px] font-label-md cursor-pointer"
                              title="Inspect Details"
                            >
                              Details
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onRestockItem(item.id, 25);
                              }}
                              className="p-1 rounded-lg text-primary hover:bg-primary/10 transition-colors cursor-pointer"
                              title="Quick Restock +25 units"
                            >
                              <span className="material-symbols-outlined text-[18px]">add_circle</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between bg-surface-container-lowest gap-3">
            <span className="font-label-md text-[13px] text-outline">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} products
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
                aria-label="Previous page"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center font-label-md text-[13px] cursor-pointer transition-colors ${
                      currentPage === pageNum
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'text-on-surface-variant hover:bg-surface-container'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <span className="w-6 text-center text-outline text-[12px]">...</span>
              )}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
                aria-label="Next page"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Grid / Card View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedItems.map((item) => {
              const isLowStock = item.status === 'Low Stock' || item.status === 'Critical' || item.status === 'Out of Stock';

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedProduct(item)}
                  className="card-surface rounded-[20px] p-5 shadow-ambient border border-outline-variant/15 hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0 text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors">
                          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                        </div>
                        <div>
                          <h4 className="font-bold text-on-background text-[15px] leading-snug line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="text-[12px] text-outline font-mono">{item.sku}</span>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>

                    <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 space-y-2">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-outline">Quantity Available</span>
                        <span className="font-bold text-on-background">
                          {item.quantityAvailable} / {item.maxStock} units
                        </span>
                      </div>
                      <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isLowStock ? 'bg-error' : item.status === 'Oversupplied' ? 'bg-secondary' : 'bg-[#51604D]'
                          }`}
                          style={{ width: `${Math.min(item.stockPercentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[11px] text-outline pt-0.5">
                        <span>Reserved: {item.reservedQuantity}</span>
                        <span>Reorder Level: {item.reorderLevel}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[12.5px] pt-1">
                      <div>
                        <span className="text-[11px] text-outline block">Location</span>
                        <span className="font-medium text-on-surface font-mono text-[12px]">
                          {item.warehouseZone} • {item.shelfBinLocation}
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] text-outline block">Unit Price</span>
                        <span className="font-bold text-on-surface text-[13px]">${item.unitPrice.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-outline-variant/15 flex items-center justify-between">
                    <div>{getAIPredictionPill(item.aiPrediction, item.aiPredictionType)}</div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRestockItem(item.id, 25);
                      }}
                      className="px-3 py-1 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-[12px] border border-outline-variant/30 flex items-center gap-1 font-bold"
                    >
                      <span className="material-symbols-outlined text-[15px]">add</span>
                      Restock
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Grid View Pagination */}
          <div className="px-6 py-4 card-surface rounded-[18px] border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="font-label-md text-[13px] text-outline">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredAndSortedItems.length)} of {filteredAndSortedItems.length} products
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              <span className="px-3 py-1 text-[13px] font-bold text-on-surface">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:bg-surface-container transition-colors disabled:opacity-30 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PRODUCT DETAILS DRAWER (Slide-over Right Panel) */}
      {/* ========================================================================= */}
      {selectedProduct && (
        <div
          id="product-details-drawer-backdrop"
          onClick={() => setSelectedProduct(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-150"
        >
          <div
            id="product-details-drawer"
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest w-full max-w-xl h-full shadow-ambient-lg border-l border-outline-variant/30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-outline-variant/20 flex items-start justify-between bg-surface-container-low/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-mono text-outline">{selectedProduct.id}</span>
                  <span className="px-2 py-0.5 rounded-md bg-surface-container text-outline text-[11px] font-bold">
                    {selectedProduct.category}
                  </span>
                  {getStatusBadge(selectedProduct.status)}
                </div>
                <h3 className="font-headline-sm text-[20px] font-bold text-on-background">
                  {selectedProduct.name}
                </h3>
                <div className="text-[13px] text-outline font-mono">{selectedProduct.sku}</div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1.5 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Key Metrics Bento */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center">
                  <span className="text-[11px] text-outline font-bold uppercase block">Available</span>
                  <span className="text-[22px] font-bold text-on-background mt-0.5 block">
                    {selectedProduct.quantityAvailable}
                  </span>
                  <span className="text-[11px] text-outline">Units in Bin</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center">
                  <span className="text-[11px] text-outline font-bold uppercase block">Reserved</span>
                  <span className="text-[22px] font-bold text-[#7c5e10] mt-0.5 block">
                    {selectedProduct.reservedQuantity}
                  </span>
                  <span className="text-[11px] text-outline">In Picking Queues</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-center">
                  <span className="text-[11px] text-outline font-bold uppercase block">Damaged / QC</span>
                  <span className="text-[22px] font-bold text-error mt-0.5 block">
                    {selectedProduct.damagedQuantity}
                  </span>
                  <span className="text-[11px] text-outline">Quarantined</span>
                </div>
              </div>

              {/* Stock Capacity Breakdown Gauge */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
                <div className="flex justify-between items-center text-[13px]">
                  <span className="font-bold text-on-surface">Storage Capacity Allocation</span>
                  <span className="font-mono text-on-surface-variant">
                    {selectedProduct.quantityAvailable + selectedProduct.reservedQuantity} / {selectedProduct.maxStock} max
                  </span>
                </div>

                <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-[#51604D]"
                    style={{ width: `${(selectedProduct.quantityAvailable / selectedProduct.maxStock) * 100}%` }}
                    title={`Available: ${selectedProduct.quantityAvailable}`}
                  />
                  <div
                    className="h-full bg-amber-500"
                    style={{ width: `${(selectedProduct.reservedQuantity / selectedProduct.maxStock) * 100}%` }}
                    title={`Reserved: ${selectedProduct.reservedQuantity}`}
                  />
                  <div
                    className="h-full bg-error"
                    style={{ width: `${(selectedProduct.damagedQuantity / selectedProduct.maxStock) * 100}%` }}
                    title={`Damaged: ${selectedProduct.damagedQuantity}`}
                  />
                </div>

                <div className="flex flex-wrap gap-4 text-[11.5px] text-outline pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#51604D]" />
                    <span>Available ({selectedProduct.quantityAvailable})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Reserved ({selectedProduct.reservedQuantity})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-error" />
                    <span>Damaged ({selectedProduct.damagedQuantity})</span>
                  </div>
                </div>
              </div>

              {/* Location & Sourcing Details */}
              <div className="space-y-3">
                <h4 className="font-label-caps text-[11px] text-outline uppercase font-bold tracking-wider">
                  Logistics & Sourcing
                </h4>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <span className="text-[11px] text-outline block">Warehouse Location</span>
                    <span className="font-bold text-on-surface block mt-0.5">{selectedProduct.warehouseZone}</span>
                    <span className="font-mono text-[12px] text-on-surface-variant">
                      Shelf: {selectedProduct.shelfBinLocation}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <span className="text-[11px] text-outline block">Primary Supplier</span>
                    <span className="font-bold text-on-surface block mt-0.5">{selectedProduct.supplier}</span>
                    <span className="text-[12px] text-outline">Lead Time: ~{selectedProduct.leadTimeDays || 3} days</span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <span className="text-[11px] text-outline block">Unit Price & Value</span>
                    <span className="font-bold text-on-surface block mt-0.5">
                      ${selectedProduct.unitPrice.toFixed(2)} / unit
                    </span>
                    <span className="text-[12px] text-outline">
                      Total Valuation: ${(selectedProduct.quantityAvailable * selectedProduct.unitPrice).toLocaleString()}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20">
                    <span className="text-[11px] text-outline block">Reorder Configuration</span>
                    <span className="font-bold text-on-surface block mt-0.5">
                      Threshold: {selectedProduct.reorderLevel} units
                    </span>
                    <span className="text-[12px] text-outline">
                      Last Restocked: {selectedProduct.lastRestocked || 'Recent'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Demand Prediction Deep Dive */}
              <div className="p-4 rounded-2xl bg-[#BACBB4]/20 border border-[#BACBB4]/50 space-y-2">
                <div className="flex items-center gap-1.5 text-[#3C4B39]">
                  <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  <span className="font-bold text-[13px] uppercase tracking-wider">Muthu AI Predictive Insight</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[15px] font-bold text-on-background">{selectedProduct.aiPrediction}</span>
                </div>
                <p className="text-[12.5px] text-[#3C4B39]">
                  {selectedProduct.aiPredictionType === 'depletion' || selectedProduct.aiPredictionType === 'restock'
                    ? 'Based on recent 7-day outbound picking velocity, stock is depleting faster than inbound freight. Restocking 100+ units is strongly advised.'
                    : selectedProduct.aiPredictionType === 'overstock'
                    ? 'Velocity index is below 0.3x standard rate. Excess inventory is occupying valuable high-velocity shelf bins.'
                    : 'Dispatch orders for this SKU are strictly within standard historical standard deviation (+-4%). Standard reorder cadence applies.'}
                </p>
              </div>

              {/* Quick Restock & Operations Controls */}
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
                <h4 className="font-bold text-on-surface text-[14px]">Stock Adjustment & Operations</h4>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      onRestockItem(selectedProduct.id, 25);
                      setSelectedProduct((prev) =>
                        prev
                          ? {
                              ...prev,
                              quantityAvailable: Math.min(prev.maxStock, prev.quantityAvailable + 25),
                              stockPercentage: computeStockPercentage(prev.quantityAvailable + 25, prev.maxStock)
                            }
                          : null
                      );
                    }}
                    className="flex-1 py-2 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant/30 text-on-surface font-label-md text-[13px] font-bold cursor-pointer transition-colors"
                  >
                    +25 Units
                  </button>
                  <button
                    onClick={() => {
                      onRestockItem(selectedProduct.id, 100);
                      setSelectedProduct((prev) =>
                        prev
                          ? {
                              ...prev,
                              quantityAvailable: Math.min(prev.maxStock, prev.quantityAvailable + 100),
                              stockPercentage: computeStockPercentage(prev.quantityAvailable + 100, prev.maxStock)
                            }
                          : null
                      );
                    }}
                    className="flex-1 py-2 rounded-xl bg-surface hover:bg-surface-container border border-outline-variant/30 text-on-surface font-label-md text-[13px] font-bold cursor-pointer transition-colors"
                  >
                    +100 Units
                  </button>
                  <button
                    onClick={() => {
                      const fillAmount = selectedProduct.maxStock - selectedProduct.quantityAvailable;
                      if (fillAmount > 0) {
                        onRestockItem(selectedProduct.id, fillAmount);
                        setSelectedProduct((prev) =>
                          prev
                            ? {
                                ...prev,
                                quantityAvailable: prev.maxStock,
                                stockPercentage: 100
                              }
                            : null
                        );
                      }
                    }}
                    className="flex-1 py-2 rounded-xl bg-primary text-on-primary font-label-md text-[13px] font-bold shadow-xs hover:bg-primary/90 cursor-pointer transition-colors"
                  >
                    Fill to Max
                  </button>
                </div>

                <div className="flex gap-2 pt-2">
                  <input
                    type="number"
                    min="1"
                    value={customRestockQty}
                    onChange={(e) => setCustomRestockQty(Number(e.target.value))}
                    className="w-28 px-3 py-2 rounded-xl bg-surface border border-outline-variant/40 text-on-surface text-[13px] outline-none"
                    placeholder="Qty"
                  />
                  <button
                    onClick={() => {
                      if (customRestockQty > 0) {
                        onRestockItem(selectedProduct.id, customRestockQty);
                        setSelectedProduct((prev) =>
                          prev
                            ? {
                                ...prev,
                                quantityAvailable: Math.min(prev.maxStock, prev.quantityAvailable + customRestockQty),
                                stockPercentage: computeStockPercentage(
                                  prev.quantityAvailable + customRestockQty,
                                  prev.maxStock
                                )
                              }
                            : null
                        );
                      }
                    }}
                    className="flex-1 py-2 rounded-xl border border-outline-variant text-on-surface font-label-md text-[13px] hover:bg-surface transition-colors cursor-pointer font-bold"
                  >
                    Apply Custom Restock
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex justify-between items-center">
              <button
                onClick={() => setSelectedProduct(null)}
                className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-label-md text-[13px] hover:bg-surface transition-colors cursor-pointer"
              >
                Close Drawer
              </button>
              <button
                onClick={() => {
                  window.print();
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-[13px] flex items-center gap-1.5 shadow-xs hover:bg-primary/90 cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[16px]">qr_code</span>
                Print Barcode Label
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD PRODUCT MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div
          id="add-product-modal-backdrop"
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            id="add-product-modal"
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest w-full max-w-2xl rounded-3xl p-6 md:p-8 shadow-ambient-lg border border-outline-variant/30 space-y-6 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center pb-3 border-b border-outline-variant/20">
              <div>
                <h3 className="font-headline-sm text-[22px] font-bold text-on-background">
                  Add Warehouse Product
                </h3>
                <p className="text-[13px] text-on-surface-variant mt-0.5">
                  Register a new SKU with bin locations and automated reorder rules.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full text-outline hover:text-on-surface hover:bg-surface-container"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              {/* Product Name */}
              <div>
                <label className="font-label-caps text-[11px] text-outline block mb-1 font-bold">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. UltraWide 4K Gaming Monitor 32-inch"
                  className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-[14px] outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* SKU & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-[11px] text-outline block mb-1 font-bold">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newItemSku}
                    onChange={(e) => setNewItemSku(e.target.value)}
                    placeholder="SKU-ELC-9041"
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-[14px] outline-none font-mono focus:ring-2 focus:ring-primary/20 uppercase"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-[11px] text-outline block mb-1 font-bold">
                    Category *
                  </label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as ProductCategory)}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-[14px] outline-none cursor-pointer"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Furniture">Furniture</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Hardware">Hardware</option>
                  </select>
                </div>
              </div>

              {/* Quantities: Available, Reserved, Damaged */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-label-caps text-[11px] text-outline block mb-1 font-bold">
                    Initial Available Qty
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItemAvailable}
                    onChange={(e) => setNewItemAvailable(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3 py-2 text-on-surface text-[14px] outline-none"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-[11px] text-outline block mb-1 font-bold">
                    Reserved Qty
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItemReserved}
                    onChange={(e) => setNewItemReserved(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3 py-2 text-on-surface text-[14px] outline-none"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-[11px] text-outline block mb-1 font-bold">
                    Damaged Qty
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={newItemDamaged}
                    onChange={(e) => setNewItemDamaged(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-3 py-2 text-on-surface text-[14px] outline-none"
                  />
                </div>
              </div>

              {/* Reorder Level & Max Stock Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-[11px] text-outline block mb-1 font-bold">
                    Reorder Alert Threshold
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItemReorderLevel}
                    onChange={(e) => setNewItemReorderLevel(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-[14px] outline-none"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-[11px] text-outline block mb-1 font-bold">
                    Max Stock Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newItemMaxStock}
                    onChange={(e) => setNewItemMaxStock(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-[14px] outline-none"
                  />
                </div>
              </div>

              {/* Location: Zone & Shelf */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-[11px] text-outline block mb-1 font-bold">
                    Warehouse Zone
                  </label>
                  <select
                    value={newItemZone}
                    onChange={(e) => setNewItemZone(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-[14px] outline-none cursor-pointer"
                  >
                    <option value="Zone A">Zone A (Furniture & Heavy)</option>
                    <option value="Zone B">Zone B (Electronics & IT)</option>
                    <option value="Zone C">Zone C (Packaging & Tape)</option>
                    <option value="Zone D">Zone D (Accessories & Mounts)</option>
                    <option value="Mezzanine">Mezzanine (Office Supplies)</option>
                    <option value="Dock Bay">Dock Bay (Pallet / Machinery)</option>
                  </select>
                </div>

                <div>
                  <label className="font-label-caps text-[11px] text-outline block mb-1 font-bold">
                    Shelf / Bin Location
                  </label>
                  <input
                    type="text"
                    value={newItemShelf}
                    onChange={(e) => setNewItemShelf(e.target.value)}
                    placeholder="B-02-04-A"
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-[14px] outline-none font-mono"
                  />
                </div>
              </div>

              {/* Supplier & Unit Price */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-label-caps text-[11px] text-outline block mb-1 font-bold">
                    Supplier Partner
                  </label>
                  <input
                    type="text"
                    value={newItemSupplier}
                    onChange={(e) => setNewItemSupplier(e.target.value)}
                    placeholder="e.g. Silicon Dynamics Inc."
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-[14px] outline-none"
                  />
                </div>

                <div>
                  <label className="font-label-caps text-[11px] text-outline block mb-1 font-bold">
                    Unit Price ($ USD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newItemUnitPrice}
                    onChange={(e) => setNewItemUnitPrice(Number(e.target.value))}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-[14px] outline-none"
                  />
                </div>
              </div>

              {/* Status Live Preview */}
              <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-[13px]">
                <span className="text-outline">Computed Initial Status:</span>
                <div>
                  {getStatusBadge(calculateStockStatus(newItemAvailable, newItemReorderLevel, newItemMaxStock))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-label-md text-[13px] hover:bg-surface cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-[13px] font-bold shadow-xs hover:bg-primary/90 cursor-pointer"
                >
                  Save Product to Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
