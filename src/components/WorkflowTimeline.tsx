import React from 'react';
import { OrderWorkflow, Order, WorkflowStageInfo } from '../types';

interface WorkflowTimelineProps {
  workflow: OrderWorkflow;
  order: Order;
  onAdvanceStep: (orderId: string) => void;
  onTriggerQcIssue?: (orderId: string) => void;
  onClose?: () => void;
  isCompact?: boolean;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = ({
  workflow,
  order,
  onAdvanceStep,
  onTriggerQcIssue,
  onClose,
  isCompact = false
}) => {
  const currentStage = workflow.stages[workflow.currentStageIndex] || workflow.stages[0];
  const isFinalStage = workflow.currentStageIndex >= workflow.stages.length - 1;
  const isAtQualityCheck = currentStage?.id === 'quality_check' || currentStage?.label.includes('Quality Check');

  return (
    <div id={`workflow-timeline-${order.orderNumber}`} className="flex flex-col h-full space-y-5">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-bold text-[13px] text-primary">{order.orderNumber}</span>
            <span className="text-[12px] text-outline">• {order.customerName}</span>
            {workflow.hasQualityIncident && (
              <span className="px-2 py-0.5 rounded-full bg-error-container text-error text-[11px] font-bold border border-error/30 animate-pulse">
                QC Incident Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-on-background text-[15px]">
              Active Stage: {currentStage?.label || 'Initializing'}
            </span>
            <span className="text-[12px] text-outline font-mono">
              (Stage {workflow.currentStageIndex + 1} of {workflow.stages.length})
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Simulate QC Issue button (only visible when near QC stage or normal flow) */}
          {!workflow.hasQualityIncident && onTriggerQcIssue && (
            <button
              onClick={() => onTriggerQcIssue(order.id)}
              className="px-3 py-1.5 rounded-xl bg-error-container/30 text-error hover:bg-error-container text-[12px] font-bold border border-error/30 transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
              title="Test Quality Check Failure & Replacement Workflow"
            >
              <span className="material-symbols-outlined text-[15px]">report_problem</span>
              Simulate QC Defect
            </button>
          )}

          {!isFinalStage ? (
            <button
              onClick={() => onAdvanceStep(order.id)}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-[13px] font-bold shadow-xs hover:bg-primary/90 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Advance: {workflow.stages[workflow.currentStageIndex + 1]?.label || 'Next Stage'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-[#BACBB4]/30 text-[#2f432c] border border-[#BACBB4]/60 font-bold text-[12.5px] flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Workflow Complete
            </div>
          )}
        </div>
      </div>

      {/* Incident Notification Banner (If QC failed) */}
      {workflow.hasQualityIncident && workflow.incident && (
        <div className="p-4 rounded-2xl bg-error-container/30 border border-error/40 text-on-surface space-y-1.5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-bold text-error flex items-center gap-1.5 text-[13px]">
              <span className="material-symbols-outlined text-[17px]">warning</span>
              Incident #{workflow.incident.incidentId} — Quality Check Exception
            </span>
            <span className="text-[11px] font-mono text-outline">{workflow.incident.detectedAt}</span>
          </div>
          <p className="text-[12.5px] text-on-surface leading-snug">
            <strong>Reason:</strong> {workflow.incident.issueReason}
          </p>
          <div className="text-[12px] text-on-surface-variant flex flex-wrap gap-3 pt-1">
            <span>Inspector: <strong>{workflow.incident.assignedInspector}</strong></span>
            <span>Replacement SKU: <strong className="font-mono">{workflow.incident.replacementSku}</strong> (Qty: {workflow.incident.replacementQuantity})</span>
            <span>Current Status: <strong className="text-primary">{workflow.incident.status}</strong></span>
          </div>
        </div>
      )}

      {/* Progress Metric Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[12px] text-outline font-label-md">
          <span>Overall Workflow Completion</span>
          <span className="font-bold text-primary">
            {Math.round(((workflow.currentStageIndex + 1) / workflow.stages.length) * 100)}%
          </span>
        </div>
        <div className="h-2 w-full bg-surface-container-high rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: `${((workflow.currentStageIndex + 1) / workflow.stages.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Timeline Steps List */}
      <div className="space-y-0 relative before:absolute before:left-[19px] before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant/30 overflow-y-auto pr-1">
        {workflow.stages.map((stage: WorkflowStageInfo, idx: number) => {
          const isCompleted = stage.status === 'completed';
          const isActive = stage.status === 'active';
          const isFailed = stage.status === 'failed';
          const isPending = stage.status === 'pending';

          return (
            <div
              key={stage.id}
              id={`workflow-stage-${stage.id}`}
              className={`relative flex items-start gap-4 py-3 transition-all ${
                isActive
                  ? 'bg-primary-container/10 rounded-xl px-2.5 -mx-2.5 border border-primary/20 shadow-xs'
                  : isFailed
                  ? 'bg-error-container/10 rounded-xl px-2.5 -mx-2.5 border border-error/30'
                  : ''
              }`}
            >
              {/* Status Node Indicator */}
              <div className="relative z-10 shrink-0">
                {isCompleted ? (
                  <div className="w-10 h-10 rounded-full bg-[#BACBB4] text-[#2f432c] flex items-center justify-center shadow-xs border-2 border-surface">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  </div>
                ) : isActive ? (
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center ring-4 ring-primary/25 animate-pulse shadow-md border-2 border-surface">
                    <span className="material-symbols-outlined text-[20px]">
                      {stage.icon || 'play_arrow'}
                    </span>
                  </div>
                ) : isFailed ? (
                  <div className="w-10 h-10 rounded-full bg-error text-on-error flex items-center justify-center shadow-sm border-2 border-surface">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-container text-outline flex items-center justify-center border-2 border-outline-variant/40">
                    <span className="font-bold text-[12px] font-mono">{idx + 1}</span>
                  </div>
                )}
              </div>

              {/* Stage Content Card */}
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <h4
                      className={`text-[14.5px] font-bold ${
                        isActive
                          ? 'text-primary'
                          : isCompleted
                          ? 'text-on-background'
                          : isFailed
                          ? 'text-error'
                          : 'text-outline'
                      }`}
                    >
                      {stage.stageNumber}. {stage.label}
                    </h4>

                    {/* Badge Indicator */}
                    {isCompleted && (
                      <span className="px-2 py-0.2 rounded-md bg-[#BACBB4]/30 text-[#2f432c] text-[10.5px] font-bold">
                        Completed
                      </span>
                    )}
                    {isActive && (
                      <span className="px-2 py-0.2 rounded-md bg-primary text-on-primary text-[10.5px] font-bold animate-pulse shadow-xs">
                        Active Stage
                      </span>
                    )}
                    {isFailed && (
                      <span className="px-2 py-0.2 rounded-md bg-error-container text-error text-[10.5px] font-bold">
                        Failed
                      </span>
                    )}
                    {isPending && (
                      <span className="px-2 py-0.2 rounded-md bg-surface-container text-outline text-[10.5px]">
                        Pending
                      </span>
                    )}
                  </div>

                  <span className="text-[12px] font-mono text-outline shrink-0">
                    {stage.timestamp}
                  </span>
                </div>

                {/* Worker & Duration Specs */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-outline">engineering</span>
                    <span>Worker: <strong>{stage.assignedWorker}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-outline">timer</span>
                    <span>Est: {stage.estimatedDuration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-outline">hourglass_top</span>
                    <span>Actual: <strong className={isActive ? 'text-primary' : ''}>{stage.actualDuration}</strong></span>
                  </div>
                </div>

                {/* Specific stage notes */}
                {stage.notes && (
                  <p className="text-[12px] text-on-surface-variant/90 italic pt-0.5 leading-snug">
                    {stage.notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
