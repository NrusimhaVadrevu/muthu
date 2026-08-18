import React, { useState } from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: { warehouseName: string; autoReallocate: boolean; alertThreshold: number }) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [warehouseName, setWarehouseName] = useState('West Coast Fulfillment Center #4');
  const [autoReallocate, setAutoReallocate] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState(20);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ warehouseName, autoReallocate, alertThreshold });
    onClose();
  };

  return (
    <div
      id="settings-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="settings-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-ambient-lg border border-outline-variant/30 space-y-6"
      >
        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">settings</span>
            <h3 className="font-headline-sm text-[20px] font-bold text-on-surface">Platform Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-outline hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="font-label-caps text-[11px] text-outline block mb-1.5">Facility Identity</label>
            <input
              type="text"
              value={warehouseName}
              onChange={(e) => setWarehouseName(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-[14px] outline-none"
            />
          </div>

          <div>
            <label className="font-label-caps text-[11px] text-outline block mb-1.5">
              Low Stock Alert Threshold ({alertThreshold}% remaining)
            </label>
            <input
              type="range"
              min="5"
              max="40"
              value={alertThreshold}
              onChange={(e) => setAlertThreshold(Number(e.target.value))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-label-md text-on-surface font-semibold text-[14px]">
                  Autonomous Staff Suggestions
                </p>
                <p className="text-[12px] text-on-surface-variant">
                  Allow Muthu to simulate reallocation on bottleneck detection.
                </p>
              </div>
              <input
                type="checkbox"
                checked={autoReallocate}
                onChange={(e) => setAutoReallocate(e.target.checked)}
                className="w-5 h-5 rounded text-primary focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-outline-variant/20">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-outline-variant text-on-surface font-label-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md shadow-xs hover:bg-primary/90"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
