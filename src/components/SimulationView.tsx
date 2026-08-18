import React, { useState, useMemo, useEffect } from 'react';
import {
  SimulationParams,
  SimulationResults,
  SimulationHistoryRecord,
  GlobalOrderFilter
} from '../types';
import {
  DEFAULT_SIMULATION_PARAMS,
  PRESET_SCENARIOS,
  INITIAL_SIMULATION_HISTORY,
  calculateSimulationResults,
  ScenarioPreset
} from '../simulationEngine';
import { MASCOT_LOGO_URL } from '../mockData';

interface SimulationViewProps {
  onShowToast: (title: string, description?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
  onNavigateToOrders?: () => void;
  globalOrderFilter?: GlobalOrderFilter;
}

export const SimulationView: React.FC<SimulationViewProps> = ({
  onShowToast,
  onNavigateToOrders,
  globalOrderFilter = 'all'
}) => {
  // Active simulation parameters
  const [params, setParams] = useState<SimulationParams>(DEFAULT_SIMULATION_PARAMS);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'orders' | 'inventory' | 'workers' | 'warehouse' | 'dispatch' | 'custom'>('all');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('preset-orders-500');

  // Auto select preset based on globalOrderFilter if provided
  useEffect(() => {
    if (globalOrderFilter === 'business') {
      const b2bPreset = PRESET_SCENARIOS.find((p) => p.id === 'preset-orders-b2b-pallet');
      if (b2bPreset) {
        setSelectedPresetId(b2bPreset.id);
        setParams((prev) => ({
          ...prev,
          ...b2bPreset.params,
          scenarioName: b2bPreset.name,
          category: b2bPreset.category
        }));
      }
    } else if (globalOrderFilter === 'individual') {
      const b2cPreset = PRESET_SCENARIOS.find((p) => p.id === 'preset-orders-b2c-flash');
      if (b2cPreset) {
        setSelectedPresetId(b2cPreset.id);
        setParams((prev) => ({
          ...prev,
          ...b2cPreset.params,
          scenarioName: b2cPreset.name,
          category: b2cPreset.category
        }));
      }
    }
  }, [globalOrderFilter]);
  
  // Applied recommendations state for interactive what-if testing
  const [appliedRecIds, setAppliedRecIds] = useState<string[]>([]);
  
  // Simulation history state
  const [history, setHistory] = useState<SimulationHistoryRecord[]>(INITIAL_SIMULATION_HISTORY);
  
  // Simulation execution state
  const [isSimulating, setIsSimulating] = useState(false);
  const [hasRun, setHasRun] = useState(true);
  const [activeTab, setActiveTab] = useState<'twin' | 'heatmap' | 'history'>('twin');

  // Calculate live simulation results
  const results: SimulationResults = useMemo(() => {
    return calculateSimulationResults(params, appliedRecIds);
  }, [params, appliedRecIds]);

  // Handle Preset selection
  const handleSelectPreset = (preset: ScenarioPreset) => {
    setSelectedPresetId(preset.id);
    setParams({
      ...DEFAULT_SIMULATION_PARAMS,
      ...preset.params,
      scenarioName: preset.name,
      category: preset.category
    });
    setAppliedRecIds([]); // Reset applied recommendations for clean test
    onShowToast(`Loaded Scenario: ${preset.name}`, preset.description, 'info');
  };

  // Run Simulation trigger
  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setHasRun(true);
      onShowToast(
        'Simulation Complete',
        `MUTHU analyzed "${params.scenarioName}" with ${results.confidenceScore}% confidence.`,
        'success'
      );
    }, 600);
  };

  // Reset Simulation
  const handleReset = () => {
    setParams(DEFAULT_SIMULATION_PARAMS);
    setSelectedPresetId('preset-orders-500');
    setAppliedRecIds([]);
    onShowToast('Simulation Reset', 'Parameters restored to warehouse standard baseline.', 'info');
  };

  // Toggle recommendation application
  const handleToggleRecommendation = (recId: string) => {
    const isApplied = appliedRecIds.includes(recId);
    let updated: string[];
    if (isApplied) {
      updated = appliedRecIds.filter(id => id !== recId);
      onShowToast('Recommendation Removed', 'Simulation metrics updated back to baseline risk.', 'info');
    } else {
      updated = [...appliedRecIds, recId];
      const rec = results.recommendations.find(r => r.id === recId);
      onShowToast(
        'Recommendation Applied to Twin',
        rec ? rec.impactReduction : 'Optimized twin metrics re-calculated in real time.',
        'success'
      );
    }
    setAppliedRecIds(updated);
  };

  // Apply all recommendations
  const handleApplyAllRecommendations = () => {
    const allIds = results.recommendations.map(r => r.id);
    setAppliedRecIds(allIds);
    onShowToast(
      'All Muthu Recommendations Applied',
      'MUTHU full mitigation strategy active. Maximum KPI recovery achieved.',
      'success'
    );
  };

  // Save report to history
  const handleSaveReport = () => {
    const newRecord: SimulationHistoryRecord = {
      id: `sim-hist-${Date.now()}`,
      scenarioName: params.scenarioName,
      category: params.category,
      timestamp: 'Just now',
      createdBy: 'Lead Ops Manager',
      params: { ...params },
      results: { ...results },
      recommendationsAppliedCount: appliedRecIds.length
    };
    setHistory([newRecord, ...history]);
    onShowToast(
      'Simulation Report Saved',
      `"${params.scenarioName}" saved to history archive with comparison metrics.`,
      'success'
    );
  };

  // Filter presets based on category
  const filteredPresets = useMemo(() => {
    if (selectedCategory === 'all') return PRESET_SCENARIOS;
    if (selectedCategory === 'custom') return [];
    return PRESET_SCENARIOS.filter(p => p.category === selectedCategory);
  }, [selectedCategory]);

  const hasAppliedAny = appliedRecIds.length > 0;
  const activeMetrics = hasAppliedAny ? results.optimizedMetrics : results.simulatedMetrics;

  return (
    <div id="simulation-center-view" className="space-y-8 animate-fade-in pb-12">
      {/* 1. Header & Live Warehouse Snapshot Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-[18px]">
              🤎
            </span>
            <h1 className="font-headline-md text-[26px] md:text-[30px] font-bold text-on-surface tracking-tight">
              Warehouse Simulation Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-secondary/15 text-primary border border-secondary/30">
              MUTHU Digital Twin
            </span>
          </div>
          <p className="font-body-md text-on-surface-variant text-[14px] mt-1">
            Safely test operational scenarios, stress-test shift capacity, and validate MUTHU recommendations before real-world execution.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            id="btn-reset-simulation"
            onClick={handleReset}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium text-on-surface-variant hover:text-on-surface bg-surface-container-low hover:bg-surface-container border border-outline-variant/50 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            Reset Baseline
          </button>

          <button
            id="btn-save-report"
            onClick={handleSaveReport}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium text-primary bg-secondary/15 hover:bg-secondary/25 border border-secondary/40 transition-all"
          >
            <span className="material-symbols-outlined text-[18px]">bookmark_add</span>
            Save Report
          </button>

          <button
            id="btn-run-simulation"
            onClick={handleRunSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[14px] font-semibold text-surface bg-primary hover:bg-primary/90 shadow-sm transition-all ${
              isSimulating ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${isSimulating ? 'animate-spin' : ''}`}>
              {isSimulating ? 'progress_activity' : 'play_arrow'}
            </span>
            {isSimulating ? 'Simulating Twin...' : 'Run Simulation'}
          </button>
        </div>
      </div>

      {/* Live Warehouse Snapshot Banner */}
      <div
        id="warehouse-live-snapshot-banner"
        className="card-surface p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest flex flex-wrap items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant/80">
              Live Warehouse State (Twin Synchronized)
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[14px] font-bold text-on-surface">Base Health: 95/100</span>
              <span className="text-on-surface-variant text-[12px]">• 55 Active Orders In-Flight</span>
              <span className="text-on-surface-variant text-[12px]">• 14 Staff Active</span>
              <span className="text-on-surface-variant text-[12px]">• 0 SLA Violations</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-surface-container-high p-0.5 rounded-lg border border-outline-variant/40">
            <button
              onClick={() => setActiveTab('twin')}
              className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all ${
                activeTab === 'twin'
                  ? 'bg-surface text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Digital Twin & Strategy
            </button>
            <button
              onClick={() => setActiveTab('heatmap')}
              className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all ${
                activeTab === 'heatmap'
                  ? 'bg-surface text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Zone Heatmap
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1 text-[12px] font-medium rounded-md transition-all ${
                activeTab === 'history'
                  ? 'bg-surface text-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              History Archive ({history.length})
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'twin' && (
        <>
          {/* 2. Scenario Builder Section */}
          <div id="scenario-builder-section" className="card-surface p-6 rounded-2xl border border-outline-variant/40 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-outline-variant/20 pb-4">
              <div>
                <h2 className="font-headline-sm text-[18px] font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                  Scenario Builder & Stress Testing
                </h2>
                <p className="font-body-sm text-on-surface-variant text-[13px]">
                  Select an operational preset or fine-tune custom parameters to simulate order surges, staff shortages, or bottlenecks.
                </p>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: 'all', label: 'All Presets' },
                  { id: 'orders', label: 'Orders' },
                  { id: 'inventory', label: 'Inventory' },
                  { id: 'workers', label: 'Workers' },
                  { id: 'warehouse', label: 'Warehouse' },
                  { id: 'dispatch', label: 'Dispatch' },
                  { id: 'custom', label: 'Custom' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as any)}
                    className={`px-3 py-1 rounded-full text-[12px] font-medium transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-primary text-surface font-semibold shadow-xs'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets Grid */}
            {selectedCategory !== 'custom' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                {filteredPresets.map(preset => {
                  const isSelected = selectedPresetId === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset)}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all border text-left flex flex-col justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30'
                          : 'border-outline-variant/40 bg-surface-container-lowest hover:border-outline hover:bg-surface-container-low'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`material-symbols-outlined text-[20px] p-1.5 rounded-lg ${
                              isSelected ? 'bg-primary text-surface' : 'bg-surface-container text-on-surface-variant'
                            }`}
                          >
                            {preset.icon}
                          </span>
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant/70">
                            {preset.category}
                          </span>
                        </div>
                        <h4 className="font-title-sm text-[13px] font-bold text-on-surface leading-snug">
                          {preset.name}
                        </h4>
                        <p className="font-body-xs text-[11px] text-on-surface-variant line-clamp-2 mt-1">
                          {preset.description}
                        </p>
                      </div>
                      <div className="mt-3 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                        <span className="text-primary font-medium">
                          {isSelected ? '✓ Active in Twin' : 'Click to Load'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Custom Parameter Sliders & Toggles */}
            <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Fine-Tune Simulation Parameters ({params.scenarioName})
                </span>
                <span className="text-[11px] text-on-surface-variant/70">
                  Live calculation updates in real time
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* 1. Additional Orders Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-medium text-on-surface">Additional Orders</span>
                    <span className="font-bold text-primary">+{params.additionalOrders} pkgs</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="800"
                    step="25"
                    value={params.additionalOrders}
                    onChange={(e) => setParams({ ...params, additionalOrders: Number(e.target.value) })}
                    className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant/70">
                    <span>0 (Normal)</span>
                    <span>+400 (Surge)</span>
                    <span>+800 (Flash)</span>
                  </div>
                </div>

                {/* 2. Worker Staff Delta */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-medium text-on-surface">Staff Delta (Pick & Pack)</span>
                    <span className={`font-bold ${params.activePickersDelta + params.activePackersDelta < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {params.activePickersDelta + params.activePackersDelta > 0 ? '+' : ''}
                      {params.activePickersDelta + params.activePackersDelta} Staff
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-6"
                    max="6"
                    step="1"
                    value={params.activePickersDelta + params.activePackersDelta}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      const half = Math.round(total / 2);
                      setParams({
                        ...params,
                        activePickersDelta: half,
                        activePackersDelta: total - half
                      });
                    }}
                    className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant/70">
                    <span>-6 Absent</span>
                    <span>0 Baseline</span>
                    <span>+6 Temp</span>
                  </div>
                </div>

                {/* 3. Zone Congestion % */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-medium text-on-surface">Zone B Congestion</span>
                    <span className={`font-bold ${params.zoneCongestionPercent > 75 ? 'text-amber-700' : 'text-on-surface'}`}>
                      {params.zoneCongestionPercent}% Load
                    </span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="98"
                    step="2"
                    value={params.zoneCongestionPercent}
                    onChange={(e) => setParams({ ...params, zoneCongestionPercent: Number(e.target.value) })}
                    className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant/70">
                    <span>20% Clear</span>
                    <span>60% Medium</span>
                    <span>98% Jammed</span>
                  </div>
                </div>

                {/* 4. Courier Delay */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[12px]">
                    <span className="font-medium text-on-surface">Courier Delay (Outbound)</span>
                    <span className={`font-bold ${params.courierDelayMinutes > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                      +{params.courierDelayMinutes} mins
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="90"
                    step="15"
                    value={params.courierDelayMinutes}
                    onChange={(e) => setParams({ ...params, courierDelayMinutes: Number(e.target.value) })}
                    className="w-full accent-primary h-1.5 bg-surface-container-high rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-on-surface-variant/70">
                    <span>0 On-Time</span>
                    <span>+45m Delay</span>
                    <span>+90m Severe</span>
                  </div>
                </div>
              </div>

              {/* Extra Toggles */}
              <div className="pt-3 border-t border-outline-variant/20 flex flex-wrap items-center gap-4 text-[12px]">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={params.vehicleBreakdown}
                    onChange={(e) => setParams({ ...params, vehicleBreakdown: e.target.checked })}
                    className="accent-primary rounded"
                  />
                  <span className="text-on-surface font-medium">Van Breakdown Event</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={params.stockoutSeverity === 'critical'}
                    onChange={(e) => setParams({ ...params, stockoutSeverity: e.target.checked ? 'critical' : 'none' })}
                    className="accent-primary rounded"
                  />
                  <span className="text-on-surface font-medium">Critical SKU Stockout</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={params.orderTypeMix === 'vip_surge'}
                    onChange={(e) => setParams({ ...params, orderTypeMix: e.target.checked ? 'vip_surge' : 'normal' })}
                    className="accent-primary rounded"
                  />
                  <span className="text-on-surface font-medium">VIP Express Priority Surge</span>
                </label>
              </div>
            </div>
          </div>

          {/* 3. Before vs After Side-by-Side Comparison Grid */}
          <div id="before-after-comparison-section" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">compare_arrows</span>
                <h3 className="font-headline-sm text-[18px] font-bold text-on-surface">
                  Before vs Simulated vs MUTHU Optimized State
                </h3>
              </div>
              {hasAppliedAny && (
                <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                  ✨ {appliedRecIds.length} Recommendation{appliedRecIds.length > 1 ? 's' : ''} Applied — Optimizing Twin
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Card 1: Warehouse Health */}
              <div className="card-surface p-4 rounded-xl border border-outline-variant/40 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                  Warehouse Health
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-[20px] font-bold text-on-surface">
                    {results.beforeMetrics.healthScore}
                  </span>
                  <span className="text-[12px] text-on-surface-variant">↓</span>
                  <span className={`text-[20px] font-bold ${activeMetrics.healthScore < 75 ? 'text-rose-600' : 'text-amber-700'}`}>
                    {activeMetrics.healthScore}
                  </span>
                </div>
                <div className="text-[11px] font-medium flex items-center justify-between text-on-surface-variant/80 pt-1 border-t border-outline-variant/20">
                  <span>Delta: {activeMetrics.healthScore - results.beforeMetrics.healthScore} pts</span>
                  <span className={activeMetrics.healthScore >= 90 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {activeMetrics.healthScore >= 90 ? 'Healthy' : 'At Risk'}
                  </span>
                </div>
              </div>

              {/* Card 2: Dispatch Delay */}
              <div className="card-surface p-4 rounded-xl border border-outline-variant/40 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                  Dispatch Time
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-[20px] font-bold text-on-surface">
                    {results.beforeMetrics.avgDispatchDelayMinutes}m
                  </span>
                  <span className="text-[12px] text-on-surface-variant">↓</span>
                  <span className={`text-[20px] font-bold ${activeMetrics.avgDispatchDelayMinutes > 45 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {activeMetrics.avgDispatchDelayMinutes}m
                  </span>
                </div>
                <div className="text-[11px] font-medium flex items-center justify-between text-on-surface-variant/80 pt-1 border-t border-outline-variant/20">
                  <span>+{activeMetrics.avgDispatchDelayMinutes - results.beforeMetrics.avgDispatchDelayMinutes} min latency</span>
                  <span className="text-on-surface font-semibold">{activeMetrics.avgPackingTimeMinutes}m pack</span>
                </div>
              </div>

              {/* Card 3: SLA Compliance */}
              <div className="card-surface p-4 rounded-xl border border-outline-variant/40 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                  SLA Compliance
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-[20px] font-bold text-on-surface">
                    {results.beforeMetrics.slaCompliance}%
                  </span>
                  <span className="text-[12px] text-on-surface-variant">↓</span>
                  <span className={`text-[20px] font-bold ${activeMetrics.slaCompliance < 90 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {activeMetrics.slaCompliance}%
                  </span>
                </div>
                <div className="text-[11px] font-medium flex items-center justify-between text-on-surface-variant/80 pt-1 border-t border-outline-variant/20">
                  <span>Target: 98.0%</span>
                  <span className={activeMetrics.slaCompliance >= 98 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                    {activeMetrics.slaCompliance >= 98 ? 'Protected' : 'Breach Risk'}
                  </span>
                </div>
              </div>

              {/* Card 4: Orders Delayed */}
              <div className="card-surface p-4 rounded-xl border border-outline-variant/40 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                  Delayed Orders
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-[20px] font-bold text-on-surface">
                    {results.beforeMetrics.ordersDelayedCount}
                  </span>
                  <span className="text-[12px] text-on-surface-variant">↓</span>
                  <span className={`text-[20px] font-bold ${activeMetrics.ordersDelayedCount > 10 ? 'text-rose-600' : 'text-amber-700'}`}>
                    {activeMetrics.ordersDelayedCount} pkgs
                  </span>
                </div>
                <div className="text-[11px] font-medium flex items-center justify-between text-on-surface-variant/80 pt-1 border-t border-outline-variant/20">
                  <span>In-Queue Surge</span>
                  <span className="text-rose-600 font-semibold">+{activeMetrics.ordersDelayedCount - results.beforeMetrics.ordersDelayedCount} orders</span>
                </div>
              </div>

              {/* Card 5: Worker Utilization */}
              <div className="card-surface p-4 rounded-xl border border-outline-variant/40 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                  Worker Utilization
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-[20px] font-bold text-on-surface">
                    {results.beforeMetrics.workerUtilization}%
                  </span>
                  <span className="text-[12px] text-on-surface-variant">↓</span>
                  <span className={`text-[20px] font-bold ${activeMetrics.workerUtilization > 92 ? 'text-rose-600' : 'text-emerald-700'}`}>
                    {activeMetrics.workerUtilization}%
                  </span>
                </div>
                <div className="text-[11px] font-medium flex items-center justify-between text-on-surface-variant/80 pt-1 border-t border-outline-variant/20">
                  <span>Capacity: Max 95%</span>
                  <span className={activeMetrics.workerUtilization > 92 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {activeMetrics.workerUtilization > 92 ? 'Overloaded' : 'Optimal'}
                  </span>
                </div>
              </div>

              {/* Card 6: Revenue / Risk Impact */}
              <div className="card-surface p-4 rounded-xl border border-outline-variant/40 space-y-2">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-on-surface-variant">
                  Revenue at Risk
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-[20px] font-bold text-on-surface">
                    ₹0
                  </span>
                  <span className="text-[12px] text-on-surface-variant">↓</span>
                  <span className={`text-[20px] font-bold ${activeMetrics.revenueAtRisk > 50000 ? 'text-rose-600' : 'text-amber-700'}`}>
                    ₹{activeMetrics.revenueAtRisk.toLocaleString()}
                  </span>
                </div>
                <div className="text-[11px] font-medium flex items-center justify-between text-on-surface-variant/80 pt-1 border-t border-outline-variant/20">
                  <span>SLA Penalty Exposure</span>
                  <span className="text-on-surface-variant">{activeMetrics.inventoryShortagesCount} SKUs low</span>
                </div>
              </div>
            </div>
          </div>

          {/* 4. MUTHU Simulation Report & Interactive Recommendation Strategy Center */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Muthu Analysis & Problem Breakdown (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="card-surface p-6 rounded-2xl border border-outline-variant/40 space-y-5 bg-gradient-to-br from-surface to-secondary/5">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-outline-variant/50">
                      <img src={MASCOT_LOGO_URL} alt="MUTHU" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h3 className="font-headline-sm text-[17px] font-bold text-on-surface flex items-center gap-1.5">
                        <span>🤎</span> Muthu's Simulation Report
                      </h3>
                      <p className="font-body-xs text-[11px] text-on-surface-variant">
                        Scenario: <strong className="text-on-surface">{params.scenarioName}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary/10 text-primary border border-primary/20">
                      {results.confidenceScore}% Confidence
                    </span>
                  </div>
                </div>

                {/* Prediction Box */}
                <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant/30 space-y-2">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-primary">psychology</span>
                    Prediction & Diagnosis
                  </div>
                  <p className="font-body-md text-[13px] text-on-surface leading-relaxed">
                    {results.predictionSummary}
                  </p>
                </div>

                {/* Detected Problems List */}
                <div className="space-y-3">
                  <div className="text-[11px] uppercase tracking-wider font-bold text-on-surface-variant flex items-center justify-between">
                    <span>Detected Bottlenecks ({results.detectedProblems.length})</span>
                    <span className="text-rose-600 font-semibold">Real-Time Risk Analysis</span>
                  </div>

                  <div className="space-y-2">
                    {results.detectedProblems.map(prob => (
                      <div
                        key={prob.id}
                        className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/30 flex items-start gap-2.5"
                      >
                        <span
                          className={`material-symbols-outlined text-[18px] shrink-0 mt-0.5 ${
                            prob.severity === 'critical'
                              ? 'text-rose-600'
                              : prob.severity === 'high'
                              ? 'text-amber-700'
                              : 'text-primary'
                          }`}
                        >
                          warning
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h5 className="font-title-xs text-[13px] font-bold text-on-surface">
                              {prob.title}
                            </h5>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                prob.severity === 'critical'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-amber-100 text-amber-900'
                              }`}
                            >
                              {prob.severity}
                            </span>
                          </div>
                          <p className="text-[12px] text-on-surface-variant mt-0.5">
                            {prob.impact}
                          </p>
                          {prob.zone && (
                            <span className="inline-block mt-1 text-[10px] font-medium text-on-surface-variant/80 bg-surface-container px-1.5 py-0.5 rounded">
                              📍 {prob.zone}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Business Impact Summary */}
                <div className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200/60 text-[12px] text-rose-900 space-y-1">
                  <strong className="font-semibold block flex items-center gap-1.5 text-rose-800">
                    <span className="material-symbols-outlined text-[16px]">trending_down</span>
                    Business & Financial Impact Exposure:
                  </strong>
                  <p>{results.businessImpactSummary}</p>
                </div>
              </div>
            </div>

            {/* Right: Actionable Recommendations & Live Strategy Testing (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div className="card-surface p-6 rounded-2xl border border-outline-variant/40 space-y-5">
                <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
                  <div>
                    <h3 className="font-headline-sm text-[18px] font-bold text-on-surface flex items-center gap-2">
                      <span>🤎</span> MUTHU Recommended Mitigation Strategy
                    </h3>
                    <p className="font-body-xs text-[12px] text-on-surface-variant">
                      Click <strong className="text-primary">"Apply to Twin"</strong> to instantly test the recommendation impact in real time.
                    </p>
                  </div>

                  <button
                    onClick={handleApplyAllRecommendations}
                    className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-primary bg-secondary/20 hover:bg-secondary/30 border border-secondary/40 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">done_all</span>
                    Apply All Recommendations
                  </button>
                </div>

                {/* Recommendations Interactive Cards */}
                <div className="space-y-3.5">
                  {results.recommendations.map(rec => {
                    const isApplied = appliedRecIds.includes(rec.id);
                    return (
                      <div
                        key={rec.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isApplied
                            ? 'border-emerald-500 bg-emerald-50/30 ring-1 ring-emerald-400'
                            : 'border-outline-variant/40 bg-surface-container-lowest hover:border-outline'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[14px]">🤎</span>
                              <h4 className="font-title-sm text-[14px] font-bold text-on-surface">
                                {rec.title}
                              </h4>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary">
                                {rec.confidence}% Match
                              </span>
                            </div>

                            <p className="text-[12px] text-on-surface-variant">
                              {rec.description}
                            </p>

                            <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/30 text-[12px] space-y-1">
                              <div className="text-on-surface font-medium">
                                <strong className="text-primary">Action:</strong> {rec.recommendedAction}
                              </div>
                              <div className="text-emerald-700 font-semibold flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                {rec.impactReduction}
                              </div>
                            </div>
                          </div>

                          {/* Toggle Action Button */}
                          <div className="shrink-0 flex sm:flex-col items-center gap-2">
                            <button
                              onClick={() => handleToggleRecommendation(rec.id)}
                              className={`px-4 py-2 rounded-lg text-[12px] font-bold flex items-center gap-1.5 transition-all shadow-xs ${
                                isApplied
                                  ? 'bg-emerald-600 text-surface hover:bg-emerald-700'
                                  : 'bg-primary text-surface hover:bg-primary/90'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {isApplied ? 'check_circle' : 'add_circle'}
                              </span>
                              {isApplied ? 'Applied to Twin' : 'Apply to Twin'}
                            </button>
                            {isApplied && (
                              <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">
                                Active in Sim
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Expected Improvement Banner */}
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                  <span className="material-symbols-outlined text-emerald-700 text-[24px] shrink-0">
                    verified
                  </span>
                  <div>
                    <h5 className="font-title-sm text-[13px] font-bold text-emerald-950">
                      MUTHU Net Improvement Outcome
                    </h5>
                    <p className="text-[12px] text-emerald-900 mt-0.5 leading-relaxed">
                      {results.expectedImprovementSummary}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Resource Allocation & Workflow Timeline Impact */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shift Worker Resource Allocation */}
            <div className="card-surface p-6 rounded-2xl border border-outline-variant/40 space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
                  <h4 className="font-headline-sm text-[16px] font-bold text-on-surface">
                    Worker Allocation Diagram (Current vs Twin vs Optimized)
                  </h4>
                </div>
                <span className="text-[11px] font-medium text-on-surface-variant">14 Staff on Floor</span>
              </div>

              <div className="space-y-3 text-[12px]">
                {[
                  { stage: 'Picking Waves', count: results.workerAllocations.picking, baseline: 6, max: 10, color: 'bg-primary' },
                  { stage: 'Packing Line Benches', count: results.workerAllocations.packing, baseline: 4, max: 10, color: 'bg-amber-600' },
                  { stage: 'Quality Control Scan', count: results.workerAllocations.qc, baseline: 2, max: 6, color: 'bg-blue-600' },
                  { stage: 'Staging & Outbound Docks', count: results.workerAllocations.staging, baseline: 2, max: 6, color: 'bg-emerald-600' }
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-medium text-on-surface">
                      <span>{item.stage}</span>
                      <span className="font-bold text-primary">
                        {item.count} Workers ({item.count > item.baseline ? `+${item.count - item.baseline} reallocated` : 'Standard'})
                      </span>
                    </div>
                    <div className="h-3 w-full bg-surface-container-high rounded-full overflow-hidden flex">
                      <div
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${(item.count / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[11px] text-on-surface-variant/80 pt-2 border-t border-outline-variant/20">
                💡 Applying MUTHU recommendations dynamically balances staff between Picking and Packing to eliminate the bottleneck without hiring overtime labor.
              </p>
            </div>

            {/* Workflow Stage Velocity Timeline */}
            <div className="card-surface p-6 rounded-2xl border border-outline-variant/40 space-y-4">
              <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">timelapse</span>
                  <h4 className="font-headline-sm text-[16px] font-bold text-on-surface">
                    Fulfillment Stage Velocity & Queue Delay
                  </h4>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 font-semibold">Real-Time Simulation</span>
              </div>

              <div className="space-y-3.5 text-[12px]">
                {[
                  { name: '1. Order Intake & Wave Allocation', normal: '2 min', sim: '4 min', opt: '2 min', status: 'Optimal' },
                  { name: '2. Zone A/B Picking Cycle', normal: '14 min', sim: `${activeMetrics.avgPickingTimeMinutes} min`, opt: '14 min', status: activeMetrics.avgPickingTimeMinutes > 18 ? 'Lagging' : 'Optimal' },
                  { name: '3. Packing Bench & Boxing', normal: '10 min', sim: `${activeMetrics.avgPackingTimeMinutes} min`, opt: '10 min', status: activeMetrics.avgPackingTimeMinutes > 14 ? 'Bottleneck' : 'Optimal' },
                  { name: '4. QC Scan & Verification', normal: '3 min', sim: `${3 + params.qcDelayMinutes} min`, opt: '3 min', status: params.qcDelayMinutes > 0 ? 'Delayed' : 'Optimal' },
                  { name: '5. Outbound Staging & Carrier Cutoff', normal: '24 min', sim: `${activeMetrics.avgDispatchDelayMinutes} min`, opt: '26 min', status: activeMetrics.avgDispatchDelayMinutes > 40 ? 'Critical' : 'Protected' }
                ].map((step, sIdx) => (
                  <div key={sIdx} className="p-2.5 rounded-lg bg-surface-container-lowest border border-outline-variant/20 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-on-surface">{step.name}</span>
                      <div className="text-[11px] text-on-surface-variant">
                        Baseline: {step.normal} • <strong className="text-on-surface">Simulated: {step.sim}</strong>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        step.status === 'Optimal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : step.status === 'Protected'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Heatmap Tab */}
      {activeTab === 'heatmap' && (
        <div className="card-surface p-6 rounded-2xl border border-outline-variant/40 space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <div>
              <h3 className="font-headline-sm text-[18px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">grid_view</span>
                Warehouse Heatmap & Zone Congestion Twin
              </h3>
              <p className="font-body-sm text-on-surface-variant text-[13px]">
                Simulated floor congestion and bottleneck propagation under <strong className="text-on-surface">{params.scenarioName}</strong>.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Zone A */}
            <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[14px] text-on-surface">Zone A (Apparel & Soft Goods)</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {results.zoneLoads.zoneA}% Load
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600" style={{ width: `${results.zoneLoads.zoneA}%` }} />
              </div>
              <p className="text-[11px] text-on-surface-variant">Aisles 1–6 running smoothly with regular wave picking speed.</p>
            </div>

            {/* Zone B */}
            <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/40 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[14px] text-on-surface">Zone B (High-Tech & Bins)</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${results.zoneLoads.zoneB > 80 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-900'}`}>
                  {results.zoneLoads.zoneB}% Load
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-amber-600" style={{ width: `${results.zoneLoads.zoneB}%` }} />
              </div>
              <p className="text-[11px] text-on-surface-variant">Dense picker traffic in Aisle 2. Recommend wave staggering.</p>
            </div>

            {/* Zone C / Packing */}
            <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[14px] text-on-surface">Zone C (Packing & Boxing)</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${results.zoneLoads.zoneC > 80 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {results.zoneLoads.zoneC}% Load
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${results.zoneLoads.zoneC}%` }} />
              </div>
              <p className="text-[11px] text-on-surface-variant">Benches 1–4 handling batch packaging with automatic labelers.</p>
            </div>

            {/* QC Station */}
            <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[14px] text-on-surface">Quality Control Optical Desk</h4>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">
                  {results.zoneLoads.qc}% Load
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-blue-600" style={{ width: `${results.zoneLoads.qc}%` }} />
              </div>
              <p className="text-[11px] text-on-surface-variant">AI defect detection scanner active at 99.8% precision.</p>
            </div>

            {/* Dock Staging */}
            <div className="p-4 rounded-xl border border-outline-variant/40 bg-surface-container-lowest space-y-3 md:col-span-2">
              <div className="flex justify-between items-center">
                <h4 className="font-bold text-[14px] text-on-surface">Outbound Staging & Carrier Docks</h4>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${results.zoneLoads.staging > 80 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {results.zoneLoads.staging}% Load
                </span>
              </div>
              <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600" style={{ width: `${results.zoneLoads.staging}%` }} />
              </div>
              <p className="text-[11px] text-on-surface-variant">Pallet lanes 1–4 staged for FedEx and Delhivery 4:00 PM trailer sweep.</p>
            </div>
          </div>
        </div>
      )}

      {/* History Archive Tab */}
      {activeTab === 'history' && (
        <div className="card-surface p-6 rounded-2xl border border-outline-variant/40 space-y-6">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-4">
            <div>
              <h3 className="font-headline-sm text-[18px] font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">history</span>
                Simulation History Archive & Saved Reports
              </h3>
              <p className="font-body-sm text-on-surface-variant text-[13px]">
                Review previously simulated scenarios and reload their parameter configurations.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {history.map(item => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-outline-variant/30 bg-surface-container-lowest hover:border-outline transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]">🤎</span>
                    <h4 className="font-title-sm text-[14px] font-bold text-on-surface">
                      {item.scenarioName}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-surface-container uppercase tracking-wider text-on-surface-variant">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-on-surface-variant">
                    <span>🕒 {item.timestamp}</span>
                    <span>👤 {item.createdBy}</span>
                    <span>✨ {item.recommendationsAppliedCount} Recommendations Tested</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-[11px] text-on-surface-variant">Health Outcome</div>
                    <div className="font-bold text-[14px] text-emerald-700">
                      {item.results.beforeMetrics.healthScore} → {item.results.optimizedMetrics.healthScore}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setParams(item.params);
                      setActiveTab('twin');
                      onShowToast(`Loaded Archive: ${item.scenarioName}`, 'Parameters restored to twin.', 'info');
                    }}
                    className="px-3.5 py-1.5 rounded-lg text-[12px] font-semibold text-primary bg-primary/10 hover:bg-primary/20 transition-all flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                    Reopen in Twin
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
