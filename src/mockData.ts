import { WarehouseStats, Recommendation, Order, InventoryItem, AutomationLog, DecisionScenario } from './types';
import { initialFullInventory } from './inventoryData';
import { initialOrders as completeOrdersList } from './ordersData';

export const MASCOT_LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpTp0WQq90gXpj1CboNjokGb3pSFx1jcUBeuCzVsO1MbQEkec3UfO0XzZhkTna518efXq37yCqxKsN6xBkIUxECPqFv9ciU0lXcW0dU5yHHGVlAGWdZ3PaUM7_OBzspErbzWeK5beXugqWWMIgOMrffKqhqWiulBak8Zm8RyaQPdst5kTEmr1j1lhIsLnkVcsHcr_D_OnL5AsKoRm_1BknQgL69temD07rYZdQBJRqz0WjZDLvJToX';
export const USER_AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDYhXbjtUM5bEhsEG-sKBRYwO_VkhXCHUaT76FIm6j4LVCQYur_GEvvuAMVtNPal4S6oOiTVBF1l0C7kHl6M0LWdKp7RVm6u3lDUET71A0tVVbZ1c3GBSy4HBuTNaS4RVJDlfAw4EOfLGikajOr56ZAQz7tmEWWpHqERRjcxDdN1_MogKPXV4w-x7vwsoAOXbuhIRFWpe7EOJUK4iVE8su6x67C4RX8oWahClpW1yLj9pjGgxBGMJYe';
export const WAREHOUSE_MAP_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBx0vCXzGNQV0ZScMd6FRJDVbHmKXoCMEs-Y6G28tWfrEeYYhS6MDi1cEmEvoZ_jMm6dJ8ieMkIeEuFAUcCBLEyqREUajOIl7po6dOsDR4NjSARLDnLLM9D6uU2WLjcOAzwxCTiPskbXoGhE3i5flCMTFT8lWWAzZPeNhrkdUXfUPDZfyycr0dxBtpTjiH3hW-o32XDD5m2ShFR9mVq2PQOoUP9ORgJPX7nZoViRUyZJ-qr1JbcBgza';

export const initialWarehouseStats: WarehouseStats = {
  healthScore: 94,
  healthScoreDelta: 2,
  ordersDispatched: 1402,
  ordersDispatchedDelta: 12,
  ordersTargetPercent: 65,
  productivityIndex: 1.18,
  productivityHourly: [30, 45, 60, 40, 70, 85, 95]
};

export const initialRecommendations: Recommendation[] = [
  {
    id: 'rec-1',
    type: 'urgent',
    priority: 'Critical',
    title: 'Prioritize Order #104',
    description: 'VIP customer. Dispatch required in 2 hours to meet SLA.',
    problem: 'Order #104 may miss 22-minute Express SLA deadline.',
    reason: 'Zone B pack station queue congested with bulk batch runs.',
    businessImpact: 'Estimated ₹48,000 shipment delay penalty & contract breach.',
    confidence: 97,
    recommendedAction: 'Move 2 packers from Zone B to dedicated priority line.',
    estimatedImprovement: '+18 mins faster clearance • 0 SLA risk',
    actionText: 'Approve',
    actionType: 'expedite_order',
    relatedId: 'ORD-89104',
    badgeText: 'Critical SLA'
  },
  {
    id: 'rec-2',
    type: 'warning',
    priority: 'High',
    title: 'Packing Station 2 Bottleneck',
    description: 'AI detected 15% slower throughput than average over last 45 mins.',
    problem: 'Pack Station #2 experiencing 15% throughput latency.',
    reason: 'Heavy item mix exceeding single-operator handling capacity.',
    businessImpact: 'Risk of backing up Zone A picking waves by 34 minutes.',
    confidence: 92,
    recommendedAction: 'Activate Dual-Lane packing mode for Station #2.',
    estimatedImprovement: '+120 pkgs/hr throughput recovery',
    actionText: 'Approve',
    actionType: 'reallocate_staff',
    badgeText: 'Bottleneck'
  },
  {
    id: 'rec-3',
    type: 'inventory',
    priority: 'Medium',
    title: 'Low Stock Alert: ProBook 15"',
    description: "SKU 'ProBook 15\" Workstation' trending high. Expected stockout in 14 hours.",
    problem: 'Rapid depletion on fast-moving SKU PRD-002.',
    reason: 'Enterprise B2B surge in Zone B order clusters.',
    businessImpact: 'Potential ₹1.2L missed order volume within 24 hours.',
    confidence: 94,
    recommendedAction: 'Auto-generate PO #9042 for 150 replenishment units.',
    estimatedImprovement: 'Prevents stockout • Restores 14-day buffer',
    actionText: 'Approve',
    actionType: 'create_po',
    badgeText: 'Inventory'
  }
];

export const initialAutomations: AutomationLog[] = [
  { id: 'auto-1', title: 'Route optimized for Picker #4', timeAgo: '2m ago', zone: 'Zone A' },
  { id: 'auto-2', title: 'HVAC adjusted in Zone B', timeAgo: '15m ago', zone: 'Zone B' },
  { id: 'auto-3', title: 'Auto-replenish triggered Aisle 12', timeAgo: '1h ago', zone: 'Zone C' }
];

export const initialOrders: Order[] = completeOrdersList;

export const initialInventory: InventoryItem[] = initialFullInventory;

export const decisionScenarios: DecisionScenario[] = [
  {
    id: 'scenario-b2b-enterprise',
    title: '🏢 B2B Bulk Pallet Staging & Contract SLA',
    description: 'Prioritize bulk freight consolidation and staging bays for Apex Logistics and OmniTech wholesale orders.',
    prompt: 'Optimize warehouse for enterprise B2B pallet fulfillment and freight staging bays',
    strategyTitle: 'Multi-Pallet Batch Consolidation & Bay 04 Freight Wave',
    strategyDescription: 'Cluster pallet picking in Bulk Zone C, dedicate Heavy Lift Forklifts 2 & 4, and pre-stage freight loads at Staging Bay 04.',
    confidence: 98,
    triggerTitle: 'B2B Wholesale Freight Cutoff',
    triggerDescription: 'Tier-1 Enterprise contracts require 400 pallets staged by 14:00 to meet TL freight carrier booking windows.',
    solutionTitle: 'Automated Pallet Wave Routing',
    solutionDescription: 'Lock dedicated aisle routes for high-capacity pallet jacks and sync directly with Staging Bay 04 weigh scales.',
    currentThroughput: 620,
    predictedThroughput: 940,
    currentClearanceTime: 145,
    predictedClearanceTime: 40,
    priorityLevel: 'Critical',
    slaAssessment: '100% Enterprise SLA & Contract Compliance Guaranteed',
    timeline: [
      { time: '10:00 AM', description: 'Enterprise ERP pushed 8 multi-pallet freight orders.' },
      { time: '10:15 AM', description: 'Muthu computed optimal pallet rack sequence in Zone C.' },
      { time: '10:20 AM (NOW)', description: 'Staging Bay 04 reservation and forklift routing approved.', isNow: true }
    ]
  },
  {
    id: 'scenario-b2c-sameday',
    title: '👤 B2C Express Courier & Single-Item Fast Lanes',
    description: 'Reroute high-velocity consumer orders to single-item pick paths and speed up courier handoffs.',
    prompt: 'Accelerate direct-to-consumer same-day parcel picking and packaging lines',
    strategyTitle: 'Single-Item Wave Fast-Tracking & Dynamic Courier Routing',
    strategyDescription: 'Route pickers through Zone A high-density picking bins using snake algorithms and double-staff Express Pack Stations 1 & 2.',
    confidence: 96,
    triggerTitle: 'Courier Express Cutoff approaching (45 mins)',
    triggerDescription: '120 consumer orders pending in pick queue with FedEx / UPS same-day pickup scheduled in 45 minutes.',
    solutionTitle: 'Zonal Pick-to-Tote Acceleration',
    solutionDescription: 'Consolidate single-item lines to reduce travel time by 42% and auto-generate thermal parcel labels on item scan.',
    currentThroughput: 780,
    predictedThroughput: 1120,
    currentClearanceTime: 85,
    predictedClearanceTime: 22,
    priorityLevel: 'High',
    slaAssessment: 'Zero missed consumer courier cutoffs',
    timeline: [
      { time: '10:05 AM', description: 'Courier dispatch window warning received.' },
      { time: '10:12 AM', description: 'Muthu grouped 120 single-SKU parcels into 4 batch waves.' },
      { time: '10:18 AM (NOW)', description: 'Express lane activation ready.', isNow: true }
    ]
  },
  {
    id: 'scenario-1',
    title: 'Reallocate 3 Packers to QC',
    description: 'Resolves current fulfillment bottleneck in Zone B without risking outbound shipping SLAs.',
    prompt: 'What if we rerouted Shift 2 to assist QC Station B?',
    strategyTitle: 'Reallocate 3 Packers to Quality Control',
    strategyDescription: 'Based on current queue analysis, this action resolves the fulfillment bottleneck in Zone B without risking outbound shipping SLAs.',
    confidence: 94,
    triggerTitle: 'Trigger Event',
    triggerDescription: 'Packing Zone B throughput dropped by 18% over the last hour. QC station queue has exceeded maximum threshold (40+ items waiting).',
    solutionTitle: 'Proposed Solution',
    solutionDescription: 'Temporarily shift 3 staff members from Packing to QC. Packing zone currently has excess capacity relative to inbound flow from picking.',
    currentThroughput: 750,
    predictedThroughput: 840,
    currentClearanceTime: 120,
    predictedClearanceTime: 42,
    priorityLevel: 'High',
    slaAssessment: 'All priority orders safe',
    timeline: [
      { time: '10:15 AM', description: 'Queue buildup detected at QC Station B.' },
      { time: '10:20 AM', description: 'Predictive model simulated 3 reallocation scenarios.' },
      { time: '10:22 AM (NOW)', description: 'Optimal strategy presented for approval.', isNow: true }
    ]
  },
  {
    id: 'scenario-2',
    title: 'Shift 2 Replenishment Delay',
    description: 'Model impact of a 45-minute delay from inbound receiving to Zone A.',
    prompt: 'Simulate 45-minute inbound delay for Shift 2',
    strategyTitle: 'Pre-allocate Zone A Buffer Stock',
    strategyDescription: 'Trigger automated buffer shelf pull to offset inbound truck docking delays for fast-moving items.',
    confidence: 89,
    triggerTitle: 'Inbound Dock Congestion',
    triggerDescription: 'Inbound Carrier Truck #4 running 45 minutes behind schedule due to Interstate 80 weather.',
    solutionTitle: 'Buffer Activation',
    solutionDescription: 'Activate Zone A tertiary shelf stock to feed Pick Stations 1 through 3 seamlessly.',
    currentThroughput: 710,
    predictedThroughput: 795,
    currentClearanceTime: 95,
    predictedClearanceTime: 38,
    priorityLevel: 'High',
    slaAssessment: 'Zero missed dispatch cutoffs',
    timeline: [
      { time: '09:40 AM', description: 'Carrier GPS telemetry flagged heavy congestion.' },
      { time: '09:55 AM', description: 'Simulated 45m replenishment buffer depletion.' },
      { time: '10:05 AM (NOW)', description: 'Buffer dispatch command ready.', isNow: true }
    ]
  },
  {
    id: 'scenario-3',
    title: 'Holiday Volume Spike (+20%)',
    description: 'Stress test current staffing against projected Q4 volume increase.',
    prompt: 'Stress test warehouse operations for 20% surge in order volume',
    strategyTitle: 'Dynamically Activate Dual-Lane Packing & Batch Picking',
    strategyDescription: 'Enable batch picking across High Velocity Aisles 1-6 and expand packing lines 3 and 4 to 2 operators per lane.',
    confidence: 96,
    triggerTitle: 'Projected Demand Surge',
    triggerDescription: 'Promotional surge projected to inject +240 orders/hr over standard daily average.',
    solutionTitle: 'Dynamic Wave Routing',
    solutionDescription: 'Cluster order batches by SKU affinity to reduce picker travel distance by 34%.',
    currentThroughput: 800,
    predictedThroughput: 1020,
    currentClearanceTime: 160,
    predictedClearanceTime: 55,
    priorityLevel: 'Critical',
    slaAssessment: '99.2% on-time dispatch rating preserved',
    timeline: [
      { time: '08:00 AM', description: 'ERP imported promotional forecast schedule.' },
      { time: '08:30 AM', description: 'Muthu generated multi-node route graph.' },
      { time: '09:00 AM (NOW)', description: 'Batch picking configuration synthesized.', isNow: true }
    ]
  }
];
