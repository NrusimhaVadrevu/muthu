import React, { useState, useMemo } from 'react';
import { TruckShipment, TruckStatus, MuthuLogisticsRecommendation } from '../types';
import { INITIAL_TRUCKS, INITIAL_LOGISTICS_STATS, MUTHU_LOGISTICS_DECISION_INSIGHTS } from '../logisticsData';

interface LogisticsViewProps {
  trucks?: TruckShipment[];
  onUpdateTruckStatus?: (truckId: string, newStatus: TruckStatus) => void;
  onSelectOrder?: (orderId: string) => void;
  initialFilter?: string;
}

export const LogisticsView: React.FC<LogisticsViewProps> = ({
  trucks = INITIAL_TRUCKS,
  onUpdateTruckStatus,
  onSelectOrder,
  initialFilter
}) => {
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>(initialFilter || 'all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [shipmentTypeFilter, setShipmentTypeFilter] = useState<'all' | 'b2b' | 'b2c'>('all');
  const [selectedTruck, setSelectedTruck] = useState<TruckShipment | null>(null);
  const [activeTab, setActiveTab] = useState<'fleet' | 'routes' | 'muthu_insights'>('fleet');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Compute live counts matching the exact data
  const counts = useMemo(() => {
    const ready = trucks.filter(t => t.currentStatus === 'Ready to Depart').length;
    const loading = trucks.filter(t => t.currentStatus === 'Loading').length;
    const enRoute = trucks.filter(t => t.currentStatus === 'En Route').length;
    const returning = trucks.filter(t => t.currentStatus === 'Returning').length;
    const delivered = trucks.filter(t => t.currentStatus === 'Delivered').length;
    const delayed = trucks.filter(t => t.currentStatus === 'Delayed').length;
    return {
      all: trucks.length,
      ready,
      loading,
      enRoute,
      returning,
      delivered,
      delayed
    };
  }, [trucks]);

  // Filter trucks based on search and filters
  const filteredTrucks = useMemo(() => {
    return trucks.filter(truck => {
      // Status filter
      if (selectedStatusFilter !== 'all') {
        if (selectedStatusFilter === 'ready' && truck.currentStatus !== 'Ready to Depart') return false;
        if (selectedStatusFilter === 'loading' && truck.currentStatus !== 'Loading') return false;
        if (selectedStatusFilter === 'en_route' && truck.currentStatus !== 'En Route') return false;
        if (selectedStatusFilter === 'delayed' && truck.currentStatus !== 'Delayed') return false;
        if (selectedStatusFilter === 'returning' && truck.currentStatus !== 'Returning') return false;
        if (selectedStatusFilter === 'delivered' && truck.currentStatus !== 'Delivered') return false;
      }

      // Shipment type filter
      if (shipmentTypeFilter === 'b2b' && !truck.shipmentType.includes('B2B')) return false;
      if (shipmentTypeFilter === 'b2c' && !truck.shipmentType.includes('B2C')) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matches =
          truck.truckId.toLowerCase().includes(q) ||
          truck.vehicleNumber.toLowerCase().includes(q) ||
          truck.driverName.toLowerCase().includes(q) ||
          truck.destination.toLowerCase().includes(q) ||
          truck.route.toLowerCase().includes(q) ||
          truck.origin.toLowerCase().includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [trucks, selectedStatusFilter, shipmentTypeFilter, searchQuery]);

  const handleExecuteInsight = (rec: MuthuLogisticsRecommendation) => {
    setActionNotice(`Muthu executed: "${rec.action}" successfully. Logistics state synchronized.`);
    setTimeout(() => setActionNotice(null), 5000);
  };

  const handleAdvanceTruckStatus = (truck: TruckShipment) => {
    let next: TruckStatus = truck.currentStatus;
    if (truck.currentStatus === 'Assigned') next = 'Loading';
    else if (truck.currentStatus === 'Loading') next = 'Fully Packed';
    else if (truck.currentStatus === 'Fully Packed') next = 'Ready to Depart';
    else if (truck.currentStatus === 'Ready to Depart') next = 'En Route';
    else if (truck.currentStatus === 'Delayed') next = 'En Route';
    else if (truck.currentStatus === 'En Route') next = 'Near Destination';
    else if (truck.currentStatus === 'Near Destination') next = 'Delivered';
    else if (truck.currentStatus === 'Delivered') next = 'Returning';
    else if (truck.currentStatus === 'Returning') next = 'Returned';

    if (onUpdateTruckStatus) {
      onUpdateTruckStatus(truck.id, next);
    }
    if (selectedTruck && selectedTruck.id === truck.id) {
      setSelectedTruck({ ...selectedTruck, currentStatus: next });
    }
    setActionNotice(`Truck ${truck.vehicleNumber} status advanced to "${next}".`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const getStatusBadgeColor = (status: TruckStatus) => {
    switch (status) {
      case 'Ready to Depart':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Loading':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'En Route':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Near Destination':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Delivered':
        return 'bg-zinc-100 text-zinc-700 border-zinc-200';
      case 'Delayed':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Returning':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-zinc-50 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
              Fleet Command Center
            </span>
            <span className="text-xs text-zinc-600 font-medium">
              Hyderabad Central Terminal Hub (Bay 01 - 12)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Logistics & Fleet Operations
          </h1>
          <p className="text-sm text-zinc-600 mt-0.5">
            Real-time arterial tracking, capacity utilization, and dispatch route intelligence powered by Muthu.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 bg-zinc-100/80 p-1 rounded-xl border border-zinc-200 self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'fleet'
                ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Fleet Grid ({counts.all})
          </button>
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'routes'
                ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            Highway Route Visualizer
          </button>
          <button
            onClick={() => setActiveTab('muthu_insights')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'muthu_insights'
                ? 'bg-amber-600 text-white shadow-sm font-semibold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></span>
            Muthu Observes ({MUTHU_LOGISTICS_DECISION_INSIGHTS.length})
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionNotice && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium flex items-center justify-between shadow-sm animate-slideDown">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-base">check_circle</span>
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* KPI Cards — Interactive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'ready' ? 'all' : 'ready')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatusFilter === 'ready'
              ? 'bg-emerald-50/70 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
              : 'bg-white border-zinc-200 hover:border-emerald-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-600 font-medium mb-1">
            <span>Ready to Depart</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{counts.ready}</div>
          <div className="text-[11px] text-emerald-700 font-medium mt-1">Gate Pass Cleared</div>
        </button>

        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'loading' ? 'all' : 'loading')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatusFilter === 'loading'
              ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white border-zinc-200 hover:border-amber-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-600 font-medium mb-1">
            <span>Loading</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{counts.loading}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Docks 12 - 17 Active</div>
        </button>

        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'en_route' ? 'all' : 'en_route')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatusFilter === 'en_route'
              ? 'bg-blue-50/70 border-blue-400 ring-2 ring-blue-500/20 shadow-sm'
              : 'bg-white border-zinc-200 hover:border-blue-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-600 font-medium mb-1">
            <span>En Route</span>
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{counts.enRoute}</div>
          <div className="text-[11px] text-blue-700 font-medium mt-1">Active on Highways</div>
        </button>

        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'delayed' ? 'all' : 'delayed')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatusFilter === 'delayed'
              ? 'bg-rose-50/70 border-rose-400 ring-2 ring-rose-500/20 shadow-sm'
              : 'bg-white border-zinc-200 hover:border-rose-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-600 font-semibold mb-1">
            <span>Delayed</span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div className="text-2xl font-bold text-rose-600">{counts.delayed}</div>
          <div className="text-[11px] text-rose-700 font-medium mt-1">Muthu Rerouting</div>
        </button>

        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'returning' ? 'all' : 'returning')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatusFilter === 'returning'
              ? 'bg-purple-50/70 border-purple-400 ring-2 ring-purple-500/20 shadow-sm'
              : 'bg-white border-zinc-200 hover:border-purple-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-600 font-medium mb-1">
            <span>Returning</span>
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{counts.returning}</div>
          <div className="text-[11px] text-purple-700 font-medium mt-1">Inbound to Hub</div>
        </button>

        <button
          onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'delivered' ? 'all' : 'delivered')}
          className={`p-4 rounded-xl border text-left transition-all ${
            selectedStatusFilter === 'delivered'
              ? 'bg-zinc-100 border-zinc-400 ring-2 ring-zinc-500/20 shadow-sm'
              : 'bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-600 font-medium mb-1">
            <span>Delivered Today</span>
            <span className="w-2 h-2 rounded-full bg-zinc-400"></span>
          </div>
          <div className="text-2xl font-bold text-zinc-900">{counts.delivered}</div>
          <div className="text-[11px] text-zinc-600 font-medium mt-1">100% POD Verified</div>
        </button>
      </div>

      {/* Primary Content by Selected Tab */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[240px]">
                <input
                  type="text"
                  placeholder="Search vehicle (e.g. AP 05), driver, destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 placeholder-zinc-600"
                />
                <span className="material-symbols-outlined absolute left-2.5 top-2 text-zinc-600 text-sm">
                  search
                </span>
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2 text-zinc-600 hover:text-zinc-600 text-xs">
                    ✕
                  </button>
                )}
              </div>

              {/* Status Filter Dropdown */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-700 font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
              >
                <option value="all">All Statuses ({counts.all})</option>
                <option value="ready">Ready to Depart ({counts.ready})</option>
                <option value="loading">Loading ({counts.loading})</option>
                <option value="en_route">En Route ({counts.enRoute})</option>
                <option value="delayed">Delayed ({counts.delayed})</option>
                <option value="returning">Returning ({counts.returning})</option>
                <option value="delivered">Delivered ({counts.delivered})</option>
              </select>

              {/* Shipment Type Filter */}
              <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
                <button
                  onClick={() => setShipmentTypeFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    shipmentTypeFilter === 'all' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  All Types
                </button>
                <button
                  onClick={() => setShipmentTypeFilter('b2b')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    shipmentTypeFilter === 'b2b' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  B2B Freight
                </button>
                <button
                  onClick={() => setShipmentTypeFilter('b2c')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    shipmentTypeFilter === 'b2c' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  B2C Courier
                </button>
              </div>
            </div>

            <div className="text-xs text-zinc-600 font-medium">
              Showing <span className="font-bold text-zinc-900">{filteredTrucks.length}</span> of {trucks.length} vehicles
            </div>
          </div>

          {/* Fleet Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTrucks.map((truck) => (
              <div
                key={truck.id}
                onClick={() => setSelectedTruck(truck)}
                className={`bg-white rounded-xl border p-4 hover:shadow-md transition-all cursor-pointer relative group flex flex-col justify-between ${
                  truck.currentStatus === 'Delayed'
                    ? 'border-rose-300 bg-rose-50/10'
                    : 'border-zinc-200/90 hover:border-amber-300'
                }`}
              >
                {/* Top Card Bar */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                          {truck.vehicleNumber}
                        </span>
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${getStatusBadgeColor(truck.currentStatus)}`}>
                          {truck.currentStatus}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600 font-medium mt-1">
                        {truck.vehicleType} • {truck.truckId}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-semibold text-zinc-900 block">{truck.eta}</span>
                      <span className="text-[10px] text-zinc-600">ETA</span>
                    </div>
                  </div>

                  {/* Route & Progress */}
                  <div className="my-3 p-2.5 bg-zinc-50 rounded-lg border border-zinc-150 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-zinc-700 font-medium truncate max-w-[130px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                        <span className="truncate">{truck.origin.split('(')[0]}</span>
                      </div>
                      <span className="text-zinc-600 text-[10px]">➔</span>
                      <div className="flex items-center gap-1 text-zinc-900 font-bold truncate max-w-[130px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        <span className="truncate">{truck.destination.split('(')[0]}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          truck.currentStatus === 'Delayed'
                            ? 'bg-rose-500'
                            : truck.currentStatus === 'Delivered'
                            ? 'bg-emerald-600'
                            : 'bg-amber-500'
                        }`}
                        style={{ width: `${Math.max(5, truck.progressPercent || (truck.currentStatus === 'Delivered' ? 100 : truck.currentStatus === 'Ready to Depart' ? 0 : 45))}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-600">
                      <span>{truck.currentLocationDesc}</span>
                      <span className="font-semibold text-zinc-700">{truck.distanceKm} km</span>
                    </div>
                  </div>

                  {/* Driver & Load Capacity */}
                  <div className="grid grid-cols-2 gap-2 text-xs py-1 border-t border-zinc-100">
                    <div>
                      <span className="text-zinc-600 text-[10px] block">Driver</span>
                      <span className="font-medium text-zinc-800">{truck.driverName}</span>
                    </div>
                    <div>
                      <span className="text-zinc-600 text-[10px] block">Payload Utilization</span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex-1 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${truck.currentLoadPercent > 90 ? 'bg-emerald-600' : 'bg-amber-500'}`}
                            style={{ width: `${truck.currentLoadPercent}%` }}
                          ></div>
                        </div>
                        <span className="font-bold text-zinc-900 text-[11px]">{truck.currentLoadPercent}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Delay Warning if applicable */}
                  {truck.delayReason && (
                    <div className="mt-2 p-2 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-700">
                      <span className="font-bold">Delay Alert: </span>{truck.delayReason}
                    </div>
                  )}

                  {/* Muthu Recommendation Badge */}
                  {truck.muthuRecommendation && (
                    <div className="mt-2 p-2 bg-amber-50/80 border border-amber-200/80 rounded-lg text-[11px] text-amber-900 flex items-center justify-between">
                      <div className="truncate pr-2">
                        <span className="font-bold">Muthu: </span>{truck.muthuRecommendation.recommendation}
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 shrink-0">
                        {truck.muthuRecommendation.confidence}% conf.
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="mt-3 pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                  <span className="text-zinc-600 text-[11px]">
                    {truck.orderCount} Orders Assigned
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTruck(truck);
                    }}
                    className="text-amber-700 hover:text-amber-900 font-semibold flex items-center gap-0.5"
                  >
                    Details ➔
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Route Visualizer View */}
      {activeTab === 'routes' && (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">Arterial Highway Corridors & Live Waypoints</h2>
              <p className="text-xs text-zinc-600">Visual freight corridors originating from Hyderabad Central Hub.</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
              Live Telemetry Active (30s Sync)
            </span>
          </div>

          <div className="space-y-4">
            {[
              {
                corridor: 'Corridor 1: NH65 Vijayawada - Coastal Link',
                distance: '275 KM',
                activeTrucks: trucks.filter(t => t.route.includes('NH65') && (t.destination.includes('Vijayawada') || t.destination.includes('Guntur'))),
                bottleneck: 'KM 142 Keesara Toll Plaza (Moderate)',
                weather: 'Clear • 34°C'
              },
              {
                corridor: 'Corridor 2: NH44 Bengaluru South Super-Expressway',
                distance: '570 KM',
                activeTrucks: trucks.filter(t => t.route.includes('NH44')),
                bottleneck: 'None • Free Flow',
                weather: 'Sunny • 29°C'
              },
              {
                corridor: 'Corridor 3: NH16 Visakhapatnam & Port Industrial Corridor',
                distance: '620 KM',
                activeTrucks: trucks.filter(t => t.destination.includes('Visakhapatnam') || t.destination.includes('Kakinada') || t.destination.includes('Rajahmundry')),
                bottleneck: 'KM 380 Annavaram Weigh Station',
                weather: 'Coastal Breeze • 31°C'
              },
              {
                corridor: 'Corridor 4: NH65 Pune - Mumbai Western Freight Way',
                distance: '710 KM',
                activeTrucks: trucks.filter(t => t.destination.includes('Pune') || t.destination.includes('Mumbai')),
                bottleneck: 'None • Optimal Flow',
                weather: 'Clear • 28°C'
              }
            ].map((corridor, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="text-sm font-bold text-zinc-900">{corridor.corridor}</span>
                    <span className="text-xs text-zinc-600 font-medium">({corridor.distance})</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-600 font-medium">
                    <span>Bottleneck: <strong className="text-zinc-800">{corridor.bottleneck}</strong></span>
                    <span>Weather: <strong className="text-zinc-800">{corridor.weather}</strong></span>
                  </div>
                </div>

                {/* Corridor Highway Visualizer Line */}
                <div className="relative py-4 px-2 bg-white rounded-lg border border-zinc-200 overflow-x-auto">
                  <div className="min-w-[600px] flex items-center justify-between relative">
                    {/* Origin Node */}
                    <div className="flex flex-col items-center z-10">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow">
                        HYD
                      </div>
                      <span className="text-[11px] font-bold text-zinc-800 mt-1">Central Hub</span>
                      <span className="text-[10px] text-zinc-600">Origin Bay</span>
                    </div>

                    {/* Corridor Line */}
                    <div className="absolute left-10 right-10 top-4 h-1 bg-zinc-200 -z-0"></div>

                    {/* Active Trucks Along Corridor */}
                    {corridor.activeTrucks.slice(0, 4).map((trk, tIdx) => {
                      const posPercent = trk.progressPercent || (tIdx === 0 ? 30 : tIdx === 1 ? 65 : 85);
                      return (
                        <button
                          key={trk.id}
                          onClick={() => setSelectedTruck(trk)}
                          className="absolute z-10 transform -translate-x-1/2 flex flex-col items-center hover:scale-110 transition-transform group"
                          style={{ left: `${Math.min(88, Math.max(12, posPercent))}%`, top: '-4px' }}
                        >
                          <div className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border shadow-sm ${
                            trk.currentStatus === 'Delayed'
                              ? 'bg-rose-600 text-white border-rose-700 animate-bounce'
                              : 'bg-amber-600 text-white border-amber-700'
                          }`}>
                            {trk.vehicleNumber.split(' ')[0]} {trk.vehicleNumber.split(' ')[1]}
                          </div>
                          <span className="text-[9px] text-zinc-700 font-semibold mt-0.5 bg-white/90 px-1 rounded shadow-xs">
                            {trk.driverName.split(' ')[0]}
                          </span>
                        </button>
                      );
                    })}

                    {/* Destination Node */}
                    <div className="flex flex-col items-center z-10">
                      <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow">
                        DEST
                      </div>
                      <span className="text-[11px] font-bold text-zinc-800 mt-1">Regional Depot</span>
                      <span className="text-[10px] text-zinc-600">Receiving Bay</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Muthu Logistics Decision Insights Tab */}
      {activeTab === 'muthu_insights' && (
        <div className="space-y-4">
          <div className="bg-amber-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="px-2.5 py-0.5 bg-amber-800/80 rounded-full text-xs font-semibold text-amber-200 border border-amber-700">
                Logistics Partner Intelligence
              </span>
              <h2 className="text-xl font-bold mt-2">Muthu Fleet & Transportation Advisory</h2>
              <p className="text-sm text-amber-100/90 mt-1">
                Continuous telemetry analysis evaluating highway delays, trailer capacity underutilization, and priority gate dispatch clearance.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MUTHU_LOGISTICS_DECISION_INSIGHTS.map((rec, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      Recommendation #{i + 1}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {rec.confidence}% Confidence
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-zinc-900">{rec.problem}</h3>
                  
                  <div className="text-xs space-y-1.5 mt-2.5 text-zinc-600 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <p><strong className="text-zinc-800">Root Cause:</strong> {rec.reason}</p>
                    <p><strong className="text-zinc-800">Operational Impact:</strong> {rec.impact}</p>
                    <p><strong className="text-zinc-800">Muthu Recommends:</strong> {rec.recommendation}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-end">
                  <button
                    onClick={() => handleExecuteInsight(rec)}
                    className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow active:scale-95"
                  >
                    {rec.action}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shipment & Driver Details Modal / Drawer */}
      {selectedTruck && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl border border-zinc-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-zinc-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono px-2.5 py-1 bg-zinc-100 text-zinc-900 rounded border border-zinc-200">
                    {selectedTruck.vehicleNumber}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeColor(selectedTruck.currentStatus)}`}>
                    {selectedTruck.currentStatus}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-zinc-900 mt-1">
                  Shipment Manifest • {selectedTruck.truckId}
                </h2>
              </div>
              <button
                onClick={() => setSelectedTruck(null)}
                className="w-8 h-8 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status Advancement Bar */}
              <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-zinc-600 font-medium block">Current Logistics Stage</span>
                  <span className="text-sm font-bold text-zinc-900">{selectedTruck.currentStatus}</span>
                </div>
                <button
                  onClick={() => handleAdvanceTruckStatus(selectedTruck)}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-sm transition-all self-start sm:self-auto"
                >
                  Advance Stage ➔
                </button>
              </div>

              {/* Driver & Telemetry Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2 text-xs">
                  <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block">
                    Driver Profile
                  </span>
                  <div className="text-sm font-bold text-zinc-900">{selectedTruck.driverName}</div>
                  <div className="text-zinc-600 flex items-center gap-1 font-mono">
                    <span className="material-symbols-outlined text-sm text-zinc-600">phone</span>
                    {selectedTruck.driverContact}
                  </div>
                  <div className="text-zinc-600">Vehicle: <strong className="text-zinc-800">{selectedTruck.vehicleType}</strong></div>
                  <div className="text-zinc-600">Fuel Level: <strong className="text-emerald-700">{selectedTruck.fuelLevelPercent}%</strong></div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-2 text-xs">
                  <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block">
                    Route & ETA
                  </span>
                  <div className="text-zinc-600">Origin: <strong className="text-zinc-900">{selectedTruck.origin}</strong></div>
                  <div className="text-zinc-600">Destination: <strong className="text-zinc-900">{selectedTruck.destination}</strong></div>
                  <div className="text-zinc-600">Corridor: <strong className="text-zinc-800">{selectedTruck.route}</strong></div>
                  <div className="text-zinc-600">ETA: <strong className="text-amber-700">{selectedTruck.eta}</strong></div>
                </div>
              </div>

              {/* Payload Details */}
              <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3 text-xs">
                <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider block">
                  Capacity & Payload Manifest
                </span>
                <div className="grid grid-cols-3 gap-2 text-center bg-zinc-50 p-3 rounded-lg border border-zinc-150">
                  <div>
                    <span className="text-[10px] text-zinc-600 block">Total Capacity</span>
                    <span className="font-bold text-zinc-900">{selectedTruck.capacityKg / 1000} Tons ({selectedTruck.capacityPallets} Pallets)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-600 block">Current Load</span>
                    <span className="font-bold text-zinc-900">{selectedTruck.currentLoadKg} KG ({selectedTruck.currentLoadPercent}%)</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-600 block">Order Count</span>
                    <span className="font-bold text-zinc-900">{selectedTruck.orderCount} Orders</span>
                  </div>
                </div>

                {selectedTruck.orderIds && selectedTruck.orderIds.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-zinc-700 block mb-1.5">Assigned Order Identifiers:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedTruck.orderIds.map((ordId, oIdx) => (
                        <button
                          key={oIdx}
                          onClick={() => {
                            if (onSelectOrder) onSelectOrder(ordId);
                          }}
                          className="px-2.5 py-1 bg-zinc-100 hover:bg-amber-50 hover:border-amber-300 text-zinc-800 hover:text-amber-900 rounded font-mono text-xs border border-zinc-200 font-semibold"
                        >
                          {ordId}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Muthu Recommendation in Drawer if available */}
              {selectedTruck.muthuRecommendation && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900">Muthu Recommends</span>
                    <span className="text-amber-700 font-bold">{selectedTruck.muthuRecommendation.confidence}% Confidence</span>
                  </div>
                  <p className="text-amber-800">{selectedTruck.muthuRecommendation.recommendation}</p>
                  <button
                    onClick={() => handleExecuteInsight(selectedTruck.muthuRecommendation!)}
                    className="mt-2 px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-bold text-xs shadow-xs"
                  >
                    {selectedTruck.muthuRecommendation.action}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end gap-2">
              <button
                onClick={() => setSelectedTruck(null)}
                className="px-4 py-2 bg-white border border-zinc-300 text-zinc-700 rounded-xl text-xs font-bold hover:bg-zinc-100"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
