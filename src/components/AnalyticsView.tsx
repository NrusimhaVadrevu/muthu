import React, { useState, useMemo } from 'react';
import {
  AI_CHART_INSIGHTS,
  BOTTLENECK_ANOMALIES,
  WORKER_PERFORMANCE_DATA,
  DECISION_HISTORY_DATA,
  AUDIT_TIMELINE_EVENTS,
  DecisionRecord,
  BottleneckAnomaly,
  WorkerPerformance
} from '../analyticsData';
import {
  downloadFile,
  generateWarehouseSummaryCSV,
  generateAnalyticsReportCSV,
  generateDecisionHistoryCSV,
  generateWorkerPerformanceCSV,
  generateSimulationReportCSV
} from '../utils/exportUtils';
import { MASCOT_LOGO_URL } from '../mockData';
import { GlobalOrderFilter } from '../types';

interface AnalyticsViewProps {
  onExport: () => void;
  onShowToast?: (title: string, description?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  globalOrderFilter?: GlobalOrderFilter;
  onOrderFilterChange?: (filter: GlobalOrderFilter) => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  onExport,
  onShowToast,
  globalOrderFilter = 'all',
  onOrderFilterChange
}) => {
  // Local or propagated filter
  const [activeSegment, setActiveSegment] = useState<GlobalOrderFilter>(globalOrderFilter);

  // Sync segment changes
  const handleSegmentChange = (seg: GlobalOrderFilter) => {
    setActiveSegment(seg);
    if (onOrderFilterChange) {
      onOrderFilterChange(seg);
    }
  };

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'bottlenecks' | 'workers' | 'decisions' | 'timeline' | 'exports'>('dashboard');
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('today');

  // Decision History filters
  const [decisionSearch, setDecisionSearch] = useState('');
  const [decisionStatusFilter, setDecisionStatusFilter] = useState<'All' | 'Approved' | 'Rejected' | 'Pending'>('All');
  const [selectedDecision, setSelectedDecision] = useState<DecisionRecord | null>(null);

  // Worker filter
  const [workerRoleFilter, setWorkerRoleFilter] = useState<string>('All');
  const [workerShiftFilter, setWorkerShiftFilter] = useState<string>('All');

  // Audit filter
  const [auditTypeFilter, setAuditTypeFilter] = useState<string>('All');

  const toast = (title: string, desc?: string, type: 'success' | 'warning' | 'info' = 'success') => {
    if (onShowToast) {
      onShowToast(title, desc, type);
    }
  };

  // Filtered Decision History
  const filteredDecisions = useMemo(() => {
    return DECISION_HISTORY_DATA.filter((d) => {
      const matchSearch =
        d.title.toLowerCase().includes(decisionSearch.toLowerCase()) ||
        d.reason.toLowerCase().includes(decisionSearch.toLowerCase()) ||
        d.approvedBy.toLowerCase().includes(decisionSearch.toLowerCase());
      const matchStatus = decisionStatusFilter === 'All' || d.status === decisionStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [decisionSearch, decisionStatusFilter]);

  // Filtered Workers
  const filteredWorkers = useMemo(() => {
    return WORKER_PERFORMANCE_DATA.filter((w) => {
      const matchRole = workerRoleFilter === 'All' || w.role === workerRoleFilter;
      const matchShift = workerShiftFilter === 'All' || w.shift === workerShiftFilter;
      return matchRole && matchShift;
    });
  }, [workerRoleFilter, workerShiftFilter]);

  // Filtered Timeline
  const filteredTimeline = useMemo(() => {
    if (auditTypeFilter === 'All') return AUDIT_TIMELINE_EVENTS;
    return AUDIT_TIMELINE_EVENTS.filter((e) => e.type === auditTypeFilter);
  }, [auditTypeFilter]);

  // Export triggers with actual browser download
  const handleDownloadReport = (type: 'summary' | 'analytics' | 'decisions' | 'workers' | 'simulation') => {
    const timestamp = new Date().toISOString().slice(0, 10);
    switch (type) {
      case 'summary':
        downloadFile(`MUTHU_Warehouse_Summary_${timestamp}.csv`, generateWarehouseSummaryCSV());
        toast('Downloaded Warehouse Summary', 'Facility executive overview saved to your device.', 'success');
        break;
      case 'analytics':
        downloadFile(`MUTHU_Analytics_Report_${timestamp}.csv`, generateAnalyticsReportCSV());
        toast('Downloaded Analytics Report', 'Workflow stage cycle times and velocity CSV exported.', 'success');
        break;
      case 'decisions':
        downloadFile(`MUTHU_Decision_History_${timestamp}.csv`, generateDecisionHistoryCSV(DECISION_HISTORY_DATA));
        toast('Downloaded Decision History', 'Audited decision logs and outcome metrics exported.', 'success');
        break;
      case 'workers':
        downloadFile(`MUTHU_Worker_Performance_${timestamp}.csv`, generateWorkerPerformanceCSV(WORKER_PERFORMANCE_DATA));
        toast('Downloaded Worker Telemetry', 'Floor staff utilization and task logs exported.', 'success');
        break;
      case 'simulation':
        downloadFile(`MUTHU_Simulation_Report_${timestamp}.csv`, generateSimulationReportCSV());
        toast('Downloaded Simulation Report', 'Digital twin baseline vs simulated comparative CSV exported.', 'success');
        break;
    }
  };

  return (
    <div id="analytics-decision-intelligence-view" className="w-full max-w-[1440px] mx-auto px-5 md:px-10 py-8 md:py-10 space-y-8 animate-fade-in">
      {/* 1. Header & Live Telemetry Controls */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#BACBB4]/30 text-[#2f432c] text-[11px] font-bold border border-[#BACBB4]/50 flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#51604D] animate-ping" />
              MUTHU Decision Intelligence & Analytics
            </span>
            <span className="text-[11px] font-mono text-outline">
              Live Facility Telemetry • Bay-04
            </span>
          </div>
          <h1 className="font-headline-md text-[26px] md:text-[30px] font-bold text-on-surface tracking-tight leading-tight">
            Analytics & Decision Intelligence
          </h1>
          <p className="font-body-md text-on-surface-variant text-[14px] mt-1 max-w-2xl">
            Autonomous performance telemetry, real-time bottleneck diagnosis, and audited AI decision logs explaining warehouse health.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Time range selector */}
          <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/30 text-[12px] font-medium">
            {(['today', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize cursor-pointer ${
                  timeRange === range
                    ? 'bg-surface text-primary font-bold shadow-xs'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {range === 'today' ? 'Today (Shift 1)' : range === '7d' ? 'Past 7 Days' : 'Month to Date'}
              </button>
            ))}
          </div>

          <button
            id="btn-analytics-export-quick"
            onClick={() => handleDownloadReport('analytics')}
            className="px-4 py-2.5 rounded-xl bg-primary text-surface font-label-md text-[13px] hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer shadow-xs font-bold"
          >
            <span className="material-symbols-outlined text-[18px]">download</span>
            Download Report (CSV)
          </button>
        </div>
      </div>

      {/* Segment Switcher Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 card-surface rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-outline uppercase tracking-wider pl-2">Segment Filter:</span>
          <div className="flex bg-surface-container p-1 rounded-xl gap-1">
            <button
              onClick={() => handleSegmentChange('all')}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSegment === 'all'
                  ? 'bg-surface text-on-surface shadow-xs'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">layers</span>
              All Operations
            </button>
            <button
              onClick={() => handleSegmentChange('business')}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSegment === 'business'
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'text-outline hover:text-primary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">domain</span>
              B2B Enterprise
            </button>
            <button
              onClick={() => handleSegmentChange('individual')}
              className={`px-3.5 py-1.5 rounded-lg text-[12.5px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeSegment === 'individual'
                  ? 'bg-secondary text-on-secondary shadow-xs'
                  : 'text-outline hover:text-secondary'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">person</span>
              B2C Direct Consumer
            </button>
          </div>
        </div>

        <span className="text-[12px] text-outline pr-2">
          {activeSegment === 'business'
            ? '🏢 Showing Enterprise Wholesale, Freight & Contract Metrics'
            : activeSegment === 'individual'
            ? '👤 Showing Direct-to-Consumer Parcel & Courier Velocity'
            : '🌐 Showing Aggregated Facility Performance'}
        </span>
      </div>

      {/* 2. MUTHU Daily Executive Summary Briefing */}
      <div
        id="muthu-daily-executive-summary"
        className="card-surface p-6 rounded-2xl border border-outline-variant/40 bg-gradient-to-br from-surface via-surface to-secondary/10 shadow-ambient space-y-4 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/20 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 border border-outline-variant/60 shadow-xs">
              <img src={MASCOT_LOGO_URL} alt="MUTHU Mascot" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="font-headline-sm text-[18px] font-bold text-on-surface flex items-center gap-2">
                <span>🤎</span> Muthu's Daily Executive Summary
                {activeSegment === 'business' && (
                  <span className="px-2.5 py-0.5 rounded-md bg-primary/15 text-primary text-[11px] font-bold">
                    B2B Enterprise Mode
                  </span>
                )}
                {activeSegment === 'individual' && (
                  <span className="px-2.5 py-0.5 rounded-md bg-secondary/15 text-secondary text-[11px] font-bold">
                    B2C Consumer Mode
                  </span>
                )}
              </h2>
              <p className="font-body-xs text-[12px] text-on-surface-variant">
                Facility Health Status • Generated for Shift Leadership at 11:30 AM
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              ✓ 0 SLA Breaches Reported
            </span>
            <span className="px-3 py-1 rounded-full text-[11px] font-mono text-outline bg-surface-container">
              {activeSegment === 'business' ? 'B2B Target: 400 Pallets' : activeSegment === 'individual' ? 'B2C Target: 2,400 Parcels' : 'Shift 1 Target: 1,200 pkgs'}
            </span>
          </div>
        </div>

        {/* 4-Stat Briefing Strip */}
        {activeSegment === 'business' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Pallet Throughput
              </span>
              <div className="text-[22px] font-bold text-primary mt-0.5">
                1,480 <span className="text-[13px] font-normal text-on-surface-variant">Pallets</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">↑ +18% vs Monthly Avg</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Contract SLA Adherence
              </span>
              <div className="text-[22px] font-bold text-emerald-700 mt-0.5">
                99.6%
              </div>
              <span className="text-[11px] text-on-surface-variant">Zero penalty exposure</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Staging Bay Turnaround
              </span>
              <div className="text-[22px] font-bold text-on-surface mt-0.5">
                38 <span className="text-[13px] font-normal text-on-surface-variant">Mins</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">Fast Freight Loading</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Active B2B Contract Val
              </span>
              <div className="text-[22px] font-bold text-on-surface mt-0.5">
                $482,000
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">8 Enterprise Accounts</span>
            </div>
          </div>
        ) : activeSegment === 'individual' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Direct Parcel Volume
              </span>
              <div className="text-[22px] font-bold text-secondary mt-0.5">
                8,420 <span className="text-[13px] font-normal text-on-surface-variant">Parcels</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">↑ +22% Rush Velocity</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Courier Pick-to-Dock
              </span>
              <div className="text-[22px] font-bold text-emerald-700 mt-0.5">
                14.2 <span className="text-[13px] font-normal text-on-surface-variant">Mins</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">Single-Item Fast Lanes</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Same-Day Delivery Pass
              </span>
              <div className="text-[22px] font-bold text-primary mt-0.5">
                98.6%
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">Cutoffs Secured</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Customer Satisfaction
              </span>
              <div className="text-[22px] font-bold text-on-surface mt-0.5">
                4.9 / 5.0
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">99.1% On-Time Carrier</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Orders Processed
              </span>
              <div className="text-[22px] font-bold text-on-surface mt-0.5">
                55 <span className="text-[13px] font-normal text-on-surface-variant">/ 1,402 Today</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">↑ +14% vs Shift Target</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Orders Delayed
              </span>
              <div className="text-[22px] font-bold text-emerald-700 mt-0.5">
                2 <span className="text-[13px] font-normal text-on-surface-variant">In Buffer</span>
              </div>
              <span className="text-[11px] text-on-surface-variant">Within safe 45-min SLA</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Warehouse Health
              </span>
              <div className="text-[22px] font-bold text-primary mt-0.5">
                95 <span className="text-[13px] font-normal text-on-surface-variant">/ 100</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">Optimal Performance</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                SLA Compliance
              </span>
              <div className="text-[22px] font-bold text-on-surface mt-0.5">
                99.4%
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">Target 98.0% Met</span>
            </div>
          </div>
        )}

        {/* Top Issue & Top Recommendation Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-700 text-[20px] shrink-0 mt-0.5">
              warning
            </span>
            <div className="text-[12px] space-y-0.5">
              <strong className="font-bold text-amber-950 block">Top Issue Detected:</strong>
              <p>Packaging material Box #4 running low in Zone C (48 cartons remaining, 3.5 hrs buffer).</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-900 flex items-start gap-3">
            <span className="material-symbols-outlined text-emerald-700 text-[20px] shrink-0 mt-0.5">
              lightbulb
            </span>
            <div className="text-[12px] space-y-0.5">
              <strong className="font-bold text-emerald-950 block">Top Recommendation:</strong>
              <p>Reorder Packaging Type D and approve automated PO #9048 within 8 hours to prevent line stop.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Module Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-outline-variant/30 overflow-x-auto pb-1">
        {[
          { id: 'dashboard', label: 'Executive Dashboard', icon: 'monitoring' },
          { id: 'bottlenecks', label: 'Bottleneck Anomaly Detector', icon: 'troubleshoot', badge: BOTTLENECK_ANOMALIES.length },
          { id: 'workers', label: 'Worker Telemetry', icon: 'groups' },
          { id: 'decisions', label: 'Decision History', icon: 'verified', badge: DECISION_HISTORY_DATA.length },
          { id: 'timeline', label: 'Audit Timeline', icon: 'history' },
          { id: 'exports', label: 'Export Vault', icon: 'folder_zip' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-t-xl text-[13px] font-semibold transition-all flex items-center gap-2 shrink-0 border-b-2 cursor-pointer ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
            <span>{tab.label}</span>
            {tab.badge && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-secondary/30 text-primary">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* =======================================================================
          TAB 1: EXECUTIVE DASHBOARD WITH CHARTS & AI INSIGHTS
          ======================================================================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8 animate-fade-in">
          {/* Top KPI Metrics Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* KPI 1: Warehouse Health Trend */}
            <div className="card-surface rounded-[20px] p-5 border border-outline-variant/30 space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Warehouse Health Trend
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-[28px] font-bold text-on-surface">94.2</span>
                <span className="text-[12px] font-semibold text-emerald-700 flex items-center">
                  ↑ +2.1 pts vs 7d avg
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant">Zero critical system halts this shift.</p>
            </div>

            {/* KPI 2: Order Fulfillment Rate */}
            <div className="card-surface rounded-[20px] p-5 border border-outline-variant/30 space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Order Fulfillment Rate
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-[28px] font-bold text-on-surface">98.6%</span>
                <span className="text-[12px] font-semibold text-emerald-700 flex items-center">
                  ↑ +3.6% vs Target (95%)
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant">1,402 pkgs dispatched on schedule.</p>
            </div>

            {/* KPI 3: Avg Order Completion Cycle Time */}
            <div className="card-surface rounded-[20px] p-5 border border-outline-variant/30 space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Avg Completion Time
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-[28px] font-bold text-on-surface">36.4m</span>
                <span className="text-[12px] font-semibold text-emerald-700 flex items-center">
                  ↓ -8.6m faster than benchmark
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant">Total dock-to-dock cycle velocity.</p>
            </div>

            {/* KPI 4: Inventory Turnover Rate */}
            <div className="card-surface rounded-[20px] p-5 border border-outline-variant/30 space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                Inventory Turnover Velocity
              </span>
              <div className="flex items-baseline justify-between">
                <span className="text-[28px] font-bold text-on-surface">4.2x</span>
                <span className="text-[12px] font-semibold text-emerald-700 flex items-center">
                  ↑ +0.4x vs Industry Norm
                </span>
              </div>
              <p className="text-[12px] text-on-surface-variant">Optimal safety buffer retention.</p>
            </div>
          </div>

          {/* Section: Operational Charts with Attached MUTHU AI Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Picking & Route Performance */}
            <div className="card-surface p-6 rounded-2xl border border-outline-variant/40 space-y-5">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div>
                  <h3 className="font-headline-sm text-[16px] font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">directions_walk</span>
                    Picking Performance & TSP Route Optimization
                  </h3>
                  <p className="text-[12px] text-on-surface-variant">Average pick time per bin cluster</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  11.4 min avg
                </span>
              </div>

              {/* Visual Bar Representation */}
              <div className="space-y-2.5">
                {[
                  { label: 'Zone A (Apparel & Bulky)', time: '9.2 min', speed: '+12%', width: '65%', color: 'bg-primary' },
                  { label: 'Zone B (High-Tech & Bins)', time: '16.8 min', speed: '-15% (Congested)', width: '92%', color: 'bg-amber-600' },
                  { label: 'Zone C (Packaging & Supplies)', time: '7.8 min', speed: '+8%', width: '55%', color: 'bg-emerald-600' },
                  { label: 'Buffer Cross-Dock', time: '11.8 min', speed: 'Normal', width: '70%', color: 'bg-blue-600' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1 text-[12px]">
                    <div className="flex justify-between text-on-surface font-medium">
                      <span>{item.label}</span>
                      <span className="font-bold text-primary">{item.time} ({item.speed})</span>
                    </div>
                    <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: item.width }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Attached MUTHU AI Explanation */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <span>🤎</span> Muthu Observes
                  </span>
                  <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                    {AI_CHART_INSIGHTS.pickingPerformance.confidence}% AI Confidence
                  </span>
                </div>
                <p className="text-[12.5px] font-semibold text-on-surface">
                  {AI_CHART_INSIGHTS.pickingPerformance.observation}
                </p>
                <div className="text-[11.5px] text-on-surface-variant space-y-1 pt-1 border-t border-outline-variant/20">
                  <div><strong>Reason:</strong> {AI_CHART_INSIGHTS.pickingPerformance.reason}</div>
                  <div><strong>Impact:</strong> {AI_CHART_INSIGHTS.pickingPerformance.impact}</div>
                  <div className="text-emerald-700 font-semibold">
                    <strong>Recommendation:</strong> {AI_CHART_INSIGHTS.pickingPerformance.recommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Packing Performance & Station Load */}
            <div className="card-surface p-6 rounded-2xl border border-outline-variant/40 space-y-5">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div>
                  <h3 className="font-headline-sm text-[16px] font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">package_2</span>
                    Packing Station Throughput & Station Balancing
                  </h3>
                  <p className="text-[12px] text-on-surface-variant">Benches 1–4 throughput rate per hour</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900">
                  Station 2 Bottleneck
                </span>
              </div>

              {/* Station Load Bars */}
              <div className="space-y-2.5">
                {[
                  { label: 'Bench 1 (Standard Parcels)', throughput: '110 pkgs/hr', load: '84% Load', width: '84%', color: 'bg-primary' },
                  { label: 'Bench 2 (Heavy & Multi-Item Kits)', throughput: '68 pkgs/hr', load: '124% (Overload)', width: '98%', color: 'bg-rose-600' },
                  { label: 'Bench 3 (Express & VIP Priority)', throughput: '135 pkgs/hr', load: '72% Load', width: '72%', color: 'bg-emerald-600' },
                  { label: 'Bench 4 (Automated Auto-Taper)', throughput: '148 pkgs/hr', load: '65% Load', width: '65%', color: 'bg-blue-600' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1 text-[12px]">
                    <div className="flex justify-between text-on-surface font-medium">
                      <span>{item.label}</span>
                      <span className="font-bold text-primary">{item.throughput} • {item.load}</span>
                    </div>
                    <div className="h-2.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div className={`h-full ${item.color} rounded-full`} style={{ width: item.width }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Attached MUTHU AI Explanation */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <span>🤎</span> Muthu Observes
                  </span>
                  <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                    {AI_CHART_INSIGHTS.packingPerformance.confidence}% AI Confidence
                  </span>
                </div>
                <p className="text-[12.5px] font-semibold text-on-surface">
                  {AI_CHART_INSIGHTS.packingPerformance.observation}
                </p>
                <div className="text-[11.5px] text-on-surface-variant space-y-1 pt-1 border-t border-outline-variant/20">
                  <div><strong>Reason:</strong> {AI_CHART_INSIGHTS.packingPerformance.reason}</div>
                  <div><strong>Impact:</strong> {AI_CHART_INSIGHTS.packingPerformance.impact}</div>
                  <div className="text-emerald-700 font-semibold">
                    <strong>Recommendation:</strong> {AI_CHART_INSIGHTS.packingPerformance.recommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 3: Quality Check Pass Rate & Verification */}
            <div className="card-surface p-6 rounded-2xl border border-outline-variant/40 space-y-5">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div>
                  <h3 className="font-headline-sm text-[16px] font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
                    Quality Check First-Pass Yield & Defect Anomaly Rate
                  </h3>
                  <p className="text-[12px] text-on-surface-variant">Optical and weight verification accuracy</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  99.6% First-Pass Yield
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/25">
                  <div className="text-[20px] font-bold text-emerald-700">99.6%</div>
                  <div className="text-[11px] text-on-surface-variant">Passed First Run</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/25">
                  <div className="text-[20px] font-bold text-amber-700">0.4%</div>
                  <div className="text-[11px] text-on-surface-variant">Label Misalignment</div>
                </div>
                <div className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/25">
                  <div className="text-[20px] font-bold text-primary">0.0%</div>
                  <div className="text-[11px] text-on-surface-variant">Weight Defect</div>
                </div>
              </div>

              {/* Attached MUTHU AI Explanation */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <span>🤎</span> Muthu Observes
                  </span>
                  <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                    {AI_CHART_INSIGHTS.qcPassRate.confidence}% AI Confidence
                  </span>
                </div>
                <p className="text-[12.5px] font-semibold text-on-surface">
                  {AI_CHART_INSIGHTS.qcPassRate.observation}
                </p>
                <div className="text-[11.5px] text-on-surface-variant space-y-1 pt-1 border-t border-outline-variant/20">
                  <div><strong>Reason:</strong> {AI_CHART_INSIGHTS.qcPassRate.reason}</div>
                  <div><strong>Impact:</strong> {AI_CHART_INSIGHTS.qcPassRate.impact}</div>
                  <div className="text-emerald-700 font-semibold">
                    <strong>Recommendation:</strong> {AI_CHART_INSIGHTS.qcPassRate.recommendation}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 4: Dispatch & Carrier Departures */}
            <div className="card-surface p-6 rounded-2xl border border-outline-variant/40 space-y-5">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div>
                  <h3 className="font-headline-sm text-[16px] font-bold text-on-surface flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">local_shipping</span>
                    Carrier Dock Staging Velocity & Trailer Sweeps
                  </h3>
                  <p className="text-[12px] text-on-surface-variant">Outbound bays 1–4 turnaround performance</p>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                  14.1 min load avg
                </span>
              </div>

              <div className="space-y-2 text-[12px]">
                {[
                  { bay: 'Bay 1: FedEx Express Sweeps', status: 'Trailer #902 Sealed & Departed', time: '11:30 AM', state: 'On-Time' },
                  { bay: 'Bay 2: Delhivery Standard Ground', status: 'Loading 180 Parcels (Pallet 3)', time: '12:15 PM', state: 'Active' },
                  { bay: 'Bay 3: BlueDart VIP Air Cargo', status: 'Staging Complete (42 Packages)', time: '1:00 PM', state: 'Ready' },
                  { bay: 'Bay 4: Regional Overflow Dock', status: 'Buffer Staged (34 Cartons)', time: '2:30 PM', state: 'Standby' }
                ].map((d, dIdx) => (
                  <div key={dIdx} className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-on-surface">{d.bay}</span>
                      <div className="text-[11px] text-on-surface-variant">{d.status}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {d.state}
                    </span>
                  </div>
                ))}
              </div>

              {/* Attached MUTHU AI Explanation */}
              <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-primary flex items-center gap-1.5">
                    <span>🤎</span> Muthu Observes
                  </span>
                  <span className="font-bold text-primary px-2 py-0.5 rounded bg-primary/10">
                    {AI_CHART_INSIGHTS.dispatchPerformance.confidence}% AI Confidence
                  </span>
                </div>
                <p className="text-[12.5px] font-semibold text-on-surface">
                  {AI_CHART_INSIGHTS.dispatchPerformance.observation}
                </p>
                <div className="text-[11.5px] text-on-surface-variant space-y-1 pt-1 border-t border-outline-variant/20">
                  <div><strong>Reason:</strong> {AI_CHART_INSIGHTS.dispatchPerformance.reason}</div>
                  <div><strong>Impact:</strong> {AI_CHART_INSIGHTS.dispatchPerformance.impact}</div>
                  <div className="text-emerald-700 font-semibold">
                    <strong>Recommendation:</strong> {AI_CHART_INSIGHTS.dispatchPerformance.recommendation}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 2: BOTTLENECK ANOMALY DETECTOR
          ======================================================================= */}
      {activeTab === 'bottlenecks' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-headline-sm text-[18px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">troubleshoot</span>
                Autonomous Bottleneck & Anomaly Detector
              </h3>
              <p className="text-[13px] text-on-surface-variant">
                MUTHU continuously scans picking speed, station queues, SKU velocities, and worker fatigue to diagnose operational root causes.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              {BOTTLENECK_ANOMALIES.length} Active Diagnoses
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {BOTTLENECK_ANOMALIES.map((anomaly) => (
              <div
                key={anomaly.id}
                className="card-surface p-5 rounded-2xl border border-outline-variant/40 space-y-4 hover:border-outline transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <span
                      className={`material-symbols-outlined text-[20px] p-2 rounded-xl shrink-0 mt-0.5 ${
                        anomaly.severity === 'critical'
                          ? 'bg-rose-100 text-rose-800'
                          : anomaly.severity === 'high'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-blue-100 text-blue-900'
                      }`}
                    >
                      {anomaly.type === 'process'
                        ? 'precision_manufacturing'
                        : anomaly.type === 'zone'
                        ? 'grid_view'
                        : anomaly.type === 'order'
                        ? 'priority_high'
                        : anomaly.type === 'worker'
                        ? 'person_off'
                        : anomaly.type === 'inventory'
                        ? 'inventory_2'
                        : anomaly.type === 'qc'
                        ? 'qr_code_scanner'
                        : 'local_shipping'}
                    </span>
                    <div>
                      <h4 className="font-title-sm text-[14px] font-bold text-on-surface leading-snug">
                        {anomaly.title}
                      </h4>
                      {anomaly.zone && (
                        <span className="text-[11px] text-on-surface-variant font-medium">
                          📍 {anomaly.zone}
                        </span>
                      )}
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      anomaly.severity === 'critical'
                        ? 'bg-rose-100 text-rose-800 border border-rose-300'
                        : anomaly.severity === 'high'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-blue-100 text-blue-800 border border-blue-300'
                    }`}
                  >
                    {anomaly.severity}
                  </span>
                </div>

                {/* Detailed Breakdown */}
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2 text-[12px]">
                  <div>
                    <strong className="text-on-surface font-semibold">Problem:</strong>{' '}
                    <span className="text-on-surface-variant">{anomaly.problem}</span>
                  </div>
                  <div>
                    <strong className="text-on-surface font-semibold">Root Cause:</strong>{' '}
                    <span className="text-on-surface-variant">{anomaly.rootCause}</span>
                  </div>
                  <div className="text-rose-700">
                    <strong className="font-semibold">Operational Impact:</strong>{' '}
                    <span>{anomaly.impact}</span>
                  </div>
                  <div className="pt-2 border-t border-outline-variant/20 text-emerald-800">
                    <strong className="font-semibold">Suggested Fix:</strong>{' '}
                    <span>{anomaly.suggestedFix}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-on-surface-variant font-mono">
                    AI Confidence: {anomaly.confidence}%
                  </span>
                  <button
                    onClick={() => toast(`Applied Fix for ${anomaly.title}`, anomaly.suggestedFix, 'success')}
                    className="px-3.5 py-1.5 rounded-lg text-[12px] font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-all"
                  >
                    Apply Fix
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 3: WORKER ANALYTICS & TELEMETRY
          ======================================================================= */}
      {activeTab === 'workers' && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Filter & Summary Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-headline-sm text-[18px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">groups</span>
                Floor Staff Utilization & Productivity Telemetry
              </h3>
              <p className="text-[13px] text-on-surface-variant">
                Live worker load balancing, shift task completion rates, and ergonomics exertion monitoring.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Role filter */}
              <select
                value={workerRoleFilter}
                onChange={(e) => setWorkerRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/40 text-[12px] font-medium text-on-surface outline-none"
              >
                <option value="All">All Roles</option>
                <option value="Picker">Pickers</option>
                <option value="Packer">Packers</option>
                <option value="QC Inspector">QC Inspectors</option>
                <option value="Dock Stager">Dock Stagers</option>
              </select>

              {/* Shift filter */}
              <select
                value={workerShiftFilter}
                onChange={(e) => setWorkerShiftFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/40 text-[12px] font-medium text-on-surface outline-none"
              >
                <option value="All">All Shifts</option>
                <option value="Shift 1">Shift 1</option>
                <option value="Shift 2">Shift 2</option>
              </select>

              <button
                onClick={() => handleDownloadReport('workers')}
                className="px-3 py-1.5 rounded-lg bg-secondary/15 hover:bg-secondary/25 border border-secondary/40 text-primary text-[12px] font-semibold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export Staff CSV
              </button>
            </div>
          </div>

          {/* Quick Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Active Workers</span>
              <div className="text-[24px] font-bold text-on-surface mt-0.5">14 Staff</div>
              <span className="text-[11px] text-emerald-700 font-semibold">100% Shift Attendance</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Avg Utilization</span>
              <div className="text-[24px] font-bold text-primary mt-0.5">81.4%</div>
              <span className="text-[11px] text-on-surface-variant">Target: 80–85%</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Overloaded Workers</span>
              <div className="text-[24px] font-bold text-rose-600 mt-0.5">2 Staff</div>
              <span className="text-[11px] text-rose-700 font-semibold">Reallocation recommended</span>
            </div>
            <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">Idle / Reserve</span>
              <div className="text-[24px] font-bold text-amber-700 mt-0.5">2 Staff</div>
              <span className="text-[11px] text-on-surface-variant">Available for rush waves</span>
            </div>
          </div>

          {/* Worker Table */}
          <div className="card-surface rounded-2xl border border-outline-variant/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-surface-container-low border-b border-outline-variant/30 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  <tr>
                    <th className="py-3.5 px-4">Staff Member</th>
                    <th className="py-3.5 px-4">Role & Shift</th>
                    <th className="py-3.5 px-4">Current Status</th>
                    <th className="py-3.5 px-4">Utilization</th>
                    <th className="py-3.5 px-4">Tasks Done</th>
                    <th className="py-3.5 px-4">Avg Speed</th>
                    <th className="py-3.5 px-4">Zone</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {filteredWorkers.map((worker) => (
                    <tr key={worker.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-[12px] flex items-center justify-center">
                            {worker.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-on-surface block">{worker.name}</span>
                            <span className="text-[11px] text-on-surface-variant font-mono">ID: {worker.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-on-surface">{worker.role}</span>
                        <div className="text-[11px] text-on-surface-variant">{worker.shift}</div>
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            worker.status === 'Active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : worker.status === 'Overloaded'
                              ? 'bg-rose-100 text-rose-800'
                              : worker.status === 'Idle'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-surface-container text-on-surface-variant'
                          }`}
                        >
                          {worker.status}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-on-surface font-mono">{worker.utilizationRate}%</span>
                          <div className="w-16 h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                worker.utilizationRate > 90
                                  ? 'bg-rose-600'
                                  : worker.utilizationRate < 70
                                  ? 'bg-amber-600'
                                  : 'bg-emerald-600'
                              }`}
                              style={{ width: `${worker.utilizationRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-mono font-medium text-on-surface">
                        {worker.tasksCompleted} units
                      </td>

                      <td className="py-3 px-4 font-mono text-on-surface">
                        {worker.avgPickingTime > 0
                          ? `${worker.avgPickingTime} min pick`
                          : worker.avgPackingTime > 0
                          ? `${worker.avgPackingTime} min pack`
                          : '1.2 min scan'}
                      </td>

                      <td className="py-3 px-4 text-on-surface-variant font-medium">
                        {worker.zone}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => toast(`Rebalancing task for ${worker.name}`, 'Task rerouted via MUTHU optimizer.', 'success')}
                          className="px-2.5 py-1 rounded text-[11px] font-semibold text-primary hover:bg-primary/10 transition-colors"
                        >
                          Rebalance
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 4: DECISION HISTORY & AUDIT LOGS
          ======================================================================= */}
      {activeTab === 'decisions' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-headline-sm text-[18px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">verified</span>
                Audited Decision History & Outcome Ledger
              </h3>
              <p className="text-[13px] text-on-surface-variant">
                Every MUTHU algorithmic recommendation, approval authority, and final measurable operational outcome.
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-outline text-[16px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search decisions..."
                  value={decisionSearch}
                  onChange={(e) => setDecisionSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/40 text-[12px] text-on-surface outline-none"
                />
              </div>

              <select
                value={decisionStatusFilter}
                onChange={(e) => setDecisionStatusFilter(e.target.value as any)}
                className="px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/40 text-[12px] font-medium text-on-surface outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
              </select>

              <button
                onClick={() => handleDownloadReport('decisions')}
                className="px-3.5 py-1.5 rounded-lg bg-secondary/15 hover:bg-secondary/25 border border-secondary/40 text-primary text-[12px] font-semibold flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Export Ledger CSV
              </button>
            </div>
          </div>

          {/* Decision Cards List */}
          <div className="space-y-4">
            {filteredDecisions.map((dec) => (
              <div
                key={dec.id}
                className="card-surface p-5 rounded-2xl border border-outline-variant/40 hover:border-outline transition-all space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[14px]">🤎</span>
                      <h4 className="font-title-sm text-[15px] font-bold text-on-surface">
                        {dec.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container uppercase tracking-wider text-on-surface-variant">
                        {dec.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                        {dec.confidence}% Confidence
                      </span>
                    </div>
                    <p className="text-[12px] text-on-surface-variant">
                      <strong>Reason:</strong> {dec.reason}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                        dec.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : dec.status === 'Rejected'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {dec.status}
                    </span>
                  </div>
                </div>

                {/* Outcome & Impact Grid */}
                <div className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px]">
                  <div>
                    <span className="text-on-surface-variant font-semibold block text-[11px] uppercase">
                      Operational Action
                    </span>
                    <span className="text-on-surface font-medium">{dec.operationalImpact}</span>
                  </div>

                  <div>
                    <span className="text-emerald-700 font-semibold block text-[11px] uppercase">
                      Final Measured Outcome
                    </span>
                    <span className="text-emerald-900 font-medium">{dec.finalOutcome}</span>
                  </div>

                  <div className="md:border-l border-outline-variant/30 md:pl-3">
                    <span className="text-on-surface-variant font-semibold block text-[11px] uppercase">
                      Approved By & Timestamp
                    </span>
                    <span className="text-on-surface">{dec.approvedBy} • {dec.timestamp}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 5: CHRONOLOGICAL AUDIT TIMELINE
          ======================================================================= */}
      {activeTab === 'timeline' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-headline-sm text-[18px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">history</span>
                Facility Chronological Audit Timeline
              </h3>
              <p className="text-[13px] text-on-surface-variant">
                Immutable event stream for picking waves, packaging runs, optical QC verifications, and trailer sweeps.
              </p>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
              {['All', 'dispatch', 'decision', 'qc', 'packing', 'worker', 'inventory'].map((type) => (
                <button
                  key={type}
                  onClick={() => setAuditTypeFilter(type)}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium capitalize transition-all ${
                    auditTypeFilter === type
                      ? 'bg-primary text-surface font-semibold shadow-xs'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/40">
            {filteredTimeline.map((item) => (
              <div key={item.id} className="relative flex items-start gap-4">
                <div
                  className={`absolute -left-6 w-5 h-5 rounded-full border-2 border-surface flex items-center justify-center text-[10px] font-bold ${
                    item.status === 'success'
                      ? 'bg-emerald-600 text-surface'
                      : item.status === 'warning'
                      ? 'bg-amber-600 text-surface'
                      : 'bg-primary text-surface'
                  }`}
                >
                  ✓
                </div>

                <div className="card-surface p-4 rounded-xl border border-outline-variant/30 flex-1 space-y-1.5">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <h4 className="font-title-sm text-[13.5px] font-bold text-on-surface">
                        {item.title}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-container uppercase tracking-wider text-on-surface-variant">
                        {item.badge}
                      </span>
                    </div>
                    <span className="text-[11px] text-outline font-mono">
                      {item.timestamp} ({item.timeAgo})
                    </span>
                  </div>

                  <p className="text-[12.5px] text-on-surface-variant">
                    {item.description}
                  </p>

                  <div className="text-[11px] text-outline pt-1 flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-[13px]">person</span>
                    Triggered by: <strong className="text-on-surface">{item.user}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =======================================================================
          TAB 6: EXPORT VAULT
          ======================================================================= */}
      {activeTab === 'exports' && (
        <div className="space-y-6 animate-fade-in">
          <div>
            <h3 className="font-headline-sm text-[18px] font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">folder_zip</span>
              Warehouse Operations Export Vault
            </h3>
            <p className="text-[13px] text-on-surface-variant">
              Generate and instantly download audited CSV and executive operational summary reports to your device.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                id: 'summary',
                title: 'Warehouse Summary Report',
                desc: 'Executive high-level KPIs, health scores, dispatch velocity, and SLA guarantees.',
                format: 'CSV Document',
                icon: 'summarize'
              },
              {
                id: 'analytics',
                title: 'Workflow Velocity & Analytics',
                desc: 'Detailed 15-stage cycle breakdown, bottleneck metrics, and hourly throughput logs.',
                format: 'CSV Document',
                icon: 'analytics'
              },
              {
                id: 'decisions',
                title: 'Decision History & AI Ledger',
                desc: 'Every MUTHU recommendation, approval authority, and final measured outcomes.',
                format: 'CSV Document',
                icon: 'verified'
              },
              {
                id: 'workers',
                title: 'Floor Staff Productivity Telemetry',
                desc: 'Shift-by-shift picker and packer utilization, task speeds, and fatigue ratings.',
                format: 'CSV Document',
                icon: 'groups'
              },
              {
                id: 'simulation',
                title: 'Digital Twin Simulation Report',
                desc: 'Before vs After vs MUTHU Optimized stress-testing scenario comparative metrics.',
                format: 'CSV Document',
                icon: 'model_training'
              }
            ].map((exp) => (
              <div
                key={exp.id}
                className="card-surface p-5 rounded-2xl border border-outline-variant/40 space-y-4 flex flex-col justify-between hover:border-primary transition-all"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="material-symbols-outlined text-primary text-[24px] p-2 rounded-xl bg-primary/10">
                      {exp.icon}
                    </span>
                    <span className="text-[11px] font-bold text-outline uppercase font-mono">
                      {exp.format}
                    </span>
                  </div>
                  <h4 className="font-title-sm text-[15px] font-bold text-on-surface">
                    {exp.title}
                  </h4>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    {exp.desc}
                  </p>
                </div>

                <button
                  onClick={() => handleDownloadReport(exp.id as any)}
                  className="w-full py-2.5 rounded-xl bg-primary text-surface hover:bg-primary/90 font-label-md text-[13px] font-bold flex items-center justify-center gap-2 transition-all shadow-xs"
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Download {exp.title.split(' ')[0]} CSV
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
