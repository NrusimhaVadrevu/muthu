import React, { useState, useMemo, useEffect } from 'react';
import { Order, OrderStatus, OrderPriority, CustomerType, ShippingType, CopilotRecommendation, OrderWorkflow, GlobalOrderFilter } from '../types';
import { ORDER_PIPELINE_STAGES, getNextOrderStatus, initialCopilotRecommendations, computeOrderPriority } from '../ordersData';
import { generateOrderWorkflow, CANONICAL_WORKFLOW_STEPS, mapOrderStatusToStageIndex } from '../workflowEngine';
import { WorkflowTimeline } from './WorkflowTimeline';
import { useLanguage } from '../context/LanguageContext';

interface OrdersViewProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onRefreshAnalysis: () => void;
  onSelectOrder?: (order: Order) => void;
  onFilterRiskOrders?: () => void;
  onNavigateToInventory?: () => void;
  onAdvanceWorkflowStep?: (orderId: string) => void;
  onTriggerQcIssue?: (orderId: string) => void;
  orderWorkflows?: Record<string, OrderWorkflow>;
  globalOrderFilter?: GlobalOrderFilter;
  onOrderFilterChange?: (filter: GlobalOrderFilter) => void;
  initialStatusFilter?: string;
}

type SortField = 'deadline' | 'value' | 'items' | 'customer' | 'date';
type SortOrder = 'asc' | 'desc';

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  onUpdateOrderStatus,
  onRefreshAnalysis,
  onFilterRiskOrders,
  onNavigateToInventory,
  onAdvanceWorkflowStep,
  onTriggerQcIssue,
  orderWorkflows = {},
  globalOrderFilter = 'all',
  onOrderFilterChange,
  initialStatusFilter = 'All'
}) => {
  const { t } = useLanguage();
  // Local state for orders (to allow instant inline mutations, split shipments, expedited overrides)
  const [localOrders, setLocalOrders] = useState<Order[]>(orders);

  useEffect(() => {
    setLocalOrders(orders);
  }, [orders]);

  // Sync sidebar status filter when it changes
  useEffect(() => {
    if (initialStatusFilter && initialStatusFilter !== 'All') {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Copilot recommendations state
  const [copilotRecs, setCopilotRecs] = useState<CopilotRecommendation[]>(initialCopilotRecommendations);
  const [appliedRecs, setAppliedRecs] = useState<Set<string>>(new Set());

  // Search & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');
  const [customerTypeFilter, setCustomerTypeFilter] = useState<string>('All');
  const [shippingTypeFilter, setShippingTypeFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [slaRiskOnly, setSlaRiskOnly] = useState(false);

  // Sorting & View Configuration
  const [sortField, setSortField] = useState<SortField>('deadline');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Selected Order Drawer & Tab
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerTab, setDrawerTab] = useState<'details' | 'workflow'>('workflow');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMuthuPanelCollapsed, setIsMuthuPanelCollapsed] = useState(false);

  // Filtered and Sorted Orders
  const filteredAndSortedOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filtered = localOrders.filter((order) => {
      // Category filter (Global or Local tab)
      const matchesCategory =
        globalOrderFilter === 'all' ||
        (globalOrderFilter === 'business' && order.orderCategory === 'business') ||
        (globalOrderFilter === 'individual' && order.orderCategory === 'individual') ||
        (globalOrderFilter === ('vip' as any) && (order.customerType === 'VIP' || order.priority === 'Critical')) ||
        (globalOrderFilter === ('urgent' as any) && (order.priority === 'Urgent' || order.shippingType === 'Express')) ||
        (globalOrderFilter === ('sla_at_risk' as any) && (order.isNearSlaRisk || (order.slaRemainingMinutes > 0 && order.slaRemainingMinutes <= 120)));

      const matchesSearch =
        !q ||
        order.orderNumber.toLowerCase().includes(q) ||
        order.id.toLowerCase().includes(q) ||
        order.customerName.toLowerCase().includes(q) ||
        (order.companyName && order.companyName.toLowerCase().includes(q)) ||
        (order.poNumber && order.poNumber.toLowerCase().includes(q)) ||
        (order.customerPhone && order.customerPhone.toLowerCase().includes(q)) ||
        order.assignedPicker.toLowerCase().includes(q) ||
        order.assignedPacker.toLowerCase().includes(q) ||
        order.warehouseZone.toLowerCase().includes(q) ||
        order.items?.some((it) => it.name.toLowerCase().includes(q) || it.sku.toLowerCase().includes(q));

      const matchesStatus =
        statusFilter === 'All' ||
        order.currentStatus === statusFilter ||
        (statusFilter === 'RECEIVED' && (order.currentStatus === 'New' || order.currentStatus === 'Priority Assigned' || order.currentStatus === 'Inventory Checked' || order.currentStatus === 'Stock Allocated')) ||
        (statusFilter === 'PICKING' && (order.currentStatus === 'Picking' || order.currentStatus === 'Active Picking')) ||
        (statusFilter === 'PACKING' && order.currentStatus === 'Packing') ||
        (statusFilter === 'QUALITY CHECK' && (order.currentStatus === 'Quality Check' || order.currentStatus === 'Quality Control')) ||
        (statusFilter === 'READY FOR DISPATCH' && order.currentStatus === 'Ready for Dispatch') ||
        (statusFilter === 'DISPATCHED' && order.currentStatus === 'Dispatched') ||
        (statusFilter === 'ON THE WAY' && (order.currentStatus === 'Dispatched' || Boolean(order.assignedTruckId))) ||
        (statusFilter === 'DELIVERED' && order.currentStatus === 'Delivered') ||
        (statusFilter === 'CANCELLED' && order.currentStatus === 'On Hold');
      const matchesPriority = priorityFilter === 'All' || order.priority === priorityFilter;
      const matchesCustomerType = customerTypeFilter === 'All' || order.customerType === customerTypeFilter;
      const matchesShippingType = shippingTypeFilter === 'All' || order.shippingType === shippingTypeFilter;
      const matchesZone = zoneFilter === 'All' || order.warehouseZone.includes(zoneFilter);
      const matchesSlaRisk = !slaRiskOnly || (order.slaRemainingMinutes > 0 && order.slaRemainingMinutes <= 45);

      return (
        matchesCategory &&
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesCustomerType &&
        matchesShippingType &&
        matchesZone &&
        matchesSlaRisk
      );
    });

    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'deadline':
          // Urgent orders with positive SLA first, 0/closed at bottom
          const slaA = a.slaRemainingMinutes > 0 ? a.slaRemainingMinutes : 9999;
          const slaB = b.slaRemainingMinutes > 0 ? b.slaRemainingMinutes : 9999;
          comparison = slaA - slaB;
          break;
        case 'value':
          comparison = a.orderValue - b.orderValue;
          break;
        case 'items':
          comparison = a.itemCount - b.itemCount;
          break;
        case 'customer':
          comparison = a.customerName.localeCompare(b.customerName);
          break;
        case 'date':
          comparison = a.id.localeCompare(b.id);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [
    localOrders,
    globalOrderFilter,
    searchQuery,
    statusFilter,
    priorityFilter,
    customerTypeFilter,
    shippingTypeFilter,
    zoneFilter,
    slaRiskOnly,
    sortField,
    sortOrder
  ]);

  // Counts for tabs & filters
  const b2bCount = useMemo(() => localOrders.filter((o) => o.orderCategory === 'business').length, [localOrders]);
  const b2cCount = useMemo(() => localOrders.filter((o) => o.orderCategory === 'individual').length, [localOrders]);
  const vipCount = useMemo(() => localOrders.filter((o) => o.customerType === 'VIP' || o.priority === 'Critical').length, [localOrders]);
  const urgentCount = useMemo(() => localOrders.filter((o) => o.priority === 'Urgent' || o.shippingType === 'Express').length, [localOrders]);
  const slaRiskCount = useMemo(() => localOrders.filter((o) => o.isNearSlaRisk || (o.slaRemainingMinutes > 0 && o.slaRemainingMinutes <= 120)).length, [localOrders]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: localOrders.length,
      RECEIVED: 0,
      PICKING: 0,
      PACKING: 0,
      'QUALITY CHECK': 0,
      'READY FOR DISPATCH': 0,
      DISPATCHED: 0,
      'ON THE WAY': 0,
      DELIVERED: 0,
      CANCELLED: 0
    };
    localOrders.forEach((o) => {
      const s = o.currentStatus;
      if (s === 'New' || s === 'Priority Assigned' || s === 'Inventory Checked' || s === 'Stock Allocated') {
        counts['RECEIVED']++;
      } else if (s === 'Picking' || s === 'Active Picking') {
        counts['PICKING']++;
      } else if (s === 'Packing') {
        counts['PACKING']++;
      } else if (s === 'Quality Check' || s === 'Quality Control') {
        counts['QUALITY CHECK']++;
      } else if (s === 'Ready for Dispatch') {
        counts['READY FOR DISPATCH']++;
      } else if (s === 'Dispatched') {
        counts['DISPATCHED']++;
        if (o.assignedTruckId) counts['ON THE WAY']++;
      } else if (s === 'Delivered') {
        counts['DELIVERED']++;
      } else if (s === 'On Hold') {
        counts['CANCELLED']++;
      }
    });
    return counts;
  }, [localOrders]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedOrders.length / itemsPerPage));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedOrders.slice(start, start + itemsPerPage);
  }, [filteredAndSortedOrders, currentPage, itemsPerPage]);

  // Aggregate Metrics for Top Control Bar
  const metrics = useMemo(() => {
    const total = localOrders.length;
    const active = localOrders.filter(
      (o) => o.currentStatus !== 'Dispatched' && o.currentStatus !== 'Delivered'
    ).length;
    const critical = localOrders.filter((o) => o.priority === 'Critical').length;
    const high = localOrders.filter((o) => o.priority === 'High').length;
    const nearSla = localOrders.filter((o) => o.slaRemainingMinutes > 0 && o.slaRemainingMinutes <= 45).length;
    const dispatched = localOrders.filter(
      (o) => o.currentStatus === 'Dispatched' || o.currentStatus === 'Delivered'
    ).length;
    const slaOnTrackPercent = Math.round(((total - nearSla) / (total || 1)) * 100);

    return { total, active, critical, high, nearSla, dispatched, slaOnTrackPercent };
  }, [localOrders]);

  // Handlers
  const handleAdvanceStatus = (orderId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const order = localOrders.find((o) => o.id === orderId);
    if (!order) return;

    const nextStatus = getNextOrderStatus(order.currentStatus);
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, currentStatus: nextStatus, status: nextStatus } : o))
    );
    onUpdateOrderStatus(orderId, nextStatus);

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, currentStatus: nextStatus, status: nextStatus } : null));
    }
  };

  const handleSetStatus = (orderId: string, newStatus: OrderStatus) => {
    setLocalOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, currentStatus: newStatus, status: newStatus } : o))
    );
    onUpdateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => (prev ? { ...prev, currentStatus: newStatus, status: newStatus } : null));
    }
  };

  const handleApproveCopilotRec = (rec: CopilotRecommendation) => {
    setAppliedRecs((prev) => new Set(prev).add(rec.id));

    if (rec.actionType === 'prioritize' && rec.targetOrderId) {
      setLocalOrders((prev) =>
        prev.map((o) =>
          o.id === rec.targetOrderId || o.orderNumber === rec.targetOrderNumber
            ? { ...o, priority: 'Critical', currentStatus: 'Picking', status: 'Picking', isP1: true }
            : o
        )
      );
    } else if (rec.actionType === 'dispatch_first' && rec.targetOrderId) {
      setLocalOrders((prev) =>
        prev.map((o) =>
          o.id === rec.targetOrderId || o.orderNumber === rec.targetOrderNumber
            ? { ...o, currentStatus: 'Dispatched', status: 'Dispatched', slaRemainingMinutes: 0 }
            : o
        )
      );
    } else if (rec.actionType === 'allocate_staff') {
      setLocalOrders((prev) =>
        prev.map((o) =>
          o.warehouseZone.includes('Zone B') && (o.currentStatus === 'Stock Allocated' || o.currentStatus === 'Picking')
            ? { ...o, assignedPicker: 'Ravi Kumar' }
            : o
        )
      );
    } else if (rec.actionType === 'delay_insufficient_stock' && rec.targetOrderId) {
      setLocalOrders((prev) =>
        prev.map((o) =>
          o.id === rec.targetOrderId || o.orderNumber === rec.targetOrderNumber
            ? { ...o, currentStatus: 'On Hold', status: 'On Hold', notes: 'Temporarily paused: Awaiting 2:00 PM QC restock clearance.' }
            : o
        )
      );
    } else if (rec.actionType === 'split_shipment' && rec.targetOrderId) {
      setLocalOrders((prev) =>
        prev.map((o) =>
          o.id === rec.targetOrderId || o.orderNumber === rec.targetOrderNumber
            ? {
                ...o,
                notes: 'Split fulfillment active: Parcel A (Ready for Dispatch) • Parcel B (Afternoon run)',
                currentStatus: 'Ready for Dispatch',
                status: 'Ready for Dispatch'
              }
            : o
        )
      );
    }
  };

  const handleDismissCopilotRec = (recId: string) => {
    setCopilotRecs((prev) => prev.filter((r) => r.id !== recId));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      onRefreshAnalysis();
    }, 600);
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

  // Priority Badge Visualizer
  const getPriorityBadge = (priority: OrderPriority) => {
    switch (priority) {
      case 'Critical':
      case 'P1 Expedite':
      case 'P1':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-error-container text-[#93000a] uppercase tracking-wide border border-error/40 animate-pulse shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-error" />
            Critical
          </span>
        );
      case 'High':
      case 'P2':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-[#ffe082]/40 text-[#7c5e10] uppercase tracking-wide border border-[#ffe082]/70">
            <span className="w-1.5 h-1.5 rounded-full bg-[#b28704]" />
            High
          </span>
        );
      case 'Medium':
      case 'P3':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-secondary-container/40 text-on-secondary-container uppercase tracking-wide border border-secondary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Medium
          </span>
        );
      case 'Normal':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold bg-surface-container-high text-on-surface-variant uppercase tracking-wide border border-outline-variant/30">
            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
            Normal
          </span>
        );
    }
  };

  // Customer Type Badge Visualizer
  const getCustomerTypeBadge = (type: CustomerType) => {
    if (type === 'VIP') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-[#BACBB4]/30 text-[#2f432c] text-[11px] font-bold border border-[#BACBB4]/50 flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          VIP
        </span>
      );
    }
    if (type === 'Business') {
      return (
        <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface text-[11px] font-medium border border-outline-variant/30">
          Business
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded-md bg-surface-container-low text-outline text-[11px]">Standard</span>
    );
  };

  // Status Badge Visualizer
  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'New':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-surface-container text-on-surface border border-outline-variant/40">
            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
            New
          </span>
        );
      case 'Priority Assigned':
      case 'Inventory Checked':
      case 'Stock Allocated':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-primary-container/30 text-on-primary-container border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            {status}
          </span>
        );
      case 'Picking':
      case 'Active Picking':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-[#bacbb4]/30 text-[#2f432c] border border-[#bacbb4]/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#51604D] animate-pulse" />
            Picking
          </span>
        );
      case 'Packing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-surface-variant text-on-surface-variant border border-outline-variant/30">
            <span className="material-symbols-outlined text-[13px]">inventory_2</span>
            Packing
          </span>
        );
      case 'Quality Check':
      case 'Quality Control':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-secondary-container/40 text-on-secondary-container border border-secondary/20">
            <span className="material-symbols-outlined text-[13px]">fact_check</span>
            Quality Check
          </span>
        );
      case 'Ready for Dispatch':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-[#ffe082]/40 text-[#7c5e10] border border-[#ffe082]/60">
            <span className="material-symbols-outlined text-[13px]">local_shipping</span>
            Ready for Dispatch
          </span>
        );
      case 'Dispatched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-[#d6e8cf]/40 text-[#2f432c] border border-[#3c4b39]/20">
            <span className="material-symbols-outlined text-[13px]">check_circle</span>
            Dispatched
          </span>
        );
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-surface-container-high text-on-surface border border-outline-variant/40">
            <span className="material-symbols-outlined text-[13px]">done_all</span>
            Delivered
          </span>
        );
      case 'On Hold':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-error-container/40 text-[#93000a] border border-error/30">
            <span className="material-symbols-outlined text-[13px]">pause_circle</span>
            On Hold
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11.5px] font-bold bg-surface-container text-on-surface">
            {status}
          </span>
        );
    }
  };

  // SLA Countdown Timer display
  const renderSlaTimer = (minutes: number, isCriticalOrDelayed: boolean) => {
    if (minutes <= 0) {
      return (
        <span className="text-[12px] text-outline font-medium flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">done</span>
          Completed
        </span>
      );
    }

    const isUrgent = minutes <= 30;
    const isWarning = minutes <= 45;

    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-mono font-bold transition-all ${
          isUrgent
            ? 'bg-error-container text-[#93000a] border border-error/40 animate-pulse shadow-xs'
            : isWarning
            ? 'bg-[#ffe082]/40 text-[#7c5e10] border border-[#ffe082]/60'
            : 'bg-surface-container text-on-surface border border-outline-variant/30'
        }`}
      >
        <span className="material-symbols-outlined text-[14px]">
          {isUrgent ? 'timer' : 'schedule'}
        </span>
        <span>{minutes}m SLA</span>
      </div>
    );
  };

  return (
    <div id="orders-view" className="w-full max-w-[1440px] mx-auto px-4 md:px-8 py-6 md:py-10 space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="font-headline-md text-headline-md md:text-[34px] leading-tight text-on-background font-bold tracking-tight">
              Orders Management
            </h2>
            <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high border border-outline-variant/30 text-outline text-[12px] font-mono font-bold">
              {metrics.total} Orders Registered
            </span>
            {metrics.nearSla > 0 && (
              <span
                onClick={() => setSlaRiskOnly(!slaRiskOnly)}
                className={`px-3 py-0.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
                  slaRiskOnly
                    ? 'bg-error text-on-error shadow-xs'
                    : 'bg-error-container text-error border border-error/30 hover:bg-error-container/80'
                }`}
                title="Click to toggle urgent SLA risk orders"
              >
                <span className="w-2 h-2 rounded-full bg-error animate-ping" />
                {metrics.nearSla} At SLA Risk
              </span>
            )}
          </div>
          <p className="font-body-md text-[14px] md:text-[15px] text-on-surface-variant mt-1 max-w-2xl">
            Real-time warehouse fulfillment control center with SLA countdown tracking, dynamic picker allocation, and AI dispatch routing.
          </p>
        </div>

        {/* View Mode & Global Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex rounded-xl bg-surface border border-outline-variant/30 p-0.5 shadow-xs">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg font-label-md text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">grid_view</span>
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-label-md text-[13px] flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-primary text-on-primary font-bold shadow-xs'
                  : 'text-on-surface hover:bg-surface-container-high'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">table_rows</span>
              Table
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl border border-outline-variant text-on-surface font-label-md text-[13px] hover:bg-surface-container-high transition-colors flex items-center gap-1.5 bg-surface cursor-pointer shadow-xs disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
              refresh
            </span>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* KPI Bento Row */}
      <div id="orders-kpi-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="card-surface rounded-[18px] p-5 shadow-ambient border border-outline-variant/15 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
              Active Fulfillment Queue
            </span>
            <div className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">conveyor_belt</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display-lg text-[26px] md:text-[28px] text-on-background font-bold tracking-tight">
              {metrics.active} <span className="text-[14px] text-outline font-normal">/ {metrics.total} orders</span>
            </div>
            <p className="font-body-md text-[12px] text-on-surface-variant mt-0.5">
              {metrics.dispatched} orders dispatched today
            </p>
          </div>
        </div>

        <div
          onClick={() => {
            setPriorityFilter(priorityFilter === 'Critical' ? 'All' : 'Critical');
            setCurrentPage(1);
          }}
          className="card-surface rounded-[18px] p-5 shadow-ambient border-l-4 border-error/60 border border-outline-variant/15 flex flex-col justify-between cursor-pointer hover:bg-surface-container-low/30 transition-colors"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-[11px] text-error font-bold uppercase tracking-wider">
              Critical Priority
            </span>
            <div className="w-8 h-8 rounded-xl bg-error-container text-error flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">priority_high</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display-lg text-[26px] md:text-[28px] text-on-background font-bold tracking-tight">
              {metrics.critical} Orders
            </div>
            <p className="font-body-md text-[12px] text-error mt-0.5 font-medium">
              VIP & Express with urgent deadlines
            </p>
          </div>
        </div>

        <div
          onClick={() => {
            setSlaRiskOnly(!slaRiskOnly);
            setCurrentPage(1);
          }}
          className="card-surface rounded-[18px] p-5 shadow-ambient border-l-4 border-[#ffe082] border border-outline-variant/15 flex flex-col justify-between cursor-pointer hover:bg-surface-container-low/30 transition-colors"
        >
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-[11px] text-[#7c5e10] font-bold uppercase tracking-wider">
              Near SLA Cutoff (&lt;45m)
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#ffe082]/40 text-[#7c5e10] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">timer</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display-lg text-[26px] md:text-[28px] text-on-background font-bold tracking-tight">
              {metrics.nearSla} Orders
            </div>
            <p className="font-body-md text-[12px] text-on-surface-variant mt-0.5">
              Requires immediate picker assignment
            </p>
          </div>
        </div>

        <div className="card-surface rounded-[18px] p-5 shadow-ambient border border-outline-variant/15 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
              SLA On-Track Rating
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#BACBB4]/30 text-[#3C4B39] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">verified</span>
            </div>
          </div>
          <div className="mt-3">
            <div className="font-display-lg text-[26px] md:text-[28px] text-on-background font-bold tracking-tight">
              {metrics.slaOnTrackPercent}%
            </div>
            <p className="font-body-md text-[12px] text-on-surface-variant mt-0.5">
              Standard warehouse throughput benchmark
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Orders Control Center & Copilot Insights */}
      <div className="flex flex-col xl:flex-row gap-8 items-start">
        {/* Left / Center Area: Filters & Order Cards/Table */}
        <div className="flex-1 w-full space-y-6">
          {/* Filter & Search Toolbar */}
          <div className="bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/30 rounded-[20px] p-4 space-y-3 shadow-xs">
            {/* Primary Order Segment Switcher (All vs Business vs Individual) */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-1.5 p-1 bg-surface-container-low rounded-xl border border-outline-variant/30 flex-wrap">
                <button
                  id="tab-orders-all"
                  onClick={() => onOrderFilterChange && onOrderFilterChange('all')}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    globalOrderFilter === 'all'
                      ? 'bg-surface text-primary shadow-xs font-extrabold'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">grid_view</span>
                  <span>ALL ORDERS</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-surface-container-high text-[10px] font-mono">
                    {localOrders.length}
                  </span>
                </button>

                <button
                  id="tab-orders-business"
                  onClick={() => onOrderFilterChange && onOrderFilterChange('business')}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    globalOrderFilter === 'business'
                      ? 'bg-primary text-on-primary shadow-xs font-extrabold'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">domain</span>
                  <span>BUSINESS (B2B)</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    globalOrderFilter === 'business' ? 'bg-on-primary/20 text-on-primary' : 'bg-surface-container-high'
                  }`}>
                    {b2bCount}
                  </span>
                </button>

                <button
                  id="tab-orders-individual"
                  onClick={() => onOrderFilterChange && onOrderFilterChange('individual')}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    globalOrderFilter === 'individual'
                      ? 'bg-secondary text-on-secondary shadow-xs font-extrabold'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">person</span>
                  <span>INDIVIDUAL (B2C)</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    globalOrderFilter === 'individual' ? 'bg-on-secondary/20 text-on-secondary' : 'bg-surface-container-high'
                  }`}>
                    {b2cCount}
                  </span>
                </button>

                <button
                  id="tab-orders-vip"
                  onClick={() => onOrderFilterChange && onOrderFilterChange('vip' as any)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    globalOrderFilter === ('vip' as any)
                      ? 'bg-amber-600 text-white shadow-xs font-extrabold'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">star</span>
                  <span>VIP</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-700/30 text-amber-900 text-[10px] font-mono">
                    {vipCount}
                  </span>
                </button>

                <button
                  id="tab-orders-urgent"
                  onClick={() => onOrderFilterChange && onOrderFilterChange('urgent' as any)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    globalOrderFilter === ('urgent' as any)
                      ? 'bg-rose-600 text-white shadow-xs font-extrabold'
                      : 'text-outline hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">bolt</span>
                  <span>URGENT</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-700/30 text-rose-900 text-[10px] font-mono">
                    {urgentCount}
                  </span>
                </button>

                <button
                  id="tab-orders-sla-risk"
                  onClick={() => onOrderFilterChange && onOrderFilterChange('sla_at_risk' as any)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    globalOrderFilter === ('sla_at_risk' as any)
                      ? 'bg-rose-700 text-white shadow-xs font-extrabold animate-pulse'
                      : 'text-rose-700 hover:text-rose-900'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">timer</span>
                  <span>SLA AT RISK</span>
                  <span className="px-1.5 py-0.2 rounded-full bg-rose-800/30 text-rose-950 text-[10px] font-mono font-bold">
                    {slaRiskCount}
                  </span>
                </button>
              </div>

              <span className="text-[12px] text-outline hidden sm:inline">
                {globalOrderFilter === 'business'
                  ? 'Enterprise Contracts & Bulk Pallets'
                  : globalOrderFilter === 'individual'
                  ? 'Direct Consumer Parcels & Same-Day Dispatch'
                  : globalOrderFilter === ('vip' as any)
                  ? 'VIP Accounts & Priority SLA Contracts'
                  : globalOrderFilter === ('sla_at_risk' as any)
                  ? 'Orders Nearing Cutoff (<120m SLA)'
                  : 'Unified Order Pipeline'}
              </span>
            </div>

            {/* Required Status Category Quick Filter Pills (Dynamic Counts) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] font-bold text-outline uppercase shrink-0">Status Category:</span>
              {[
                { label: 'All', key: 'All' },
                { label: 'Received', key: 'RECEIVED' },
                { label: 'Picking', key: 'PICKING' },
                { label: 'Packing', key: 'PACKING' },
                { label: 'Quality Check', key: 'QUALITY CHECK' },
                { label: 'Ready for Dispatch', key: 'READY FOR DISPATCH' },
                { label: 'Dispatched', key: 'DISPATCHED' },
                { label: 'On the Way', key: 'ON THE WAY' },
                { label: 'Delivered', key: 'DELIVERED' }
              ].map((st) => (
                <button
                  key={st.key}
                  id={`status-pill-${st.key.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => {
                    setStatusFilter(st.key);
                    setCurrentPage(1);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer border ${
                    statusFilter === st.key
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                      : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border-zinc-200'
                  }`}
                >
                  {st.label} ({statusCounts[st.key] || 0})
                </button>
              ))}
            </div>

            {/* Search and Secondary Filters */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[19px]">
                  search
                </span>
                <input
                  id="orders-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search Order #, PO, Customer, SKU..."
                  className="w-full bg-surface-container-low border border-outline-variant/20 rounded-[14px] pl-10 pr-9 py-2 text-on-surface font-body-md text-[13.5px] focus:ring-2 focus:ring-primary/20 placeholder:text-outline outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
                {/* Status Filter */}
                <select
                  id="select-orders-status"
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-[13px] shadow-xs cursor-pointer outline-none"
                >
                  <option value="All">All Statuses</option>
                  {ORDER_PIPELINE_STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  <option value="On Hold">On Hold</option>
                </select>

                {/* Priority Filter */}
                <select
                  id="select-orders-priority"
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-[13px] shadow-xs cursor-pointer outline-none"
                >
                  <option value="All">All Priorities</option>
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Normal">Normal</option>
                </select>

                {/* Customer Type */}
                <select
                  value={customerTypeFilter}
                  onChange={(e) => {
                    setCustomerTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-[13px] shadow-xs cursor-pointer outline-none"
                >
                  <option value="All">All Customer Types</option>
                  <option value="VIP">VIP Accounts</option>
                  <option value="Business">Business Accounts</option>
                  <option value="Standard">Standard Accounts</option>
                </select>

                {/* Shipping Type */}
                <select
                  value={shippingTypeFilter}
                  onChange={(e) => {
                    setShippingTypeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-[13px] shadow-xs cursor-pointer outline-none"
                >
                  <option value="All">All Shipping</option>
                  <option value="Express">Express Air</option>
                  <option value="Standard">Standard Ground</option>
                  <option value="Economy">Economy Freight</option>
                </select>

                {/* Zone Filter */}
                <select
                  value={zoneFilter}
                  onChange={(e) => {
                    setZoneFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface font-label-md text-[13px] shadow-xs cursor-pointer outline-none"
                >
                  <option value="All">All Zones</option>
                  <option value="Zone A">Zone A (Furniture)</option>
                  <option value="Zone B">Zone B (Electronics)</option>
                  <option value="Zone C">Zone C (Packaging)</option>
                  <option value="Zone D">Zone D (Accessories)</option>
                  <option value="Mezzanine">Mezzanine</option>
                  <option value="Dock Bay">Dock Bay</option>
                </select>

                {/* Reset Filters */}
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setPriorityFilter('All');
                    setCustomerTypeFilter('All');
                    setShippingTypeFilter('All');
                    setZoneFilter('All');
                    setSlaRiskOnly(false);
                    if (onOrderFilterChange) onOrderFilterChange('all');
                    setCurrentPage(1);
                  }}
                  className="h-9 px-3 rounded-xl bg-surface-container-low border border-outline-variant/30 text-on-surface flex items-center gap-1 shadow-xs hover:bg-surface-variant transition-colors cursor-pointer text-[12px] font-label-md"
                  title="Reset all filters"
                >
                  <span className="material-symbols-outlined text-[16px]">restart_alt</span>
                  Reset
                </button>
              </div>
            </div>

            {/* Sort Sorters and Items Counter */}
            <div className="flex flex-wrap items-center justify-between text-[13px] text-on-surface-variant pt-2 border-t border-outline-variant/15 gap-2">
              <div className="flex items-center gap-2">
                <span className="font-label-caps text-[11px] text-outline uppercase font-bold">Sort By:</span>
                <button
                  onClick={() => handleSort('deadline')}
                  className={`px-2.5 py-1 rounded-lg border text-[12px] cursor-pointer flex items-center gap-1 transition-colors ${
                    sortField === 'deadline'
                      ? 'bg-primary-container text-on-primary-container border-primary/30 font-bold'
                      : 'bg-surface border-outline-variant/30 hover:bg-surface-container'
                  }`}
                >
                  SLA Deadline
                  {sortField === 'deadline' && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleSort('value')}
                  className={`px-2.5 py-1 rounded-lg border text-[12px] cursor-pointer flex items-center gap-1 transition-colors ${
                    sortField === 'value'
                      ? 'bg-primary-container text-on-primary-container border-primary/30 font-bold'
                      : 'bg-surface border-outline-variant/30 hover:bg-surface-container'
                  }`}
                >
                  Order Value
                  {sortField === 'value' && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleSort('items')}
                  className={`px-2.5 py-1 rounded-lg border text-[12px] cursor-pointer flex items-center gap-1 transition-colors ${
                    sortField === 'items'
                      ? 'bg-primary-container text-on-primary-container border-primary/30 font-bold'
                      : 'bg-surface border-outline-variant/30 hover:bg-surface-container'
                  }`}
                >
                  Items Count
                  {sortField === 'items' && (
                    <span className="material-symbols-outlined text-[14px]">
                      {sortOrder === 'asc' ? 'arrow_upward' : 'arrow_downward'}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => handleSort('customer')}
                  className={`px-2.5 py-1 rounded-lg border text-[12px] cursor-pointer flex items-center gap-1 transition-colors ${
                    sortField === 'customer'
                      ? 'bg-primary-container text-on-primary-container border-primary/30 font-bold'
                      : 'bg-surface border-outline-variant/30 hover:bg-surface-container'
                  }`}
                >
                  Customer Name
                  {sortField === 'customer' && (
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
                  <option value={8}>8</option>
                  <option value={12}>12</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
          </div>

          {/* Orders Cards Grid View */}
          {viewMode === 'cards' ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
                {paginatedOrders.length === 0 ? (
                  <div className="col-span-full card-surface rounded-[20px] p-12 text-center text-on-surface-variant border border-outline-variant/20">
                    <div className="w-12 h-12 rounded-full bg-surface-container mx-auto flex items-center justify-center text-outline mb-2">
                      <span className="material-symbols-outlined text-[24px]">search_off</span>
                    </div>
                    <p className="font-bold text-on-surface text-[16px]">No orders match your filter criteria</p>
                    <p className="text-[13px] text-outline mt-1">Try resetting filters or adjusting search parameters</p>
                  </div>
                ) : (
                  paginatedOrders.map((ord) => {
                    const isNearSla = ord.slaRemainingMinutes > 0 && ord.slaRemainingMinutes <= 35;
                    const isCritical = ord.priority === 'Critical';
                    const isB2B = ord.orderCategory === 'business';

                    return (
                      <article
                        key={ord.id}
                        id={`order-card-${ord.orderNumber}`}
                        onClick={() => setSelectedOrder(ord)}
                        className={`card-surface rounded-[20px] p-5 md:p-6 shadow-ambient border transition-all cursor-pointer flex flex-col justify-between space-y-4 group relative overflow-hidden ${
                          isCritical
                            ? 'border-error/40 shadow-sm bg-gradient-to-br from-surface to-error-container/10'
                            : isNearSla
                            ? 'border-[#ffe082] bg-gradient-to-br from-surface to-[#ffe082]/10'
                            : isB2B
                            ? 'border-primary/20 hover:border-primary/50'
                            : 'border-secondary/20 hover:border-secondary/50'
                        }`}
                      >
                        {/* Critical Accent Bar */}
                        {isCritical && (
                          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-error animate-pulse" />
                        )}

                        <div className="space-y-3">
                          {/* Card Header */}
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center flex-wrap gap-1.5 mb-1">
                                <span className="font-mono text-[12px] text-outline font-bold">
                                  {ord.orderNumber}
                                </span>
                                <span className="text-[11px] text-outline">• {ord.id}</span>
                                
                                {isB2B ? (
                                  <span className="px-2 py-0.2 rounded-md bg-primary/10 text-primary border border-primary/20 text-[10.5px] font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">domain</span>
                                    B2B Enterprise
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.2 rounded-md bg-secondary/10 text-secondary border border-secondary/20 text-[10.5px] font-bold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[12px]">person</span>
                                    B2C Consumer
                                  </span>
                                )}

                                {getCustomerTypeBadge(ord.customerType)}
                              </div>

                              <h3 className="font-headline-sm text-[18px] font-bold text-on-background group-hover:text-primary transition-colors line-clamp-1">
                                {isB2B && ord.companyName ? ord.companyName : ord.customerName}
                              </h3>

                              {isB2B && ord.poNumber && (
                                <div className="text-[11.5px] font-mono text-outline font-medium">
                                  PO Ref: <span className="text-on-surface font-bold">{ord.poNumber}</span>
                                  {ord.accountManager && ` • AM: ${ord.accountManager}`}
                                </div>
                              )}

                              {!isB2B && ord.customerPhone && (
                                <div className="text-[11.5px] text-outline">
                                  Recipient: <span className="text-on-surface font-medium">{ord.customerName}</span> ({ord.customerPhone})
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-1 shrink-0">
                              {getPriorityBadge(ord.priority)}
                              {renderSlaTimer(ord.slaRemainingMinutes, isNearSla || isCritical)}
                            </div>
                          </div>

                          {/* Quick Info Grid */}
                          <div className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 grid grid-cols-3 gap-2 text-[12px]">
                            <div>
                              <span className="text-outline text-[10.5px] uppercase font-bold block">Status</span>
                              <div className="mt-0.5">{getStatusBadge(ord.currentStatus)}</div>
                            </div>

                            <div>
                              <span className="text-outline text-[10.5px] uppercase font-bold block">
                                {isB2B ? 'Pallets / Freight' : 'Delivery Method'}
                              </span>
                              <span className="font-bold text-on-surface block mt-0.5 truncate">
                                {isB2B
                                  ? `${ord.palletCount || 2} Pallets • Bay ${ord.stagingBay || '04'}`
                                  : ord.deliveryMethod || 'Same-Day Courier'}
                              </span>
                              <span className="text-[11px] text-outline">{ord.shippingType}</span>
                            </div>

                            <div>
                              <span className="text-outline text-[10.5px] uppercase font-bold block">Items & Val</span>
                              <span className="font-bold text-on-surface block mt-0.5">
                                {ord.itemCount} items
                              </span>
                              <span className="text-[11px] text-outline font-mono">${ord.orderValue.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Assigned Workers Bar */}
                          <div className="flex items-center justify-between text-[12px] text-on-surface-variant pt-1">
                            <div className="flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[15px] text-primary">person</span>
                              <span className="font-medium text-on-surface">Picker: {ord.assignedPicker}</span>
                            </div>
                            <div className="text-[11.5px] text-outline">
                              Packer: {ord.assignedPacker} • {ord.warehouseZone}
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Actions */}
                        <div className="pt-3 border-t border-outline-variant/15 flex items-center justify-between">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedOrder(ord);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-surface border border-outline-variant/30 text-on-surface font-label-md text-[12px] hover:bg-surface-container transition-colors cursor-pointer"
                          >
                            Inspect Manifest
                          </button>

                          {ord.currentStatus !== 'Delivered' && (
                            <button
                              onClick={(e) => handleAdvanceStatus(ord.id, e)}
                              className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-[12px] font-bold shadow-xs hover:bg-primary/90 flex items-center gap-1 cursor-pointer transition-colors"
                              title={`Advance to ${getNextOrderStatus(ord.currentStatus)}`}
                            >
                              <span>Next: {getNextOrderStatus(ord.currentStatus)}</span>
                              <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              {/* Cards Pagination */}
              <div className="px-6 py-4 card-surface rounded-[18px] border border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="font-label-md text-[13px] text-outline">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length} orders
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
          ) : (
            /* Table View */
            <div className="card-surface rounded-[20px] shadow-ambient border border-outline-variant/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-outline-variant/20 bg-surface-container-low/50 text-[12px]">
                      <th className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap">
                        Category
                      </th>
                      <th
                        onClick={() => handleSort('deadline')}
                        className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap cursor-pointer hover:text-on-surface"
                      >
                        Order & Account
                      </th>
                      <th className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap">
                        Priority
                      </th>
                      <th className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap">
                        Current Status
                      </th>
                      <th
                        onClick={() => handleSort('items')}
                        className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap cursor-pointer hover:text-on-surface"
                      >
                        Items & Value
                      </th>
                      <th className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap">
                        Logistics Spec
                      </th>
                      <th className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap">
                        Zone & Worker
                      </th>
                      <th
                        onClick={() => handleSort('deadline')}
                        className="py-3.5 px-4 font-label-caps text-label-caps text-outline whitespace-nowrap cursor-pointer hover:text-on-surface"
                      >
                        SLA Countdown
                      </th>
                      <th className="py-3.5 px-4 font-label-caps text-label-caps text-outline text-right">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-[13.5px]">
                    {paginatedOrders.map((ord) => {
                      const isNearSla = ord.slaRemainingMinutes > 0 && ord.slaRemainingMinutes <= 35;
                      const isCritical = ord.priority === 'Critical';
                      const isB2B = ord.orderCategory === 'business';

                      return (
                        <tr
                          key={ord.id}
                          onClick={() => setSelectedOrder(ord)}
                          className={`border-b border-outline-variant/10 hover:bg-surface-container-low/40 transition-colors group cursor-pointer ${
                            isCritical ? 'bg-error-container/5' : isNearSla ? 'bg-[#ffe082]/5' : ''
                          }`}
                        >
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isB2B ? (
                              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary font-bold text-[11px] inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">domain</span>
                                B2B
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-secondary/10 text-secondary font-bold text-[11px] inline-flex items-center gap-1">
                                <span className="material-symbols-outlined text-[13px]">person</span>
                                B2C
                              </span>
                            )}
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[12px] font-bold text-outline">{ord.orderNumber}</span>
                              {getCustomerTypeBadge(ord.customerType)}
                            </div>
                            <div className="font-bold text-on-background text-[14.5px] mt-0.5 leading-snug">
                              {isB2B && ord.companyName ? ord.companyName : ord.customerName}
                            </div>
                            {isB2B && ord.poNumber ? (
                              <div className="text-[11px] text-outline font-mono">PO: {ord.poNumber}</div>
                            ) : (
                              <div className="text-[11px] text-outline font-mono">{ord.id}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">{getPriorityBadge(ord.priority)}</td>

                          <td className="py-3.5 px-4 whitespace-nowrap">{getStatusBadge(ord.currentStatus)}</td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-bold text-on-surface text-[14px]">
                              ${ord.orderValue.toLocaleString()}
                            </div>
                            <div className="text-[11.5px] text-outline">{ord.itemCount} items</div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {isB2B ? (
                              <div>
                                <span className="font-medium text-on-surface text-[12.5px] block">
                                  {ord.palletCount || 2} Pallets (Bay {ord.stagingBay || '04'})
                                </span>
                                <span className="text-[11px] text-outline font-mono">{ord.contractType || 'Enterprise Tier-1'}</span>
                              </div>
                            ) : (
                              <div>
                                <span className="font-medium text-on-surface text-[12.5px] block">
                                  {ord.deliveryMethod || 'Same-Day Courier'}
                                </span>
                                <span className="text-[11px] text-outline">{ord.carrier}</span>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="font-medium text-on-surface text-[13px]">{ord.warehouseZone}</div>
                            <div className="text-[11.5px] text-outline">Picker: {ord.assignedPicker}</div>
                          </td>

                          <td className="py-3.5 px-4 whitespace-nowrap">
                            {renderSlaTimer(ord.slaRemainingMinutes, isNearSla || isCritical)}
                          </td>

                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(ord);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-surface border border-outline-variant/30 text-on-surface hover:bg-surface-container text-[12px] font-label-md cursor-pointer"
                              >
                                Details
                              </button>
                              {ord.currentStatus !== 'Delivered' && (
                                <button
                                  onClick={(e) => handleAdvanceStatus(ord.id, e)}
                                  className="px-2.5 py-1 rounded-lg bg-primary text-on-primary font-label-md text-[12px] font-bold shadow-xs hover:bg-primary/90 flex items-center gap-1 cursor-pointer"
                                  title={`Advance to ${getNextOrderStatus(ord.currentStatus)}`}
                                >
                                  <span>Advance</span>
                                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Pagination Footer */}
              <div className="px-6 py-4 border-t border-outline-variant/20 flex flex-col sm:flex-row items-center justify-between bg-surface-container-lowest gap-3">
                <span className="font-label-md text-[13px] text-outline">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, filteredAndSortedOrders.length)} of {filteredAndSortedOrders.length} orders
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
        </div>

        {/* Right Column: Copilot Insights Panel ("Muthu Recommends") */}
        {isMuthuPanelCollapsed ? (
          <div className="shrink-0 xl:sticky xl:top-24">
            <button
              id="btn-expand-muthu-panel"
              onClick={() => setIsMuthuPanelCollapsed(false)}
              className="px-4 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-bold rounded-2xl text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer border border-amber-400 hover:scale-105"
              title="Expand Muthu Recommendations Panel"
            >
              <span className="material-symbols-outlined text-lg">smart_toy</span>
              <span>Muthu Decisions ({copilotRecs.length})</span>
              <span className="material-symbols-outlined text-xs">unfold_more</span>
            </button>
          </div>
        ) : (
          <aside id="orders-copilot-panel" className="w-full xl:w-[410px] shrink-0 space-y-4 xl:sticky xl:top-24">
            <div className="card-surface rounded-[24px] p-5 md:p-6 shadow-ambient border-l-4 border-amber-500 border border-outline-variant/20 relative overflow-hidden bg-white max-h-[calc(100vh-140px)] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-950 flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-xl">smart_toy</span>
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-[16px] font-bold text-on-background">
                      Muthu Recommends
                    </h3>
                    <span className="text-[10px] text-amber-800 font-bold uppercase tracking-wider font-mono">
                      Prescriptive Triage Engine
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-mono font-bold">
                    {copilotRecs.length} Active
                  </span>
                  <button
                    id="btn-collapse-muthu-panel"
                    onClick={() => setIsMuthuPanelCollapsed(true)}
                    className="p-1 text-zinc-400 hover:text-zinc-800 rounded-lg cursor-pointer transition-colors"
                    title="Collapse Panel"
                  >
                    <span className="material-symbols-outlined text-lg">close</span>
                  </button>
                </div>
              </div>

              <p className="font-body-md text-[12px] text-on-surface-variant my-2.5 leading-relaxed shrink-0">
                Live operational triage recommendations calculated from picking speeds, packing bench capacity, and SLA cutoff deadlines.
              </p>

              {/* Recommendations List with Smooth Internal Vertical Scrolling */}
              <div className="space-y-4 overflow-y-auto pr-1 flex-1 text-xs scrollbar-thin">
                {copilotRecs.length === 0 ? (
                  <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200 text-center text-zinc-500">
                    <span className="material-symbols-outlined text-[28px] text-emerald-600 mb-1">verified</span>
                    <p className="font-bold text-zinc-900 text-xs">All Dispatch Queues Synchronized</p>
                    <p className="text-[11px] mt-0.5">No bottleneck anomalies detected across facility lines.</p>
                  </div>
                ) : (
                  copilotRecs.map((rec) => {
                    const isApproved = appliedRecs.has(rec.id);

                    return (
                      <div
                        key={rec.id}
                        id={`copilot-rec-${rec.id}`}
                        className={`p-4 rounded-2xl border transition-all space-y-3 break-words whitespace-normal overflow-hidden ${
                          isApproved
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-zinc-50/80 border-zinc-200 hover:border-amber-400 hover:shadow-2xs'
                        }`}
                      >
                        {/* Rec Header: Title & Confidence */}
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-2 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold font-mono">
                                {rec.badgeText}
                              </span>
                              <span className="text-[10.5px] font-mono text-zinc-500 font-bold">{rec.confidence}% Confidence</span>
                            </div>
                            <h4 className="font-bold text-zinc-900 text-xs md:text-sm leading-snug break-words">{rec.title}</h4>
                          </div>
                          {isApproved && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-0.5 shrink-0">
                              <span className="material-symbols-outlined text-[12px]">check</span>
                              Applied
                            </span>
                          )}
                        </div>

                        {/* Complete Muthu Decision Format (Section 19) */}
                        <div className="space-y-2 text-[11.5px] leading-relaxed text-zinc-700">
                          <div>
                            <span className="font-bold text-rose-700 text-[10px] uppercase block font-mono">
                              Problem:
                            </span>
                            <p className="text-zinc-900 font-medium break-words">{rec.problem}</p>
                          </div>

                          <div>
                            <span className="font-bold text-zinc-500 text-[10px] uppercase block font-mono">
                              Reason:
                            </span>
                            <p className="text-zinc-700 break-words">{rec.reason}</p>
                          </div>

                          <div>
                            <span className="font-bold text-amber-900 text-[10px] uppercase block font-mono">
                              Business Impact:
                            </span>
                            <p className="text-amber-950 font-semibold break-words">{rec.businessImpact}</p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-white border border-zinc-200 space-y-1">
                            <span className="font-bold text-emerald-800 text-[10px] uppercase block font-mono">
                              Recommendation:
                            </span>
                            <p className="text-zinc-900 font-bold break-words">{rec.recommendedAction}</p>
                          </div>

                          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-0.5">
                            <span className="font-bold text-emerald-900 text-[10px] uppercase block font-mono">
                              Expected Result:
                            </span>
                            <p className="text-emerald-950 font-semibold break-words">
                              {rec.expectedResult || 'Reduce SLA risk from 8 orders to 2 and recover 21 minutes in queue.'}
                            </p>
                          </div>
                        </div>

                        {/* Action Buttons (Approve / Dismiss) */}
                        {!isApproved ? (
                          <div className="pt-2 flex items-center gap-2">
                            <button
                              id={`btn-approve-rec-${rec.id}`}
                              onClick={() => handleApproveCopilotRec(rec)}
                              className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1 cursor-pointer transition-all hover:shadow-xs"
                            >
                              <span className="material-symbols-outlined text-sm">check</span>
                              Approve
                            </button>
                            <button
                              id={`btn-dismiss-rec-${rec.id}`}
                              onClick={() => handleDismissCopilotRec(rec.id)}
                              className="px-3 py-2 rounded-xl border border-zinc-300 text-zinc-700 text-xs font-bold hover:bg-zinc-100 cursor-pointer transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <div className="text-[11px] text-emerald-800 flex items-center gap-1 font-semibold pt-1">
                            <span className="material-symbols-outlined text-sm">task_alt</span>
                            Reallocation policy active in WMS routing.
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ORDER DETAILS DRAWER (Slide-over Panel) */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div
          id="order-details-drawer-backdrop"
          onClick={() => setSelectedOrder(null)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex justify-end animate-in fade-in duration-150"
        >
          <div
            id="order-details-drawer"
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest w-full max-w-xl h-full shadow-ambient-lg border-l border-outline-variant/30 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
          >
            {/* Drawer Header */}
            <div className="p-6 border-b border-outline-variant/20 flex items-start justify-between bg-surface-container-low/30">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-outline text-[13px]">{selectedOrder.orderNumber}</span>
                  <span className="text-[11.5px] text-outline">• {selectedOrder.id}</span>
                  {getCustomerTypeBadge(selectedOrder.customerType)}
                  {getPriorityBadge(selectedOrder.priority)}
                </div>
                <h3 className="font-headline-sm text-[22px] font-bold text-on-background">
                  {selectedOrder.customerName}
                </h3>
                <p className="text-[13px] text-on-surface-variant">
                  {selectedOrder.shippingAddress || 'Enterprise Delivery Hub'}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            {/* Tab Switcher */}
            <div className="flex border-b border-outline-variant/20 px-6 bg-surface-container-low/20">
              <button
                onClick={() => setDrawerTab('workflow')}
                className={`py-3 px-4 text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  drawerTab === 'workflow'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-outline hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">account_tree</span>
                Workflow Timeline (15 Stages)
              </button>
              <button
                onClick={() => setDrawerTab('details')}
                className={`py-3 px-4 text-[13px] font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
                  drawerTab === 'details'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-outline hover:text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[17px]">inventory_2</span>
                Manifest & Logistics
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {drawerTab === 'workflow' ? (
                <WorkflowTimeline
                  workflow={
                    orderWorkflows[selectedOrder.id] ||
                    generateOrderWorkflow(selectedOrder)
                  }
                  order={selectedOrder}
                  onAdvanceStep={(orderId) => {
                    if (onAdvanceWorkflowStep) {
                      onAdvanceWorkflowStep(orderId);
                    } else {
                      handleAdvanceStatus(orderId);
                    }
                  }}
                  onTriggerQcIssue={(orderId) => {
                    if (onTriggerQcIssue) {
                      onTriggerQcIssue(orderId);
                    }
                  }}
                  onClose={() => setSelectedOrder(null)}
                />
              ) : (
                <>
                  {/* 10-Stage Pipeline Quick Selector */}
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
                    <div className="flex justify-between items-center text-[13px]">
                      <span className="font-bold text-on-surface">Fulfillment Stage Progression</span>
                      <span className="font-bold text-primary">{selectedOrder.currentStatus}</span>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 pt-1">
                      {ORDER_PIPELINE_STAGES.map((st, idx) => {
                        const currentIndex = ORDER_PIPELINE_STAGES.indexOf(selectedOrder.currentStatus);
                        const isPassed = idx <= currentIndex;
                        const isCurrent = idx === currentIndex;

                        return (
                          <div
                            key={st}
                            onClick={() => handleSetStatus(selectedOrder.id, st)}
                            className={`p-2 rounded-xl text-center cursor-pointer transition-all border ${
                              isCurrent
                                ? 'bg-primary text-on-primary font-bold border-primary shadow-xs'
                                : isPassed
                                ? 'bg-[#BACBB4]/40 text-[#2f432c] border-[#BACBB4]/60'
                                : 'bg-surface text-outline border-outline-variant/30 hover:bg-surface-container'
                            }`}
                            title={`Click to set status to ${st}`}
                          >
                            <span className="text-[10px] font-bold block">{idx + 1}</span>
                            <span className="text-[9.5px] truncate block leading-tight">{st}</span>
                          </div>
                        );
                      })}
                    </div>

                    {selectedOrder.currentStatus !== 'Delivered' && (
                      <button
                        onClick={() => handleAdvanceStatus(selectedOrder.id)}
                        className="w-full py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-[13px] font-bold shadow-xs hover:bg-primary/90 flex items-center justify-center gap-2 cursor-pointer transition-colors"
                      >
                        <span>Advance to Next Stage: {getNextOrderStatus(selectedOrder.currentStatus)}</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    )}
                  </div>

                  {/* Specialized B2B Enterprise or B2C Consumer Info Block */}
                  {selectedOrder.orderCategory === 'business' ? (
                    <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">domain</span>
                          <h4 className="font-bold text-on-background text-[14px]">Enterprise B2B Freight Logistics</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-primary/15 text-primary font-bold text-[11px] font-mono">
                          {selectedOrder.contractType || 'Tier-1 Contract'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[12px]">
                        <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20">
                          <span className="text-[10px] text-outline uppercase font-bold block">PO Number</span>
                          <span className="font-mono font-bold text-on-surface text-[12.5px] mt-0.5 block">
                            {selectedOrder.poNumber || 'PO-2025-089'}
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20">
                          <span className="text-[10px] text-outline uppercase font-bold block">Pallet Allocation</span>
                          <span className="font-bold text-on-surface text-[12.5px] mt-0.5 block">
                            {selectedOrder.palletCount || 4} Pallets (Bay {selectedOrder.stagingBay || '04'})
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20 col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-outline uppercase font-bold block">Account Manager</span>
                          <span className="font-bold text-on-surface text-[12.5px] mt-0.5 block truncate">
                            {selectedOrder.accountManager || 'Marcus Vance'}
                          </span>
                        </div>
                      </div>

                      {selectedOrder.b2bShipments && selectedOrder.b2bShipments.length > 0 && (
                        <div className="pt-2 border-t border-primary/15 space-y-1.5">
                          <span className="text-[11px] font-bold text-on-surface-variant block">
                            Split Freight Consignments ({selectedOrder.b2bShipments.length} Pallet Loads):
                          </span>
                          <div className="space-y-1">
                            {selectedOrder.b2bShipments.map((s) => (
                              <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-surface text-[11.5px] border border-outline-variant/15">
                                <span className="font-mono font-bold text-outline">{s.shipmentId}</span>
                                <span className="text-on-surface">{s.palletCount} Pallets • {s.itemsCount} Units</span>
                                <span className="text-primary font-medium">{s.destinationBay}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[20px]">local_shipping</span>
                          <h4 className="font-bold text-on-background text-[14px]">Direct-to-Consumer Parcel Dispatch</h4>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary font-bold text-[11px]">
                          {selectedOrder.deliveryMethod || 'Same-Day Courier'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[12px]">
                        <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20">
                          <span className="text-[10px] text-outline uppercase font-bold block">Recipient Contact</span>
                          <span className="font-bold text-on-surface text-[12.5px] mt-0.5 block truncate">
                            {selectedOrder.customerName}
                          </span>
                          <span className="text-[11px] text-outline font-mono">{selectedOrder.customerPhone || '+1 (555) 234-8921'}</span>
                        </div>
                        <div className="p-2.5 rounded-xl bg-surface border border-outline-variant/20">
                          <span className="text-[10px] text-outline uppercase font-bold block">Payment & Carrier</span>
                          <span className="font-bold text-[#2f432c] text-[12.5px] mt-0.5 block">
                            {selectedOrder.paymentStatus || 'Paid (Stripe Express)'}
                          </span>
                          <span className="text-[11px] text-outline">{selectedOrder.carrier} Courier Express</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SLA and Logistics Grid */}
                  <div className="grid grid-cols-2 gap-3 text-[13px]">
                    <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                      <span className="text-[11px] text-outline uppercase font-bold block">SLA Countdown</span>
                      <div className="pt-0.5">
                        {renderSlaTimer(selectedOrder.slaRemainingMinutes, selectedOrder.slaRemainingMinutes <= 35)}
                      </div>
                      <span className="text-[11.5px] text-outline block pt-1">
                        Est Completion: ~{selectedOrder.estimatedCompletionTime}
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                      <span className="text-[11px] text-outline uppercase font-bold block">Carrier & Freight</span>
                      <span className="font-bold text-on-surface block mt-0.5">{selectedOrder.carrier}</span>
                      <span className="text-[11.5px] text-outline block">
                        Type: {selectedOrder.shippingType} ({selectedOrder.warehouseZone})
                      </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                      <span className="text-[11px] text-outline uppercase font-bold block">Assigned Picker</span>
                      <span className="font-bold text-on-surface block mt-0.5">{selectedOrder.assignedPicker}</span>
                      <span className="text-[11.5px] text-outline block">Zone B Route Priority</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                      <span className="text-[11px] text-outline uppercase font-bold block">Assigned Packer</span>
                      <span className="font-bold text-on-surface block mt-0.5">{selectedOrder.assignedPacker}</span>
                      <span className="text-[11.5px] text-outline block">Pack Station #4</span>
                    </div>
                  </div>

                  {/* Items Manifest */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-label-caps text-[11px] text-outline uppercase font-bold tracking-wider">
                        Order Item Manifest ({selectedOrder.itemCount} Units • ${selectedOrder.orderValue.toLocaleString()})
                      </h4>
                      <span className="text-[11px] text-outline">Verify Bin Scan</span>
                    </div>

                    <div className="space-y-2">
                      {selectedOrder.items?.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-[13px]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary shrink-0">
                              <span className="material-symbols-outlined text-[18px]">inventory_2</span>
                            </div>
                            <div>
                              <p className="font-bold text-on-surface">{item.name}</p>
                              <div className="flex items-center gap-2 text-[11px] text-outline font-mono">
                                <span>{item.sku}</span>
                                {item.binLocation && <span>• Bin: {item.binLocation}</span>}
                              </div>
                            </div>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-on-surface">Qty: {item.quantity}</span>
                            {item.unitPrice && (
                              <div className="text-[11px] text-outline">${item.unitPrice.toFixed(2)}/unit</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Instructions & Notes */}
                  {selectedOrder.notes && (
                    <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-1">
                      <span className="font-label-caps text-[11px] text-outline uppercase font-bold block">
                        Special Packing & Dispatch Notes
                      </span>
                      <p className="text-[13px] text-on-surface leading-snug">{selectedOrder.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex justify-between items-center">
              <button
                onClick={() => setSelectedOrder(null)}
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
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                Print Packing Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
