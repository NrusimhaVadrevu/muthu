import React from 'react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      id="support-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="support-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-ambient-lg border border-outline-variant/30 space-y-6"
      >
        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">help</span>
            <h3 className="font-headline-sm text-[20px] font-bold text-on-surface">MUTHU Operations Support</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-outline hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 text-[14px] text-on-surface">
          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20">
            <h4 className="font-bold text-on-surface mb-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-primary text-[18px]">support_agent</span>
              Direct Dispatch Hotline
            </h4>
            <p className="text-[13px] text-on-surface-variant">
              Toll-Free Warehouse Operations Support: <strong>+1 (800) 555-MUTHU</strong>
            </p>
            <p className="text-[12px] text-outline mt-1">Available 24/7 during all shift rotations.</p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-label-caps text-outline text-[11px]">System Quick References</h4>
            <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 flex justify-between items-center">
              <span>WMS Floorplan Telemetry & Node Calibration</span>
              <span className="material-symbols-outlined text-outline text-[18px]">launch</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 flex justify-between items-center">
              <span>Autonomous Reallocation Logic Guidelines</span>
              <span className="material-symbols-outlined text-outline text-[18px]">launch</span>
            </div>
            <div className="p-3 rounded-xl bg-surface border border-outline-variant/20 flex justify-between items-center">
              <span>Carrier API & Tracking SLA Definitions</span>
              <span className="material-symbols-outlined text-outline text-[18px]">launch</span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md shadow-xs hover:bg-primary/90"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
