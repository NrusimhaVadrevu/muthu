import React, { useState } from 'react';

interface NewReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (reportName: string, format: string) => void;
}

export const NewReportModal: React.FC<NewReportModalProps> = ({
  isOpen,
  onClose,
  onGenerate
}) => {
  const [reportType, setReportType] = useState('Daily Operational Brief');
  const [format, setFormat] = useState('PDF');
  const [facility, setFacility] = useState('Bay-04 (Main Fulfillment)');
  const [includeAiInsights, setIncludeAiInsights] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerate(`${reportType} - ${facility}`, format);
    onClose();
  };

  return (
    <div
      id="new-report-modal-backdrop"
      onClick={onClose}
      className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="new-report-modal"
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-ambient-lg border border-outline-variant/30 space-y-6"
      >
        <div className="flex justify-between items-center pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[22px]">description</span>
            <h3 className="font-headline-sm text-[20px] font-bold text-on-surface">Generate Operations Report</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-outline hover:text-on-surface">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-label-caps text-[11px] text-outline block mb-1.5">Report Template</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-[14px] outline-none"
            >
              <option value="Daily Operational Brief">Daily Operational Brief (Health & Throughput)</option>
              <option value="Stock Level & Depletion Audit">Stock Level & Depletion Audit (Inventory)</option>
              <option value="SLA & Carrier Risk Assessment">SLA & Carrier Risk Assessment (Orders)</option>
              <option value="Shift Bottleneck & Staffing Simulation">Shift Bottleneck & Staffing Simulation</option>
            </select>
          </div>

          <div>
            <label className="font-label-caps text-[11px] text-outline block mb-1.5">Facility / Warehouse Zone</label>
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl px-4 py-2.5 text-on-surface text-[14px] outline-none"
            >
              <option value="Bay-04 (Main Fulfillment)">Bay-04 (Main Fulfillment - All Zones)</option>
              <option value="Zone A (High Velocity)">Zone A (High Velocity Goods)</option>
              <option value="Zone B (Electronics)">Zone B (Electronics & Workstations)</option>
              <option value="Zone C (Packaging & Staging)">Zone C (Packaging & Staging)</option>
            </select>
          </div>

          <div>
            <label className="font-label-caps text-[11px] text-outline block mb-1.5">Export Format</label>
            <div className="grid grid-cols-3 gap-3">
              {['PDF', 'CSV', 'JSON'].map((fmt) => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => setFormat(fmt)}
                  className={`py-2.5 rounded-xl border text-[13px] font-label-md transition-all ${
                    format === fmt
                      ? 'bg-primary text-on-primary border-primary font-bold shadow-xs'
                      : 'bg-surface-container-low border-outline-variant/30 text-on-surface'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="include-ai-toggle"
              checked={includeAiInsights}
              onChange={(e) => setIncludeAiInsights(e.target.checked)}
              className="w-4 h-4 rounded text-primary focus:ring-primary/30"
            />
            <label htmlFor="include-ai-toggle" className="text-[13px] text-on-surface select-none cursor-pointer">
              Include Muthu's recommendations and predictive trend notes
            </label>
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
              className="px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md shadow-xs hover:bg-primary/90 flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Compile & Export
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
