export type CalendarEventType =
  | 'Dispatch'
  | 'Delivery'
  | 'Worker Shift'
  | 'Maintenance'
  | 'Audit'
  | 'Supplier'
  | 'Reports'
  | 'Critical'
  | 'Recommendation';

export interface CalendarEvent {
  id: string;
  title: string;
  type: CalendarEventType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'At Risk' | 'Pending Approval';
  locationZone: string;
  assignedPersonnel: string;
  description: string;
  businessImpact: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
  };
  icon: string;
  isHighPriority?: boolean;
}

export interface MuthuCalendarInsight {
  id: string;
  title: string;
  targetDate: string;
  observation: string;
  rootCause: string;
  riskAssessment: string;
  recommendedAction: string;
  confidenceScore: number;
  expectedResult: string;
  actionType: 'reallocate_worker' | 'reschedule_maintenance' | 'expedite_supplier' | 'deploy_backup';
}

export const INITIAL_CALENDAR_INSIGHTS: MuthuCalendarInsight[] = [
  {
    id: 'mci-101',
    title: 'Peak Dispatch Surge vs Packing Bench Capacity',
    targetDate: '2026-02-19',
    observation: 'Tomorrow has 42 scheduled wholesale and consumer dispatches between 14:00 and 18:00.',
    rootCause: 'Packing Station 2 currently scheduled with only 2 packers (Asha Reddy & Ananya Patel).',
    riskAssessment: 'High probability of 35-minute carrier dispatch delays affecting 14 express consignments.',
    recommendedAction: 'Assign Meena Iyer’s auxiliary packing team (2 associates) to Packing Bench 2 from 13:30.',
    confidenceScore: 96,
    expectedResult: 'Eliminate packing bottleneck; maintain 100% on-time truck departures.',
    actionType: 'reallocate_worker'
  },
  {
    id: 'mci-102',
    title: 'Machinery Maintenance Overlap with Dock Loading Peak',
    targetDate: '2026-02-20',
    observation: 'Electric Forklift FL-07 hydraulic servicing is scheduled for 15:00, overlapping with outbound Vijayawada freight staging.',
    rootCause: 'Dock Bay 04 operates at maximum pallet throughput between 14:30 and 17:00.',
    riskAssessment: 'Dock congestion risk and potential detention fees from BlueDart Linehaul trucks.',
    recommendedAction: 'Reschedule FL-07 maintenance to Night Shift (22:00) and deploy Standby Forklift FL-03 to Bay 04.',
    confidenceScore: 94,
    expectedResult: 'Preserve full dock loading throughput with zero staging downtime.',
    actionType: 'reschedule_maintenance'
  },
  {
    id: 'mci-103',
    title: 'Inbound Supplier Delivery Congestion at North Ramp',
    targetDate: '2026-02-21',
    observation: '3 heavy raw material suppliers (Tata Corrugated, Apex Polymers, Nilkamal) arriving within a 30-minute window (10:00–10:30).',
    rootCause: 'Uncoordinated supplier dispatch windows at Inbound Unloading Bay A.',
    riskAssessment: 'Yard truck queues backing up into access road; potential 45-min receiving backlog.',
    recommendedAction: 'Stagger Tata Corrugated to Inbound Ramp B and summon 2 additional dock loaders for priority de-stuffing.',
    confidenceScore: 91,
    expectedResult: 'Clear yard traffic in 20 minutes; avoid demurrage and dock gridlock.',
    actionType: 'expedite_supplier'
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  // Today & Tomorrow (Feb 18-19, 2026)
  {
    id: 'ev-1',
    title: 'Express Outbound Dispatch #EXP-401 (BlueDart Express)',
    type: 'Dispatch',
    date: '2026-02-18',
    time: '14:30',
    duration: '1 hr',
    status: 'In Progress',
    locationZone: 'Outbound Bay 02',
    assignedPersonnel: 'Priya Sharma (Dispatcher)',
    description: '18 high-priority consumer parcels and hospital medical supplies manifest.',
    businessImpact: '₹4.2L order consignment under active 45-min SLA guarantee.',
    badgeColor: { bg: 'bg-blue-100', text: 'text-blue-900', border: 'border-blue-300' },
    icon: 'local_shipping',
    isHighPriority: true
  },
  {
    id: 'ev-2',
    title: 'Forklift FL-07 250-Hour Hydraulic Servicing',
    type: 'Maintenance',
    date: '2026-02-18',
    time: '16:00',
    duration: '2 hrs',
    status: 'Scheduled',
    locationZone: 'Maintenance Workshop Bay 01',
    assignedPersonnel: 'Kiran Naik (Technician)',
    description: 'Preventive hydraulic fluid flush and brake inspection. Standby Forklift FL-03 on standby.',
    businessImpact: 'Zero operational downtime via standby machine substitution.',
    badgeColor: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
    icon: 'build'
  },
  {
    id: 'ev-3',
    title: 'Hospital ICU Consignment Direct Delivery (Care Hospitals)',
    type: 'Delivery',
    date: '2026-02-18',
    time: '17:15',
    duration: '45 mins',
    status: 'Scheduled',
    locationZone: 'Banjara Hills Care Hospital Hub',
    assignedPersonnel: 'Rajesh Varma (Driver)',
    description: 'Sterile surgical packs and cold-chain diagnostics transport with temperature telemetry.',
    businessImpact: '₹6.8L emergency medical supply contract.',
    badgeColor: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
    icon: 'inventory_2',
    isHighPriority: true
  },
  {
    id: 'ev-4',
    title: 'Morning Shift Operations & Daily Floor Briefing',
    type: 'Worker Shift',
    date: '2026-02-19',
    time: '06:00',
    duration: '8 hrs',
    status: 'Scheduled',
    locationZone: 'All Warehouse Zones (A, B, C, D)',
    assignedPersonnel: 'Meena Iyer (Shift Supervisor) + 14 Staff',
    description: 'Shift 1 staffing: 6 pickers, 4 packers, 2 QC inspectors, 2 forklift operators.',
    businessImpact: 'Core day throughput capacity targeting 1,200 picks/hour.',
    badgeColor: { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300' },
    icon: 'group'
  },
  {
    id: 'ev-5',
    title: 'Tata Corrugated Packaging Inbound PO #PO-9844',
    type: 'Supplier',
    date: '2026-02-19',
    time: '10:00',
    duration: '1.5 hrs',
    status: 'Scheduled',
    locationZone: 'Inbound Receiving Dock A',
    assignedPersonnel: 'Suresh Babu (Loader)',
    description: '3,000 Heavy Duty Corrugated Boxes (BX-HD01 & BX-MED02) replenishment delivery.',
    businessImpact: 'Prevents packing bench box stockout during weekend surge.',
    badgeColor: { bg: 'bg-teal-100', text: 'text-teal-900', border: 'border-teal-300' },
    icon: 'factory'
  },
  {
    id: 'ev-6',
    title: 'Wholesale B2B Wave 24 Dispatch (Vijayawada Freight Hub)',
    type: 'Dispatch',
    date: '2026-02-19',
    time: '15:00',
    duration: '2.5 hrs',
    status: 'At Risk',
    locationZone: 'Dock Bay 04 & 05',
    assignedPersonnel: 'Priya Sharma & Harish Venkat',
    description: '42 palletized orders for South Regional distribution centers.',
    businessImpact: '₹18.4L wholesale revenue consignment at risk of dock staging delay.',
    badgeColor: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
    icon: 'warning',
    isHighPriority: true
  },
  {
    id: 'ev-7',
    title: 'ISO 9001 Quality Inspection & Cold-Chain Calibration Audit',
    type: 'Audit',
    date: '2026-02-20',
    time: '11:00',
    duration: '3 hrs',
    status: 'Scheduled',
    locationZone: 'Zone B & Cold Storage Vault',
    assignedPersonnel: 'Vikram Singh (Senior QC)',
    description: 'Quarterly sensor calibration and temperature log verification audit.',
    businessImpact: 'Maintains pharma and sterile supply regulatory compliance.',
    badgeColor: { bg: 'bg-indigo-100', text: 'text-indigo-900', border: 'border-indigo-300' },
    icon: 'assignment'
  },
  {
    id: 'ev-8',
    title: 'Automatic Box Sealing Machine PM-02 Belt Servicing',
    type: 'Maintenance',
    date: '2026-02-20',
    time: '18:00',
    duration: '1.5 hrs',
    status: 'Scheduled',
    locationZone: 'Packing Station 2',
    assignedPersonnel: 'Sandeep Mukherjee (Tech)',
    description: 'Drive belt replacement and optical sensor realignments.',
    businessImpact: 'Prevents line stoppage at primary packaging bench.',
    badgeColor: { bg: 'bg-amber-100', text: 'text-amber-900', border: 'border-amber-300' },
    icon: 'precision_manufacturing'
  },
  {
    id: 'ev-9',
    title: 'Afternoon Surge Shift (Flash Sale Wave)',
    type: 'Worker Shift',
    date: '2026-02-21',
    time: '14:00',
    duration: '8 hrs',
    status: 'Scheduled',
    locationZone: 'Mezzanine & Packing Station 1',
    assignedPersonnel: 'Karthik Swaminathan + 16 Staff',
    description: 'Reinforced afternoon team handling flash sale consumer parcels.',
    businessImpact: 'Ensures same-day cutoff compliance for 850 orders.',
    badgeColor: { bg: 'bg-purple-100', text: 'text-purple-900', border: 'border-purple-300' },
    icon: 'badge'
  },
  {
    id: 'ev-10',
    title: 'Mid-Month Executive Operations Review & Profitability Audit',
    type: 'Reports',
    date: '2026-02-22',
    time: '16:00',
    duration: '1 hr',
    status: 'Scheduled',
    locationZone: 'Executive Briefing Room / Virtual',
    assignedPersonnel: 'Facility Leadership Team',
    description: 'Review of February throughput, worker revenue support, and machinery uptime ledger.',
    businessImpact: 'Strategic alignment on Q1 operational budget and bonus approvals.',
    badgeColor: { bg: 'bg-emerald-100', text: 'text-emerald-900', border: 'border-emerald-300' },
    icon: 'monitoring'
  },
  {
    id: 'ev-11',
    title: 'High-Volume Super Saturday Surge (1,800+ Dispatches)',
    type: 'Critical',
    date: '2026-02-23',
    time: '08:00',
    duration: 'All Day',
    status: 'Scheduled',
    locationZone: 'Entire Facility',
    assignedPersonnel: 'All 32 Workforce Personnel',
    description: 'Anticipated 2.4x standard order volume across consumer retail channels.',
    businessImpact: '₹42L peak weekend volume requiring maximum floor velocity.',
    badgeColor: { bg: 'bg-rose-100', text: 'text-rose-900', border: 'border-rose-300' },
    icon: 'local_fire_department',
    isHighPriority: true
  }
];
