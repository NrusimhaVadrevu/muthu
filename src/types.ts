export type PageId =
  | 'dashboard'
  | 'inventory'
  | 'orders'
  | 'logistics'
  | 'workers'
  | 'equipment'
  | 'calendar'
  | 'analytics'
  | 'reports'
  | 'decision'
  | 'simulation'
  | 'help';

export type WorkerRole =
  | 'Picker'
  | 'Packer'
  | 'Quality Inspector'
  | 'Warehouse Associate'
  | 'Loader'
  | 'Dispatcher'
  | 'Driver'
  | 'Supervisor'
  | 'Maintenance Technician';

export type WorkerPerformanceStatus =
  | 'EXCELLENT'
  | 'GOOD'
  | 'ON TRACK'
  | 'NEEDS IMPROVEMENT'
  | 'UNDER REVIEW';

export type WorkerAvailability = 'Available' | 'On Shift' | 'Overloaded' | 'On Break' | 'On Leave';

export type WorkerRecognitionCategory =
  | 'Top Performer'
  | 'High Impact'
  | 'Most Improved'
  | 'Needs Training'
  | 'Performance Review';

export interface Worker {
  id: string;
  workerId: string;
  name: string;
  role: WorkerRole;
  shift: 'Morning' | 'Afternoon' | 'Night';
  zone: string;
  availability: WorkerAvailability;
  ordersHandled: number;
  packagesPicked: number;
  packagesPacked: number;
  qcChecks: number;
  avgProcessingTimeMinutes: number;
  productivityScore: number;
  attendancePercent: number;
  currentWorkloadPercent: number;
  slaContributionPercent: number;
  performanceStatus: WorkerPerformanceStatus;
  estimatedRevenueSupportedInr: number;
  recommendedBonusInr?: number;
  bonusReason?: string;
  bonusApproved?: boolean;
  trainingRecommended?: string;
  performanceNote?: string;
  recognitionCategory?: WorkerRecognitionCategory;
  recognitionReason?: string;
  avatarUrl?: string;
}

export type EquipmentType =
  | 'Forklift'
  | 'Crane'
  | 'Pallet Jack'
  | 'Conveyor System'
  | 'Automated Sorter'
  | 'Barcode Scanner'
  | 'Packing Machine'
  | 'Loading Equipment'
  | 'Warehouse Robot';

export type EquipmentCondition = 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';

export type EquipmentStatus =
  | 'OPERATIONAL'
  | 'MAINTENANCE DUE'
  | 'UNDER MAINTENANCE'
  | 'WARNING'
  | 'OUT OF SERVICE'
  | 'CRITICAL';

export interface Equipment {
  id: string;
  equipmentId: string;
  name: string;
  type: EquipmentType;
  zone: string;
  condition: EquipmentCondition;
  status: EquipmentStatus;
  utilizationPercent: number;
  lastMaintenanceDate: string;
  nextMaintenanceDate: string;
  maintenanceCostInr: number;
  backupAvailableId?: string;
  backupAvailableName?: string;
  assignedTechnicianName: string;
  locationDetails: string;
  notes?: string;
}

export interface MonthlyOperationsReport {
  month: string;
  isCurrentMonth?: boolean;
  executiveSummary: string;
  topAchievement: string;
  biggestRisk: string;
  primaryBottleneck: string;
  topPerformerName: string;
  equipmentRiskName: string;
  inventoryRiskItem: string;
  muthuTopRecommendation: string;

  orders: {
    received: number;
    picked: number;
    packed: number;
    dispatched: number;
    delivered: number;
    cancelled: number;
    delayed: number;
  };
  logistics: {
    trucksDispatched: number;
    trucksDelivered: number;
    trucksReturning: number;
    avgDispatchMinutes: number;
    avgDeliveryHours: number;
    delayedShipmentsCount: number;
  };
  workforce: {
    workersActive: number;
    packagesPicked: number;
    packagesPacked: number;
    avgProductivityScore: number;
    slaContributionPercent: number;
    attendancePercent: number;
  };
  inventory: {
    unitsProcessed: number;
    lowStockEventsCount: number;
    outOfStockEventsCount: number;
    damagedItemsCount: number;
    reordersTriggeredCount: number;
  };
  equipment: {
    machinesUsedCount: number;
    maintenanceEventsCount: number;
    downtimeHours: number;
    backupEquipmentUsageHours: number;
  };
  businessImpact: {
    orderValueFulfilledInr: number;
    estimatedRevenueSupportedInr: number;
    estimatedDelayCostInr: number;
    estimatedEfficiencyPercent: number;
    projectedImprovementPercent: number;
  };
}

export type FaqCategory =
  | 'Getting Started'
  | 'Orders'
  | 'Inventory'
  | 'Logistics'
  | 'Simulation'
  | 'Analytics'
  | 'Muthu'
  | 'Troubleshooting';

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  troubleshootingDetails?: {
    problem: string;
    possibleCause: string;
    resolution: string;
  };
}

export interface DemoGuideSection {
  id: string;
  title: string;
  category: string;
  icon: string;
  overview: string;
  purpose: string;
  howToUse: string;
  expectedOutcome: string;
  bestPractices: string[];
}

export interface DemoStoryStep {
  stepNumber: number;
  title: string;
  description: string;
  actionText: string;
  targetPage: PageId;
  details: string;
}

export interface ProductTourStep {
  stepIndex: number;
  pageId: PageId;
  title: string;
  subtitle: string;
  description: string;
  whyItExists: string;
  howToUse: string;
}

export type TruckStatus =
  | 'Assigned'
  | 'Loading'
  | 'Fully Packed'
  | 'Ready to Depart'
  | 'Departed'
  | 'En Route'
  | 'Near Destination'
  | 'Delivered'
  | 'Returning'
  | 'Returned'
  | 'Delayed';

export interface MuthuLogisticsRecommendation {
  problem: string;
  reason: string;
  impact: string;
  recommendation: string;
  confidence: number;
  action: string;
}

export interface TruckShipment {
  id: string;
  truckId: string;
  driverName: string;
  driverContact: string;
  vehicleNumber: string;
  vehicleType: string;
  capacityPallets: number;
  capacityKg: number;
  currentLoadPercent: number;
  currentLoadKg: number;
  origin: string;
  destination: string;
  route: string;
  departureTime: string;
  eta: string;
  currentStatus: TruckStatus;
  shipmentType: 'B2B Wholesale Freight' | 'B2C Express Courier' | 'Mixed Multi-Client';
  orderCount: number;
  orderIds: string[];
  distanceKm: number;
  delayRisk: 'None' | 'Low' | 'Medium' | 'High' | 'Critical';
  delayMinutes?: number;
  delayReason?: string;
  currentLocationDesc: string;
  fuelLevelPercent: number;
  temperatureDegC?: number;
  muthuRecommendation?: MuthuLogisticsRecommendation;
  progressPercent: number;
  lastUpdated: string;
}

export interface LogisticsStats {
  readyToDepartCount: number;
  loadingCount: number;
  enRouteCount: number;
  returningCount: number;
  deliveredCount: number;
  delayedCount: number;
  availableCapacityTons: number;
  todayDispatchesCount: number;
  activeFleetCount: number;
  onTimeDeliveryRate: number;
}

export interface SimulationParams {
  scenarioName: string;
  category: 'orders' | 'inventory' | 'workers' | 'warehouse' | 'dispatch' | 'custom';
  simulationScope?: 'mixed' | 'business' | 'individual';
  additionalOrders: number;
  orderTypeMix: 'normal' | 'vip_surge' | 'holiday_spike' | 'b2b_bulk' | 'b2b_wholesale' | 'b2c_consumer' | 'mixed_multimodal';
  activePickersDelta: number;
  activePackersDelta: number;
  zoneCongestionPercent: number; // 0 to 100
  blockedShelvesCount: number;
  qcDelayMinutes: number;
  courierDelayMinutes: number;
  vehicleBreakdown: boolean;
  stockoutSeverity: 'none' | 'moderate' | 'critical';
  supplierDelayDays: number;
}

export interface SimulationProblem {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium';
  impact: string;
  zone?: string;
}

export interface SimulationRecommendation {
  id: string;
  title: string;
  description: string;
  recommendedAction: string;
  impactReduction: string;
  confidence: number;
  applied: boolean;
}

export interface SimulationMetrics {
  healthScore: number;
  orderCompletionRate: number; // percentage
  slaCompliance: number; // percentage
  workerUtilization: number; // percentage
  avgPickingTimeMinutes: number;
  avgPackingTimeMinutes: number;
  avgDispatchDelayMinutes: number;
  inventoryShortagesCount: number;
  revenueAtRisk: number; // in INR / USD
  ordersDelayedCount: number;
}

export interface SimulationResults {
  beforeMetrics: SimulationMetrics;
  simulatedMetrics: SimulationMetrics;
  optimizedMetrics: SimulationMetrics;
  confidenceScore: number;
  predictionSummary: string;
  businessImpactSummary: string;
  expectedImprovementSummary: string;
  detectedProblems: SimulationProblem[];
  recommendations: SimulationRecommendation[];
  zoneLoads: {
    zoneA: number; // %
    zoneB: number; // %
    zoneC: number; // %
    qc: number; // %
    staging: number; // %
  };
  workerAllocations: {
    picking: number;
    packing: number;
    qc: number;
    staging: number;
  };
}

export interface SimulationHistoryRecord {
  id: string;
  scenarioName: string;
  category: string;
  timestamp: string;
  createdBy: string;
  params: SimulationParams;
  results: SimulationResults;
  recommendationsAppliedCount: number;
}

export interface WarehouseStats {
  healthScore: number;
  healthScoreDelta: number;
  ordersDispatched: number;
  ordersDispatchedDelta: number;
  ordersTargetPercent: number;
  productivityIndex: number;
  productivityHourly: number[];
}

export interface Recommendation {
  id: string;
  type: 'urgent' | 'warning' | 'inventory';
  title: string;
  description: string;
  actionText: string;
  actionType: 'expedite_order' | 'reallocate_staff' | 'create_po' | 'view_details';
  relatedId?: string;
  badgeText?: string;
  problem?: string;
  reason?: string;
  businessImpact?: string;
  confidence?: number;
  recommendedAction?: string;
  estimatedImprovement?: string;
  priority?: 'Critical' | 'High' | 'Medium' | 'Optimal';
  timeSavedMinutes?: number;
  revenueProtectedInr?: number;
  affectedOrdersCount?: number;
  affectedWorkersCount?: number;
}

export type OrderCategory = 'business' | 'individual';
export type GlobalOrderFilter = 'all' | 'business' | 'individual';

export type OrderPriority = 'Critical' | 'Urgent' | 'High' | 'Medium' | 'Normal' | 'Low' | 'P1' | 'P2' | 'P3' | 'P1 Expedite';
export type CustomerType = 'VIP' | 'Business' | 'Standard';
export type ShippingType = 'Express' | 'Standard' | 'Economy';

export type OrderStatus =
  | 'New'
  | 'Priority Assigned'
  | 'Inventory Checked'
  | 'Stock Allocated'
  | 'Picking'
  | 'Packing'
  | 'Quality Check'
  | 'Ready for Dispatch'
  | 'Dispatched'
  | 'Delivered'
  | 'On Hold'
  | 'Active Picking'
  | 'Quality Control';

export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice?: number;
  picked?: boolean;
  binLocation?: string;
}

export interface B2BShipment {
  id: string;
  shipmentNumber: string;
  status: 'Staged' | 'Loaded' | 'Dispatched' | 'Delivered' | 'Pending';
  trackingNumber: string;
  carrier: string;
  unitCount: number;
  palletCount?: number;
  dispatchTime?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  orderCategory: OrderCategory; // 'business' (B2B) | 'individual' (B2C)
  customerName: string;
  customerType: CustomerType;
  orderValue: number;
  shippingType: ShippingType;
  priority: OrderPriority;
  orderDate: string;
  expectedDispatchTime: string;
  slaDeadline: string;
  slaRemainingMinutes: number;
  currentStatus: OrderStatus;
  assignedPicker: string;
  assignedPacker: string;
  warehouseZone: string;
  itemCount: number;
  items: OrderItem[];
  estimatedCompletionTime: string;
  carrier?: string;
  trackingNumber?: string;
  shippingAddress?: string;
  notes?: string;
  isNearSlaRisk?: boolean;
  isDelayed?: boolean;
  isP1?: boolean;
  slaRiskLevel?: 'Safe' | 'Watch' | 'At Risk' | 'Critical';
  slaRiskReason?: string;
  assignedTruckId?: string;
  assignedTruckNumber?: string;
  muthuRecommendationText?: string;
  muthuConfidence?: number;

  // B2B Specific Fields (Business Orders)
  companyName?: string;
  poNumber?: string;
  bulkQuantity?: number; // Total units in bulk
  contractType?: string; // e.g. "Enterprise SLA Tier-1", "Scheduled Bulk Supply", "Consignment Contract", "JIT Manufacturing"
  accountManager?: string;
  deliveryWindow?: string; // e.g. "Tomorrow 08:00 - 12:00", "Daily Morning Sweep", "Friday 14:00 Freight Slot"
  warehouseAllocation?: string; // e.g. "Pallet Bay 04 & 05", "Bulk Staging Lane 2", "Mezzanine Pallet Rack M3"
  multipleShipmentsAllowed?: boolean;
  shipmentCount?: number;
  shipments?: B2BShipment[];

  // B2C Specific Fields (Individual Consumer Orders)
  customerPhone?: string;
  deliveryMethod?: string; // e.g. "Same-Day Courier", "Express Air", "Standard Home Ground", "Locker Drop"
  paymentStatus?: 'Prepaid Verified' | 'Cash on Delivery' | 'Net-15 Invoice' | 'Escrow Secured';
  singleShipment?: boolean;

  // Compatibility fields
  status?: OrderStatus;
  zone?: string;
  slaTarget?: string;
  slaTargetMinutes?: number;
  createdAt?: string;
}

export interface CopilotRecommendation {
  id: string;
  title: string;
  targetOrderId?: string;
  targetOrderNumber?: string;
  problem: string;
  reason: string;
  businessImpact: string;
  confidence: number;
  recommendedAction: string;
  expectedResult?: string;
  actionType: 'prioritize' | 'dispatch_first' | 'allocate_staff' | 'delay_insufficient_stock' | 'split_shipment';
  badgeText: string;
  isApplied?: boolean;
  isDismissed?: boolean;
  timeSavedMinutes?: number;
  revenueProtectedInr?: number;
  affectedOrdersCount?: number;
  affectedWorkersCount?: number;
}

export type InventoryStatus = 'Optimal' | 'Low Stock' | 'Critical' | 'Out of Stock' | 'Oversupplied';

export type ProductCategory =
  | 'Electronics'
  | 'Furniture'
  | 'Packaging'
  | 'Accessories'
  | 'Office Supplies'
  | 'Equipment'
  | 'Hardware';

export type AIPredictionType =
  | 'stable'
  | 'increasing'
  | 'restock'
  | 'overstock'
  | 'dead_stock'
  | 'depletion';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  quantityAvailable: number;
  reservedQuantity: number;
  damagedQuantity: number;
  reorderLevel: number;
  maxStock: number;
  stockPercentage: number;
  status: InventoryStatus;
  warehouseZone: string;
  shelfBinLocation: string;
  supplier: string;
  unitPrice: number;
  aiPrediction: string;
  aiPredictionType: AIPredictionType;
  icon: string;
  lastRestocked?: string;
  leadTimeDays?: number;
  unitCost?: number;
  // Compatibility fields
  currentStock?: number;
  muthuPredict?: string;
  muthuPredictType?: 'stable' | 'depletion' | 'restock' | 'low_velocity';
  locationZone?: string;
}

export interface AutomationLog {
  id: string;
  title: string;
  timeAgo: string;
  zone?: string;
}

export interface DecisionScenario {
  id: string;
  title: string;
  description: string;
  prompt: string;
  strategyTitle: string;
  strategyDescription: string;
  confidence: number;
  triggerTitle: string;
  triggerDescription: string;
  solutionTitle: string;
  solutionDescription: string;
  currentThroughput: number;
  predictedThroughput: number;
  currentClearanceTime: number;
  predictedClearanceTime: number;
  priorityLevel: 'High' | 'Medium' | 'Critical';
  slaAssessment: string;
  timeline: {
    time: string;
    description: string;
    isNow?: boolean;
  }[];
}

export type WorkflowStageState = 'completed' | 'active' | 'pending' | 'failed';

export type CanonicalWorkflowStageId =
  | 'order_created'
  | 'priority_determined'
  | 'inventory_checked'
  | 'inventory_reserved'
  | 'inventory_allocated'
  | 'picker_assigned'
  | 'picking'
  | 'packing'
  | 'quality_check'
  | 'ready_for_dispatch'
  | 'dispatched'
  | 'delivered'
  | 'inventory_updated'
  | 'dashboard_updated'
  | 'analytics_updated';

export type QualityIncidentStageId =
  | 'issue_detected'
  | 'create_incident'
  | 'allocate_replacement'
  | 'repack'
  | 'repeat_qc'
  | 'dispatch';

export interface WorkflowStageInfo {
  id: CanonicalWorkflowStageId | QualityIncidentStageId;
  label: string;
  stageNumber: number;
  status: WorkflowStageState;
  assignedWorker: string;
  timestamp: string;
  estimatedDuration: string;
  actualDuration: string;
  icon: string;
  notes?: string;
}

export interface QualityIncident {
  incidentId: string;
  orderId: string;
  detectedAt: string;
  issueReason: string;
  replacementSku: string;
  replacementQuantity: number;
  assignedInspector: string;
  status: 'Investigating' | 'Replacement Allocated' | 'Repacked' | 'QC Verified';
}

export interface OrderWorkflow {
  orderId: string;
  orderNumber: string;
  currentStageId: CanonicalWorkflowStageId | QualityIncidentStageId;
  currentStageIndex: number;
  stages: WorkflowStageInfo[];
  hasQualityIncident: boolean;
  incident?: QualityIncident;
  lastUpdated: string;
  autoDriveActive?: boolean;
}

export interface WorkflowEngineState {
  isLiveAutoDrive: boolean;
  speedMultiplier: number;
  activeOrdersInWorkflow: number;
  totalCompletedWorkflows: number;
  lastEventDescription: string;
  recentEvents: {
    id: string;
    orderNumber: string;
    stageLabel: string;
    timestamp: string;
    details: string;
    type: 'progression' | 'qc_fail' | 'inventory_deduct' | 'dispatch';
  }[];
}

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}
