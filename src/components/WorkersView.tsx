import React, { useState, useMemo } from 'react';
import { Worker, WorkerRole, WorkerPerformanceStatus, WorkerAvailability, WorkerRecognitionCategory } from '../types';
import { MONTHLY_WORKFORCE_HISTORY, MonthlyWorkforceRecord } from '../workersData';
import { useLanguage } from '../context/LanguageContext';

interface WorkersViewProps {
  workers: Worker[];
  onApproveBonus: (workerId: string) => void;
  onReallocateWorker: (workerId: string, targetZone: string) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const WorkersView: React.FC<WorkersViewProps> = ({
  workers,
  onApproveBonus,
  onReallocateWorker,
  onShowToast
}) => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'roster' | 'recognition' | 'bonuses' | 'monthly_report'>('roster');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [shiftFilter, setShiftFilter] = useState<string>('All');
  const [zoneFilter, setZoneFilter] = useState<string>('All');
  const [performanceFilter, setPerformanceFilter] = useState<string>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('All');
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(0);

  // Summary Metrics calculated directly from mock worker records
  const metrics = useMemo(() => {
    const total = workers.length;
    const activeToday = workers.filter((w) => w.availability === 'On Shift' || w.availability === 'Overloaded').length;
    const onLeave = workers.filter((w) => w.availability === 'On Leave').length;
    const available = workers.filter((w) => w.availability === 'Available').length;
    const overloaded = workers.filter((w) => w.availability === 'Overloaded' || w.currentWorkloadPercent > 100).length;
    const avgProductivity = Math.round(workers.reduce((acc, w) => acc + w.productivityScore, 0) / (total || 1));
    const totalPackages = workers.reduce((acc, w) => acc + w.packagesPicked + w.packagesPacked, 0);
    const avgProcTime = (workers.reduce((acc, w) => acc + w.avgProcessingTimeMinutes, 0) / (total || 1)).toFixed(1);
    const totalRevenueSupported = workers.reduce((acc, w) => acc + w.estimatedRevenueSupportedInr, 0);

    return {
      total,
      activeToday,
      onLeave,
      available,
      overloaded,
      avgProductivity,
      totalPackages,
      avgProcTime,
      totalRevenueSupported
    };
  }, [workers]);

  // Filtered workers list
  const filteredWorkers = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return workers.filter((w) => {
      const matchesSearch =
        !q ||
        w.name.toLowerCase().includes(q) ||
        w.workerId.toLowerCase().includes(q) ||
        w.role.toLowerCase().includes(q) ||
        w.zone.toLowerCase().includes(q);

      const matchesRole = roleFilter === 'All' || w.role === roleFilter;
      const matchesShift = shiftFilter === 'All' || w.shift === shiftFilter;
      const matchesZone = zoneFilter === 'All' || w.zone.includes(zoneFilter);
      const matchesPerf = performanceFilter === 'All' || w.performanceStatus === performanceFilter;
      const matchesAvail = availabilityFilter === 'All' || w.availability === availabilityFilter;

      return matchesSearch && matchesRole && matchesShift && matchesZone && matchesPerf && matchesAvail;
    });
  }, [workers, searchQuery, roleFilter, shiftFilter, zoneFilter, performanceFilter, availabilityFilter]);

  const rolesList: WorkerRole[] = [
    'Picker',
    'Packer',
    'Quality Inspector',
    'Warehouse Associate',
    'Loader',
    'Dispatcher',
    'Driver',
    'Supervisor',
    'Maintenance Technician'
  ];

  const currentMonthlyReport: MonthlyWorkforceRecord = MONTHLY_WORKFORCE_HISTORY[selectedMonthIndex] || MONTHLY_WORKFORCE_HISTORY[0];

  return (
    <div id="workers-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
              Workforce Intelligence
            </span>
            <span className="text-xs text-zinc-500 font-medium font-mono">• {workers.length} Personnel Active Roster</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
            Workers & Workforce Management
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Real-time floor productivity tracking, SLA contributions, estimated revenue supported, and Muthu workload optimization.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onShowToast('Exporting Roster', 'Generating Shift 1 & 2 Worker Performance CSV...', 'info')}
            className="px-4 py-2 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Roster CSV</span>
          </button>
        </div>
      </div>

      {/* Top 8 Telemetry KPI Bento Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 md:gap-4">
        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">Total Staff</span>
          <span className="text-xl md:text-2xl font-extrabold text-zinc-900 font-mono">{metrics.total}</span>
          <p className="text-[10px] text-zinc-500 font-medium">Full Roster</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-emerald-700 block">Active Today</span>
          <span className="text-xl md:text-2xl font-extrabold text-emerald-700 font-mono">{metrics.activeToday}</span>
          <p className="text-[10px] text-zinc-500 font-medium">On Shift</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">On Leave</span>
          <span className="text-xl md:text-2xl font-extrabold text-zinc-800 font-mono">{metrics.onLeave}</span>
          <p className="text-[10px] text-zinc-500 font-medium">HR Approved</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-blue-700 block">Available</span>
          <span className="text-xl md:text-2xl font-extrabold text-blue-700 font-mono">{metrics.available}</span>
          <p className="text-[10px] text-zinc-500 font-medium">Ready</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-rose-700 block">Overloaded</span>
          <span className="text-xl md:text-2xl font-extrabold text-rose-700 font-mono">{metrics.overloaded}</span>
          <p className="text-[10px] text-rose-700 font-medium">&gt;100% Load</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-amber-700 block">Avg Score</span>
          <span className="text-xl md:text-2xl font-extrabold text-amber-700 font-mono">{metrics.avgProductivity}</span>
          <p className="text-[10px] text-zinc-500 font-medium">/100 Target</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">Packages</span>
          <span className="text-xl md:text-2xl font-extrabold text-zinc-900 font-mono">{metrics.totalPackages.toLocaleString()}</span>
          <p className="text-[10px] text-zinc-500 font-medium">Units Handled</p>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400 block">Avg Time</span>
          <span className="text-xl md:text-2xl font-extrabold text-zinc-900 font-mono">{metrics.avgProcTime}m</span>
          <p className="text-[10px] text-zinc-500 font-medium">Per Package</p>
        </div>
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'roster'
              ? 'bg-zinc-900 text-white shadow-2xs'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <span className="material-symbols-outlined text-base">group</span>
          <span>Worker Roster ({workers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('recognition')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'recognition'
              ? 'bg-amber-600 text-white shadow-2xs'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <span className="material-symbols-outlined text-base">military_tech</span>
          <span>Recognition & Improvement</span>
        </button>

        <button
          onClick={() => setActiveTab('bonuses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'bonuses'
              ? 'bg-emerald-700 text-white shadow-2xs'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <span className="material-symbols-outlined text-base">payments</span>
          <span>Bonus Recommendations</span>
        </button>

        <button
          onClick={() => setActiveTab('monthly_report')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'monthly_report'
              ? 'bg-blue-700 text-white shadow-2xs'
              : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
          }`}
        >
          <span className="material-symbols-outlined text-base">assessment</span>
          <span>Monthly Workforce Report</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: WORKER ROSTER */}
      {/* ========================================================================= */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          {/* Muthu Workforce Recommendations Banner */}
          <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-amber-500/10 rounded-3xl p-5 md:p-6 border border-amber-300 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-zinc-950 font-bold flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">smart_toy</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 font-mono">
                  Muthu Recommends • Workforce Allocation Engine
                </span>
                <h3 className="text-base md:text-lg font-bold text-zinc-900">
                  Dynamic Shift Balancing & Station Bottleneck Relief
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Decision 1: Packing Station 2 Reallocation */}
              <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold font-mono">
                    Station Rebalance
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 font-mono">94% Confidence</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900">Move Ravi Kumar to Packing Station 2</h4>
                  <p className="text-[11.5px] text-zinc-700">
                    <strong>Problem:</strong> Packing Station 2 queue is 27% above shift average.
                  </p>
                  <p className="text-[11.5px] text-zinc-700">
                    <strong>Reason:</strong> Ravi's packing velocity (4.2m/pkg) is 18% above shift benchmark.
                  </p>
                  <p className="text-[11.5px] text-emerald-900 font-medium">
                    <strong>Expected Impact:</strong> Reduce packing queue by approximately 16 minutes.
                  </p>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-zinc-100">
                  <button
                    onClick={() => {
                      onReallocateWorker('wrk-101', 'Packing Station 2');
                      onShowToast('Reallocation Approved', 'Ravi Kumar moved to Packing Station 2. Queue clearing.', 'success');
                    }}
                    className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-2xs"
                  >
                    Approve Reallocation
                  </button>
                </div>
              </div>

              {/* Decision 2: Refresher Training Allocation */}
              <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-2.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[10px] font-bold font-mono">
                    Training Recommendation
                  </span>
                  <span className="text-[11px] font-bold text-amber-800 font-mono">91% Confidence</span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-zinc-900">Recommend Refresher Training for Asha Reddy</h4>
                  <p className="text-[11.5px] text-zinc-700">
                    <strong>Evidence:</strong> Picking accuracy at 91% vs team benchmark of 96%.
                  </p>
                  <p className="text-[11.5px] text-zinc-700">
                    <strong>Recommended:</strong> Barcode verification & bin scanning refresher module.
                  </p>
                  <p className="text-[11.5px] text-emerald-900 font-medium">
                    <strong>Expected Impact:</strong> Prevent mispicks and avoid rework across 210 picked packages.
                  </p>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-zinc-100">
                  <button
                    onClick={() => {
                      onShowToast('Training Scheduled', 'Assigned Asha Reddy to 30-min Barcode Verification module.', 'info');
                    }}
                    className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-2xs"
                  >
                    Schedule Training
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-white rounded-2xl p-4 md:p-5 border border-zinc-200 shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="relative w-full md:w-80">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">
                  search
                </span>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Worker Name, ID, Role, Zone..."
                  className="w-full bg-zinc-50 border border-zinc-250 rounded-xl pl-10 pr-9 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  >
                    <span className="material-symbols-outlined text-base">close</span>
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto items-center text-xs">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-250 text-zinc-800 font-semibold outline-none cursor-pointer"
                >
                  <option value="All">All Roles ({rolesList.length})</option>
                  {rolesList.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                <select
                  value={shiftFilter}
                  onChange={(e) => setShiftFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-250 text-zinc-800 font-semibold outline-none cursor-pointer"
                >
                  <option value="All">All Shifts</option>
                  <option value="Morning">Morning Shift</option>
                  <option value="Afternoon">Afternoon Shift</option>
                  <option value="Night">Night Shift</option>
                </select>

                <select
                  value={performanceFilter}
                  onChange={(e) => setPerformanceFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-250 text-zinc-800 font-semibold outline-none cursor-pointer"
                >
                  <option value="All">All Performances</option>
                  <option value="EXCELLENT">EXCELLENT</option>
                  <option value="GOOD">GOOD</option>
                  <option value="ON TRACK">ON TRACK</option>
                  <option value="NEEDS IMPROVEMENT">NEEDS IMPROVEMENT</option>
                  <option value="UNDER REVIEW">UNDER REVIEW</option>
                </select>

                <select
                  value={availabilityFilter}
                  onChange={(e) => setAvailabilityFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-250 text-zinc-800 font-semibold outline-none cursor-pointer"
                >
                  <option value="All">All Availabilities</option>
                  <option value="On Shift">On Shift</option>
                  <option value="Available">Available</option>
                  <option value="Overloaded">Overloaded</option>
                  <option value="On Break">On Break</option>
                  <option value="On Leave">On Leave</option>
                </select>

                <button
                  onClick={() => {
                    setSearchQuery('');
                    setRoleFilter('All');
                    setShiftFilter('All');
                    setZoneFilter('All');
                    setPerformanceFilter('All');
                    setAvailabilityFilter('All');
                  }}
                  className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold cursor-pointer"
                  title="Reset all filters"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>

          {/* Worker Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {filteredWorkers.map((worker) => {
              const isOverloaded = worker.availability === 'Overloaded' || worker.currentWorkloadPercent > 100;

              return (
                <div
                  key={worker.id}
                  onClick={() => setSelectedWorker(worker)}
                  className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer space-y-4 flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    {/* Header Profile */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-zinc-900 text-white font-bold flex items-center justify-center text-sm shadow-2xs group-hover:scale-105 transition-transform">
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-zinc-400 font-mono">{worker.workerId}</span>
                            <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-zinc-100 text-zinc-700 font-mono">
                              {worker.shift}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-zinc-900">{worker.name}</h3>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-mono ${
                          worker.performanceStatus === 'EXCELLENT'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : worker.performanceStatus === 'GOOD'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : worker.performanceStatus === 'ON TRACK'
                            ? 'bg-zinc-100 text-zinc-800 border border-zinc-300'
                            : worker.performanceStatus === 'NEEDS IMPROVEMENT'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {worker.performanceStatus}
                      </span>
                    </div>

                    <div className="text-xs text-zinc-600 flex items-center justify-between pt-1">
                      <span className="font-semibold text-zinc-900">{worker.role}</span>
                      <span className="font-mono text-zinc-500 text-[11px]">{worker.zone}</span>
                    </div>

                    {/* Operational Telemetry Matrix */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-150 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 block uppercase">Productivity</span>
                        <span className="font-bold font-mono text-amber-700">{worker.productivityScore}/100</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 block uppercase">SLA Contribution</span>
                        <span className="font-bold font-mono text-emerald-700">{worker.slaContributionPercent}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 block uppercase">Packages Handled</span>
                        <span className="font-bold font-mono text-zinc-900">
                          {worker.packagesPicked + worker.packagesPacked || worker.qcChecks || worker.ordersHandled}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 block uppercase">Current Workload</span>
                        <span
                          className={`font-bold font-mono ${
                            isOverloaded ? 'text-rose-700' : 'text-zinc-800'
                          }`}
                        >
                          {worker.currentWorkloadPercent}%
                        </span>
                      </div>
                    </div>

                    {/* Explicit Revenue Supported Metric (Section 4) */}
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-xs flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 uppercase">Estimated Revenue Supported:</span>
                      <span className="font-extrabold text-amber-950 font-mono text-sm">
                        ₹{(worker.estimatedRevenueSupportedInr / 100000).toFixed(1)}L
                      </span>
                    </div>

                    {worker.trainingRecommended && (
                      <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-900 font-medium">
                        <span className="font-bold uppercase block text-[9.5px]">Performance Review Required:</span>
                        {worker.trainingRecommended}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                    <span>Click for full profile</span>
                    <span className="material-symbols-outlined text-base text-zinc-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: RECOGNITION & IMPROVEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'recognition' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-1">
            <h3 className="text-lg font-bold text-zinc-900">Performance Recognition & Improvement Matrix</h3>
            <p className="text-xs text-zinc-500">
              Clear attribution and evidence-based performance tracking across top performers, high-impact contributors, most improved workers, and skill refreshers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Top Performers Category */}
            <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-emerald-100 pb-3">
                <span className="text-xl">🏆</span>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">Top Performers</h4>
                  <span className="text-[10px] text-emerald-800 font-bold uppercase font-mono">Consistently Exceeding Benchmark</span>
                </div>
              </div>

              <div className="space-y-3">
                {workers
                  .filter((w) => w.recognitionCategory === 'Top Performer')
                  .map((w) => (
                    <div key={w.id} className="p-3.5 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-zinc-900 text-sm">{w.name}</span>
                          <span className="text-zinc-500 text-[11px] block">{w.role} • {w.zone}</span>
                        </div>
                        <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                          {w.productivityScore}/100 Score
                        </span>
                      </div>
                      <p className="text-zinc-700">
                        <strong>Evidence:</strong> {w.recognitionReason || w.performanceNote}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-emerald-100 text-[11px]">
                        <span className="text-emerald-950 font-semibold">Recommended: Performance Bonus</span>
                        <span className="font-mono font-bold text-emerald-800">
                          ₹{(w.estimatedRevenueSupportedInr / 100000).toFixed(1)}L Supported
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* High Impact Contributors */}
            <div className="bg-white rounded-2xl p-5 border border-blue-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-blue-100 pb-3">
                <span className="text-xl">⚡</span>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">High Impact Operational Leaders</h4>
                  <span className="text-[10px] text-blue-800 font-bold uppercase font-mono">Critical Bottleneck Solvers</span>
                </div>
              </div>

              <div className="space-y-3">
                {workers
                  .filter((w) => w.recognitionCategory === 'High Impact')
                  .map((w) => (
                    <div key={w.id} className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-200 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-zinc-900 text-sm">{w.name}</span>
                          <span className="text-zinc-500 text-[11px] block">{w.role} • {w.zone}</span>
                        </div>
                        <span className="font-mono font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded text-[10px]">
                          {w.slaContributionPercent}% SLA
                        </span>
                      </div>
                      <p className="text-zinc-700">
                        <strong>Evidence:</strong> {w.recognitionReason || w.performanceNote}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-blue-100 text-[11px]">
                        <span className="text-blue-950 font-semibold">Impact: Dispatch Velocity Acceleration</span>
                        <span className="font-mono font-bold text-blue-800">
                          ₹{(w.estimatedRevenueSupportedInr / 100000).toFixed(1)}L Supported
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Most Improved */}
            <div className="bg-white rounded-2xl p-5 border border-amber-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-amber-100 pb-3">
                <span className="text-xl">📈</span>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">Most Improved</h4>
                  <span className="text-[10px] text-amber-800 font-bold uppercase font-mono">Steepest Productivity Climb</span>
                </div>
              </div>

              <div className="space-y-3">
                {workers
                  .filter((w) => w.recognitionCategory === 'Most Improved')
                  .map((w) => (
                    <div key={w.id} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-zinc-900 text-sm">{w.name}</span>
                          <span className="text-zinc-500 text-[11px] block">{w.role} • {w.zone}</span>
                        </div>
                        <span className="font-mono font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded text-[10px]">
                          +{w.productivityScore - 75}% MoM
                        </span>
                      </div>
                      <p className="text-zinc-700">
                        <strong>Evidence:</strong> {w.recognitionReason || w.performanceNote}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-amber-100 text-[11px]">
                        <span className="text-amber-950 font-semibold">Recommended: Advanced Certification</span>
                        <span className="font-mono font-bold text-amber-800">
                          ₹{(w.estimatedRevenueSupportedInr / 100000).toFixed(1)}L Supported
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Needs Training & Performance Review */}
            <div className="bg-white rounded-2xl p-5 border border-rose-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 border-b border-rose-100 pb-3">
                <span className="text-xl">📚</span>
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">Training & Performance Review Required</h4>
                  <span className="text-[10px] text-rose-800 font-bold uppercase font-mono">Targeted Coaching Loops</span>
                </div>
              </div>

              <div className="space-y-3">
                {workers
                  .filter((w) => w.recognitionCategory === 'Needs Training' || w.recognitionCategory === 'Performance Review' || w.trainingRecommended)
                  .map((w) => (
                    <div key={w.id} className="p-3.5 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="font-bold text-zinc-900 text-sm">{w.name}</span>
                          <span className="text-zinc-500 text-[11px] block">{w.role} • {w.zone}</span>
                        </div>
                        <span className="font-mono font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded text-[10px]">
                          Review Required
                        </span>
                      </div>
                      <p className="text-zinc-700">
                        <strong>Evidence:</strong> {w.recognitionReason || w.trainingRecommended || w.performanceNote}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t border-rose-100 text-[11px]">
                        <span className="text-rose-950 font-semibold">Recommended Action: Refresher Coaching</span>
                        <button
                          onClick={() => onShowToast('Training Scheduled', `Scheduled coaching module for ${w.name}`, 'info')}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[10px] cursor-pointer"
                        >
                          Enroll in Training
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: BONUS RECOMMENDATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'bonuses' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 space-y-1">
            <h3 className="text-lg font-bold text-zinc-900">Muthu Performance Bonus Nominations</h3>
            <p className="text-xs text-zinc-500">
              Bonuses are recommended algorithmically based on productivity and SLA compliance. Manager approval is required before payroll processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {workers
              .filter((w) => Boolean(w.recommendedBonusInr))
              .map((w) => (
                <div
                  key={w.id}
                  className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-2xs space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center">
                          {w.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-900 text-sm">{w.name}</h4>
                          <span className="text-xs text-zinc-500">{w.role} • {w.shift} Shift</span>
                        </div>
                      </div>

                      <span className="text-lg font-extrabold text-emerald-800 font-mono">
                        ₹{w.recommendedBonusInr?.toLocaleString()}
                      </span>
                    </div>

                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block">Reason:</span>
                        <p className="text-zinc-800 font-medium">{w.bonusReason}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase block">Performance Evidence:</span>
                        <p className="text-zinc-700">Productivity Score: {w.productivityScore}/100 • SLA Compliance: {w.slaContributionPercent}% • Attendance: {w.attendancePercent}%</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-amber-900 uppercase block">Estimated Operational Value:</span>
                        <span className="font-extrabold text-amber-950 font-mono">
                          ₹{(w.estimatedRevenueSupportedInr / 100000).toFixed(1)}L Revenue Supported
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => setSelectedWorker(w)}
                      className="text-zinc-600 hover:text-zinc-900 font-semibold cursor-pointer"
                    >
                      Review Details
                    </button>

                    {w.bonusApproved ? (
                      <span className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold border border-emerald-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">check</span>
                        Manager Approved ✓
                      </span>
                    ) : (
                      <button
                        onClick={() => onApproveBonus(w.id)}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer transition-all shadow-2xs flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Approve Bonus (₹{w.recommendedBonusInr?.toLocaleString()})
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MONTHLY WORKFORCE REPORT */}
      {/* ========================================================================= */}
      {activeTab === 'monthly_report' && (
        <div className="space-y-6">
          {/* Month Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 font-mono">
              Report Month:
            </span>
            {MONTHLY_WORKFORCE_HISTORY.map((hist, idx) => (
              <button
                key={hist.month}
                onClick={() => setSelectedMonthIndex(idx)}
                className={`px-4 py-2 rounded-xl font-bold shrink-0 transition-all cursor-pointer border ${
                  selectedMonthIndex === idx
                    ? 'bg-blue-700 text-white border-blue-700 shadow-2xs'
                    : 'bg-white text-zinc-700 border-zinc-250 hover:bg-zinc-100'
                }`}
              >
                {hist.month}
              </button>
            ))}
          </div>

          {/* Monthly Report Breakdown Grid */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200 shadow-2xs space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-zinc-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 font-mono">
                  Audited Historical Ledger
                </span>
                <h3 className="text-xl font-bold text-zinc-900">{currentMonthlyReport.month} Workforce Report</h3>
              </div>
              <span className="px-3 py-1 bg-blue-50 text-blue-900 border border-blue-200 rounded-full font-mono text-xs font-bold">
                {currentMonthlyReport.totalShifts} Shifts Operated
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-1">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Total Workers</span>
                <span className="text-2xl font-extrabold font-mono text-zinc-900">{currentMonthlyReport.totalWorkers}</span>
                <p className="text-zinc-500 font-medium">{currentMonthlyReport.activeWorkers} Active On-Duty</p>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-1">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Attendance Rate</span>
                <span className="text-2xl font-extrabold font-mono text-emerald-700">{currentMonthlyReport.attendancePercent}%</span>
                <p className="text-zinc-500 font-medium">Overtime: {currentMonthlyReport.overtimeHours} hrs</p>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-1">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Avg Productivity</span>
                <span className="text-2xl font-extrabold font-mono text-amber-700">{currentMonthlyReport.avgProductivity}</span>
                <p className="text-zinc-500 font-medium">SLA Compliance: {currentMonthlyReport.slaCompliancePercent}%</p>
              </div>

              <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 space-y-1">
                <span className="text-amber-900 block text-[10px] uppercase font-bold">Est. Revenue Supported</span>
                <span className="text-2xl font-extrabold font-mono text-amber-950">
                  ₹{(currentMonthlyReport.estimatedRevenueSupportedInr / 100000).toFixed(1)}L
                </span>
                <p className="text-amber-800 font-medium">Across {currentMonthlyReport.ordersSupported} Orders</p>
              </div>
            </div>

            {/* Packages & QC Throughput */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-1">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Packages Picked</span>
                <span className="text-xl font-bold font-mono text-zinc-900">{currentMonthlyReport.packagesPicked.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-1">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Packages Packed</span>
                <span className="text-xl font-bold font-mono text-zinc-900">{currentMonthlyReport.packagesPacked.toLocaleString()}</span>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-150 space-y-1">
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">QC Checks Completed</span>
                <span className="text-xl font-bold font-mono text-zinc-900">{currentMonthlyReport.qcChecks.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DETAILED WORKER PROFILE DRAWER MODAL */}
      {/* ========================================================================= */}
      {selectedWorker && (
        <div
          id="worker-profile-drawer-backdrop"
          onClick={() => setSelectedWorker(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn"
        >
          <div
            id="worker-profile-drawer"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white h-full shadow-2xl p-6 md:p-8 overflow-y-auto space-y-6 animate-slideLeft"
          >
            {/* Header Profile */}
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white font-bold flex items-center justify-center text-lg shadow-2xs">
                  {selectedWorker.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-zinc-400">{selectedWorker.workerId}</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 rounded bg-zinc-100 text-zinc-700 font-mono">
                      {selectedWorker.shift} Shift
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-zinc-900">{selectedWorker.name}</h2>
                </div>
              </div>

              <button
                onClick={() => setSelectedWorker(null)}
                className="p-2 text-zinc-400 hover:text-zinc-800 rounded-lg cursor-pointer"
                title="Close Profile"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Performance Status & Role Tag */}
            <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase text-zinc-400 block">Role & Assigned Zone</span>
                <span className="font-bold text-zinc-900">{selectedWorker.role} • {selectedWorker.zone}</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-mono ${
                  selectedWorker.performanceStatus === 'EXCELLENT'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : selectedWorker.performanceStatus === 'GOOD'
                    ? 'bg-blue-100 text-blue-800 border border-blue-300'
                    : selectedWorker.performanceStatus === 'ON TRACK'
                    ? 'bg-zinc-100 text-zinc-800 border border-zinc-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {selectedWorker.performanceStatus}
              </span>
            </div>

            {/* Performance Metrics Matrix */}
            <div className="space-y-2">
              <h4 className="font-bold text-zinc-900 uppercase text-[10px] text-zinc-400">Operational Velocity</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
                  <span className="text-zinc-500 block text-[10px]">Productivity Score</span>
                  <span className="text-lg font-bold text-amber-700 font-mono">{selectedWorker.productivityScore}/100</span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
                  <span className="text-zinc-500 block text-[10px]">SLA Contribution</span>
                  <span className="text-lg font-bold text-emerald-700 font-mono">{selectedWorker.slaContributionPercent}%</span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
                  <span className="text-zinc-500 block text-[10px]">Attendance</span>
                  <span className="text-lg font-bold text-zinc-900 font-mono">{selectedWorker.attendancePercent}%</span>
                </div>
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
                  <span className="text-zinc-500 block text-[10px]">Avg Processing Time</span>
                  <span className="text-lg font-bold text-zinc-900 font-mono">{selectedWorker.avgProcessingTimeMinutes}m / pkg</span>
                </div>
              </div>
            </div>

            {/* Packages & Orders Handled */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-150 text-xs text-center">
              <div>
                <span className="text-[10px] text-zinc-400 block">Orders Handled</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{selectedWorker.ordersHandled}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">Packages Picked</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{selectedWorker.packagesPicked}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block">Packages Packed</span>
                <span className="font-bold font-mono text-zinc-900 text-sm">{selectedWorker.packagesPacked}</span>
              </div>
            </div>

            {/* Clearly Labeled Estimated Revenue Supported (Section 4) */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2 text-xs">
              <span className="font-bold text-amber-900 block text-[10px] uppercase font-mono">
                Estimated Operational Contribution
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-zinc-700 font-semibold">Estimated Revenue Supported:</span>
                <span className="text-xl font-extrabold text-amber-950 font-mono">
                  ₹{selectedWorker.estimatedRevenueSupportedInr.toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Calculated based on the order value of successfully fulfilled orders and SLA milestones that {selectedWorker.name} directly contributed to on this shift.
              </p>
            </div>

            {/* Bonus Section & Approval */}
            {selectedWorker.recommendedBonusInr && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-emerald-900 block text-[10px] uppercase font-mono">
                      Bonus Nomination
                    </span>
                    <span className="text-lg font-bold text-emerald-950 font-mono">
                      ₹{selectedWorker.recommendedBonusInr.toLocaleString()}
                    </span>
                  </div>

                  {selectedWorker.bonusApproved ? (
                    <span className="px-3 py-1.5 bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check</span>
                      Approved
                    </span>
                  ) : (
                    <button
                      onClick={() => {
                        onApproveBonus(selectedWorker.id);
                        setSelectedWorker({ ...selectedWorker, bonusApproved: true });
                      }}
                      className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold cursor-pointer transition-all shadow-2xs flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">verified</span>
                      Approve Bonus
                    </button>
                  )}
                </div>
                <p className="text-[11.5px] text-emerald-800 font-medium">{selectedWorker.bonusReason}</p>
              </div>
            )}

            {/* Reassignment Action */}
            <div className="pt-2 border-t border-zinc-100 flex items-center gap-2">
              <button
                onClick={() => {
                  onReallocateWorker(selectedWorker.id, 'Packing Station 2');
                  setSelectedWorker({ ...selectedWorker, zone: 'Packing Station 2' });
                  onShowToast('Reallocation Done', `${selectedWorker.name} moved to Packing Station 2`, 'success');
                }}
                className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs cursor-pointer transition-all shadow-2xs"
              >
                Reassign to Packing Station 2
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
