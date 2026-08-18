import React from 'react';
import { Order } from '../types';

interface SlaRiskModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  onApproveRecommendation: (order: Order) => void;
  onSelectOrderWorkflow?: (orderId: string) => void;
}

export const SlaRiskModal: React.FC<SlaRiskModalProps> = ({
  isOpen,
  onClose,
  orders,
  onApproveRecommendation,
  onSelectOrderWorkflow
}) => {
  if (!isOpen) return null;

  // Filter exact SLA risk orders (< 120 mins remaining and not delivered)
  const slaRiskOrders = orders.filter(
    (o) => (o.isNearSlaRisk || (o.slaRemainingMinutes > 0 && o.slaRemainingMinutes <= 120)) && o.currentStatus !== 'Delivered'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-zinc-200 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 bg-zinc-900 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">timer</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">SLA Risk Detailed Audit</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white font-mono">
                  {slaRiskOrders.length} Affected Orders
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Exact orders nearing cutoff • Actionable Muthu recommendations to prevent SLA breach.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-zinc-50/50">
          {slaRiskOrders.length === 0 ? (
            <div className="text-center py-12 space-y-2">
              <span className="material-symbols-outlined text-4xl text-emerald-600">verified</span>
              <h3 className="text-base font-bold text-zinc-900">All Order SLAs are Healthy</h3>
              <p className="text-xs text-zinc-500">No orders are currently at risk of missing their dispatch SLA.</p>
            </div>
          ) : (
            slaRiskOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:shadow-md transition-all space-y-4 relative"
              >
                {/* Top Title & Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-base font-bold text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200">
                      {order.orderNumber}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                        order.orderCategory === 'business'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-blue-50 text-blue-900 border border-blue-200'
                      }`}
                    >
                      {order.orderCategory === 'business' ? 'B2B Business' : 'B2C Individual'}
                    </span>
                    {order.customerType === 'VIP' && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white flex items-center gap-1 shadow-2xs">
                        ★ VIP
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        order.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      Priority: {order.priority}
                    </span>
                  </div>

                  {/* SLA Countdown Badge */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-mono text-xs font-bold animate-pulse">
                      ⏰ {order.slaRemainingMinutes} mins remaining
                    </span>
                  </div>
                </div>

                {/* Grid Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-150">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Customer</span>
                    <span className="font-bold text-zinc-900 truncate block mt-0.5">{order.customerName}</span>
                    <span className="text-[10px] text-zinc-500">{order.companyName || 'Consumer Customer'}</span>
                  </div>

                  <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-150">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Current Stage</span>
                    <span className="font-bold text-amber-700 block mt-0.5">{order.currentStatus}</span>
                    <span className="text-[10px] text-zinc-500">Zone: {order.warehouseZone}</span>
                  </div>

                  <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-150">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Est. Completion</span>
                    <span className="font-bold text-zinc-900 font-mono block mt-0.5">
                      {order.estimatedCompletionTime || '11:45 AM'}
                    </span>
                    <span className="text-[10px] text-zinc-500">Worker: {order.assignedPacker || order.assignedPicker}</span>
                  </div>

                  <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-150">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Assigned Truck</span>
                    <span className="font-bold text-zinc-900 font-mono block mt-0.5">
                      {order.assignedTruckNumber || 'TRK-HYD-01'}
                    </span>
                    <span className="text-[10px] text-zinc-500">Route Staging</span>
                  </div>
                </div>

                {/* Risk Reason Banner */}
                {order.slaRiskReason && (
                  <div className="p-3 bg-rose-50/80 border border-rose-200/80 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                    <span className="material-symbols-outlined text-rose-600 text-base shrink-0 mt-0.5">
                      warning
                    </span>
                    <div>
                      <strong className="font-bold">Risk Reason: </strong>
                      {order.slaRiskReason}
                    </div>
                  </div>
                )}

                {/* Muthu Recommendation & Action Bar */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-950 flex items-center gap-1">
                        <span>🤎</span> Muthu Recommends
                      </span>
                      <span className="text-[10px] font-bold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-mono">
                        {order.muthuConfidence || 97}% Confidence
                      </span>
                    </div>
                    <p className="text-amber-900 font-medium">
                      {order.muthuRecommendationText || 'Move 2 available packers from Zone B to Packing Station 2.'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onSelectOrderWorkflow && (
                      <button
                        onClick={() => onSelectOrderWorkflow(order.id)}
                        className="px-3.5 py-2 bg-white hover:bg-zinc-100 text-zinc-800 rounded-xl text-xs font-bold border border-zinc-300 transition-colors"
                      >
                        Inspect Audit
                      </button>
                    )}
                    <button
                      onClick={() => onApproveRecommendation(order)}
                      className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      Approve Recommendation
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-white flex items-center justify-between text-xs text-zinc-500 px-6">
          <span>Displaying exact {slaRiskOrders.length} records feeding WMS real-time telemetry</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
