export interface AIChartInsight {
  chartId: string;
  title: string;
  observation: string;
  reason: string;
  impact: string;
  recommendation: string;
  confidence: number;
}

export interface BottleneckAnomaly {
  id: string;
  type: 'process' | 'zone' | 'order' | 'worker' | 'inventory' | 'qc' | 'dispatch';
  title: string;
  severity: 'critical' | 'high' | 'medium';
  problem: string;
  rootCause: string;
  impact: string;
  suggestedFix: string;
  zone?: string;
  confidence: number;
}

export interface WorkerPerformance {
  id: string;
  name: string;
  role: 'Picker' | 'Packer' | 'QC Inspector' | 'Dock Stager';
  shift: 'Shift 1' | 'Shift 2' | 'Night Shift';
  status: 'Active' | 'Overloaded' | 'Idle' | 'On Break';
  utilizationRate: number; // %
  tasksCompleted: number;
  avgPickingTime: number; // mins
  avgPackingTime: number; // mins
  zone: string;
  rating: number;
}

export interface DecisionRecord {
  id: string;
  timestamp: string;
  title: string;
  category: 'Staff Allocation' | 'VIP Priority' | 'Inventory PO' | 'Carrier Sweep' | 'Quality Control';
  reason: string;
  confidence: number;
  status: 'Approved' | 'Rejected' | 'Pending' | 'Auto-Executed';
  approvedBy: string;
  operationalImpact: string;
  finalOutcome: string;
  appliedDelta: string;
}

export interface AuditTimelineEvent {
  id: string;
  timestamp: string;
  timeAgo: string;
  type: 'inventory' | 'worker' | 'packing' | 'qc' | 'dispatch' | 'decision' | 'simulation';
  title: string;
  description: string;
  user: string;
  status: 'success' | 'warning' | 'info';
  badge: string;
}

export const AI_CHART_INSIGHTS: Record<string, AIChartInsight> = {
  healthTrend: {
    chartId: 'healthTrend',
    title: 'Warehouse Health & Uptime Trend',
    observation: 'Facility health score maintained at 94.2 average over the last 7 days.',
    reason: 'Autonomous wave balancing reduced order stagnation by 32%.',
    impact: 'Zero SLA breaches reported across 4,200 total dispatches.',
    recommendation: 'Maintain automated wave scheduling threshold at 45-min intervals.',
    confidence: 96
  },
  fulfillmentRate: {
    chartId: 'fulfillmentRate',
    title: 'Order Fulfillment & Velocity Rate',
    observation: 'Fulfillment velocity peaked at 94 pkgs/hr during the 2:00 PM shift handoff.',
    reason: 'Zone A bulk picking waves cleared 18 minutes ahead of carrier arrival.',
    impact: 'Same-day dispatch rate increased from 96.2% to 99.4%.',
    recommendation: 'Pre-allocate packing cartons 30 minutes before the 3:00 PM trailer sweep.',
    confidence: 95
  },
  packingPerformance: {
    chartId: 'packingPerformance',
    title: 'Packing Station Throughput & Load',
    observation: 'Packing efficiency has decreased by 8% on Station 2 compared to yesterday.',
    reason: 'Station 2 is operating above 120% capacity with heavy-item SKU combinations.',
    impact: 'Average packing queue latency increased by 14 minutes.',
    recommendation: 'Move one available packer from Buffer Staging to Station 2.',
    confidence: 95
  },
  pickingPerformance: {
    chartId: 'pickingPerformance',
    title: 'Zone Picking Travel & Route Efficiency',
    observation: 'Picker travel distance dropped by 16.4% via TSP aisle routing.',
    reason: 'AI dynamic batch clustering grouped 42 orders into single contiguous aisle paths.',
    impact: 'Reduced picker fatigue and boosted picking rate to 28 picks/hr/worker.',
    recommendation: 'Extend dynamic clustering to high-density Zone B electronics bins.',
    confidence: 97
  },
  qcPassRate: {
    chartId: 'qcPassRate',
    title: 'Quality Check & Precision Verification',
    observation: 'Quality check first-pass yield is currently 99.6% across all optical scan desks.',
    reason: 'Dual-camera weight and dimension checksums caught 2 label misalignments before sealing.',
    impact: 'Prevented ₹36,000 in return shipping and customer return re-handling costs.',
    recommendation: 'Calibrate Optical Scanner #2 during the 6:00 PM shift transition.',
    confidence: 94
  },
  dispatchPerformance: {
    chartId: 'dispatchPerformance',
    title: 'Carrier Dock Staging & Trailer Sweeps',
    observation: 'Dock loading time averaged 14.1 minutes per trailer (Target: 18 min).',
    reason: 'Pallet staging in Lanes 1–3 was synchronized with carrier GPS arrivals.',
    impact: 'FedEx and Delhivery trailers departed precisely at scheduled cutoff times.',
    recommendation: 'Keep staging bay lane 4 reserved for emergency rush dispatches.',
    confidence: 93
  }
};

export const BOTTLENECK_ANOMALIES: BottleneckAnomaly[] = [
  {
    id: 'bot-1',
    type: 'process',
    title: 'Slowest Process: Packing Station #2 Overload',
    severity: 'critical',
    problem: 'Packing Station #2 operating at 124% designed capacity.',
    rootCause: 'Heavy batch orders containing multi-item electronic kits requiring custom foam packing.',
    impact: '14-minute dispatch delay accumulation across 18 pending orders.',
    suggestedFix: 'Move 1 available floor runner to Station #2 and activate dual-lane taping bench.',
    zone: 'Zone C (Packing)',
    confidence: 96
  },
  {
    id: 'bot-2',
    type: 'zone',
    title: 'Most Congested Zone: Zone B Electronics Aisles',
    severity: 'high',
    problem: 'Picker foot traffic density exceeding 88% in Aisles 2 & 4.',
    rootCause: 'Concurrent promotional wave picking for high-velocity ProBook and Audio SKUs.',
    impact: 'Pick cycle time increased from 11.4 min to 16.8 min per tote.',
    suggestedFix: 'Stagger picker wave release by 6 minutes and reverse Aisle 4 one-way travel loop.',
    zone: 'Zone B (Tech Shelves)',
    confidence: 94
  },
  {
    id: 'bot-3',
    type: 'order',
    title: 'Most Delayed Orders: VIP Express #ORD-89104',
    severity: 'critical',
    problem: 'Order #ORD-89104 has only 22 minutes remaining on 45-min SLA window.',
    rootCause: 'Held in staging queue due to oversized carton dimension verification.',
    impact: 'Risk of ₹48,000 penalty clause and VIP account satisfaction degradation.',
    suggestedFix: 'Expedite directly to Fast-Track QC Bay 1 with manual override seal.',
    zone: 'QC Bay 1',
    confidence: 98
  },
  {
    id: 'bot-4',
    type: 'worker',
    title: 'Worker Overload: Shift 1 Zone B Pickers',
    severity: 'high',
    problem: '3 pickers in Zone B operating at 98% sustained physical exertion.',
    rootCause: 'Unbalanced picklist distribution favoring tech category over apparel.',
    impact: 'Potential picking errors and 15% slowdown during final 2 hours of shift.',
    suggestedFix: 'Re-balance 25 picking tasks to Zone A cross-trained runners.',
    zone: 'Zone B',
    confidence: 92
  },
  {
    id: 'bot-5',
    type: 'inventory',
    title: 'Inventory Shortage: Box #4 Corrugated Cartons',
    severity: 'high',
    problem: 'Only 48 units of Medium Heavy-Duty Box #4 remaining in buffer stock.',
    rootCause: 'Unexpected surge in multi-item electronics orders.',
    impact: 'Packing station will run out of suitable cartons in 3.5 hours.',
    suggestedFix: 'Trigger auto-PO #9048 to Apex Packaging and transfer 80 units from Bay-02 reserve.',
    zone: 'Zone C Supply',
    confidence: 97
  },
  {
    id: 'bot-6',
    type: 'qc',
    title: 'Repeated QC Incidents: Optical Scanner #1 Misalignment',
    severity: 'medium',
    problem: '0.4% false-positive bar code scan reject rate at QC Station 1.',
    rootCause: 'Dust accumulation on optical prism lens during morning conveyor run.',
    impact: 'Requires manual handheld re-scan adding 45 seconds per flagged package.',
    suggestedFix: 'Execute automated 2-minute lens air-purge calibration sequence.',
    zone: 'QC Station 1',
    confidence: 91
  },
  {
    id: 'bot-7',
    type: 'dispatch',
    title: 'Dispatch Bottleneck: Bay 4 Trailer Sweep Latency',
    severity: 'medium',
    problem: 'Outbound Bay 4 staging dock 82% occupied awaiting secondary carrier.',
    rootCause: 'FedEx regional hub weather delay shifted arrival window by 25 minutes.',
    impact: 'Staging congestion restricting fork truck pallet maneuvering.',
    suggestedFix: 'Stage standard parcels in Overflow Buffer Lane 3 to keep main dock aisle clear.',
    zone: 'Dock Bay 4',
    confidence: 93
  }
];

const rawWorkers: WorkerPerformance[] = [
  { id: 'w-1', name: 'Alice Zhang', role: 'Picker', shift: 'Shift 1', status: 'Active', utilizationRate: 88, tasksCompleted: 142, avgPickingTime: 10.8, avgPackingTime: 0, zone: 'Zone A (Bulk Storage)', rating: 4.9 },
  { id: 'w-2', name: 'Carlos Mendez', role: 'Picker', shift: 'Shift 1', status: 'Overloaded', utilizationRate: 98, tasksCompleted: 168, avgPickingTime: 11.2, avgPackingTime: 0, zone: 'Zone B (Tech Shelves)', rating: 4.8 },
  { id: 'w-3', name: 'David Kumar', role: 'Packer', shift: 'Shift 1', status: 'Overloaded', utilizationRate: 96, tasksCompleted: 154, avgPickingTime: 0, avgPackingTime: 6.8, zone: 'Zone C (Packing Bench 2)', rating: 4.9 },
  { id: 'w-4', name: 'Elena Rostova', role: 'Packer', shift: 'Shift 1', status: 'Active', utilizationRate: 84, tasksCompleted: 138, avgPickingTime: 0, avgPackingTime: 7.4, zone: 'Zone C (Packing Bench 1)', rating: 4.7 },
  { id: 'w-5', name: 'Farhan Ali', role: 'QC Inspector', shift: 'Shift 1', status: 'Active', utilizationRate: 82, tasksCompleted: 210, avgPickingTime: 0, avgPackingTime: 0, zone: 'QC Optical Bay 1', rating: 5.0 },
  { id: 'w-6', name: 'Grace Hopper', role: 'Dock Stager', shift: 'Shift 1', status: 'Active', utilizationRate: 79, tasksCompleted: 88, avgPickingTime: 0, avgPackingTime: 0, zone: 'Bay 1–4 Docks', rating: 4.9 },
  { id: 'w-7', name: 'Hassan Malik', role: 'Picker', shift: 'Shift 1', status: 'Active', utilizationRate: 86, tasksCompleted: 135, avgPickingTime: 11.6, avgPackingTime: 0, zone: 'Zone B (Tech Shelves)', rating: 4.7 },
  { id: 'w-8', name: 'Isabella Silva', role: 'Packer', shift: 'Shift 1', status: 'Idle', utilizationRate: 64, tasksCompleted: 98, avgPickingTime: 0, avgPackingTime: 8.1, zone: 'Zone C (Bench 3)', rating: 4.6 },
  { id: 'w-9', name: 'James Wilson', role: 'Picker', shift: 'Shift 2', status: 'Active', utilizationRate: 85, tasksCompleted: 120, avgPickingTime: 11.1, avgPackingTime: 0, zone: 'Zone A (Bulk Storage)', rating: 4.8 },
  { id: 'w-10', name: 'Kavita Patel', role: 'Packer', shift: 'Shift 2', status: 'Active', utilizationRate: 82, tasksCompleted: 112, avgPickingTime: 0, avgPackingTime: 7.2, zone: 'Zone C (Packing Bench 4)', rating: 4.9 },
  { id: 'w-11', name: 'Liam O’Connor', role: 'QC Inspector', shift: 'Shift 2', status: 'Active', utilizationRate: 80, tasksCompleted: 180, avgPickingTime: 0, avgPackingTime: 0, zone: 'QC Optical Bay 2', rating: 4.8 },
  { id: 'w-12', name: 'Mei Lin', role: 'Dock Stager', shift: 'Shift 2', status: 'Idle', utilizationRate: 58, tasksCompleted: 64, avgPickingTime: 0, avgPackingTime: 0, zone: 'Bay 3 Dock', rating: 4.7 },
  { id: 'w-13', name: 'Nikhil Sharma', role: 'Picker', shift: 'Shift 1', status: 'On Break', utilizationRate: 74, tasksCompleted: 104, avgPickingTime: 12.0, avgPackingTime: 0, zone: 'Zone D (Cold Chain)', rating: 4.6 },
  { id: 'w-14', name: 'Olivia Brown', role: 'Packer', shift: 'Shift 2', status: 'Active', utilizationRate: 87, tasksCompleted: 126, avgPickingTime: 0, avgPackingTime: 7.0, zone: 'Zone C (Packing)', rating: 4.9 },
  { id: 'w-15', name: 'Priya Verma', role: 'Picker', shift: 'Shift 2', status: 'Active', utilizationRate: 89, tasksCompleted: 140, avgPickingTime: 10.9, avgPackingTime: 0, zone: 'Zone F (High-Bay)', rating: 4.9 },
  { id: 'w-16', name: 'Quentin Miller', role: 'Dock Stager', shift: 'Shift 1', status: 'Active', utilizationRate: 83, tasksCompleted: 94, avgPickingTime: 0, avgPackingTime: 0, zone: 'Bay 2 Dock', rating: 4.8 },
  { id: 'w-17', name: 'Ravi Teja', role: 'Picker', shift: 'Shift 2', status: 'Active', utilizationRate: 86, tasksCompleted: 130, avgPickingTime: 11.4, avgPackingTime: 0, zone: 'Zone A (Bulk Storage)', rating: 4.7 },
  { id: 'w-18', name: 'Sofia Rodriguez', role: 'Packer', shift: 'Shift 2', status: 'Active', utilizationRate: 81, tasksCompleted: 115, avgPickingTime: 0, avgPackingTime: 7.5, zone: 'Zone C (Bench 1)', rating: 4.8 },
  { id: 'w-19', name: 'Tariq Johnson', role: 'QC Inspector', shift: 'Night Shift', status: 'Active', utilizationRate: 78, tasksCompleted: 165, avgPickingTime: 0, avgPackingTime: 0, zone: 'QC Optical Bay 1', rating: 4.9 },
  { id: 'w-20', name: 'Uma Krishnan', role: 'Picker', shift: 'Night Shift', status: 'Active', utilizationRate: 82, tasksCompleted: 128, avgPickingTime: 11.0, avgPackingTime: 0, zone: 'Zone B (Tech Shelves)', rating: 4.8 },
  { id: 'w-21', name: 'Victor Vance', role: 'Packer', shift: 'Night Shift', status: 'Active', utilizationRate: 79, tasksCompleted: 108, avgPickingTime: 0, avgPackingTime: 7.3, zone: 'Zone C (Bench 2)', rating: 4.7 },
  { id: 'w-22', name: 'Wanda Maxim', role: 'Dock Stager', shift: 'Night Shift', status: 'Active', utilizationRate: 75, tasksCompleted: 78, avgPickingTime: 0, avgPackingTime: 0, zone: 'Bay 4 Dock', rating: 4.9 },
  { id: 'w-23', name: 'Xavier Cole', role: 'Picker', shift: 'Shift 1', status: 'Active', utilizationRate: 88, tasksCompleted: 138, avgPickingTime: 10.7, avgPackingTime: 0, zone: 'Zone E (Hazardous)', rating: 4.9 },
  { id: 'w-24', name: 'Yasmin Ward', role: 'Packer', shift: 'Shift 1', status: 'Active', utilizationRate: 85, tasksCompleted: 122, avgPickingTime: 0, avgPackingTime: 7.1, zone: 'Zone C (Bench 3)', rating: 4.8 },
  { id: 'w-25', name: 'Zackary Thorne', role: 'QC Inspector', shift: 'Shift 1', status: 'Active', utilizationRate: 84, tasksCompleted: 195, avgPickingTime: 0, avgPackingTime: 0, zone: 'QC Bay 3', rating: 4.9 },
  { id: 'w-26', name: 'Aarav Gupta', role: 'Picker', shift: 'Shift 2', status: 'Active', utilizationRate: 87, tasksCompleted: 132, avgPickingTime: 11.3, avgPackingTime: 0, zone: 'Zone G (Returns)', rating: 4.8 },
  { id: 'w-27', name: 'Bella Swan', role: 'Packer', shift: 'Shift 2', status: 'Active', utilizationRate: 80, tasksCompleted: 110, avgPickingTime: 0, avgPackingTime: 7.6, zone: 'Zone C (Bench 4)', rating: 4.7 },
  { id: 'w-28', name: 'Chen Wei', role: 'Dock Stager', shift: 'Shift 1', status: 'Active', utilizationRate: 82, tasksCompleted: 86, avgPickingTime: 0, avgPackingTime: 0, zone: 'Bay 1 Dock', rating: 4.9 }
];

export const WORKER_PERFORMANCE_DATA: WorkerPerformance[] = rawWorkers;

// Procedurally generate 105+ high-quality audited decision history records
const rawDecisionsBase: DecisionRecord[] = [
  {
    id: 'dec-1',
    timestamp: 'Today at 11:15 AM',
    title: 'Prioritize VIP Express Order #ORD-89104',
    category: 'VIP Priority',
    reason: '22 minutes remaining before carrier cutoff SLA breach.',
    confidence: 97,
    status: 'Approved',
    approvedBy: 'Lead Ops Manager',
    operationalImpact: 'Bypassed standard queue to dedicated priority packing line.',
    finalOutcome: 'Delivered to FedEx dock 12 mins before deadline. ₹48,000 SLA penalty avoided.',
    appliedDelta: '+18 min clearance velocity'
  },
  {
    id: 'dec-2',
    timestamp: 'Today at 10:30 AM',
    title: 'Packing Station 2 Staff Re-allocation',
    category: 'Staff Allocation',
    reason: 'Station 2 operating at 120% capacity creating conveyor bottleneck.',
    confidence: 95,
    status: 'Approved',
    approvedBy: 'Floor Supervisor',
    operationalImpact: 'Transferred 1 runner from Buffer Staging to Station 2.',
    finalOutcome: 'Packing queue reduced by 42%. Station throughput restored to 110 pkgs/hr.',
    appliedDelta: '+45 pkgs/hr throughput'
  },
  {
    id: 'dec-3',
    timestamp: 'Today at 09:12 AM',
    title: 'Auto-Generate PO #9042 for ProBook 15"',
    category: 'Inventory PO',
    reason: 'Stock trending high; predicted stockout in 14 hours.',
    confidence: 94,
    status: 'Approved',
    approvedBy: 'Muthu Auto-Pilot',
    operationalImpact: 'Created purchase order for 150 replenishment units.',
    finalOutcome: 'Vendor confirmed dispatch; 14-day stock buffer guaranteed.',
    appliedDelta: 'Stockout risk 0%'
  },
  {
    id: 'dec-4',
    timestamp: 'Yesterday at 4:45 PM',
    title: 'Shift 2 Pick Wave Staggering',
    category: 'Staff Allocation',
    reason: 'Zone B high density congestion causing 15% travel slowdown.',
    confidence: 93,
    status: 'Approved',
    approvedBy: 'Lead Ops Manager',
    operationalImpact: 'Applied 6-minute wave release delay between pick groups.',
    finalOutcome: 'Aisle traffic dropped by 28%. Picker speed normalized.',
    appliedDelta: '-14% picker transit time'
  },
  {
    id: 'dec-5',
    timestamp: 'Yesterday at 2:20 PM',
    title: 'DHL On-Demand Extra Carrier Sweep',
    category: 'Carrier Sweep',
    reason: 'Staging queue exceeded 85% dock floor saturation.',
    confidence: 96,
    status: 'Approved',
    approvedBy: 'Dispatch Lead',
    operationalImpact: 'Called backup DHL 18-wheeler trailer sweep.',
    finalOutcome: 'Cleared 320 pending packages. 100% on-time daily dispatch achieved.',
    appliedDelta: 'Dock congestion cleared'
  },
  {
    id: 'dec-6',
    timestamp: 'Yesterday at 11:00 AM',
    title: 'Temporary Hold on Non-Urgent B2B Pallets',
    category: 'Staff Allocation',
    reason: 'Surge in 1-day consumer express shipments.',
    confidence: 89,
    status: 'Rejected',
    approvedBy: 'Ops Director',
    operationalImpact: 'Rejected to maintain contractual B2B SLA guarantees.',
    finalOutcome: 'Overtime authorized for 2 packers to absorb surge.',
    appliedDelta: 'Overtime absorbed'
  }
];

const decisionTitles = [
  { title: 'Dynamic Pick Wave Re-Clustering', cat: 'Staff Allocation' as const, reason: 'High congestion in Aisle 3; grouped 35 tote orders by bin coordinates.' },
  { title: 'Automated Restock PO for Carton Type 4', cat: 'Inventory PO' as const, reason: 'Packaging inventory dropped beneath 2-day safety threshold.' },
  { title: 'Expedite Medical Cold-Chain Package #ORD-89115', cat: 'VIP Priority' as const, reason: 'Temperature-sensitive payload near 30-minute dock staging cutoff.' },
  { title: 'Optical Scan Prism Recalibration Trigger', cat: 'Quality Control' as const, reason: 'False-reject anomaly triggered automatic lens air-purge.' },
  { title: 'BlueDart Dedicated Air Sweep Booking', cat: 'Carrier Sweep' as const, reason: 'Overflow in Outbound Staging Lane 2 after flash sale volume.' },
  { title: 'Cross-Dock Transit Route Reassignment', cat: 'Staff Allocation' as const, reason: 'Shifted pallet intake directly to staging buffer without put-away delay.' },
  { title: 'Quarantine Lot #Q-4098 Dimension Flag', cat: 'Quality Control' as const, reason: 'Automated 3D scanner detected 2cm box deformation.' },
  { title: 'Bulk Order Staging Priority Optimization', cat: 'VIP Priority' as const, reason: 'Enterprise contract milestone delivery guarantee.' }
];

const authorities = ['Lead Ops Manager', 'Muthu Auto-Pilot', 'Floor Supervisor', 'Dispatch Lead', 'Quality Lead', 'VP of Logistics'];

export const DECISION_HISTORY_DATA: DecisionRecord[] = Array.from({ length: 108 }, (_, idx) => {
  if (idx < rawDecisionsBase.length) {
    return rawDecisionsBase[idx];
  }
  const tmpl = decisionTitles[idx % decisionTitles.length];
  const daysAgo = Math.floor(idx / 10) + 1;
  const hours = (idx * 3) % 12 + 1;
  const minutes = (idx * 17) % 60;
  const ampm = idx % 2 === 0 ? 'AM' : 'PM';
  const timestamp = daysAgo === 1 ? `Yesterday at ${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}` : `${daysAgo} days ago at ${hours}:${minutes < 10 ? '0' + minutes : minutes} ${ampm}`;
  const conf = 91 + (idx % 8);
  const status: 'Approved' | 'Rejected' | 'Pending' | 'Auto-Executed' =
    idx % 12 === 0 ? 'Rejected' : idx % 7 === 0 ? 'Auto-Executed' : idx % 19 === 0 ? 'Pending' : 'Approved';

  return {
    id: `dec-${idx + 1}`,
    timestamp,
    title: `${tmpl.title} #${1000 + idx}`,
    category: tmpl.cat,
    reason: tmpl.reason,
    confidence: conf,
    status,
    approvedBy: authorities[idx % authorities.length],
    operationalImpact: `Autonomous algorithm executed rule-set ${idx % 5 + 1} across target zones.`,
    finalOutcome: `Target KPI met with ${98 + (idx % 2)}% SLA compliance rate maintained.`,
    appliedDelta: `+${12 + (idx % 25)}% performance delta`
  };
});

export const WAREHOUSE_ZONES_DATA = [
  { id: 'zone-a', name: 'Zone A: Bulk Pallet Storage', capacity: '88%', status: 'Normal', activeStaff: 5, aisleCount: 12 },
  { id: 'zone-b', name: 'Zone B: High-Density Tech Shelves', capacity: '94%', status: 'Congested', activeStaff: 6, aisleCount: 16 },
  { id: 'zone-c', name: 'Zone C: Packaging & Sealing Hub', capacity: '91%', status: 'High Throughput', activeStaff: 7, aisleCount: 8 },
  { id: 'zone-d', name: 'Zone D: Temperature-Controlled Cold Chain', capacity: '72%', status: 'Optimal', activeStaff: 2, aisleCount: 6 },
  { id: 'zone-e', name: 'Zone E: Hazardous & Flammables Vault', capacity: '64%', status: 'Secure', activeStaff: 2, aisleCount: 4 },
  { id: 'zone-f', name: 'Zone F: Automated High-Bay Racking', capacity: '86%', status: 'Automated Flow', activeStaff: 2, aisleCount: 10 },
  { id: 'zone-g', name: 'Zone G: Returns & QC Quarantine', capacity: '52%', status: 'Normal', activeStaff: 2, aisleCount: 4 },
  { id: 'zone-h', name: 'Zone H: Outbound Staging & Docks 1–8', capacity: '84%', status: 'Active Loading', activeStaff: 4, aisleCount: 8 }
];

export const SUPPLIERS_DATA = [
  { id: 'sup-1', name: 'Apex Packaging Solutions', category: 'Packaging', leadTime: '2 Days', rating: 4.9, onTimeRate: '99.2%' },
  { id: 'sup-2', name: 'Silicon Core Technologies', category: 'Electronics', leadTime: '4 Days', rating: 4.8, onTimeRate: '98.5%' },
  { id: 'sup-3', name: 'Titan Fasteners & Hardware', category: 'Hardware', leadTime: '3 Days', rating: 4.7, onTimeRate: '97.8%' },
  { id: 'sup-4', name: 'CryoSafe Cold-Chain Labs', category: 'Pharma / Cold', leadTime: '1 Day', rating: 5.0, onTimeRate: '100%' },
  { id: 'sup-5', name: 'PolyWrap Global Supplies', category: 'Packaging', leadTime: '2 Days', rating: 4.8, onTimeRate: '98.9%' },
  { id: 'sup-6', name: 'OpticScan Precision Sensor Co', category: 'Equipment', leadTime: '5 Days', rating: 4.9, onTimeRate: '99.0%' },
  { id: 'sup-7', name: 'Delta Dynamics Conveyors', category: 'Maintenance', leadTime: '1 Day', rating: 4.9, onTimeRate: '99.4%' },
  { id: 'sup-8', name: 'AeroFreight Logistics Supply', category: 'Aviation Hardware', leadTime: '3 Days', rating: 4.8, onTimeRate: '98.1%' },
  { id: 'sup-9', name: 'EcoKraft Corrugated Mills', category: 'Packaging', leadTime: '2 Days', rating: 4.7, onTimeRate: '97.5%' },
  { id: 'sup-10', name: 'HyperVolt Lithium Storage', category: 'Batteries', leadTime: '4 Days', rating: 4.9, onTimeRate: '99.1%' },
  { id: 'sup-11', name: 'Nexus Ribbon & Label Co', category: 'Supplies', leadTime: '1 Day', rating: 4.8, onTimeRate: '98.7%' },
  { id: 'sup-12', name: 'Vector Clean Chemicals', category: 'Maintenance', leadTime: '3 Days', rating: 4.8, onTimeRate: '98.0%' },
  { id: 'sup-13', name: 'Vanguard Steel Racks', category: 'Fixtures', leadTime: '6 Days', rating: 4.6, onTimeRate: '96.8%' },
  { id: 'sup-14', name: 'OmniLabel Barcode Inks', category: 'Supplies', leadTime: '1 Day', rating: 4.9, onTimeRate: '99.6%' },
  { id: 'sup-15', name: 'ThermaShield Cold Insulation', category: 'Pharma / Cold', leadTime: '2 Days', rating: 4.9, onTimeRate: '99.3%' },
  { id: 'sup-16', name: 'Zenith Robotic Spares', category: 'Automation', leadTime: '3 Days', rating: 4.9, onTimeRate: '99.2%' }
];

export const DISPATCH_FLEET_DATA = [
  { id: 'vh-1', carrier: 'FedEx Express', vehicle: '18-Wheeler Trailer #902', destination: 'Memphis Hub', parcels: 240, status: 'Departed', bay: 'Bay 1' },
  { id: 'vh-2', carrier: 'Delhivery Surface', vehicle: 'Heavy Truck #DL-402', destination: 'North Distribution Hub', parcels: 180, status: 'Loading', bay: 'Bay 2' },
  { id: 'vh-3', carrier: 'BlueDart Air', vehicle: 'Air Cargo Feeder #BD-88', destination: 'Airport Terminal 3', parcels: 42, status: 'Ready for Dispatch', bay: 'Bay 3' },
  { id: 'vh-4', carrier: 'DHL Express', vehicle: 'Sprinter Van #DH-12', destination: 'Metro Express Route', parcels: 34, status: 'Loading', bay: 'Bay 4' },
  { id: 'vh-5', carrier: 'UPS Ground', vehicle: 'Package Car #UP-55', destination: 'Regional Sector 4', parcels: 96, status: 'Staged', bay: 'Bay 5' },
  { id: 'vh-6', carrier: 'Shadowfax Quick', vehicle: 'Electric Van #SF-09', destination: 'City Center 2-Hr', parcels: 28, status: 'Active Loading', bay: 'Bay 6' },
  { id: 'vh-7', carrier: 'Gati KWE Heavy', vehicle: 'Freight Container #GK-71', destination: 'Interstate Hub', parcels: 310, status: 'Scheduled', bay: 'Bay 7' },
  { id: 'vh-8', carrier: 'Amazon Freight', vehicle: 'Linehaul Semi #AF-104', destination: 'Sortation Center #3', parcels: 220, status: 'Inbound Dock', bay: 'Bay 8' },
  { id: 'vh-9', carrier: 'Ecom Express', vehicle: 'Delivery Van #EE-33', destination: 'South Suburbs', parcels: 52, status: 'Staged', bay: 'Bay 2 Buffer' },
  { id: 'vh-10', carrier: 'DTDC Priority', vehicle: 'Courier Van #DT-19', destination: 'Commercial Tech Park', parcels: 45, status: 'Departed', bay: 'Bay 1 Buffer' },
  { id: 'vh-11', carrier: 'SafeXpress Cargo', vehicle: '32-Ft High-Cube #SX-88', destination: 'Central Depot', parcels: 280, status: 'Loading', bay: 'Bay 7' },
  { id: 'vh-12', carrier: 'Zomato Blink Feeder', vehicle: 'Rapid Transit EV #ZB-04', destination: 'Hyper-Local Hub', parcels: 18, status: 'Departed', bay: 'Express Bay' }
];

export const AUDIT_TIMELINE_EVENTS: AuditTimelineEvent[] = [
  {
    id: 'aud-1',
    timestamp: '11:32 AM',
    timeAgo: '4 mins ago',
    type: 'dispatch',
    title: 'Dispatch Completed • Trailer #902 Sealed',
    description: 'FedEx Express trailer loaded with 240 parcels departed Bay 2 on schedule.',
    user: 'Grace Hopper (Dock Stager)',
    status: 'success',
    badge: 'Carrier Departure'
  },
  {
    id: 'aud-2',
    timestamp: '11:24 AM',
    timeAgo: '12 mins ago',
    type: 'decision',
    title: 'MUTHU Recommendation Approved • VIP #ORD-89104',
    description: 'Lead Ops Manager approved fast-track packaging bypass for VIP order #104.',
    user: 'Muthu Decision Engine',
    status: 'info',
    badge: 'Decision Applied'
  },
  {
    id: 'aud-3',
    timestamp: '11:18 AM',
    timeAgo: '18 mins ago',
    type: 'qc',
    title: 'QC Optical Verification Passed • 42 Items',
    description: 'Optical scanner verified bar codes, weights, and seal integrity with 100% match.',
    user: 'Farhan Ali (QC Inspector)',
    status: 'success',
    badge: 'QC Passed'
  },
  {
    id: 'aud-4',
    timestamp: '11:05 AM',
    timeAgo: '31 mins ago',
    type: 'packing',
    title: 'Packing Started • Station 2 Dual-Lane',
    description: 'Station 2 began processing batch wave #14 with reinforced double-tape cartons.',
    user: 'David Kumar (Packer)',
    status: 'info',
    badge: 'Packaging'
  },
  {
    id: 'aud-5',
    timestamp: '10:52 AM',
    timeAgo: '44 mins ago',
    type: 'worker',
    title: 'Worker Reassigned • Shift 1 Optimization',
    description: 'Alice Zhang reassigned from Zone A to Packing Bench 2 to eliminate bottleneck.',
    user: 'Floor Supervisor',
    status: 'info',
    badge: 'Staff Move'
  },
  {
    id: 'aud-6',
    timestamp: '10:42 AM',
    timeAgo: '54 mins ago',
    type: 'simulation',
    title: 'Digital Twin Simulation Executed',
    description: 'Simulated 500 New Orders Rush Wave; generated 4 AI recommendations.',
    user: 'Lead Ops Manager',
    status: 'info',
    badge: 'Twin Sim'
  },
  {
    id: 'aud-7',
    timestamp: '10:15 AM',
    timeAgo: '1h 21m ago',
    type: 'inventory',
    title: 'Inventory Reserved • 150 Units PRD-001',
    description: 'Stock allocated from Aisle 4 Bin B-12 for corporate batch order.',
    user: 'Warehouse Automation Core',
    status: 'success',
    badge: 'Stock Locked'
  }
];
