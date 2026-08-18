import React, { useState, useMemo } from 'react';
import { WarehouseStats, Recommendation, AutomationLog, PageId, Order, WorkflowEngineState, GlobalOrderFilter } from '../types';
import { WAREHOUSE_MAP_URL, MASCOT_LOGO_URL } from '../mockData';
import { CANONICAL_WORKFLOW_STEPS, mapOrderStatusToStageIndex } from '../workflowEngine';
import { useLanguage } from '../context/LanguageContext';

interface DashboardViewProps {
  stats: WarehouseStats;
  recommendations: Recommendation[];
  automations: AutomationLog[];
  orders: Order[];
  globalOrderFilter?: GlobalOrderFilter;
  onOrderFilterChange?: (filter: GlobalOrderFilter) => void;
  engineState?: WorkflowEngineState;
  onNavigate: (page: PageId) => void;
  onAction: (rec: Recommendation) => void;
  onDismissRecommendation?: (recId: string) => void;
  onExport: () => void;
  onSelectOrderWorkflow?: (orderId: string) => void;
  onToggleAutoDrive?: () => void;
  onStepAllWorkflows?: () => void;
  onSimulateQcDefect?: () => void;
  onOpenSlaRiskModal?: () => void;
  onOpenCriticalSkusModal?: () => void;
  onNavigateToLogisticsFilter?: (filter: string) => void;
  onNavigateToOrdersFilter?: (filter: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  recommendations,
  automations,
  orders,
  globalOrderFilter = 'all',
  onOrderFilterChange,
  engineState,
  onNavigate,
  onAction,
  onDismissRecommendation,
  onExport,
  onSelectOrderWorkflow,
  onToggleAutoDrive,
  onStepAllWorkflows,
  onSimulateQcDefect,
  onOpenSlaRiskModal,
  onOpenCriticalSkusModal,
  onNavigateToLogisticsFilter,
  onNavigateToOrdersFilter
}) => {
  const { t } = useLanguage();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);

  // Filtered orders according to global filter
  const displayedOrders = useMemo(() => {
    if (globalOrderFilter === 'business') {
      return orders.filter((o) => o.orderCategory === 'business');
    }
    if (globalOrderFilter === 'individual') {
      return orders.filter((o) => o.orderCategory === 'individual');
    }
    return orders;
  }, [orders, globalOrderFilter]);

  // Separate B2B & B2C Order collections
  const b2bOrders = useMemo(() => orders.filter((o) => o.orderCategory === 'business'), [orders]);
  const b2cOrders = useMemo(() => orders.filter((o) => o.orderCategory === 'individual'), [orders]);

  // B2B Key Metrics
  const activeB2BCount = b2bOrders.filter((o) => o.currentStatus !== 'Delivered').length;
  const b2bTotalValue = b2bOrders.reduce((sum, o) => sum + o.orderValue, 0);
  const b2bAwaitingFreight = b2bOrders.filter((o) => o.currentStatus === 'Ready for Dispatch' || o.currentStatus === 'Quality Check').length;
  const b2bPalletsStaged = b2bOrders.filter((o) => o.currentStatus === 'Packing' || o.currentStatus === 'Ready for Dispatch').length * 4 + 12;

  // B2C Key Metrics
  const activeB2CCount = b2cOrders.filter((o) => o.currentStatus !== 'Delivered').length;
  const b2cTotalValue = b2cOrders.reduce((sum, o) => sum + o.orderValue, 0);
  const b2cAwaitingCourier = b2cOrders.filter((o) => o.currentStatus === 'Ready for Dispatch' || o.currentStatus === 'Quality Check').length;
  const b2cNearSlaCount = b2cOrders.filter((o) => o.slaRemainingMinutes > 0 && o.slaRemainingMinutes <= 45 && o.currentStatus !== 'Delivered').length;

  // Operational pipeline queues
  const actionableOrders = displayedOrders
    .filter((o) => o.currentStatus !== 'Delivered')
    .slice(0, 4);

  const activeWorkflowOrders = actionableOrders;

  // High priority / SLA at risk orders
  const criticalSlaOrders = displayedOrders
    .filter((o) => o.slaRemainingMinutes <= 45 && o.currentStatus !== 'Delivered')
    .slice(0, 2);

  // Recently completed / dispatched orders for the right-side operational feed
  const recentlyCompletedOrders = displayedOrders
    .filter((o) => o.currentStatus === 'Delivered' || o.currentStatus === 'Dispatched')
    .slice(0, 3);

  // Operational metrics
  const activeOrdersCount = displayedOrders.filter((o) => o.currentStatus !== 'Delivered').length;
  const inPickingCount = displayedOrders.filter(
    (o) => o.currentStatus === 'Inventory Checked' || o.currentStatus === 'Stock Allocated' || o.currentStatus === 'Picking'
  ).length;
  const inPackingCount = displayedOrders.filter((o) => o.currentStatus === 'Packing').length;
  const inQcCount = displayedOrders.filter((o) => o.currentStatus === 'Quality Check').length;
  const readyDispatchCount = displayedOrders.filter((o) => o.currentStatus === 'Ready for Dispatch' || o.currentStatus === 'Dispatched').length;
  const inQueueCount = displayedOrders.filter(
    (o) => o.currentStatus === 'New' || o.currentStatus === 'Priority Assigned' || o.currentStatus === 'Inventory Checked'
  ).length;

  return (
    <div id="dashboard-view" className="p-4 md:p-8 flex flex-col gap-6 md:gap-7 max-w-[1440px] mx-auto w-full">
      {/* 1. Real Operational Command Center Header (Replaces Greeting Hero) */}
      <section id="dashboard-operational-header" className="card-surface rounded-[22px] p-5 md:p-6 shadow-ambient border border-outline-variant/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#BACBB4]/30 text-[#2f432c] text-[11px] font-bold border border-[#BACBB4]/50 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#51604D] animate-ping" />
              Live Facility Operations
            </span>
            <span className="text-[11px] font-mono text-outline flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">schedule</span>
              Last Updated: 18 seconds ago
            </span>
            <span className="px-2 py-0.5 rounded-md bg-surface-container text-outline text-[10.5px] font-mono font-bold">
              Facility Bay-04 • Shift 1
            </span>
          </div>

          <div>
            <h1 className="font-headline-md text-[26px] md:text-[28px] font-bold text-on-surface tracking-tight leading-tight">
              {t('dash.title', 'Warehouse Command Center')}
            </h1>
            <p className="font-body-md text-[13.5px] text-on-surface-variant mt-0.5">
              {t('dash.subtitle', "Today's Warehouse Status • Automated 15-stage fulfillment engine & live decision telemetry.")}
            </p>
          </div>

          {/* Quick Real-Time Status Telemetry & Interactive KPI Strip */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={onOpenSlaRiskModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[12px] font-bold text-rose-800 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title="Click to view exact 8 SLA Risk Orders"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>8 SLA Risks</span>
            </button>

            <button
              onClick={onOpenCriticalSkusModal}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-[12px] font-bold text-amber-800 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title="Click to view exact 17 Critical Inventory SKUs"
            >
              <span className="material-symbols-outlined text-[15px] text-amber-600">warning</span>
              <span>17 Critical SKUs</span>
            </button>

            <button
              onClick={() => onNavigateToLogisticsFilter && onNavigateToLogisticsFilter('ready')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-[12px] font-bold text-emerald-800 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title="Click to view 12 Trucks Ready to Depart"
            >
              <span className="material-symbols-outlined text-[15px] text-emerald-600">local_shipping</span>
              <span>12 Trucks Ready</span>
            </button>

            <button
              onClick={() => onNavigateToLogisticsFilter && onNavigateToLogisticsFilter('delayed')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-[12px] font-bold text-rose-800 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title="Click to view 2 Delayed Shipments"
            >
              <span className="material-symbols-outlined text-[15px] text-rose-600">schedule</span>
              <span>2 Delayed Shipments</span>
            </button>

            <button
              onClick={() => onNavigateToOrdersFilter && onNavigateToOrdersFilter('Dispatched')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-[12px] font-bold text-blue-800 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title="Click to view 24 Dispatched Orders"
            >
              <span className="material-symbols-outlined text-[15px] text-blue-600">outbound</span>
              <span>24 Dispatched</span>
            </button>

            <button
              onClick={() => onNavigateToLogisticsFilter && onNavigateToLogisticsFilter('delivered')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 text-[12px] font-bold text-zinc-800 transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95"
              title="Click to view 31 Delivered Trucks"
            >
              <span className="material-symbols-outlined text-[15px] text-zinc-600">task_alt</span>
              <span>31 Delivered</span>
            </button>
          </div>
        </div>

        {/* Right Header Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-start lg:justify-end">
          <button
            onClick={() => onNavigate('simulation')}
            className="px-4 py-2.5 rounded-xl bg-secondary/15 hover:bg-secondary/25 border border-secondary/40 text-primary font-label-md text-[13px] transition-all flex items-center gap-2 cursor-pointer shadow-xs font-bold"
          >
            <span className="text-[14px]">🤎</span>
            Simulation Twin
          </button>
          <button
            onClick={() => onNavigate('orders')}
            className="px-4 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-[13px] hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-xs font-bold"
          >
            <span className="material-symbols-outlined text-[17px]">account_tree</span>
            Order Pipeline
          </button>
          <button
            id="btn-dashboard-export"
            onClick={onExport}
            className="px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface hover:bg-surface-container-low text-on-surface font-label-md text-[13px] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs font-medium"
          >
            <span className="material-symbols-outlined text-[17px] text-outline">download</span>
            Export Data
          </button>
        </div>
      </section>

      {/* 2. Top Stats Row with Subtle Comparison Metrics */}
      <section id="dashboard-top-stats" className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Stat 1: Warehouse Health */}
        <div 
          id="stat-card-health"
          className="card-surface rounded-[20px] p-5 md:p-6 shadow-ambient flex flex-col justify-between border border-outline-variant/15 hover:border-outline-variant/40 transition-all relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
              Warehouse Health Score
            </span>
            <div className="px-2 py-0.5 bg-[#bacbb4]/30 text-tertiary text-[11px] rounded-lg flex items-center gap-1 font-bold font-mono">
              <span className="material-symbols-outlined text-[13px]">trending_up</span> +{stats.healthScoreDelta}%
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-[34px] text-on-surface font-bold font-mono">{stats.healthScore}</span>
            <span className="font-body-md text-[13px] text-on-surface-variant font-medium">/ 100 Optimal</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/15 text-[11.5px] text-outline">
            <span>↑ 12% vs Yesterday</span>
            <span className="text-[10.5px] font-mono">Updated 18 sec ago</span>
          </div>
        </div>

        {/* Stat 2: Orders Dispatched */}
        <div 
          id="stat-card-orders"
          onClick={() => onNavigate('orders')}
          className="card-surface rounded-[20px] p-5 md:p-6 shadow-ambient flex flex-col justify-between border border-outline-variant/15 hover:border-outline-variant/40 transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
              Orders Dispatched Today
            </span>
            <div className="px-2 py-0.5 bg-[#bacbb4]/30 text-tertiary text-[11px] rounded-lg flex items-center gap-1 font-bold font-mono">
              <span className="material-symbols-outlined text-[13px]">trending_up</span> +{stats.ordersDispatchedDelta}%
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-[34px] text-on-surface font-bold font-mono">
              {stats.ordersDispatched.toLocaleString()}
            </span>
            <span className="text-[12.5px] text-outline font-medium">/ 2,150 Daily Target</span>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-primary h-full rounded-full transition-all duration-700" 
              style={{ width: `${stats.ordersTargetPercent}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 pt-1 text-[11.5px] text-outline">
            <span>↑ 18% vs Weekly Average</span>
            <span className="text-primary font-bold flex items-center gap-0.5 group-hover:underline">
              View {stats.ordersTargetPercent}% <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </span>
          </div>
        </div>

        {/* Stat 3: Productivity Velocity */}
        <div 
          id="stat-card-productivity"
          className="card-surface rounded-[20px] p-5 md:p-6 shadow-ambient flex flex-col justify-between relative overflow-hidden border border-outline-variant/15"
        >
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
              Productivity Velocity
            </span>
            <span className="px-2 py-0.5 bg-surface-container text-on-surface text-[10.5px] font-mono rounded-md font-bold">
              Zone Balanced
            </span>
          </div>
          <div className="flex items-baseline gap-2 relative z-10">
            <span className="font-display-lg text-[34px] text-on-surface font-bold font-mono">{stats.productivityIndex}</span>
            <span className="text-[13px] text-on-surface-variant font-medium">units / picker hr</span>
          </div>

          {/* Minimalist Chart representation */}
          <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-[#fcddc4]/30 to-transparent z-0 flex items-end px-6 gap-2 opacity-50">
            {stats.productivityHourly.map((height, i) => (
              <div
                key={i}
                className="w-full bg-primary/30 rounded-t-sm transition-all duration-500 hover:bg-primary/70"
                style={{ height: `${height}%` }}
                title={`Hour ${i + 1}: ${height}% output`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between mt-2 pt-2 border-t border-outline-variant/15 text-[11.5px] text-outline relative z-10">
            <span>↓ 4% vs Peak Hour</span>
            <span className="text-[10.5px] font-mono">Live Telemetry</span>
          </div>
        </div>
      </section>

      {/* 2.5 Dedicated B2B vs B2C Fulfillment Intelligence Matrix */}
      <section id="dashboard-order-category-matrix" className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: Business Orders (B2B Enterprise) */}
        <div
          id="card-b2b-fulfillment-summary"
          className={`card-surface rounded-[22px] p-5 md:p-6 shadow-ambient border transition-all ${
            globalOrderFilter === 'business'
              ? 'border-primary ring-2 ring-primary/20 bg-primary/[0.02]'
              : 'border-outline-variant/20 hover:border-outline-variant/40'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[22px]">domain</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-sm text-[16px] font-bold text-on-surface">
                    Business Orders (B2B Enterprise)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase font-label-caps">
                    LTL & Freight
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant">
                  Contractual fulfillment for Tier-1 enterprise clients & factory hubs
                </p>
              </div>
            </div>

            {onOrderFilterChange && (
              <button
                onClick={() => onOrderFilterChange(globalOrderFilter === 'business' ? 'all' : 'business')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  globalOrderFilter === 'business'
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface'
                }`}
              >
                {globalOrderFilter === 'business' ? 'Active Filter ✓' : 'Filter B2B'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-outline-variant/15">
            <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
              <span className="text-[10.5px] uppercase font-bold text-outline block">Active B2B Orders</span>
              <span className="font-display-sm text-[20px] font-bold text-primary font-mono block mt-0.5">
                {activeB2BCount}
              </span>
              <span className="text-[10.5px] text-outline truncate block">${(b2bTotalValue / 1000).toFixed(1)}k Pipeline</span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
              <span className="text-[10.5px] uppercase font-bold text-outline block">Contract Deliveries</span>
              <span className="font-display-sm text-[20px] font-bold text-[#2f432c] font-mono block mt-0.5">
                99.4%
              </span>
              <span className="text-[10.5px] text-tertiary truncate block">Tier-1 SLAs Met</span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
              <span className="text-[10.5px] uppercase font-bold text-outline block">Bulk Staging</span>
              <span className="font-display-sm text-[20px] font-bold text-secondary font-mono block mt-0.5">
                {b2bPalletsStaged} Pallets
              </span>
              <span className="text-[10.5px] text-outline truncate block">Bay 04 & 06 Staging</span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
              <span className="text-[10.5px] uppercase font-bold text-outline block">Freight Dispatch</span>
              <span className="font-display-sm text-[20px] font-bold text-on-surface font-mono block mt-0.5">
                {b2bAwaitingFreight} Ready
              </span>
              <span className="text-[10.5px] text-outline truncate block">LTL Carriers Staged</span>
            </div>
          </div>
        </div>

        {/* Card 2: Individual Orders (B2C Consumer) */}
        <div
          id="card-b2c-fulfillment-summary"
          className={`card-surface rounded-[22px] p-5 md:p-6 shadow-ambient border transition-all ${
            globalOrderFilter === 'individual'
              ? 'border-secondary ring-2 ring-secondary/20 bg-secondary/[0.02]'
              : 'border-outline-variant/20 hover:border-outline-variant/40'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 border border-secondary/25 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-[22px]">person</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-headline-sm text-[16px] font-bold text-on-surface">
                    Individual Orders (B2C Consumer)
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-secondary/15 text-secondary text-[10px] font-bold uppercase font-label-caps">
                    Courier & Same-Day
                  </span>
                </div>
                <p className="text-[12px] text-on-surface-variant">
                  High-velocity residential parcel picking, packing & rapid courier dispatch
                </p>
              </div>
            </div>

            {onOrderFilterChange && (
              <button
                onClick={() => onOrderFilterChange(globalOrderFilter === 'individual' ? 'all' : 'individual')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  globalOrderFilter === 'individual'
                    ? 'bg-secondary text-on-secondary shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-outline hover:text-on-surface'
                }`}
              >
                {globalOrderFilter === 'individual' ? 'Active Filter ✓' : 'Filter B2C'}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-outline-variant/15">
            <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
              <span className="text-[10.5px] uppercase font-bold text-outline block">Active B2C Orders</span>
              <span className="font-display-sm text-[20px] font-bold text-secondary font-mono block mt-0.5">
                {activeB2CCount}
              </span>
              <span className="text-[10.5px] text-outline truncate block">${(b2cTotalValue / 1000).toFixed(1)}k Pipeline</span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
              <span className="text-[10.5px] uppercase font-bold text-outline block">Awaiting Dispatch</span>
              <span className="font-display-sm text-[20px] font-bold text-primary font-mono block mt-0.5">
                {b2cAwaitingCourier} Parcels
              </span>
              <span className="text-[10.5px] text-outline truncate block">Door 2 Ready</span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
              <span className="text-[10.5px] uppercase font-bold text-outline block">Consumer Deliveries</span>
              <span className="font-display-sm text-[20px] font-bold text-on-surface font-mono block mt-0.5">
                1,420 pkgs
              </span>
              <span className="text-[10.5px] text-tertiary truncate block">98.6% Same-Day</span>
            </div>

            <div className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/15">
              <span className="text-[10.5px] uppercase font-bold text-outline block">Courier SLA Risk</span>
              <span className="font-display-sm text-[20px] font-bold text-amber-700 font-mono block mt-0.5">
                {b2cNearSlaCount}
              </span>
              <span className="text-[10.5px] text-outline truncate block">&lt;45m Windows</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Two-Column Split Section: Left 65% (Fulfillment & Pipelines) | Right 35% (MUTHU Decision Center & Live Feeds) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================================= */}
        {/* LEFT COLUMN (65% / 7-8 Cols): Pipeline Summary, Pipeline Card & Map */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col gap-6">
          {/* 3. Operational Summary Bar (Compact Status Chips above pipeline) */}
          <section id="pipeline-status-summary-bar" className="card-surface rounded-[18px] p-3.5 shadow-ambient border border-outline-variant/15">
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-base">🤎</span>
                <span className="font-label-caps text-[11px] uppercase font-bold text-outline tracking-wider">
                  Muthu Observed Pipeline Funnel
                </span>
              </div>
              <span className="text-[11px] font-mono text-outline">Live Stage Load</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[12px]">
              <button
                onClick={() => onNavigate('orders')}
                className="p-2 rounded-xl bg-surface-container-low/80 hover:bg-surface-container border border-outline-variant/20 transition-colors text-left sm:text-center"
              >
                <div className="flex items-center justify-between sm:justify-center gap-1">
                  <span className="text-[10px] text-outline uppercase font-bold">Picking</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                </div>
                <span className="text-[16px] font-bold text-on-surface font-mono block mt-0.5">
                  {inPickingCount}
                </span>
                <span className="text-[10px] text-outline block">In Picking</span>
              </button>

              <button
                onClick={() => onNavigate('orders')}
                className="p-2 rounded-xl bg-surface-container-low/80 hover:bg-surface-container border border-outline-variant/20 transition-colors text-left sm:text-center"
              >
                <div className="flex items-center justify-between sm:justify-center gap-1">
                  <span className="text-[10px] text-outline uppercase font-bold">Packing</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                </div>
                <span className="text-[16px] font-bold text-on-surface font-mono block mt-0.5">
                  {inPackingCount}
                </span>
                <span className="text-[10px] text-outline block">In Packing</span>
              </button>

              <button
                onClick={() => onNavigate('orders')}
                className="p-2 rounded-xl bg-surface-container-low/80 hover:bg-surface-container border border-outline-variant/20 transition-colors text-left sm:text-center"
              >
                <div className="flex items-center justify-between sm:justify-center gap-1">
                  <span className="text-[10px] text-outline uppercase font-bold">QC Check</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                </div>
                <span className="text-[16px] font-bold text-on-surface font-mono block mt-0.5">
                  {inQcCount}
                </span>
                <span className="text-[10px] text-outline block">In QC Desk</span>
              </button>

              <button
                onClick={() => onNavigate('orders')}
                className="p-2 rounded-xl bg-surface-container-low/80 hover:bg-surface-container border border-outline-variant/20 transition-colors text-left sm:text-center"
              >
                <div className="flex items-center justify-between sm:justify-center gap-1">
                  <span className="text-[10px] text-outline uppercase font-bold">Ready</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#51604D]" />
                </div>
                <span className="text-[16px] font-bold text-tertiary font-mono block mt-0.5">
                  {readyDispatchCount}
                </span>
                <span className="text-[10px] text-outline block">Ready Dispatch</span>
              </button>

              <button
                onClick={() => onNavigate('orders')}
                className="p-2 rounded-xl bg-surface-container-low/80 hover:bg-surface-container border border-outline-variant/20 transition-colors text-left sm:text-center col-span-2 sm:col-span-1"
              >
                <div className="flex items-center justify-between sm:justify-center gap-1">
                  <span className="text-[10px] text-outline uppercase font-bold">Done Today</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BACBB4]" />
                </div>
                <span className="text-[16px] font-bold text-tertiary font-mono block mt-0.5">
                  {stats.ordersDispatched}
                </span>
                <span className="text-[10px] text-outline block">Completed Today</span>
              </button>
            </div>
          </section>

          {/* 4. Integrated Pipeline Card with Integrated Workflow Engine Bar */}
          <section id="dashboard-workflow-pipeline-card" className="card-surface rounded-[22px] p-5 md:p-6 shadow-ambient border border-outline-variant/20 space-y-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[18px]">account_tree</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-headline-sm text-[16.5px] font-bold text-on-surface leading-tight">
                      Active Warehouse Lifecycle Pipelines
                    </h3>
                    <span className="text-[10.5px] px-2 py-0.2 rounded bg-primary/10 text-primary font-bold font-mono">
                      15 Stages
                    </span>
                  </div>
                  <p className="text-[12px] text-on-surface-variant">
                    Live orders progressing through automated WMS lifecycle transitions.
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigate('orders')}
                className="text-[12.5px] font-bold text-primary hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
              >
                <span>View All ({orders.length})</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>

            {/* INTEGRATED WORKFLOW ENGINE BAR (Requirement 4: Displayed inside pipeline card) */}
            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/25 text-on-surface space-y-2.5">
              {/* Telemetry Row */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11.5px] pb-2 border-b border-outline-variant/20">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-primary">groups</span>
                    <span className="text-outline">Active Workers:</span>
                    <span className="font-bold text-on-surface">14 on Shift</span>
                  </div>
                  <span className="text-outline-variant/40 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-secondary">pending_actions</span>
                    <span className="text-outline">Queue Length:</span>
                    <span className="font-bold text-on-surface">{inQueueCount} Orders</span>
                  </div>
                  <span className="text-outline-variant/40 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-tertiary">speed</span>
                    <span className="text-outline">Throughput:</span>
                    <span className="font-bold text-tertiary">94 pkgs/hr</span>
                  </div>
                  <span className="text-outline-variant/40 hidden sm:inline">•</span>
                  <div className="flex items-center gap-1.5 font-medium">
                    <span className="material-symbols-outlined text-[15px] text-primary">sync</span>
                    <span className="text-outline">In Progress:</span>
                    <span className="font-bold text-primary">{activeOrdersCount} Active</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-mono text-outline">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                  <span>Auto Workflow Status: {engineState?.isLiveAutoDrive ? 'Live Active' : 'Manual'}</span>
                </div>
              </div>

              {/* Controls & Quick Selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5">
                <div className="relative w-full sm:w-[320px]">
                  <select
                    id="select-dashboard-pipeline-order"
                    onChange={(e) => {
                      if (e.target.value && onSelectOrderWorkflow) {
                        onSelectOrderWorkflow(e.target.value);
                      }
                    }}
                    defaultValue=""
                    className="w-full pl-3 pr-8 py-1.5 rounded-xl bg-surface border border-outline-variant/30 text-on-surface font-label-md text-[12px] shadow-2xs cursor-pointer outline-none truncate"
                  >
                    <option value="" disabled>
                      Inspect Order Workflow (320px)...
                    </option>
                    {orders.slice(0, 15).map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.orderNumber} ({o.customerName}) — {o.currentStatus}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  {onStepAllWorkflows && (
                    <button
                      id="btn-pipeline-step-next"
                      onClick={onStepAllWorkflows}
                      className="px-2.5 py-1.5 rounded-xl bg-surface hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-label-md text-[11.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      title="Advance all active orders to next stage"
                    >
                      <span className="material-symbols-outlined text-[14px]">fast_forward</span>
                      Step Next
                    </button>
                  )}

                  {onSimulateQcDefect && (
                    <button
                      id="btn-pipeline-test-qc"
                      onClick={onSimulateQcDefect}
                      className="px-2.5 py-1.5 rounded-xl bg-error-container/30 text-error hover:bg-error-container/60 border border-error/25 text-[11.5px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Test QC incident loop"
                    >
                      <span className="material-symbols-outlined text-[14px]">report_problem</span>
                      QC Test
                    </button>
                  )}

                  {onToggleAutoDrive && (
                    <button
                      id="btn-pipeline-autodrive"
                      onClick={onToggleAutoDrive}
                      className={`px-3 py-1.5 rounded-xl font-label-md text-[11.5px] font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                        engineState?.isLiveAutoDrive
                          ? 'bg-primary text-on-primary hover:bg-primary/90'
                          : 'bg-surface-container-highest text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {engineState?.isLiveAutoDrive ? 'pause' : 'play_arrow'}
                      </span>
                      {engineState?.isLiveAutoDrive ? 'Pause Auto' : 'Auto-Drive'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Compact 2x2 Grid of Active Order Workflows */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeWorkflowOrders.map((order) => {
                const currentStageIndex = mapOrderStatusToStageIndex(order.currentStatus);
                const currentStage = CANONICAL_WORKFLOW_STEPS[currentStageIndex] || CANONICAL_WORKFLOW_STEPS[0];
                const progressPercent = Math.round(((currentStageIndex + 1) / 15) * 100);

                return (
                  <div
                    key={order.id}
                    onClick={() => onSelectOrderWorkflow && onSelectOrderWorkflow(order.id)}
                    className="p-3 rounded-xl bg-surface-container-low/70 border border-outline-variant/20 hover:border-primary/40 hover:bg-surface-container-low transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-[12px] font-bold text-primary">{order.orderNumber}</span>
                        <span className="px-1.5 py-0.2 rounded text-[9.5px] font-bold uppercase bg-surface-container text-on-surface-variant">
                          {order.shippingType}
                        </span>
                        <span className="text-[11.5px] font-bold text-on-surface truncate group-hover:text-primary transition-colors max-w-[110px]">
                          {order.customerName}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10.5px] font-bold font-mono shrink-0">
                        {progressPercent}%
                      </span>
                    </div>

                    {/* Active Stage & Worker Bar */}
                    <div className="px-2.5 py-1.5 rounded-lg bg-surface border border-outline-variant/15 text-[11px] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping shrink-0" />
                        <span className="font-bold text-on-surface truncate">{currentStage.label}</span>
                      </div>
                      <span className="text-[10px] text-outline font-medium shrink-0">
                        {order.assignedPicker || currentStage.defaultWorker}
                      </span>
                    </div>

                    {/* Compact 15-Dot Mini Stepper */}
                    <div className="flex items-center gap-1 pt-0.5">
                      {CANONICAL_WORKFLOW_STEPS.map((st, sIdx) => {
                        const isPassed = sIdx < currentStageIndex;
                        const isCurrent = sIdx === currentStageIndex;
                        return (
                          <div
                            key={st.id}
                            className={`h-1.5 flex-1 rounded-full transition-all ${
                              isCurrent
                                ? 'bg-primary animate-pulse'
                                : isPassed
                                ? 'bg-[#BACBB4]'
                                : 'bg-surface-container-high'
                            }`}
                            title={`Stage ${sIdx + 1}: ${st.label}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Status Line */}
            <div className="flex items-center justify-between pt-1 px-1 text-[11px] text-outline">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 text-on-surface">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BACBB4]" /> Completed Steps
                </span>
                <span className="flex items-center gap-1 text-on-surface">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Active In-Flight
                </span>
              </div>
              <span className="font-mono">Click any pipeline to inspect full audit timeline</span>
            </div>
          </section>

          {/* 5. Interactive Warehouse Map & Zone Telemetry */}
          <section id="dashboard-zone-map" className="card-surface rounded-[22px] p-5 md:p-6 shadow-ambient border border-outline-variant/15 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">🤎</span>
                  <h3 className="font-headline-sm text-[16px] font-bold text-on-surface">
                    Muthu Verified Zone Activity & Picker Routing
                  </h3>
                </div>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  Facility Bay-04 live routing paths, congestion bottlenecks, and loading bays.
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-surface-container text-[10.5px] font-mono font-bold text-outline">
                Live 2 min ago
              </span>
            </div>

            {/* Map Container */}
            <div className="card-surface rounded-[18px] p-1 shadow-inner border border-outline-variant/20 overflow-hidden h-[220px] relative">
              <div
                className="w-full h-full bg-cover bg-center rounded-[14px] relative"
                style={{ backgroundImage: `url('${WAREHOUSE_MAP_URL}')` }}
              >
                {/* Node 1: Zone A */}
                <button
                  id="map-node-zone-a"
                  onClick={() => setSelectedZone('Zone A - Bulk Furniture & Aisle 1-4 (98% Speed, 4 Pickers Active)')}
                  className="absolute top-[28%] left-[38%] w-4 h-4 bg-tertiary rounded-full animate-pulse shadow-[0_0_12px_rgba(81,96,77,0.9)] ring-4 ring-tertiary/20 cursor-pointer"
                  title="Zone A: Picking optimal"
                />

                {/* Node 2: Zone B Bottleneck */}
                <button
                  id="map-node-zone-b"
                  onClick={() => setSelectedZone('Zone B - Pack Station #2 (Bottleneck: 15% slower throughput)')}
                  className="absolute top-[58%] left-[22%] w-4 h-4 bg-error rounded-full animate-pulse shadow-[0_0_12px_rgba(186,26,26,0.9)] ring-4 ring-error/20 cursor-pointer"
                  title="Zone B: Bottleneck detected"
                />

                {/* Node 3: Outbound Dock */}
                <button
                  id="map-node-dock-bay"
                  onClick={() => setSelectedZone('Outbound Docks - Staging Lane 4 (FedEx Carrier Loading)')}
                  className="absolute top-[48%] left-[72%] w-4 h-4 bg-primary rounded-full shadow-[0_0_12px_rgba(113,87,67,0.9)] ring-4 ring-primary/20 cursor-pointer"
                  title="Dock 4: Outbound staging"
                />

                {/* Zone Tooltip Overlay */}
                {selectedZone && (
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-surface-container-lowest/95 backdrop-blur-md px-3 py-2 rounded-xl text-[12px] font-label-md text-on-surface shadow-md flex justify-between items-center border border-outline-variant/30 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2 truncate">
                      <span className="material-symbols-outlined text-primary text-[16px]">info</span>
                      <span className="truncate">{selectedZone}</span>
                    </div>
                    <button
                      onClick={() => setSelectedZone(null)}
                      className="text-outline hover:text-on-surface ml-2 p-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Zone Telemetry Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px]">
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15">
                <div className="text-[9.5px] uppercase font-bold text-outline">Zone A (Heavy)</div>
                <div className="font-bold text-on-surface mt-0.5">92% Capacity</div>
                <div className="text-[10px] text-tertiary font-medium">↑ 4.5% vs Last Hour</div>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15">
                <div className="text-[9.5px] uppercase font-bold text-outline">Zone B (Tech)</div>
                <div className="font-bold text-on-surface mt-0.5">78% Capacity</div>
                <div className="text-[10px] text-error font-medium">↓ 15% bottleneck</div>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15">
                <div className="text-[9.5px] uppercase font-bold text-outline">Zone C (Pack)</div>
                <div className="font-bold text-on-surface mt-0.5">86% Capacity</div>
                <div className="text-[10px] text-tertiary font-medium">Optimal flow</div>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15">
                <div className="text-[9.5px] uppercase font-bold text-outline">Dock Staging</div>
                <div className="font-bold text-on-surface mt-0.5">64% Capacity</div>
                <div className="text-[10px] text-primary font-medium">3 Trucks Loading</div>
              </div>
            </div>
          </section>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN (35% / 4-5 Cols): Primary MUTHU Decision Center & Real-Time Feeds */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col gap-6">
          {/* 2. ENHANCED MUTHU DECISION CENTER (Increased Height & Prominence) */}
          <section id="dashboard-muthu-decision-center" className="card-surface rounded-[22px] p-5 md:p-6 shadow-ambient-lg border-2 border-primary/20 space-y-4 bg-gradient-to-b from-surface-container-lowest via-surface-container-lowest to-surface-container-low/40">
            {/* Mascot Title Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2.5">
                <img
                  src={MASCOT_LOGO_URL}
                  alt="MUTHU Mascot"
                  className="w-9 h-9 rounded-xl object-contain bg-primary/10 border border-primary/25 p-1 shadow-xs"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">🤎</span>
                    <h3 className="font-headline-sm text-[17px] font-bold text-on-surface leading-tight">
                      Muthu Recommends
                    </h3>
                  </div>
                  <p className="text-[11.5px] text-on-surface-variant">
                    Autonomous operations engine • Primary Decision Center
                  </p>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold font-mono border border-primary/20">
                {recommendations.length} Pending
              </span>
            </div>

            {/* Detailed Recommendation Cards */}
            <div className="space-y-4">
              {recommendations.map((rec) => {
                const priority = rec.priority || (rec.type === 'urgent' ? 'Critical' : rec.type === 'warning' ? 'High' : 'Medium');
                const isCritical = priority === 'Critical' || rec.type === 'urgent';
                const isHigh = priority === 'High' || rec.type === 'warning';

                return (
                  <div
                    key={rec.id}
                    id={`rec-card-${rec.id}`}
                    className="p-4 rounded-2xl bg-surface border border-outline-variant/30 hover:border-primary/50 transition-all shadow-xs space-y-3 relative group"
                  >
                    {/* Header: Priority & Confidence */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                            isCritical
                              ? 'bg-error-container text-error border border-error/30'
                              : isHigh
                              ? 'bg-secondary-container text-secondary border border-secondary/30'
                              : 'bg-tertiary-container/30 text-tertiary border border-tertiary/30'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          Priority: {priority}
                        </span>
                        <span className="text-[11px] font-mono text-outline font-bold">
                          {rec.badgeText || 'AI Alert'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11.5px] font-mono font-bold text-tertiary bg-[#BACBB4]/20 px-2 py-0.5 rounded-md">
                        <span className="material-symbols-outlined text-[13px]">verified</span>
                        <span>{rec.confidence || 96}% Conf.</span>
                      </div>
                    </div>

                    {/* Problem Statement */}
                    <div>
                      <span className="text-[10px] font-bold uppercase text-outline tracking-wider block">Problem</span>
                      <p className="text-[13.5px] font-bold text-on-surface leading-snug">
                        {rec.problem || rec.title}
                      </p>
                    </div>

                    {/* Reason & Root Cause */}
                    <div className="p-2.5 rounded-xl bg-surface-container-low/80 border border-outline-variant/15 text-[12px] space-y-1">
                      <div>
                        <span className="text-[10px] font-bold uppercase text-outline">Reason:</span>
                        <p className="text-on-surface-variant font-medium mt-0.5">
                          {rec.reason || rec.description}
                        </p>
                      </div>

                      {/* Business Impact */}
                      <div className="pt-1 border-t border-outline-variant/15">
                        <span className="text-[10px] font-bold uppercase text-outline">Business Impact:</span>
                        <p className="text-error font-bold text-[12px] mt-0.5">
                          {rec.businessImpact || 'Risk of SLA violation penalty fee.'}
                        </p>
                      </div>

                      {/* Recommended Action */}
                      <div className="pt-1 border-t border-outline-variant/15">
                        <span className="text-[10px] font-bold uppercase text-primary">Recommended Action:</span>
                        <p className="text-on-surface font-semibold text-[12px] mt-0.5">
                          {rec.recommendedAction || rec.actionText}
                        </p>
                      </div>

                      {/* Estimated Improvement */}
                      {rec.estimatedImprovement && (
                        <div className="pt-1 text-[11px] font-mono text-tertiary font-bold flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px]">trending_up</span>
                          <span>Est. Improvement: {rec.estimatedImprovement}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions: Approve / Dismiss / View Details */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        id={`btn-approve-rec-${rec.id}`}
                        onClick={() => onAction(rec)}
                        className="flex-1 py-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 font-label-md text-[12.5px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span className="material-symbols-outlined text-[15px]">check</span>
                        Approve
                      </button>

                      <button
                        onClick={() => onNavigate('decision')}
                        className="px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant/30 text-on-surface font-label-md text-[12px] font-medium transition-colors cursor-pointer"
                        title="Simulate impact in Decision Workspace"
                      >
                        Details
                      </button>

                      {onDismissRecommendation && (
                        <button
                          onClick={() => onDismissRecommendation(rec.id)}
                          className="p-2 rounded-xl hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
                          title="Dismiss Recommendation"
                        >
                          <span className="material-symbols-outlined text-[17px]">close</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-1 flex items-center justify-between text-[11px] text-outline">
              <span className="flex items-center gap-1">
                <span>🤎</span> Muthu Auto-Orchestrator v2.4
              </span>
              <span className="font-mono">Updated 18 sec ago</span>
            </div>
          </section>

          {/* 6. Critical Logistics & Carrier Cutoff Timers */}
          <section id="dashboard-carrier-cutoffs" className="card-surface rounded-[22px] p-5 shadow-ambient border border-outline-variant/15 space-y-3.5">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🤎</span>
                <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
                  Muthu Tracked Carrier Departures
                </span>
              </div>
              <span className="text-[11px] text-tertiary font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping" /> Live Docks
              </span>
            </div>

            <div className="space-y-2 text-[12.5px]">
              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#fcddc4]/60 text-primary flex items-center justify-center font-bold text-[11px]">
                    FX
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block leading-tight">FedEx Ground #408</span>
                    <span className="text-[11px] text-outline">Bay 4 • 24 Parcels</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-error block text-[12px]">38 mins</span>
                  <span className="text-[10px] text-outline uppercase font-mono">Cutoff</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-secondary/15 text-secondary flex items-center justify-center font-bold text-[11px]">
                    DH
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block leading-tight">DHL Express Priority</span>
                    <span className="text-[11px] text-outline">Bay 2 • 12 Parcels</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-secondary block text-[12px]">1h 12m</span>
                  <span className="text-[10px] text-outline uppercase font-mono">Cutoff</span>
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/15 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md bg-[#bacbb4]/40 text-[#2f432c] flex items-center justify-center font-bold text-[11px]">
                    LT
                  </div>
                  <div>
                    <span className="font-bold text-on-surface block leading-tight">Freight LTL Pallet Batch</span>
                    <span className="text-[11px] text-outline">Bay 6 • 8 Pallets</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-tertiary block text-[12px]">2h 45m</span>
                  <span className="text-[10px] text-outline uppercase font-mono">Cutoff</span>
                </div>
              </div>
            </div>
          </section>

          {/* 7. Real-Time Events Feed & Muthu Updated Logs */}
          <section id="dashboard-automations" className="card-surface rounded-[22px] p-5 shadow-ambient border border-outline-variant/15 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🤎</span>
                <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
                  Muthu Updated Events
                </span>
              </div>
              <span className="text-[10.5px] font-mono text-outline">Just Updated</span>
            </div>

            <div className="space-y-2">
              {automations.slice(0, 3).map((auto) => (
                <div
                  key={auto.id}
                  className="p-2.5 rounded-xl bg-surface-container-low/70 border border-outline-variant/15 flex items-start gap-2.5 text-[12px]"
                >
                  <span className="material-symbols-outlined text-tertiary text-[16px] mt-0.5 shrink-0">
                    check_circle
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-on-surface font-medium leading-tight">{auto.title}</p>
                    <div className="flex items-center justify-between mt-1 text-[10.5px] text-outline">
                      <span>{auto.zone}</span>
                      <span className="font-mono">{auto.timeAgo}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 8. Recently Completed / Dispatched Orders */}
          <section id="dashboard-completed-orders" className="card-surface rounded-[22px] p-5 shadow-ambient border border-outline-variant/15 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">🤎</span>
                <span className="font-label-caps text-[11px] text-outline uppercase tracking-wider font-bold">
                  Muthu Verified Dispatches
                </span>
              </div>
              <span className="material-symbols-outlined text-[16px] text-tertiary">local_shipping</span>
            </div>

            <div className="space-y-2">
              {recentlyCompletedOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => onSelectOrderWorkflow && onSelectOrderWorkflow(ord.id)}
                  className="p-2.5 rounded-xl bg-surface-container-low/60 border border-outline-variant/15 flex items-center justify-between text-[12px] hover:bg-surface-container-low transition-colors cursor-pointer"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-on-surface">{ord.orderNumber}</span>
                      <span className="text-[9.5px] px-1.5 py-0.2 rounded bg-[#bacbb4]/30 text-[#2f432c] font-bold">
                        {ord.currentStatus}
                      </span>
                    </div>
                    <span className="text-[11px] text-outline block mt-0.5 truncate max-w-[150px]">
                      {ord.customerName} • {ord.itemCount} items
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-on-surface text-[12px] font-mono">${ord.orderValue.toLocaleString()}</span>
                    <span className="text-[10px] text-outline block">{ord.carrier}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
