import React from 'react';
import { Order, OrderWorkflow } from '../types';
import { WorkflowTimeline } from './WorkflowTimeline';

interface WorkflowTimelineModalProps {
  isOpen: boolean;
  order: Order | null;
  workflow: OrderWorkflow | null;
  onClose: () => void;
  onAdvanceStep: (orderId: string) => void;
  onTriggerQcIssue: (orderId: string) => void;
}

export const WorkflowTimelineModal: React.FC<WorkflowTimelineModalProps> = ({
  isOpen,
  order,
  workflow,
  onClose,
  onAdvanceStep,
  onTriggerQcIssue
}) => {
  if (!isOpen || !order || !workflow) return null;

  return (
    <div
      id="workflow-timeline-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 md:p-6 animate-in fade-in duration-150"
    >
      <div
        id="workflow-timeline-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest w-full max-w-3xl max-h-[90vh] rounded-[28px] shadow-ambient-lg border border-outline-variant/30 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-5 md:p-6 border-b border-outline-variant/20 flex items-center justify-between bg-surface-container-low/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                account_tree
              </span>
            </div>
            <div>
              <h3 className="font-headline-sm text-[20px] font-bold text-on-background">
                Warehouse Workflow Lifecycle
              </h3>
              <p className="text-[12px] text-outline font-mono">
                Order {order.orderNumber} • {order.customerName} ({order.shippingType})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 md:p-6">
          <WorkflowTimeline
            workflow={workflow}
            order={order}
            onAdvanceStep={onAdvanceStep}
            onTriggerQcIssue={onTriggerQcIssue}
            onClose={onClose}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-outline-variant/20 bg-surface-container-low/30 flex justify-between items-center text-[12px] text-outline">
          <span>⚡ State changes automatically synchronize across Inventory, Orders, Dashboard & Analytics.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-outline-variant text-on-surface font-label-md hover:bg-surface transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
