import React, { useState } from 'react';
import { MonthlyOperationsReport } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface ReportsViewProps {
  reports: MonthlyOperationsReport[];
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ reports, onShowToast }) => {
  const { t } = useLanguage();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);
  const activeReport = reports[selectedMonthIndex] || reports[0];

  return (
    <div id="reports-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
              Executive Auditing & Business Impact
            </span>
            <span className="text-xs text-zinc-500 font-medium font-mono">• Monthly Operations Ledger</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
            Monthly Operations & Profitability Reports
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Consolidated operational breakdown across Orders, Logistics, Workforce, Inventory, Equipment, and Simulated Business Impact.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onShowToast('Exporting PDF', `Generating PDF report for ${activeReport.month}...`, 'info')}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">picture_as_pdf</span>
            <span>Export Monthly PDF</span>
          </button>

          <button
            onClick={() => onShowToast('Exporting CSV', `Downloaded CSV ledger for ${activeReport.month}.`, 'success')}
            className="px-4 py-2 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Month Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 font-mono">
          Report Period:
        </span>
        {reports.map((rep, idx) => (
          <button
            key={rep.month}
            onClick={() => setSelectedMonthIndex(idx)}
            className={`px-4 py-2 rounded-xl font-bold shrink-0 transition-all cursor-pointer border ${
              selectedMonthIndex === idx
                ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                : 'bg-white text-zinc-700 border-zinc-250 hover:bg-zinc-100'
            }`}
          >
            {rep.month}
          </button>
        ))}
      </div>

      {/* ========================================================================= */}
      {/* SECTION 15: MUTHU'S MONTHLY OPERATIONS SUMMARY */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/70 to-amber-500/10 rounded-3xl p-6 md:p-8 border border-amber-300 shadow-xs space-y-6">
        <div className="flex items-center gap-3 border-b border-amber-200/80 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 font-bold flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-3xl">smart_toy</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 font-mono">
              Executive Operations Summary • {activeReport.month}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-zinc-900">
              Muthu's Monthly Operations Summary
            </h2>
          </div>
        </div>

        <p className="text-xs md:text-sm text-zinc-800 leading-relaxed font-medium bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs">
          "{activeReport.executiveSummary}"
        </p>

        {/* 7 Key Executive Highlights Grid (Section 15) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 space-y-1 shadow-2xs">
            <span className="font-bold text-emerald-800 block uppercase text-[10px] font-mono">🏆 Top Achievement</span>
            <p className="text-zinc-800 font-semibold">{activeReport.topAchievement}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-rose-200 space-y-1 shadow-2xs">
            <span className="font-bold text-rose-800 block uppercase text-[10px] font-mono">⚠️ Biggest Risk</span>
            <p className="text-zinc-800 font-semibold">{activeReport.biggestRisk}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-1 shadow-2xs">
            <span className="font-bold text-amber-900 block uppercase text-[10px] font-mono">⚙️ Primary Bottleneck</span>
            <p className="text-zinc-800 font-semibold">{activeReport.primaryBottleneck}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200 space-y-1 shadow-2xs">
            <span className="font-bold text-zinc-600 block uppercase text-[10px] font-mono">👤 Top Performer</span>
            <p className="text-zinc-900 font-bold">{activeReport.topPerformerName}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200 space-y-1 shadow-2xs">
            <span className="font-bold text-zinc-600 block uppercase text-[10px] font-mono">🔧 Equipment Risk</span>
            <p className="text-zinc-900 font-semibold">{activeReport.equipmentRiskName}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-zinc-200 space-y-1 shadow-2xs">
            <span className="font-bold text-zinc-600 block uppercase text-[10px] font-mono">📦 Inventory Risk</span>
            <p className="text-zinc-900 font-semibold">{activeReport.inventoryRiskItem}</p>
          </div>
        </div>

        {/* Muthu Top Recommendation Callout (Section 15) */}
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-400 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-bold text-amber-900 uppercase text-[10px] block font-mono">Muthu's Top Recommendation:</span>
            <p className="text-zinc-950 font-bold text-xs md:text-sm">{activeReport.muthuTopRecommendation}</p>
          </div>
          <span className="px-3.5 py-1.5 bg-amber-600 text-white rounded-xl font-bold shrink-0 shadow-2xs text-center">
            Action Recommended
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 14: CATEGORIZED OPERATIONAL BREAKDOWN (6 PILLARS) */}
      {/* ========================================================================= */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-zinc-900">Comprehensive Operational Breakdown</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. ORDERS */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
              <span className="material-symbols-outlined text-amber-600">shopping_cart</span>
              <h4 className="font-bold text-zinc-900 text-sm">ORDERS FULFILLMENT</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Received</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.orders.received}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Picked</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.orders.picked}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Packed</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.orders.packed}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Dispatched</span>
                <span className="font-bold font-mono text-emerald-700 text-sm">{activeReport.orders.dispatched}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Delivered</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.orders.delivered}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Delayed / Cancel</span>
                <span className="font-bold font-mono text-rose-700 text-sm">
                  {activeReport.orders.delayed} / {activeReport.orders.cancelled}
                </span>
              </div>
            </div>
          </div>

          {/* 2. LOGISTICS */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
              <span className="material-symbols-outlined text-amber-600">local_shipping</span>
              <h4 className="font-bold text-zinc-900 text-sm">LOGISTICS & FLEET</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Trucks Dispatched</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.logistics.trucksDispatched}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Trucks Delivered</span>
                <span className="font-bold font-mono text-emerald-700 text-sm">{activeReport.logistics.trucksDelivered}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Trucks Returning</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.logistics.trucksReturning}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Avg Dispatch Time</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.logistics.avgDispatchMinutes} mins</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Avg Delivery Time</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.logistics.avgDeliveryHours} hrs</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Delayed Shipments</span>
                <span className="font-bold font-mono text-rose-700 text-sm">{activeReport.logistics.delayedShipmentsCount}</span>
              </div>
            </div>
          </div>

          {/* 3. WORKFORCE */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
              <span className="material-symbols-outlined text-amber-600">group</span>
              <h4 className="font-bold text-zinc-900 text-sm">WORKFORCE VELOCITY</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Workers Active</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.workforce.workersActive}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Packages Picked</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.workforce.packagesPicked.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Packages Packed</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.workforce.packagesPacked.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Avg Productivity</span>
                <span className="font-bold font-mono text-amber-700 text-sm">{activeReport.workforce.avgProductivityScore}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">SLA Contribution</span>
                <span className="font-bold font-mono text-emerald-700 text-sm">{activeReport.workforce.slaContributionPercent}%</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Attendance</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.workforce.attendancePercent}%</span>
              </div>
            </div>
          </div>

          {/* 4. INVENTORY */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
              <span className="material-symbols-outlined text-amber-600">inventory_2</span>
              <h4 className="font-bold text-zinc-900 text-sm">INVENTORY INTEGRITY</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Units Processed</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.inventory.unitsProcessed.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Low Stock Events</span>
                <span className="font-bold font-mono text-amber-700 text-sm">{activeReport.inventory.lowStockEventsCount}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Out-of-Stock</span>
                <span className="font-bold font-mono text-rose-700 text-sm">{activeReport.inventory.outOfStockEventsCount}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Damaged Items</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.inventory.damagedItemsCount}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl col-span-2">
                <span className="text-zinc-400 block text-[10px]">Supplier Reorders Triggered</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.inventory.reordersTriggeredCount} Purchase Orders</span>
              </div>
            </div>
          </div>

          {/* 5. EQUIPMENT */}
          <div className="bg-white rounded-2xl p-5 border border-zinc-200 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-zinc-100 pb-2">
              <span className="material-symbols-outlined text-amber-600">precision_manufacturing</span>
              <h4 className="font-bold text-zinc-900 text-sm">EQUIPMENT & MACHINERY</h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Machines Deployed</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.equipment.machinesUsedCount}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Maintenance Events</span>
                <span className="font-bold font-mono text-amber-700 text-sm">{activeReport.equipment.maintenanceEventsCount}</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Downtime Hours</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{activeReport.equipment.downtimeHours} hrs</span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl">
                <span className="text-zinc-400 block text-[10px]">Backup Usage</span>
                <span className="font-bold font-mono text-emerald-700 text-sm">{activeReport.equipment.backupEquipmentUsageHours} hrs</span>
              </div>
            </div>
          </div>

          {/* 6. BUSINESS IMPACT (Clearly Labeled Simulated/Estimated/Projected) */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
              <span className="material-symbols-outlined text-emerald-700">payments</span>
              <h4 className="font-bold text-zinc-900 text-sm">PROFITABILITY & BUSINESS IMPACT</h4>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex justify-between items-center">
                <span className="text-emerald-900 font-bold text-[10.5px] uppercase">Estimated Revenue Supported:</span>
                <span className="font-extrabold font-mono text-emerald-950 text-sm">
                  ₹{(activeReport.businessImpact.estimatedRevenueSupportedInr / 100000).toFixed(1)}L
                </span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl flex justify-between items-center">
                <span className="text-zinc-500">Order Value Fulfilled:</span>
                <span className="font-bold font-mono text-zinc-900">
                  ₹{(activeReport.businessImpact.orderValueFulfilledInr / 100000).toFixed(1)}L
                </span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl flex justify-between items-center">
                <span className="text-zinc-500">Estimated Delay Cost:</span>
                <span className="font-bold font-mono text-rose-700">
                  ₹{activeReport.businessImpact.estimatedDelayCostInr.toLocaleString()}
                </span>
              </div>
              <div className="p-2.5 bg-zinc-50 rounded-xl flex justify-between items-center">
                <span className="text-zinc-500">Projected Improvement:</span>
                <span className="font-bold font-mono text-emerald-700">
                  +{activeReport.businessImpact.projectedImprovementPercent}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
