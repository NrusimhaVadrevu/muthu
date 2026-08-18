import { FaqItem, DemoGuideSection, DemoStoryStep, ProductTourStep } from './types';

export const FAQ_ITEMS: FaqItem[] = [
  // Getting Started
  {
    id: 'faq-1',
    category: 'Getting Started',
    question: 'How do I create a new order?',
    answer: 'Navigate to the Orders view using the sidebar menu and click the "New Order" or "Create Order" button at the top. Fill in the customer details, order category (B2B Business or B2C Individual), items, shipping method, and delivery window. The Muthu Order Priority Engine will automatically calculate its priority and SLA deadline.'
  },
  {
    id: 'faq-2',
    category: 'Getting Started',
    question: 'What does Warehouse Health mean?',
    answer: 'Warehouse Health is a real-time composite score (0–100) reflecting facility efficiency, SLA compliance rate, packing station throughput, inventory shortage risks, and carrier departure punctuality. A score above 90 indicates optimal performance.'
  },
  {
    id: 'faq-3',
    category: 'Getting Started',
    question: 'How are Business and Individual orders different?',
    answer: 'Business (B2B) orders represent wholesale commercial supply contracts (hospitals, retail chains, factories) requiring pallet staging, bulk inventory allocation, scheduled delivery windows, and truck utilization. Individual (B2C) orders represent single consumer purchases requiring fast item picking, parcel packing, and express courier dispatch.'
  },

  // Orders
  {
    id: 'faq-4',
    category: 'Orders',
    question: 'How does Muthu determine priority?',
    answer: 'Muthu calculates priority deterministically using an explainable multi-factor scoring engine considering Customer Type (VIP vs Standard), SLA Time Remaining, Shipping Method (Express vs Economy), Order Category (B2B vs B2C), and Inventory Availability. Categories range from Critical (<30m SLA or VIP <60m) to Urgent, High, Normal, and Low.'
  },
  {
    id: 'faq-5',
    category: 'Orders',
    question: 'What is an SLA Risk?',
    answer: 'An SLA Risk occurs when an order is at risk of breaching its guaranteed customer dispatch window due to picking queue backlog, packing station congestion, or carrier cutoff tightness. Orders with under 120 minutes remaining are flagged as At Risk, and under 30 minutes as Critical.'
  },

  // Inventory
  {
    id: 'faq-6',
    category: 'Inventory',
    question: 'What happens if inventory becomes unavailable?',
    answer: 'If an item is damaged or out of stock, Muthu prevents allocation for new orders and triggers an automated reorder recommendation. For existing staged orders, Muthu identifies reserve overflow bin stock or suggests partial consignment splitting.'
  },

  // Logistics
  {
    id: 'faq-7',
    category: 'Logistics',
    question: 'How are trucks assigned?',
    answer: 'Trucks are assigned based on destination corridor, payload weight/pallet capacity, order SLA deadline, and truck departure schedule. Muthu consolidates orders along highway arterial routes (e.g. NH65 Vijayawada, NH44 Bengaluru) to maximize truck volume utilization and eliminate empty deadhead runs.'
  },

  // Simulation
  {
    id: 'faq-8',
    category: 'Simulation',
    question: 'How does Simulation Mode work?',
    answer: 'Simulation Mode (Digital Twin) models hypothetical warehouse scenarios (order surge waves, worker absenteeism, conveyor bottlenecks, vehicle breakdowns) in a sandbox environment without altering live data. It projects metric degradation and tests Muthu optimization recommendations.'
  },

  // Analytics
  {
    id: 'faq-9',
    category: 'Analytics',
    question: 'How do I export reports?',
    answer: 'Click the "New Report" button in the sidebar or "Export Data" button on the Dashboard, Orders, Inventory, or Analytics views. Select your desired format (CSV, PDF summary, or JSON Audit Log) to immediately generate and download the report.'
  },
  {
    id: 'faq-13',
    category: 'Analytics',
    question: 'How is Warehouse Health calculated?',
    answer: 'Warehouse Health (0–100) is dynamically computed from SLA Compliance Rate (40% weight), Station Packing Throughput (25% weight), Inventory Safety Stock Buffers (20% weight), and On-Time Truck Departures (15% weight).'
  },

  // Muthu
  {
    id: 'faq-10',
    category: 'Muthu',
    question: 'How do I approve a recommendation?',
    answer: 'When Muthu generates a recommendation (on the Dashboard, Decision Workspace, SLA Risk drawer, or Demo Mode), click the "Approve Recommendation" button. The decision will immediately execute automated WMS actions (reassigning packers, expediting totes, updating stock, or clearing gate passes).'
  },
  {
    id: 'faq-11',
    category: 'Muthu',
    question: 'What do the confidence scores mean?',
    answer: 'Muthu confidence scores (e.g. 97%) reflect historical pattern matching accuracy, real-time sensor reliability, and operational simulation validation. Higher scores indicate high certainty of SLA recovery.'
  },
  {
    id: 'faq-12',
    category: 'Muthu',
    question: 'What does Auto Workflow do?',
    answer: 'Auto Workflow (Auto-Drive) automatically steps active orders sequentially through the 15-stage fulfillment pipeline at configurable speeds (1x, 2x, 5x), simulating live warehouse activity and worker picking/packing throughput.'
  },
  {
    id: 'faq-14',
    category: 'Orders',
    question: 'What happens when QC fails?',
    answer: 'When a Quality Check (QC) defect is flagged (e.g. barcode scan mismatch or damaged carton), the order is automatically isolated, preventing dispatch. An automated re-pick request is routed to Zone A/B runners while preserving the customer SLA deadline timer.'
  },

  // Troubleshooting
  {
    id: 'tb-1',
    category: 'Troubleshooting',
    question: 'Why is an order not moving?',
    answer: 'View detailed troubleshooting for stalled order execution.',
    troubleshootingDetails: {
      problem: 'Order remains stuck in Picking, Packing, or Stock Allocated stage without progressing.',
      possibleCause: 'Assigned packing station is overloaded (>130% capacity), required SKU stock is reserved by another P1 order, or optical scanner flagged a QC defect.',
      resolution: 'Open the Order Workflow timeline modal, check for active QC defect flags, and click "Step Next" or approve Muthu\'s recommended packer reallocation.'
    }
  },
  {
    id: 'tb-2',
    category: 'Troubleshooting',
    question: 'Why is inventory not updating?',
    answer: 'View detailed troubleshooting for inventory stock sync discrepancies.',
    troubleshootingDetails: {
      problem: 'Available or reserved inventory count does not update after order allocation or dispatch.',
      possibleCause: 'Order is still in "New" unallocated status, or manual stock replenishment was not committed.',
      resolution: 'Ensure the order status advances to "Stock Allocated" or "Picking" to decrement available stock and increment reserved stock. Use the "Restock +X" button on the Inventory page to manually replenish.'
    }
  },
  {
    id: 'tb-3',
    category: 'Troubleshooting',
    question: 'Why is a truck delayed?',
    answer: 'View detailed troubleshooting for highway fleet delays.',
    troubleshootingDetails: {
      problem: 'Truck status is flagged as "Delayed" on the Logistics Command Center.',
      possibleCause: 'Highway toll plaza congestion (e.g. Keesara Toll Plaza on NH65), heavy rain/weather disruptions, or weigh station clearance queues.',
      resolution: 'Open the Logistics view, click the delayed truck card to inspect Muthu\'s route recommendation, and click "Dispatch Reroute Instructions" to transmit alternative bypass routes to the driver.'
    }
  },
  {
    id: 'tb-4',
    category: 'Troubleshooting',
    question: 'Why can\'t I dispatch an order?',
    answer: 'View detailed troubleshooting for dispatch button blocks.',
    troubleshootingDetails: {
      problem: 'Dispatch button is disabled or action returns a warning.',
      possibleCause: 'Order has not completed mandatory Quality Check (QC), pallet seal document audit is pending, or no outbound truck is assigned to the destination route.',
      resolution: 'Verify the order status is "Ready for Dispatch", ensure assigned truck gate pass is cleared in Logistics, and complete QC verification.'
    }
  },
  {
    id: 'tb-5',
    category: 'Troubleshooting',
    question: 'Why can\'t I approve a recommendation?',
    answer: 'View detailed troubleshooting for recommendation approval blocks.',
    troubleshootingDetails: {
      problem: 'Clicking "Approve Recommendation" does not trigger state change.',
      possibleCause: 'Recommendation target order has already been dispatched/delivered, or auto-drive simulation is currently pausing execution.',
      resolution: 'Check if the order was already completed. Toggle Auto-Drive off/on in the Workflow Engine panel to refresh live state listeners.'
    }
  },
  {
    id: 'tb-6',
    category: 'Troubleshooting',
    question: 'Why is Warehouse Health decreasing?',
    answer: 'View detailed troubleshooting for health score drops.',
    troubleshootingDetails: {
      problem: 'Warehouse Health score dropped from 96 to below 90.',
      possibleCause: 'Accumulation of SLA risk orders (<45m left), packing bench congestion, or unhandled low-stock SKUs.',
      resolution: 'Click "8 SLA Risks" on the Dashboard to review and approve Muthu\'s packer reallocation recommendations to immediately recover health points.'
    }
  },
  {
    id: 'tb-7',
    category: 'Troubleshooting',
    question: 'Why is an order marked Critical?',
    answer: 'View detailed troubleshooting for priority escalations.',
    troubleshootingDetails: {
      problem: 'Order priority escalated automatically to "Critical".',
      possibleCause: 'Order customer is VIP tier with under 60 minutes SLA remaining, or SLA remaining is under 30 minutes regardless of customer type.',
      resolution: 'Assign a fast-track picking runner or approve Muthu\'s station queue override to expedite fulfillment.'
    }
  },
  {
    id: 'tb-8',
    category: 'Troubleshooting',
    question: 'How do I resolve SLA Risk?',
    answer: 'View detailed troubleshooting for mitigating SLA breach risks.',
    troubleshootingDetails: {
      problem: 'Multiple orders flagged under "SLA AT RISK" tab.',
      possibleCause: 'Packing Station 2 queue backlog, delayed courier pickup van, or picker aisle congestion.',
      resolution: 'Click the "8 SLA Risks" interactive KPI on the Dashboard, review the affected orders in the drawer, and click "Approve Recommendation" to reallocate staff and recover SLA timelines.'
    }
  }
];

export const DEMO_GUIDE_SECTIONS: DemoGuideSection[] = [
  {
    id: 'guide-overview',
    title: 'Application Overview',
    category: 'General',
    icon: 'dashboard_customize',
    overview: 'MUTHU is an autonomous operations, logistics, and decision-intelligence platform engineered for modern fulfillment centers.',
    purpose: 'To provide real-time operational visibility, explainable order prioritization, automated WMS workflow orchestration, and active fleet management.',
    howToUse: 'Navigate using the left sidebar. Monitor facility telemetry on the Dashboard, manage order queues in Orders, track stock levels in Inventory, and command transportation in Logistics.',
    expectedOutcome: 'Zero missed SLAs, maximized warehouse health score, optimal truck payload utilization, and full decision auditability.',
    bestPractices: [
      'Check the Warehouse Health score daily on the Dashboard.',
      'Review pending Muthu recommendations before shifting labor resources.',
      'Use global search (Cmd/Ctrl + K) to locate specific SKUs, orders, or vehicle numbers.'
    ]
  },
  {
    id: 'guide-dashboard',
    title: 'Warehouse Command Center (Dashboard)',
    category: 'Fulfillment',
    icon: 'dashboard',
    overview: 'The central nerve center displaying live facility telemetry, interactive KPI cards, order lifecycle funnels, and Muthu Prescriptive Intelligence.',
    purpose: 'To give operations managers immediate, actionable insights into warehouse performance and urgent bottleneck risks.',
    howToUse: 'Click any interactive KPI card (e.g. "8 SLA Risks", "17 Critical SKUs", "12 Trucks Ready") to open exact record audit drawers or filtered views. Click "Approve" on Muthu recommendations to trigger instant state remedies.',
    expectedOutcome: 'Real-time bottleneck resolution and rapid operational decision-making.',
    bestPractices: [
      'Prioritize recommendations with red Critical badges.',
      'Inspect the 15-stage pipeline funnel to balance worker allocations across Zone A, B, and C.'
    ]
  },
  {
    id: 'guide-orders',
    title: 'Order Management & Priority Engine',
    category: 'Fulfillment',
    icon: 'shopping_cart',
    overview: 'Comprehensive order fulfillment registry supporting B2B Wholesale Freight and B2C Express Courier workflows.',
    purpose: 'To enforce explainable SLA prioritization and streamline order progression from Received to Delivered.',
    howToUse: 'Use top bifurcation tabs (ALL, B2B, B2C, VIP, URGENT, SLA AT RISK) or status category pills (RECEIVED, PACKED, DISPATCHED, DELIVERED, etc.) to filter. Click any order row to open its 15-stage workflow timeline.',
    expectedOutcome: '100% on-time dispatch for VIP and contract SLA orders.',
    bestPractices: [
      'Filter by "SLA AT RISK" at the start of each shift.',
      'Use the inline "Step Next" action to advance stage transitions.'
    ]
  },
  {
    id: 'guide-inventory',
    title: 'Inventory SKU Registry & Stock Sync',
    category: 'Warehouse',
    icon: 'inventory_2',
    overview: 'Real-time product registry tracking available, reserved, and damaged stock levels across warehouse shelf/bin locations.',
    purpose: 'To prevent stockouts, manage buffer reorder levels, and automatically synchronize stock when orders are allocated or dispatched.',
    howToUse: 'Search by SKU or product name. Use the "Restock +X" button on low or critical items to commit replenishment orders.',
    expectedOutcome: 'Zero assembly line packaging stalls and optimized safety stock buffers.',
    bestPractices: [
      'Monitor items marked with "Depletion in X Days" AI prediction badges.',
      'Reconcile damaged stock counts before allocating high-volume B2B contract orders.'
    ]
  },
  {
    id: 'guide-logistics',
    title: 'Logistics & Fleet Command Center',
    category: 'Logistics',
    icon: 'local_shipping',
    overview: 'Transportation control center tracking 72 regional trucks across 6 stages from Assigned to Returned.',
    purpose: 'To optimize highway corridor routes, eliminate empty return deadhead runs, and ensure on-time destination arrivals.',
    howToUse: 'Filter trucks by status (Ready to Depart, Loading, En Route, Delayed, Returning, Delivered). Switch to "Highway Route Visualizer" to observe live corridor waypoints between Hyderabad Central Hub and regional depots.',
    expectedOutcome: 'Maximum payload utilization (>90%) and on-time courier/freight departures.',
    bestPractices: [
      'Inspect delayed trucks immediately and transmit Muthu GPS reroute instructions.',
      'Allocate inbound packaging backhauls for returning empty trucks.'
    ]
  },
  {
    id: 'guide-simulation',
    title: 'Simulation Center (Digital Twin)',
    category: 'Intelligence',
    icon: 'model_training',
    overview: 'A risk-free sandbox environment for modeling hypothetical operational disruptions and testing mitigation strategies.',
    purpose: 'To stress-test facility capacity against order spikes, worker absenteeism, conveyor jams, and vehicle breakdowns.',
    howToUse: 'Select a pre-built scenario or adjust parameters (additional orders, zone congestion, picker delta). Click "Run Digital Twin Simulation" to inspect projected health score drops and test Muthu optimization remedies.',
    expectedOutcome: 'Validated contingency plans before real-world disruptions occur.',
    bestPractices: [
      'Run the "500-Order Surge" scenario prior to launching promotional marketing campaigns.',
      'Apply simulated recommendations to live app state when satisfied with projected recovery.'
    ]
  },
  {
    id: 'guide-analytics',
    title: 'Analytics & Decision Audit Ledger',
    category: 'Intelligence',
    icon: 'analytics',
    overview: 'Comprehensive reporting dashboard displaying hourly picking throughput, SLA compliance trends, zone load heatmaps, and immutable decision logs.',
    purpose: 'To provide full operational transparency and long-term performance auditing.',
    howToUse: 'Select reporting date ranges and export CSV or PDF summaries using the export control bar.',
    expectedOutcome: 'Data-driven facility optimization and audit compliance.',
    bestPractices: [
      'Review weekly picker productivity velocity to identify training needs.',
      'Export the Decision History ledger for monthly executive reviews.'
    ]
  },
  {
    id: 'guide-muthu',
    title: 'Meet Muthu (Decision Workspace)',
    category: 'Intelligence',
    icon: 'smart_toy',
    overview: 'Your Smart Operations Partner workspace for interactive scenario analysis and strategy tuning.',
    purpose: 'To provide explainable, AI-driven prescriptive remedies with confidence metrics and expected operational impact.',
    howToUse: 'Browse active decision scenarios, review root cause diagnoses, and click "Apply Strategy" to orchestrate facility-wide remedies.',
    expectedOutcome: 'Autonomous, explainable operations management.',
    bestPractices: [
      'Review confidence scores (>95%) before approving major staff reallocations.'
    ]
  },
  {
    id: 'guide-decision-engine',
    title: 'Muthu Prescriptive Decision Engine',
    category: 'Intelligence',
    icon: 'psychology',
    overview: 'Autonomous diagnostic engine that continuous correlates bottleneck telemetry with historical operational data.',
    purpose: 'To detect root causes, calculate risk exposure, and prescribe actionable remedies.',
    howToUse: 'Inspect recommendation cards on the Dashboard or Decision Workspace, read the root cause explanation, and click "Approve Recommendation".',
    expectedOutcome: 'Immediate bottleneck elimination with full decision audit trails.',
    bestPractices: [
      'Evaluate impact cost metrics before deciding between auto-reallocation or manual dispatch.'
    ]
  },
  {
    id: 'guide-workflow',
    title: 'Warehouse Workflow Orchestration Engine',
    category: 'Fulfillment',
    icon: 'account_tree',
    overview: '15-stage state machine controlling order progression from New to Dispatched.',
    purpose: 'To orchestrate worker picking, packing station assignment, quality control, and gate pass authorization.',
    howToUse: 'Click the floating action button [⚙] in the bottom-right corner to toggle Auto-Drive, adjust speed multipliers (1x, 2x, 5x), or step order workflows.',
    expectedOutcome: 'Smooth, predictable order flow without packing bench overcrowding.',
    bestPractices: [
      'Use 2x or 5x Auto-Drive speed during shift simulations to observe queue behavior.'
    ]
  }
];

export const DEMO_STORY_STEPS: DemoStoryStep[] = [
  {
    stepNumber: 1,
    title: 'Step 1: Open Dashboard',
    description: 'Inspect live warehouse status, health score (92/100), and operational KPI summary cards.',
    actionText: 'View Dashboard Telemetry',
    targetPage: 'dashboard',
    details: 'The Dashboard displays live facility metrics, active pipeline stage counts, and urgent Muthu recommendations.'
  },
  {
    stepNumber: 2,
    title: 'Step 2: Create VIP Order',
    description: 'Navigate to Orders and create a high-priority B2B VIP Hospital Order (#MTH-1042).',
    actionText: 'Create Order #MTH-1042',
    targetPage: 'orders',
    details: 'Order #MTH-1042 is created with VIP status, 24 minutes SLA remaining, and placed into the packing queue.'
  },
  {
    stepNumber: 3,
    title: 'Step 3: Muthu Detects SLA Risk',
    description: 'Muthu identifies Packing Station 2 operating at 132% capacity with queue backlog.',
    actionText: 'Inspect SLA Risk Alert',
    targetPage: 'dashboard',
    details: 'Muthu flags Order #MTH-1042 under "8 SLA Risks" with 97% confidence recommendation to reallocate 2 packers from Zone B.'
  },
  {
    stepNumber: 4,
    title: 'Step 4: Approve Recommendation',
    description: 'Click "Approve Recommendation" to reassign available packers to Packing Station 2.',
    actionText: 'Approve Recommendation',
    targetPage: 'dashboard',
    details: 'Packers are reassigned immediately. Packing Station 2 queue drops by 68% and estimated completion recovers 21 minutes.'
  },
  {
    stepNumber: 5,
    title: 'Step 5: Inventory Updates',
    description: 'Allocated SKUs update automatically in the Inventory Registry.',
    actionText: 'Check Inventory Stock',
    targetPage: 'inventory',
    details: 'Available stock for medical packaging SKUs decrements while reserved stock increments proportionally.'
  },
  {
    stepNumber: 6,
    title: 'Step 6: Truck Assigned',
    description: 'Order #MTH-1042 is assigned to Truck AP 05 XX 1234 on the Vijayawada Expressway corridor.',
    actionText: 'View Logistics Fleet',
    targetPage: 'logistics',
    details: 'Truck AP 05 XX 1234 payload load increases to 88% and status advances to "Ready to Depart".'
  },
  {
    stepNumber: 7,
    title: 'Step 7: Dispatch Order',
    description: 'Authorize gate clearance pass to dispatch Truck AP 05 XX 1234 from Bay 04.',
    actionText: 'Authorize Gate Pass',
    targetPage: 'logistics',
    details: 'Truck departs Central Hub on schedule, avoiding afternoon toll plaza congestion.'
  },
  {
    stepNumber: 8,
    title: 'Step 8: Analytics Updated',
    description: 'Dispatched order is logged in Analytics and Decision History Ledger.',
    actionText: 'View Performance Analytics',
    targetPage: 'analytics',
    details: 'On-time delivery SLA compliance rate updates to 99.4%.'
  },
  {
    stepNumber: 9,
    title: 'Step 9: Warehouse Health Improves',
    description: 'Facility health score recovers from 92 to 96 points.',
    actionText: 'Verify Health Score (96)',
    targetPage: 'dashboard',
    details: 'The full operational decision loop is closed successfully with zero SLA violations.'
  }
];

export const PRODUCT_TOUR_STEPS: ProductTourStep[] = [
  {
    stepIndex: 0,
    pageId: 'dashboard',
    title: 'Welcome to MUTHU Dashboard',
    subtitle: 'Warehouse Command Center & Live Telemetry',
    description: 'The Dashboard gives you real-time visibility into facility performance, Warehouse Health (0-100), active order funnels, and pending Muthu recommendations.',
    whyItExists: 'To eliminate operational blind spots and empower fast, data-driven decisions.',
    howToUse: 'Click interactive KPI cards (e.g. "8 SLA Risks", "17 Critical SKUs") to inspect exact affected records, and click "Approve" on recommendations.'
  },
  {
    stepIndex: 1,
    pageId: 'orders',
    title: 'Orders Management & Priority Engine',
    subtitle: '15-Stage Automated WMS Fulfillment Pipeline',
    description: 'Manage all B2B Business contracts and B2C Individual consumer orders in one unified pipeline with explainable SLA priority scoring.',
    whyItExists: 'To ensure high-priority VIP orders and contract deadlines are never missed.',
    howToUse: 'Use top bifurcation tabs (B2B, B2C, VIP, Urgent, SLA Risk) or status category pills to filter. Click any order row to open its 15-stage workflow timeline.'
  },
  {
    stepIndex: 2,
    pageId: 'inventory',
    title: 'Inventory SKU Registry & Stock Sync',
    subtitle: 'Real-Time Stock Levels & Reorder Intelligence',
    description: 'Track SKU stock levels across warehouse shelf/bin locations with automatic reservation sync when orders are created or dispatched.',
    whyItExists: 'To prevent assembly line packaging stalls and manage reorder levels proactively.',
    howToUse: 'Search product names or SKUs, monitor AI prediction badges, and click "Restock +X" to replenish stock buffers.'
  },
  {
    stepIndex: 3,
    pageId: 'logistics',
    title: 'Logistics & Fleet Command Center',
    subtitle: 'Arterial Transport Routing & Fleet Tracking',
    description: 'Monitor regional trucks across 6 stages from Assigned to Returned, inspect highway corridor waypoints, and optimize truck load capacity.',
    whyItExists: 'To eliminate empty return deadhead runs and ensure on-time destination arrivals.',
    howToUse: 'Filter trucks by status, switch to Highway Route Visualizer to observe live highway corridors, and click truck cards to view payload manifests.'
  },
  {
    stepIndex: 4,
    pageId: 'simulation',
    title: 'Simulation Center (Digital Twin)',
    subtitle: 'Risk-Free Disruption Stress Testing',
    description: 'Model hypothetical order surge waves, worker absenteeism, or conveyor breakdowns in a sandbox environment without altering live data.',
    whyItExists: 'To test contingency strategies and validate Muthu recommendations before real disruptions happen.',
    howToUse: 'Select a scenario, adjust parameters, click "Run Digital Twin Simulation", and review projected health recoveries.'
  },
  {
    stepIndex: 5,
    pageId: 'analytics',
    title: 'Analytics & Decision History Ledger',
    subtitle: 'Performance Trends & Immutable Decision Logs',
    description: 'Analyze hourly picker productivity, SLA compliance trends, zone heatmaps, and audit every recommendation approved by operations managers.',
    whyItExists: 'To provide complete operational transparency and long-term reporting.',
    howToUse: 'Filter date ranges and click "Export Data" to generate downloadable CSV or PDF reports.'
  },
  {
    stepIndex: 6,
    pageId: 'decision',
    title: 'Meet Muthu (Decision Workspace)',
    subtitle: 'Your Smart Operations Partner',
    description: 'Muthu continuously monitors facility telemetry, diagnoses root cause bottlenecks, calculates business impact, and recommends optimal remedies.',
    whyItExists: 'To provide explainable, AI-driven prescriptive intelligence tailored to your warehouse.',
    howToUse: 'Browse active decision scenarios, review confidence scores, and click "Apply Strategy" to execute facility-wide remedies.'
  }
];
