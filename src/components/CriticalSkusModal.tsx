import React from 'react';
import { InventoryItem } from '../types';

interface CriticalSkusModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onRestockItem: (id: string, amount: number) => void;
}

export const CriticalSkusModal: React.FC<CriticalSkusModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onRestockItem
}) => {
  if (!isOpen) return null;

  // Filter exact critical/low stock SKUs
  const criticalItems = inventory.filter(
    (item) => item.status === 'Critical' || item.status === 'Low Stock' || item.status === 'Out of Stock'
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-zinc-200 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 md:p-6 bg-zinc-900 text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight">Critical SKU Inventory Audit</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-white font-mono">
                  {criticalItems.length} Critical Items
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                SKUs below reorder threshold • Muthu automated replenishment recommendations.
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
        <div className="p-6 overflow-y-auto flex-1 space-y-3 bg-zinc-50/50">
          {criticalItems.map((item) => (
            <div
              key={item.id}
              className="bg-white p-4 rounded-xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-300 transition-all"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                    {item.sku}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                    {item.status}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium">{item.category}</span>
                </div>
                <h3 className="text-sm font-bold text-zinc-900">{item.name}</h3>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span>Bin: <strong className="text-zinc-800 font-mono">{item.shelfBinLocation}</strong></span>
                  <span>Zone: <strong className="text-zinc-800">{item.warehouseZone}</strong></span>
                  <span>Supplier: <strong className="text-zinc-800">{item.supplier}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-zinc-100 justify-between md:justify-end">
                <div className="text-left md:text-right">
                  <div className="text-xs text-zinc-500">Available Stock</div>
                  <div className="text-lg font-bold text-rose-600 font-mono">
                    {item.quantityAvailable} / {item.reorderLevel} <span className="text-xs text-zinc-500 font-normal">min</span>
                  </div>
                </div>

                <button
                  onClick={() => onRestockItem(item.id, item.reorderLevel * 2)}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
                  Restock +{item.reorderLevel * 2}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-200 bg-white flex items-center justify-between text-xs text-zinc-500 px-6">
          <span>Displaying exact {criticalItems.length} critical inventory items</span>
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
