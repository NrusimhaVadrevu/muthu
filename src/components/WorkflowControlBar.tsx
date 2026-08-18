import React, { useState } from 'react';
import { WorkflowEngineState, Order } from '../types';

export type WorkflowPanelState = 'open' | 'closed';

interface WorkflowControlBarProps {
  panelState: WorkflowPanelState;
  onSetPanelState: (state: WorkflowPanelState) => void;
  engineState: WorkflowEngineState;
  onToggleAutoDrive: () => void;
  onChangeSpeed: (speed: number) => void;
  onStepAllWorkflows: () => void;
  onSimulateQcDefect: () => void;
  onSelectOrderForWorkflow: (orderNumber: string) => void;
  orders: Order[];
}

export const WorkflowControlBar: React.FC<WorkflowControlBarProps> = ({
  panelState,
  onSetPanelState,
  engineState,
  onToggleAutoDrive,
  onChangeSpeed,
  onStepAllWorkflows,
  onSimulateQcDefect,
  onSelectOrderForWorkflow,
  orders
}) => {
  const [activeTab, setActiveTab] = useState<'control' | 'orders' | 'logs'>('control');

  const activeOrders = orders.filter(
    (o) => o.currentStatus !== 'Delivered'
  );
  const activeOrder = activeOrders[0] || orders[0];

  // 1. When closed: Render ONLY the sleek 50px floating button in the bottom-right corner
  if (panelState === 'closed') {
    return (
      <div className="fixed bottom-5 right-5 z-40 animate-fadeIn">
        <button
          id="btn-open-workflow-panel"
          onClick={() => onSetPanelState('open')}
          className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-amber-600 text-white shadow-xl hover:shadow-2xl flex items-center justify-center transition-all cursor-pointer group relative border border-zinc-700/50 hover:scale-105 active:scale-95"
          title="Open MUTHU Workflow Engine"
        >
          <span className="material-symbols-outlined text-xl group-hover:rotate-45 transition-transform duration-300">
            settings
          </span>
          {engineState.isLiveAutoDrive && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-amber-400 rounded-full border-2 border-zinc-900 animate-ping"></span>
          )}
          <span className="sr-only">Open Workflow Engine</span>
        </button>
      </div>
    );
  }

  // 2. When open: Render a compact, non-intrusive floating panel in the bottom-right corner
  return (
    <div className="fixed bottom-5 right-5 z-40 w-96 max-w-[calc(100vw-2.5rem)] bg-white rounded-2xl border border-zinc-200 shadow-2xl overflow-hidden animate-slideUp flex flex-col max-h-[560px]">
      {/* Header */}
      <div className="p-4 bg-zinc-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <span className="material-symbols-outlined text-lg">account_tree</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white tracking-wide">MUTHU Workflow Engine</span>
              <span className={`w-2 h-2 rounded-full ${engineState.isLiveAutoDrive ? 'bg-amber-400 animate-ping' : 'bg-zinc-500'}`}></span>
            </div>
            <span className="text-[11px] text-zinc-400">
              {engineState.isLiveAutoDrive ? 'Auto-Drive Active' : 'Manual Mode'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onSetPanelState('closed')}
            className="w-7 h-7 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
            title="Close panel"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center justify-around border-b border-zinc-200 bg-zinc-50 text-xs font-medium text-zinc-600 p-1">
        <button
          onClick={() => setActiveTab('control')}
          className={`flex-1 py-1.5 rounded-md text-center transition-all ${
            activeTab === 'control' ? 'bg-white text-zinc-900 font-bold shadow-xs' : 'hover:text-zinc-900'
          }`}
        >
          Control
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-1.5 rounded-md text-center transition-all ${
            activeTab === 'orders' ? 'bg-white text-zinc-900 font-bold shadow-xs' : 'hover:text-zinc-900'
          }`}
        >
          Active ({activeOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-1.5 rounded-md text-center transition-all ${
            activeTab === 'logs' ? 'bg-white text-zinc-900 font-bold shadow-xs' : 'hover:text-zinc-900'
          }`}
        >
          Events
        </button>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
        {activeTab === 'control' && (
          <>
            {/* Active Order Spotlight */}
            {activeOrder && (
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-950">
                    {activeOrder.orderNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200/70 text-amber-900 border border-amber-300">
                    {activeOrder.currentStatus}
                  </span>
                </div>
                <div className="text-zinc-700 truncate font-medium">
                  {activeOrder.customerName}
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-amber-200/40">
                  <span>Zone: {activeOrder.warehouseZone}</span>
                  <span>SLA: {activeOrder.slaRemainingMinutes}m left</span>
                </div>
              </div>
            )}

            {/* Primary Action Controls */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={onToggleAutoDrive}
                  className={`py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs ${
                    engineState.isLiveAutoDrive
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-base">
                    {engineState.isLiveAutoDrive ? 'pause' : 'play_arrow'}
                  </span>
                  <span>{engineState.isLiveAutoDrive ? 'Pause Auto' : 'Auto Drive'}</span>
                </button>

                <button
                  onClick={onStepAllWorkflows}
                  className="py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold flex items-center justify-center gap-1.5 border border-zinc-200 transition-all active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">fast_forward</span>
                  <span>Step Next</span>
                </button>
              </div>

              {/* Speed Multipliers */}
              <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-zinc-600 font-medium">Simulation Speed:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => onChangeSpeed(speed)}
                      className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                        engineState.speedMultiplier === speed
                          ? 'bg-zinc-900 text-white'
                          : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Trigger QC Incident */}
              <button
                onClick={onSimulateQcDefect}
                className="w-full py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-semibold flex items-center justify-center gap-1 transition-all"
              >
                <span className="material-symbols-outlined text-sm">report_problem</span>
                <span>Simulate QC Defect Scenario</span>
              </button>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-1.5">
            {activeOrders.slice(0, 8).map((ord) => (
              <div
                key={ord.id}
                onClick={() => onSelectOrderForWorkflow(ord.orderNumber)}
                className="p-2.5 bg-zinc-50 hover:bg-amber-50/50 rounded-lg border border-zinc-200 flex items-center justify-between cursor-pointer transition-all"
              >
                <div>
                  <span className="font-mono font-bold text-zinc-900 block">{ord.orderNumber}</span>
                  <span className="text-zinc-600 text-[11px] truncate max-w-[160px] block">
                    {ord.customerName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-white rounded border border-zinc-200 text-zinc-700 block">
                    {ord.currentStatus}
                  </span>
                  <span className="text-[10px] text-zinc-600">{ord.slaRemainingMinutes}m SLA</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-1.5 font-mono text-[11px]">
            {engineState.recentEvents && engineState.recentEvents.length > 0 ? (
              engineState.recentEvents.slice(0, 6).map((evt) => (
                <div key={evt.id} className="p-2 bg-zinc-50 rounded border border-zinc-150 space-y-0.5">
                  <div className="flex items-center justify-between text-zinc-500 text-[10px]">
                    <span className="font-bold text-zinc-700">{evt.orderNumber}</span>
                    <span>{evt.timestamp}</span>
                  </div>
                  <div className="text-zinc-800">{evt.details}</div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-zinc-600">No events logged yet</div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-2.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between text-[11px] text-zinc-500 px-4">
        <span>{engineState.totalCompletedWorkflows} Workflows Completed</span>
        <button
          onClick={() => onSetPanelState('closed')}
          className="text-amber-800 hover:text-amber-950 font-bold"
        >
          Collapse
        </button>
      </div>
    </div>
  );
};
