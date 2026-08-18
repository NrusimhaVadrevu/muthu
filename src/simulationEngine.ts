import {
  SimulationParams,
  SimulationResults,
  SimulationMetrics,
  SimulationProblem,
  SimulationRecommendation,
  SimulationHistoryRecord
} from './types';

export const DEFAULT_SIMULATION_PARAMS: SimulationParams = {
  scenarioName: '500 New Orders Rush Wave',
  category: 'orders',
  additionalOrders: 500,
  orderTypeMix: 'normal',
  activePickersDelta: 0,
  activePackersDelta: 0,
  zoneCongestionPercent: 65,
  blockedShelvesCount: 0,
  qcDelayMinutes: 0,
  courierDelayMinutes: 0,
  vehicleBreakdown: false,
  stockoutSeverity: 'none',
  supplierDelayDays: 0
};

export interface ScenarioPreset {
  id: string;
  name: string;
  category: 'orders' | 'inventory' | 'workers' | 'warehouse' | 'dispatch';
  icon: string;
  description: string;
  params: Partial<SimulationParams>;
}

export const PRESET_SCENARIOS: ScenarioPreset[] = [
  // Orders Scenarios (B2B, B2C, and Mixed)
  {
    id: 'preset-orders-b2b-pallet',
    name: '🏢 B2B Enterprise Pallet Wave (+350 Pallets)',
    category: 'orders',
    icon: 'domain',
    description: 'Heavy wholesale freight order wave testing dock staging bays and forklift allocation.',
    params: {
      scenarioName: 'B2B Enterprise Pallet Wave (+350 Pallets)',
      category: 'orders',
      additionalOrders: 350,
      orderTypeMix: 'b2b_wholesale',
      zoneCongestionPercent: 70
    }
  },
  {
    id: 'preset-orders-b2c-flash',
    name: '👤 B2C Direct Consumer Flash Sale (+750 Parcels)',
    category: 'orders',
    icon: 'electric_bolt',
    description: 'Direct-to-consumer flash sale pushing courier cutoff times and high-velocity single-item picking lines.',
    params: {
      scenarioName: 'B2C Direct Consumer Flash Sale (+750 Parcels)',
      category: 'orders',
      additionalOrders: 750,
      orderTypeMix: 'b2c_consumer',
      zoneCongestionPercent: 82
    }
  },
  {
    id: 'preset-orders-mixed-peak',
    name: '🔀 Mixed Multi-Modal Peak (B2B & B2C Simultaneous)',
    category: 'orders',
    icon: 'hub',
    description: 'Simultaneous enterprise contract fulfillment alongside high-velocity consumer parcel dispatch.',
    params: {
      scenarioName: 'Mixed Multi-Modal Peak (B2B & B2C Simultaneous)',
      category: 'orders',
      additionalOrders: 600,
      orderTypeMix: 'mixed_multimodal',
      zoneCongestionPercent: 88
    }
  },
  {
    id: 'preset-orders-100',
    name: '100 New Orders Surge',
    category: 'orders',
    icon: 'shopping_bag',
    description: 'Moderate volume increase testing buffer line capacity.',
    params: {
      scenarioName: '100 New Orders Surge',
      category: 'orders',
      additionalOrders: 100,
      orderTypeMix: 'normal',
      zoneCongestionPercent: 35
    }
  },
  {
    id: 'preset-orders-250',
    name: '250 New Orders Surge',
    category: 'orders',
    icon: 'local_mall',
    description: 'Mid-shift promotional spike across Zone A & B.',
    params: {
      scenarioName: '250 New Orders Surge',
      category: 'orders',
      additionalOrders: 250,
      orderTypeMix: 'normal',
      zoneCongestionPercent: 55
    }
  },
  {
    id: 'preset-orders-500',
    name: '500 New Orders Rush Wave',
    category: 'orders',
    icon: 'bolt',
    description: 'Heavy order flood pushing packing and staging queues to limits.',
    params: {
      scenarioName: '500 New Orders Rush Wave',
      category: 'orders',
      additionalOrders: 500,
      orderTypeMix: 'normal',
      zoneCongestionPercent: 78
    }
  },
  {
    id: 'preset-orders-vip',
    name: 'VIP Rush Orders Priority',
    category: 'orders',
    icon: 'star',
    description: '150 urgent VIP orders with strict 45-minute SLA delivery windows.',
    params: {
      scenarioName: 'VIP Rush Orders Priority',
      category: 'orders',
      additionalOrders: 150,
      orderTypeMix: 'vip_surge',
      zoneCongestionPercent: 50
    }
  },
  {
    id: 'preset-orders-holiday',
    name: 'Holiday Sales Spike (+600)',
    category: 'orders',
    icon: 'celebration',
    description: 'Extreme seasonal surge with multi-item gift and tech bundles.',
    params: {
      scenarioName: 'Holiday Sales Spike',
      category: 'orders',
      additionalOrders: 600,
      orderTypeMix: 'holiday_spike',
      zoneCongestionPercent: 88,
      stockoutSeverity: 'moderate'
    }
  },

  // Inventory Scenarios
  {
    id: 'preset-inv-stockout',
    name: 'Product Out of Stock (Critical SKUs)',
    category: 'inventory',
    icon: 'production_quantity_limits',
    description: 'Zero stock on high-demand ProBook and Ergonomic Chair units.',
    params: {
      scenarioName: 'Product Out of Stock (Critical SKUs)',
      category: 'inventory',
      additionalOrders: 80,
      stockoutSeverity: 'critical',
      supplierDelayDays: 3
    }
  },
  {
    id: 'preset-inv-low',
    name: 'Low Packaging Material Alert',
    category: 'inventory',
    icon: 'inventory_2',
    description: 'Box and tape depletion causing 30% packaging slowdown.',
    params: {
      scenarioName: 'Low Packaging Material Alert',
      category: 'inventory',
      additionalOrders: 120,
      stockoutSeverity: 'moderate'
    }
  },
  {
    id: 'preset-inv-supplier-delay',
    name: 'Supplier Inbound Delay (5 Days)',
    category: 'inventory',
    icon: 'event_busy',
    description: 'Vendor delay on electronics parts impacting backorders.',
    params: {
      scenarioName: 'Supplier Inbound Delay (5 Days)',
      category: 'inventory',
      supplierDelayDays: 5,
      stockoutSeverity: 'moderate'
    }
  },
  {
    id: 'preset-inv-transfer',
    name: 'Cross-Dock Warehouse Transfer',
    category: 'inventory',
    icon: 'swap_horiz',
    description: 'Receiving 300 units from Bay-02 for rapid fulfillment re-routing.',
    params: {
      scenarioName: 'Cross-Dock Warehouse Transfer',
      category: 'inventory',
      additionalOrders: 180,
      zoneCongestionPercent: 40
    }
  },

  // Workers Scenarios
  {
    id: 'preset-worker-picker-absent',
    name: '2 Pickers Absent on Shift',
    category: 'workers',
    icon: 'person_off',
    description: 'Unplanned absence slowing down Zone A picking waves.',
    params: {
      scenarioName: '2 Pickers Absent on Shift',
      category: 'workers',
      activePickersDelta: -2,
      additionalOrders: 100
    }
  },
  {
    id: 'preset-worker-packer-absent',
    name: '3 Packers Absent / Sick',
    category: 'workers',
    icon: 'sick',
    description: 'Packing bench capacity reduced by 40%, creating conveyor backup.',
    params: {
      scenarioName: '3 Packers Absent / Sick',
      category: 'workers',
      activePackersDelta: -3,
      additionalOrders: 150
    }
  },
  {
    id: 'preset-worker-multiple-sick',
    name: 'Multiple Workers Sick (Severe Staff Shortage)',
    category: 'workers',
    icon: 'group_off',
    description: '4 pickers and 3 packers unavailable during peak hours.',
    params: {
      scenarioName: 'Multiple Workers Sick (Severe Staff Shortage)',
      category: 'workers',
      activePickersDelta: -4,
      activePackersDelta: -3,
      additionalOrders: 200
    }
  },
  {
    id: 'preset-worker-hire',
    name: 'Deploy 4 Temp Workers',
    category: 'workers',
    icon: 'group_add',
    description: 'Inject 4 supplemental runners to clear backlogs.',
    params: {
      scenarioName: 'Deploy 4 Temp Workers',
      category: 'workers',
      activePickersDelta: 2,
      activePackersDelta: 2,
      additionalOrders: 250
    }
  },

  // Warehouse Congestion & Hardware Scenarios
  {
    id: 'preset-wh-zone-congestion',
    name: 'Zone B Heavy Congestion',
    category: 'warehouse',
    icon: 'grid_view',
    description: 'Aisle traffic in Zone B exceeding 90% density capacity.',
    params: {
      scenarioName: 'Zone B Heavy Congestion',
      category: 'warehouse',
      zoneCongestionPercent: 92,
      additionalOrders: 150
    }
  },
  {
    id: 'preset-wh-shelf-blocked',
    name: 'Aisle 3 Forklift Spill & Shelf Blocked',
    category: 'warehouse',
    icon: 'block',
    description: 'Pallet obstruction blocking Bins A-12 through A-18.',
    params: {
      scenarioName: 'Aisle 3 Forklift Spill & Shelf Blocked',
      category: 'warehouse',
      blockedShelvesCount: 3,
      zoneCongestionPercent: 70
    }
  },
  {
    id: 'preset-wh-qc-delay',
    name: 'QC Optical Scanner Recalibration Delay',
    category: 'warehouse',
    icon: 'timer',
    description: 'Automated barcode scanner failure adding 35-min manual inspection.',
    params: {
      scenarioName: 'QC Optical Scanner Recalibration Delay',
      category: 'warehouse',
      qcDelayMinutes: 35,
      additionalOrders: 100
    }
  },
  {
    id: 'preset-wh-pack-bottleneck',
    name: 'Pack Station #2 Mechanical Failure',
    category: 'warehouse',
    icon: 'precision_manufacturing',
    description: 'Automated taping arm failure forcing single-line manual pack.',
    params: {
      scenarioName: 'Pack Station #2 Mechanical Failure',
      category: 'warehouse',
      activePackersDelta: -2,
      zoneCongestionPercent: 65
    }
  },

  // Dispatch & Logistics Scenarios
  {
    id: 'preset-dispatch-courier-delay',
    name: 'FedEx Ground Courier Delay (45 Mins)',
    category: 'dispatch',
    icon: 'local_shipping',
    description: 'Severe weather delay holding up primary FedEx trailer departure.',
    params: {
      scenarioName: 'FedEx Ground Courier Delay (45 Mins)',
      category: 'dispatch',
      courierDelayMinutes: 45,
      additionalOrders: 120
    }
  },
  {
    id: 'preset-dispatch-van-breakdown',
    name: 'Last-Mile Delivery Van Breakdown',
    category: 'dispatch',
    icon: 'car_crash',
    description: 'Van #04 mechanical failure stranding 28 local express parcels.',
    params: {
      scenarioName: 'Last-Mile Delivery Van Breakdown',
      category: 'dispatch',
      vehicleBreakdown: true,
      courierDelayMinutes: 60
    }
  },
  {
    id: 'preset-dispatch-staging-full',
    name: 'Dispatch Staging Queue Saturation',
    category: 'dispatch',
    icon: 'warehouse',
    description: 'Dock floor 95% full with outgoing pallets awaiting carrier sweeps.',
    params: {
      scenarioName: 'Dispatch Staging Queue Saturation',
      category: 'dispatch',
      zoneCongestionPercent: 85,
      courierDelayMinutes: 30,
      additionalOrders: 200
    }
  }
];

const rawHistoricalScenarios: { name: string; cat: 'orders' | 'inventory' | 'workers' | 'warehouse' | 'dispatch'; user: string; time: string; pDelta: Partial<SimulationParams>; recs: string[] }[] = [
  { name: '500 New Orders Rush Wave', cat: 'orders', user: 'Lead Ops Manager', time: 'Today at 10:42 AM', pDelta: { additionalOrders: 500 }, recs: ['rec-1', 'rec-2', 'rec-3'] },
  { name: '3 Packers Absent / Sick', cat: 'workers', user: 'Floor Supervisor', time: 'Yesterday at 3:15 PM', pDelta: { activePackersDelta: -3, additionalOrders: 150 }, recs: ['rec-1', 'rec-2'] },
  { name: 'VIP Rush Orders Priority Wave', cat: 'orders', user: 'Dispatch Lead', time: 'Yesterday at 9:05 AM', pDelta: { additionalOrders: 150, orderTypeMix: 'vip_surge' }, recs: ['rec-1', 'rec-2'] },
  { name: 'Critical Stockout: Box #4 Cartons', cat: 'inventory', user: 'Inventory Controller', time: '2 days ago at 4:30 PM', pDelta: { stockoutSeverity: 'critical' }, recs: ['rec-4'] },
  { name: 'FedEx Express 45-Min Courier Delay', cat: 'dispatch', user: 'Dispatch Lead', time: '2 days ago at 1:15 PM', pDelta: { courierDelayMinutes: 45, additionalOrders: 120 }, recs: ['rec-3'] },
  { name: 'Zone B High Density Congestion', cat: 'warehouse', user: 'Floor Supervisor', time: '3 days ago at 11:20 AM', pDelta: { zoneCongestionPercent: 92, additionalOrders: 180 }, recs: ['rec-1'] },
  { name: 'QC Optical Scanner Recalibration Delay', cat: 'warehouse', user: 'Quality Lead', time: '3 days ago at 9:00 AM', pDelta: { qcDelayMinutes: 35 }, recs: ['rec-1', 'rec-2'] },
  { name: 'Flash Sale: 250 Rush Orders', cat: 'orders', user: 'Lead Ops Manager', time: '4 days ago at 5:10 PM', pDelta: { additionalOrders: 250 }, recs: ['rec-1', 'rec-2'] },
  { name: 'Last-Mile Delivery Van Breakdown', cat: 'dispatch', user: 'Dispatch Lead', time: '4 days ago at 2:40 PM', pDelta: { vehicleBreakdown: true, courierDelayMinutes: 60 }, recs: ['rec-3'] },
  { name: 'Supplier 5-Day Lead Time Delay', cat: 'inventory', user: 'Procurement Specialist', time: '5 days ago at 10:15 AM', pDelta: { supplierDelayDays: 5 }, recs: ['rec-4'] },
  { name: 'Deploy 4 Temp Workers Stress Test', cat: 'workers', user: 'VP of Logistics', time: '5 days ago at 8:30 AM', pDelta: { activePickersDelta: 2, activePackersDelta: 2, additionalOrders: 300 }, recs: ['rec-1', 'rec-2', 'rec-3'] },
  { name: 'Aisle 3 Forklift Spill & Obstruction', cat: 'warehouse', user: 'Safety Officer', time: '6 days ago at 3:50 PM', pDelta: { blockedShelvesCount: 3, zoneCongestionPercent: 70 }, recs: ['rec-1'] },
  { name: 'Weekend Shift Low-Staffing Simulation', cat: 'workers', user: 'Shift Coordinator', time: '7 days ago at 4:20 PM', pDelta: { activePickersDelta: -2, activePackersDelta: -2 }, recs: ['rec-1'] },
  { name: 'Black Friday 1000-Order Extreme Stress Test', cat: 'orders', user: 'Lead Ops Manager', time: '8 days ago at 11:00 AM', pDelta: { additionalOrders: 500, zoneCongestionPercent: 85 }, recs: ['rec-1', 'rec-2', 'rec-3', 'rec-4'] },
  { name: 'Dispatch Staging Dock Saturation (95%)', cat: 'dispatch', user: 'Dispatch Lead', time: '9 days ago at 2:10 PM', pDelta: { zoneCongestionPercent: 85, courierDelayMinutes: 30 }, recs: ['rec-3'] },
  { name: 'Cold-Chain Pharma Priority Run', cat: 'orders', user: 'Lead Ops Manager', time: '10 days ago at 10:00 AM', pDelta: { additionalOrders: 80, orderTypeMix: 'vip_surge' }, recs: ['rec-2'] },
  { name: 'Pack Station #2 Mechanical Breakdown', cat: 'warehouse', user: 'Maintenance Lead', time: '11 days ago at 1:45 PM', pDelta: { activePackersDelta: -2, zoneCongestionPercent: 65 }, recs: ['rec-1'] },
  { name: 'Bulk Pallet Re-Slotting & Balancing', cat: 'warehouse', user: 'Operations Architect', time: '12 days ago at 9:30 AM', pDelta: { zoneCongestionPercent: 40 }, recs: ['rec-1'] },
  { name: 'Multi-Carrier Simultaneous Ground Sweep', cat: 'dispatch', user: 'Dispatch Lead', time: '13 days ago at 3:15 PM', pDelta: { additionalOrders: 200 }, recs: ['rec-3'] },
  { name: 'Cross-Dock Transit Rapid Turnaround', cat: 'warehouse', user: 'Lead Ops Manager', time: '14 days ago at 11:45 AM', pDelta: { additionalOrders: 150 }, recs: ['rec-1', 'rec-2'] },
  { name: 'Hazardous Materials Handling Quarantine', cat: 'warehouse', user: 'Safety Officer', time: '15 days ago at 2:00 PM', pDelta: { qcDelayMinutes: 25 }, recs: ['rec-1'] },
  { name: 'Night Shift Autonomous Picking Simulation', cat: 'workers', user: 'Muthu Auto-Pilot', time: '16 days ago at 1:30 AM', pDelta: { activePickersDelta: -1, additionalOrders: 90 }, recs: ['rec-1'] }
];

export const INITIAL_SIMULATION_HISTORY: SimulationHistoryRecord[] = rawHistoricalScenarios.map((sc, i) => {
  const mergedParams: SimulationParams = {
    ...DEFAULT_SIMULATION_PARAMS,
    ...sc.pDelta,
    scenarioName: sc.name,
    category: sc.cat
  };
  return {
    id: `sim-hist-${i + 1}`,
    scenarioName: sc.name,
    category: sc.cat,
    timestamp: sc.time,
    createdBy: sc.user,
    recommendationsAppliedCount: sc.recs.length,
    params: mergedParams,
    results: calculateSimulationResults(mergedParams, sc.recs)
  };
});

/**
 * Main Digital Twin calculation function that simulates warehouse impact
 * and calculates optimized metrics when recommendations are applied.
 */
export function calculateSimulationResults(
  params: SimulationParams,
  appliedRecommendationIds: string[] = []
): SimulationResults {
  // Baseline (Current Normal State)
  const beforeMetrics: SimulationMetrics = {
    healthScore: 95,
    orderCompletionRate: 98.6,
    slaCompliance: 99.2,
    workerUtilization: 81,
    avgPickingTimeMinutes: 14,
    avgPackingTimeMinutes: 10,
    avgDispatchDelayMinutes: 24,
    inventoryShortagesCount: 2,
    revenueAtRisk: 0,
    ordersDelayedCount: 2
  };

  // Severity weights calculation
  const orderPressure = params.additionalOrders / 50; // each 50 orders adds 1 point pressure
  const workerDeficit = Math.abs(Math.min(0, params.activePickersDelta + params.activePackersDelta)) * 3.5;
  const congestionImpact = Math.max(0, (params.zoneCongestionPercent - 50) / 6);
  const stockoutImpact = params.stockoutSeverity === 'critical' ? 12 : params.stockoutSeverity === 'moderate' ? 6 : 0;
  const delayImpact = (params.courierDelayMinutes + params.qcDelayMinutes) / 8;
  const breakdownImpact = params.vehicleBreakdown ? 10 : 0;
  const blockedImpact = params.blockedShelvesCount * 3;

  const totalDisruptionScore = Math.min(
    70,
    orderPressure + workerDeficit + congestionImpact + stockoutImpact + delayImpact + breakdownImpact + blockedImpact
  );

  // Simulated metrics without mitigation
  const simulatedHealth = Math.max(48, Math.round(95 - totalDisruptionScore * 0.75));
  const simulatedCompletion = Math.max(62, Math.round((98.6 - totalDisruptionScore * 0.45) * 10) / 10);
  const simulatedSla = Math.max(54, Math.round((99.2 - totalDisruptionScore * 0.65) * 10) / 10);
  const simulatedUtilization = Math.min(100, Math.round(81 + totalDisruptionScore * 0.35));
  const simulatedPickingTime = Math.round(14 + (params.additionalOrders / 80) + Math.abs(Math.min(0, params.activePickersDelta)) * 4 + (params.zoneCongestionPercent > 70 ? 6 : 0));
  const simulatedPackingTime = Math.round(10 + (params.additionalOrders / 60) + Math.abs(Math.min(0, params.activePackersDelta)) * 5 + (params.stockoutSeverity !== 'none' ? 4 : 0));
  const simulatedDispatchDelay = Math.round(24 + (totalDisruptionScore * 3.2) + params.courierDelayMinutes);
  const simulatedShortages = 2 + (params.stockoutSeverity === 'critical' ? 7 : params.stockoutSeverity === 'moderate' ? 4 : Math.round(params.additionalOrders / 150));
  const simulatedDelayedOrders = Math.round(2 + totalDisruptionScore * 0.75 + (params.additionalOrders / 25));
  const simulatedRevenueAtRisk = Math.round(simulatedDelayedOrders * 12500 + (params.vehicleBreakdown ? 45000 : 0) + (params.orderTypeMix === 'vip_surge' ? 38000 : 0));

  const simulatedMetrics: SimulationMetrics = {
    healthScore: simulatedHealth,
    orderCompletionRate: simulatedCompletion,
    slaCompliance: simulatedSla,
    workerUtilization: simulatedUtilization,
    avgPickingTimeMinutes: simulatedPickingTime,
    avgPackingTimeMinutes: simulatedPackingTime,
    avgDispatchDelayMinutes: simulatedDispatchDelay,
    inventoryShortagesCount: simulatedShortages,
    revenueAtRisk: simulatedRevenueAtRisk,
    ordersDelayedCount: simulatedDelayedOrders
  };

  // Generate dynamic problems based on scenario
  const detectedProblems: SimulationProblem[] = [];

  if (params.additionalOrders >= 200 || params.activePackersDelta < 0) {
    detectedProblems.push({
      id: 'prob-pack',
      title: 'Packing Station Queue Overloaded',
      severity: 'critical',
      impact: `Conveyor backup of ${Math.round(params.additionalOrders * 0.4 + 18)} orders at Station #2.`,
      zone: 'Zone C (Packing)'
    });
  }

  if (params.zoneCongestionPercent >= 70 || params.activePickersDelta < 0 || params.blockedShelvesCount > 0) {
    detectedProblems.push({
      id: 'prob-zone-b',
      title: 'Zone B High Density Congestion',
      severity: 'high',
      impact: 'Picker travel speed reduced by 22% in Aisle 2 & 4.',
      zone: 'Zone B (Tech Shelves)'
    });
  }

  if (params.stockoutSeverity !== 'none' || params.additionalOrders >= 300) {
    detectedProblems.push({
      id: 'prob-inv',
      title: 'Packaging & High-Velocity SKU Shortage',
      severity: params.stockoutSeverity === 'critical' ? 'critical' : 'medium',
      impact: 'Box #4 corrugated cartons & fast-moving SKUs depleted below buffer.',
      zone: 'Staging & Bins'
    });
  }

  if (params.courierDelayMinutes > 0 || params.vehicleBreakdown || params.orderTypeMix === 'vip_surge') {
    detectedProblems.push({
      id: 'prob-dispatch',
      title: 'Carrier Cutoff SLA Risk',
      severity: 'critical',
      impact: `${params.orderTypeMix === 'vip_surge' ? 'VIP Express SLA penalty' : 'Carrier pickup window'} deadline at risk.`,
      zone: 'Outbound Bay 4'
    });
  }

  if (detectedProblems.length === 0) {
    detectedProblems.push({
      id: 'prob-general',
      title: 'Minor Shift Load Variance',
      severity: 'medium',
      impact: 'Temporary queue increase within acceptable buffers.',
      zone: 'Zone A'
    });
  }

  // Generate AI Recommendations
  const recommendations: SimulationRecommendation[] = [
    {
      id: 'rec-1',
      title: 'Reallocate 3 Floor Workers to Packing Line',
      description: 'Move 2 workers from Low-Density Zone A and 1 runner from Buffer staging to Packing Benches 1 & 2.',
      recommendedAction: 'Reassign Alice Zhang & John Doe to Packing Line 2 immediately.',
      impactReduction: 'Reduces packing queue delay by 65 minutes (-42%).',
      confidence: 97,
      applied: appliedRecommendationIds.includes('rec-1')
    },
    {
      id: 'rec-2',
      title: 'Activate VIP Priority Fast-Track Wave',
      description: 'Prioritize VIP Express orders in picker picklists to clear tight 45-minute SLA deadlines first.',
      recommendedAction: 'Apply algorithmic priority wave #94 to bump 18 VIP orders to the top of queue.',
      impactReduction: 'Prevents 100% of VIP SLA breach penalties (Saves ₹48,000).',
      confidence: 96,
      applied: appliedRecommendationIds.includes('rec-2')
    },
    {
      id: 'rec-3',
      title: 'Trigger Backup Courier Sweep & Cross-Dock Staging',
      description: 'Request DHL on-demand express sweep for urgent packages and stage standard orders in Buffer Lane 3.',
      recommendedAction: 'Call DHL carrier dispatch integration to book an extra 4:00 PM trailer sweep.',
      impactReduction: 'Clears dispatch dock congestion and restores on-time cutoff to 98%.',
      confidence: 94,
      applied: appliedRecommendationIds.includes('rec-3')
    },
    {
      id: 'rec-4',
      title: 'Auto-Generate Expedited PO for Packaging Stock',
      description: 'Replenish 250 Box #4 cartons and allocate safety reserves from secondary aisle.',
      recommendedAction: 'Send automated PO #9048 to Apex Packaging with priority 2-hour courier drop.',
      impactReduction: 'Guarantees uninterrupted packaging throughput for shift 2.',
      confidence: 92,
      applied: appliedRecommendationIds.includes('rec-4')
    }
  ];

  // Calculate Optimized State based on applied recommendations
  const appliedCount = appliedRecommendationIds.length;
  const mitigationMultiplier = Math.min(0.92, appliedCount * 0.28); // Each applied rec mitigates ~28% of disruption

  const recoveredHealth = Math.min(96, Math.round(simulatedHealth + (95 - simulatedHealth) * mitigationMultiplier));
  const recoveredCompletion = Math.min(99, Math.round((simulatedCompletion + (98.6 - simulatedCompletion) * mitigationMultiplier) * 10) / 10);
  const recoveredSla = Math.min(99.4, Math.round((simulatedSla + (99.2 - simulatedSla) * mitigationMultiplier) * 10) / 10);
  const recoveredUtilization = Math.round(simulatedUtilization - (simulatedUtilization - 84) * (mitigationMultiplier * 0.7));
  const recoveredPickingTime = Math.max(14, Math.round(simulatedPickingTime - (simulatedPickingTime - 14) * mitigationMultiplier));
  const recoveredPackingTime = Math.max(10, Math.round(simulatedPackingTime - (simulatedPackingTime - 10) * mitigationMultiplier));
  const recoveredDispatchDelay = Math.max(24, Math.round(simulatedDispatchDelay - (simulatedDispatchDelay - 28) * mitigationMultiplier));
  const recoveredShortages = Math.max(1, Math.round(simulatedShortages - (simulatedShortages - 2) * mitigationMultiplier));
  const recoveredDelayedOrders = Math.max(1, Math.round(simulatedDelayedOrders - (simulatedDelayedOrders - 2) * mitigationMultiplier));
  const recoveredRevenueAtRisk = Math.round(simulatedRevenueAtRisk * (1 - mitigationMultiplier * 0.95));

  const optimizedMetrics: SimulationMetrics = {
    healthScore: recoveredHealth,
    orderCompletionRate: recoveredCompletion,
    slaCompliance: recoveredSla,
    workerUtilization: recoveredUtilization,
    avgPickingTimeMinutes: recoveredPickingTime,
    avgPackingTimeMinutes: recoveredPackingTime,
    avgDispatchDelayMinutes: recoveredDispatchDelay,
    inventoryShortagesCount: recoveredShortages,
    revenueAtRisk: recoveredRevenueAtRisk,
    ordersDelayedCount: recoveredDelayedOrders
  };

  // Zone Loads and Worker Allocations
  const zoneLoads = {
    zoneA: Math.min(100, Math.round(62 + (params.additionalOrders / 25) - (appliedRecommendationIds.includes('rec-1') ? 8 : 0))),
    zoneB: Math.min(100, Math.round(params.zoneCongestionPercent + (params.additionalOrders / 30))),
    zoneC: Math.min(100, Math.round(75 + (params.additionalOrders / 18) - (appliedRecommendationIds.includes('rec-1') ? 22 : 0))),
    qc: Math.min(100, Math.round(55 + params.qcDelayMinutes * 0.8)),
    staging: Math.min(100, Math.round(60 + (params.additionalOrders / 20) + (params.courierDelayMinutes * 0.6) - (appliedRecommendationIds.includes('rec-3') ? 25 : 0)))
  };

  const workerAllocations = {
    picking: 6 + params.activePickersDelta - (appliedRecommendationIds.includes('rec-1') ? 2 : 0),
    packing: 4 + params.activePackersDelta + (appliedRecommendationIds.includes('rec-1') ? 3 : 0),
    qc: 2,
    staging: 2 + (appliedRecommendationIds.includes('rec-3') ? 1 : 0)
  };

  const confidenceScore = Math.max(91, Math.min(99, 98 - (params.additionalOrders > 400 ? 2 : 0) - (params.stockoutSeverity === 'critical' ? 2 : 0)));

  return {
    beforeMetrics,
    simulatedMetrics,
    optimizedMetrics,
    confidenceScore,
    predictionSummary: `Under this scenario (${params.scenarioName}), ${
      simulatedHealth < 75
        ? "current staffing and station capacity will encounter severe SLA bottlenecks."
        : "moderate station latency will occur across packing and dispatch lanes."
    }`,
    businessImpactSummary: `Estimated ${simulatedDispatchDelay} min dispatch delay across ${simulatedDelayedOrders} orders with ₹${simulatedRevenueAtRisk.toLocaleString()} revenue / penalty exposure.`,
    expectedImprovementSummary: `Dispatch delay reduced from ${simulatedDispatchDelay} min to ${recoveredDispatchDelay} min (${Math.round(((simulatedDispatchDelay - recoveredDispatchDelay) / simulatedDispatchDelay) * 100)}% recovery) with SLA compliance restored to ${recoveredSla}%.`,
    detectedProblems,
    recommendations,
    zoneLoads,
    workerAllocations
  };
}
