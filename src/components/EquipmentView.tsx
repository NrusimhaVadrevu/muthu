import React, { useState, useMemo } from 'react';
import { Equipment, EquipmentStatus, EquipmentType } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface EquipmentViewProps {
  equipment: Equipment[];
  onScheduleMaintenance: (equipmentId: string) => void;
  onAssignBackup: (equipmentId: string, backupId: string) => void;
  onCompleteMaintenance: (equipmentId: string) => void;
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const EquipmentView: React.FC<EquipmentViewProps> = ({
  equipment,
  onScheduleMaintenance,
  onAssignBackup,
  onCompleteMaintenance,
  onShowToast
}) => {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  // Summary Metrics calculated directly from mock equipment records
  const metrics = useMemo(() => {
    const total = equipment.length;
    const operational = equipment.filter((e) => e.status === 'OPERATIONAL').length;
    const maintenanceDue = equipment.filter((e) => e.status === 'MAINTENANCE DUE').length;
    const underMaintenance = equipment.filter((e) => e.status === 'UNDER MAINTENANCE').length;
    const warning = equipment.filter((e) => e.status === 'WARNING').length;
    const outOfService = equipment.filter((e) => e.status === 'OUT OF SERVICE' || e.status === 'CRITICAL').length;
    const backupAvailable = equipment.filter((e) => Boolean(e.backupAvailableId)).length;
    const avgUtilization = Math.round(equipment.reduce((acc, e) => acc + e.utilizationPercent, 0) / (total || 1));
    const totalEstMaintenanceCost = equipment.reduce((acc, e) => acc + e.maintenanceCostInr, 0);

    return {
      total,
      operational,
      maintenanceDue,
      underMaintenance,
      warning,
      outOfService,
      backupAvailable,
      avgUtilization,
      totalEstMaintenanceCost
    };
  }, [equipment]);

  const filteredEquipment = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return equipment.filter((e) => {
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.equipmentId.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q) ||
        e.zone.toLowerCase().includes(q) ||
        e.assignedTechnicianName.toLowerCase().includes(q);

      const matchesType = typeFilter === 'All' || e.type === typeFilter;
      const matchesStatus = statusFilter === 'All' || e.status === statusFilter;

      return matchesSearch && matchesType && matchesStatus;
    });
  }, [equipment, searchQuery, typeFilter, statusFilter]);

  const equipmentTypesList: EquipmentType[] = [
    'Forklift',
    'Crane',
    'Pallet Jack',
    'Conveyor System',
    'Automated Sorter',
    'Barcode Scanner',
    'Packing Machine',
    'Loading Equipment',
    'Warehouse Robot'
  ];

  return (
    <div id="equipment-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
              Hardware & Machinery Health
            </span>
            <span className="text-xs text-zinc-500 font-medium font-mono">• {equipment.length} Active Warehouse Assets</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
            Equipment & Machinery Maintenance
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            Fleet monitoring for forklifts, conveyors, packing machines, automated sorters, pallet jacks, and backup units.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onShowToast('Maintenance Export', 'Generating machinery health and service audit CSV...', 'info')}
            className="px-4 py-2 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>Export Maintenance Ledger</span>
          </button>
        </div>
      </div>

      {/* Equipment Health Dashboard KPIs (Section 10) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">Total Equipment</span>
          <span className="text-2xl font-extrabold text-zinc-900 font-mono">{metrics.total}</span>
          <p className="text-[10.5px] text-zinc-500 font-medium">Full Machine Fleet</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Operational</span>
          <span className="text-2xl font-extrabold text-emerald-700 font-mono">{metrics.operational}</span>
          <p className="text-[10.5px] text-emerald-700 font-medium">{metrics.avgUtilization}% Avg Utilization</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Maintenance Due</span>
          <span className="text-2xl font-extrabold text-amber-700 font-mono">{metrics.maintenanceDue}</span>
          <p className="text-[10.5px] text-amber-800 font-medium">Scheduled &lt;7 Days</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">In Workshop</span>
          <span className="text-2xl font-extrabold text-rose-700 font-mono">{metrics.underMaintenance}</span>
          <p className="text-[10.5px] text-rose-700 font-medium">Under Maintenance</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Out of Service</span>
          <span className="text-2xl font-extrabold text-zinc-800 font-mono">{metrics.outOfService + metrics.warning}</span>
          <p className="text-[10.5px] text-zinc-500 font-medium">{metrics.warning} Warnings</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-2xs space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Backups Ready</span>
          <span className="text-2xl font-extrabold text-blue-700 font-mono">{metrics.backupAvailable}</span>
          <p className="text-[10.5px] text-blue-700 font-medium">Zero Downtime Buffer</p>
        </div>
      </div>

      {/* Muthu Equipment Maintenance Alert Banner (Sections 11 & 12) */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/60 to-amber-500/10 rounded-3xl p-5 md:p-6 border border-amber-300 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-zinc-950 font-bold flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">construction</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 font-mono">
              Muthu Observes • Preventive Machinery Alert
            </span>
            <h3 className="text-base md:text-lg font-bold text-zinc-900">
              Forklift FL-07 Exceeded Recommended Service Interval
            </h3>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 space-y-3 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="font-bold text-zinc-400 block text-[10px] uppercase">Equipment:</span>
              <span className="font-bold text-zinc-900">Electric Forklift FL-07 (Dock Bay 04)</span>
            </div>
            <div>
              <span className="font-bold text-zinc-400 block text-[10px] uppercase">Maintenance Due:</span>
              <span className="font-bold text-amber-800">In 3 Days (250-hour hydraulic service)</span>
            </div>
            <div>
              <span className="font-bold text-zinc-400 block text-[10px] uppercase">Backup Machine:</span>
              <span className="font-bold text-emerald-800">Forklift FL-03 Available (Dock Bay 01)</span>
            </div>
          </div>

          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 text-xs space-y-1">
            <p className="text-zinc-800">
              <strong>Risk:</strong> Potential pallet loading delay on outbound Vijayawada wholesale freight dispatches.
            </p>
            <p className="text-amber-950 font-semibold">
              <strong>Muthu Recommendation (93% Confidence):</strong> Schedule maintenance during night shift and assign FL-03 as backup to prevent loading disruption.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 text-xs">
            <span className="text-zinc-600 font-medium">Assigned Technician: Kiran Naik</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onAssignBackup('eq-201', 'eq-203');
                  onShowToast('Backup Assigned', 'Forklift FL-03 deployed to Dock Bay 04.', 'info');
                }}
                className="px-3.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl font-bold cursor-pointer transition-all"
              >
                Assign FL-03 Backup
              </button>
              <button
                onClick={() => {
                  onScheduleMaintenance('eq-201');
                  onShowToast('Maintenance Scheduled', 'Forklift FL-07 scheduled for Night Shift servicing.', 'success');
                }}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer transition-all shadow-2xs"
              >
                Schedule Maintenance
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar Search & Filters */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-zinc-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Machine ID, Name, Type, Zone, Tech..."
              className="w-full bg-zinc-50 border border-zinc-250 rounded-xl pl-10 pr-9 py-2 text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 w-full md:w-auto items-center text-xs">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-250 text-zinc-800 font-semibold outline-none cursor-pointer"
            >
              <option value="All">All Types ({equipmentTypesList.length})</option>
              {equipmentTypesList.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-zinc-50 border border-zinc-250 text-zinc-800 font-semibold outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="OPERATIONAL">OPERATIONAL</option>
              <option value="MAINTENANCE DUE">MAINTENANCE DUE</option>
              <option value="UNDER MAINTENANCE">UNDER MAINTENANCE</option>
              <option value="WARNING">WARNING</option>
              <option value="OUT OF SERVICE">OUT OF SERVICE</option>
            </select>

            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('All');
                setStatusFilter('All');
              }}
              className="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold cursor-pointer"
              title="Reset Filters"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Equipment Machinery Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {filteredEquipment.map((item) => (
          <div
            key={item.id}
            onClick={() => setSelectedEquipment(item)}
            className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer space-y-4 flex flex-col justify-between group"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 font-mono">{item.equipmentId}</span>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider font-mono ${
                    item.status === 'OPERATIONAL'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : item.status === 'MAINTENANCE DUE'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300'
                      : item.status === 'UNDER MAINTENANCE'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-zinc-100 text-zinc-800 border border-zinc-300'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-zinc-900">{item.name}</h3>
                <span className="text-xs text-zinc-500">{item.type} • {item.zone}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-zinc-50 rounded-xl border border-zinc-150 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Condition</span>
                  <span className="font-bold text-zinc-900">{item.condition}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Utilization</span>
                  <span className="font-bold font-mono text-zinc-900">{item.utilizationPercent}%</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Next Service</span>
                  <span className="font-bold font-mono text-amber-800">{item.nextMaintenanceDate}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 block uppercase">Technician</span>
                  <span className="font-bold text-zinc-800">{item.assignedTechnicianName}</span>
                </div>
              </div>

              {item.backupAvailableName && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between text-emerald-950 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-base text-emerald-700">swap_horiz</span>
                    <span className="truncate">{item.backupAvailableName}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
              <span>View full machine details</span>
              <span className="material-symbols-outlined text-base text-zinc-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
            </div>
          </div>
        ))}
      </div>

      {/* Equipment Detail Modal */}
      {selectedEquipment && (
        <div
          id="equipment-drawer-backdrop"
          onClick={() => setSelectedEquipment(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn"
        >
          <div
            id="equipment-drawer"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white h-full shadow-2xl p-6 md:p-8 overflow-y-auto space-y-6 animate-slideLeft"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-zinc-400">{selectedEquipment.equipmentId}</span>
                <h2 className="text-xl font-bold text-zinc-900">{selectedEquipment.name}</h2>
              </div>
              <button
                onClick={() => setSelectedEquipment(null)}
                className="p-2 text-zinc-400 hover:text-zinc-800 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-1">
                <span className="font-bold text-zinc-700 block">Location & Assigned Zone:</span>
                <p className="text-zinc-900 font-medium">{selectedEquipment.locationDetails} • {selectedEquipment.zone}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-150">
                  <span className="text-zinc-500 block text-[10px]">Machine Condition</span>
                  <span className="text-base font-bold text-zinc-900">{selectedEquipment.condition}</span>
                </div>
                <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-150">
                  <span className="text-zinc-500 block text-[10px]">Current Utilization</span>
                  <span className="text-base font-bold font-mono text-zinc-900">{selectedEquipment.utilizationPercent}%</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
                <span className="font-bold text-zinc-900 block uppercase text-[10px] font-mono">Maintenance & Service Log</span>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Last Maintenance:</span>
                  <span className="font-bold font-mono text-zinc-900">{selectedEquipment.lastMaintenanceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Next Service Interval:</span>
                  <span className="font-bold font-mono text-amber-800">{selectedEquipment.nextMaintenanceDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Estimated Service Cost:</span>
                  <span className="font-bold font-mono text-zinc-900">₹{selectedEquipment.maintenanceCostInr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Assigned Technician:</span>
                  <span className="font-bold text-zinc-900">{selectedEquipment.assignedTechnicianName}</span>
                </div>
              </div>

              {selectedEquipment.notes && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 font-medium">
                  <span className="font-bold uppercase block text-[10px] text-amber-800 mb-1">Muthu Telemetry Notes:</span>
                  {selectedEquipment.notes}
                </div>
              )}

              {selectedEquipment.backupAvailableName && (
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-900 uppercase text-[10px]">Dedicated Backup Asset:</span>
                  <p className="text-emerald-950 font-bold">{selectedEquipment.backupAvailableName}</p>
                </div>
              )}

              <div className="pt-2 border-t border-zinc-100 flex items-center gap-3">
                {selectedEquipment.status === 'UNDER MAINTENANCE' ? (
                  <button
                    onClick={() => {
                      onCompleteMaintenance(selectedEquipment.id);
                      setSelectedEquipment({ ...selectedEquipment, status: 'OPERATIONAL', condition: 'Good' });
                      onShowToast('Maintenance Complete', `${selectedEquipment.name} marked Operational ✓`, 'success');
                    }}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl cursor-pointer shadow-2xs"
                  >
                    Mark Maintenance Complete ✓
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      onScheduleMaintenance(selectedEquipment.id);
                      setSelectedEquipment({ ...selectedEquipment, status: 'UNDER MAINTENANCE' });
                      onShowToast('Maintenance Scheduled', `${selectedEquipment.name} moved to Under Maintenance.`, 'info');
                    }}
                    className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer shadow-2xs"
                  >
                    Schedule Servicing Maintenance
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
