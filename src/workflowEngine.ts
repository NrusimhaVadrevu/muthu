import {
  Order,
  InventoryItem,
  WarehouseStats,
  OrderStatus,
  OrderWorkflow,
  WorkflowStageInfo,
  CanonicalWorkflowStageId,
  QualityIncidentStageId,
  QualityIncident,
  WorkflowEngineState
} from './types';

export interface CanonicalStepDefinition {
  id: CanonicalWorkflowStageId;
  label: string;
  defaultWorker: string;
  estimatedDuration: string;
  icon: string;
  stageNumber: number;
}

export const CANONICAL_WORKFLOW_STEPS: CanonicalStepDefinition[] = [
  {
    stageNumber: 1,
    id: 'order_created',
    label: 'Order Created',
    defaultWorker: 'ERP Gateway (Automated)',
    estimatedDuration: '1m',
    icon: 'add_shopping_cart'
  },
  {
    stageNumber: 2,
    id: 'priority_determined',
    label: 'Priority Determined',
    defaultWorker: 'Muthu SLA Priority Engine',
    estimatedDuration: '2m',
    icon: 'rule'
  },
  {
    stageNumber: 3,
    id: 'inventory_checked',
    label: 'Inventory Checked',
    defaultWorker: 'WMS Inventory Auditor',
    estimatedDuration: '3m',
    icon: 'search_check'
  },
  {
    stageNumber: 4,
    id: 'inventory_reserved',
    label: 'Inventory Reserved',
    defaultWorker: 'Slotting Reserve Bot',
    estimatedDuration: '2m',
    icon: 'bookmark_added'
  },
  {
    stageNumber: 5,
    id: 'inventory_allocated',
    label: 'Inventory Allocated',
    defaultWorker: 'Bin Allocation Agent',
    estimatedDuration: '3m',
    icon: 'assignment_turned_in'
  },
  {
    stageNumber: 6,
    id: 'picker_assigned',
    label: 'Picker Assigned',
    defaultWorker: 'Dynamic Route Optimizer',
    estimatedDuration: '1m',
    icon: 'person_pin_circle'
  },
  {
    stageNumber: 7,
    id: 'picking',
    label: 'Picking',
    defaultWorker: 'Assigned Picker',
    estimatedDuration: '12m',
    icon: 'transfer_within_a_station'
  },
  {
    stageNumber: 8,
    id: 'packing',
    label: 'Packing',
    defaultWorker: 'Assigned Packer',
    estimatedDuration: '8m',
    icon: 'inventory_2'
  },
  {
    stageNumber: 9,
    id: 'quality_check',
    label: 'Quality Check',
    defaultWorker: 'Viktor V. (Lead QC Specialist)',
    estimatedDuration: '4m',
    icon: 'verified_user'
  },
  {
    stageNumber: 10,
    id: 'ready_for_dispatch',
    label: 'Ready for Dispatch',
    defaultWorker: 'Dock Marshall Station',
    estimatedDuration: '5m',
    icon: 'local_shipping'
  },
  {
    stageNumber: 11,
    id: 'dispatched',
    label: 'Dispatched',
    defaultWorker: 'Carrier Freight Logistics',
    estimatedDuration: '15m',
    icon: 'departure_board'
  },
  {
    stageNumber: 12,
    id: 'delivered',
    label: 'Delivered',
    defaultWorker: 'Regional Courier Hub',
    estimatedDuration: '45m',
    icon: 'done_all'
  },
  {
    stageNumber: 13,
    id: 'inventory_updated',
    label: 'Inventory Updated',
    defaultWorker: 'Ledger Reconciliation Bot',
    estimatedDuration: '1m',
    icon: 'sync_saved_locally'
  },
  {
    stageNumber: 14,
    id: 'dashboard_updated',
    label: 'Dashboard Updated',
    defaultWorker: 'Real-time Telemetry Service',
    estimatedDuration: '1m',
    icon: 'speed'
  },
  {
    stageNumber: 15,
    id: 'analytics_updated',
    label: 'Analytics Updated',
    defaultWorker: 'Predictive Compute Cluster',
    estimatedDuration: '1m',
    icon: 'monitoring'
  }
];

export const INCIDENT_WORKFLOW_STEPS: {
  id: QualityIncidentStageId;
  label: string;
  defaultWorker: string;
  estimatedDuration: string;
  icon: string;
  stageNumber: number;
}[] = [
  {
    stageNumber: 10,
    id: 'issue_detected',
    label: 'Issue Detected',
    defaultWorker: 'Viktor V. (QC Specialist)',
    estimatedDuration: '2m',
    icon: 'report_problem'
  },
  {
    stageNumber: 11,
    id: 'create_incident',
    label: 'Create Incident',
    defaultWorker: 'Incident Triage AI',
    estimatedDuration: '2m',
    icon: 'warning'
  },
  {
    stageNumber: 12,
    id: 'allocate_replacement',
    label: 'Allocate Replacement Inventory',
    defaultWorker: 'Zone Buffer Manager',
    estimatedDuration: '5m',
    icon: 'swap_horiz'
  },
  {
    stageNumber: 13,
    id: 'repack',
    label: 'Repack',
    defaultWorker: 'Pack Station 2',
    estimatedDuration: '6m',
    icon: 'package_2'
  },
  {
    stageNumber: 14,
    id: 'repeat_qc',
    label: 'Repeat Quality Check',
    defaultWorker: 'Viktor V. (Senior QC Specialist)',
    estimatedDuration: '3m',
    icon: 'fact_check'
  },
  {
    stageNumber: 15,
    id: 'dispatch',
    label: 'Dispatch',
    defaultWorker: 'Dock Bay Express Line',
    estimatedDuration: '10m',
    icon: 'local_shipping'
  }
];

/**
 * Maps a standard order status string to canonical workflow stage index (0 to 14)
 */
export function mapOrderStatusToStageIndex(status: OrderStatus): number {
  switch (status) {
    case 'New':
      return 0; // Order Created
    case 'Priority Assigned':
      return 1; // Priority Determined
    case 'Inventory Checked':
      return 2; // Inventory Checked
    case 'Stock Allocated':
      return 4; // Inventory Allocated
    case 'Picking':
    case 'Active Picking':
      return 6; // Picking
    case 'Packing':
      return 7; // Packing
    case 'Quality Check':
    case 'Quality Control':
      return 8; // Quality Check
    case 'Ready for Dispatch':
      return 9; // Ready for Dispatch
    case 'Dispatched':
      return 10; // Dispatched
    case 'Delivered':
      return 14; // All 15 stages completed (including inventory, dashboard, analytics updated)
    case 'On Hold':
      return 8; // Held at QC
    default:
      return 0;
  }
}

/**
 * Maps a workflow stage index back to the OrderStatus string
 */
export function mapStageIndexToOrderStatus(index: number): OrderStatus {
  if (index <= 0) return 'New';
  if (index === 1) return 'Priority Assigned';
  if (index === 2) return 'Inventory Checked';
  if (index === 3 || index === 4) return 'Stock Allocated';
  if (index === 5 || index === 6) return 'Picking';
  if (index === 7) return 'Packing';
  if (index === 8) return 'Quality Check';
  if (index === 9) return 'Ready for Dispatch';
  if (index === 10) return 'Dispatched';
  return 'Delivered';
}

/**
 * Generates initial workflow structure with realistic timestamp trail for an order
 */
export function generateOrderWorkflow(order: Order, options?: { forceIncident?: boolean }): OrderWorkflow {
  const targetStageIndex = mapOrderStatusToStageIndex(order.currentStatus);

  const baseHour = 9;
  const baseMinutes = 15;

  const stages: WorkflowStageInfo[] = CANONICAL_WORKFLOW_STEPS.map((step, idx) => {
    let status: 'completed' | 'active' | 'pending' | 'failed' = 'pending';
    if (idx < targetStageIndex) {
      status = 'completed';
    } else if (idx === targetStageIndex) {
      status = 'active';
    }

    // Determine assigned worker
    let assignedWorker = step.defaultWorker;
    if (step.id === 'picking' && order.assignedPicker) {
      assignedWorker = `${order.assignedPicker} (Zone ${order.warehouseZone || 'A'})`;
    } else if (step.id === 'packing' && order.assignedPacker) {
      assignedWorker = `${order.assignedPacker} (Pack Station 4)`;
    } else if (step.id === 'dispatched' && order.carrier) {
      assignedWorker = `${order.carrier} Outbound Freight`;
    }

    // Generate incremental timestamp
    const minuteOffset = idx * 6;
    const hour = baseHour + Math.floor((baseMinutes + minuteOffset) / 60);
    const minute = (baseMinutes + minuteOffset) % 60;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    const timestamp = `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;

    // Generate actual duration
    let actualDuration = 'Pending';
    if (status === 'completed') {
      const estNum = parseInt(step.estimatedDuration, 10) || 5;
      const actualVal = Math.max(1, estNum - 1);
      actualDuration = `${actualVal}m`;
    } else if (status === 'active') {
      actualDuration = 'In Progress';
    }

    return {
      id: step.id,
      label: step.label,
      stageNumber: step.stageNumber,
      status,
      assignedWorker,
      timestamp,
      estimatedDuration: step.estimatedDuration,
      actualDuration,
      icon: step.icon,
      notes: getStageNote(step.id, order)
    };
  });

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    currentStageId: stages[targetStageIndex]?.id || 'order_created',
    currentStageIndex: targetStageIndex,
    stages,
    hasQualityIncident: Boolean(options?.forceIncident),
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}

function getStageNote(stageId: CanonicalWorkflowStageId, order: Order): string {
  switch (stageId) {
    case 'order_created':
      return `Manifest verified for ${order.itemCount} units across ${order.warehouseZone}.`;
    case 'priority_determined':
      return `Priority locked to [${order.priority}] based on customer ${order.customerType} SLA.`;
    case 'inventory_checked':
      return 'Stock verified available in high-velocity primary picking aisles.';
    case 'inventory_reserved':
      return 'Reserved stock units pinned in database to prevent double-booking.';
    case 'inventory_allocated':
      return `Bin locations allocated: Pick wave assigned to ${order.warehouseZone}.`;
    case 'picker_assigned':
      return `Route generated for ${order.assignedPicker}. Travel distance minimized.`;
    case 'picking':
      return `Active scanning of items: ${order.items?.length || 1} distinct SKUs.`;
    case 'packing':
      return `Box size verified, bubble wrap packaging sealed by ${order.assignedPacker}.`;
    case 'quality_check':
      return 'Barcode checksum, weight scale calibration, and destination seal verified.';
    case 'ready_for_dispatch':
      return `Staged at Dock Bay for ${order.carrier || 'Express Logistics'}.`;
    case 'dispatched':
      return `Carrier manifest signed. Tracking: ${order.trackingNumber || 'TRK-9821-MTH'}.`;
    case 'delivered':
      return 'Destination courier completed doorstep verification.';
    case 'inventory_updated':
      return 'Physical stock reconciled with ERP central ledger.';
    case 'dashboard_updated':
      return 'Dispatched units count and facility productivity charts refreshed.';
    case 'analytics_updated':
      return 'Hourly fulfillment cycle time and on-time dispatch rate registered.';
  }
}

/**
 * Advances a workflow to its next sequential stage, synchronizing state with inventory, stats, and orders.
 */
export function advanceWorkflowStep(
  workflow: OrderWorkflow,
  order: Order,
  inventory: InventoryItem[],
  stats: WarehouseStats
): {
  updatedWorkflow: OrderWorkflow;
  updatedOrder: Order;
  updatedInventory: InventoryItem[];
  updatedStats: WarehouseStats;
  eventDescription: string;
  eventType: 'progression' | 'qc_fail' | 'inventory_deduct' | 'dispatch';
} {
  const totalStages = workflow.stages.length;
  const nextIndex = Math.min(workflow.currentStageIndex + 1, totalStages - 1);
  const nextStage = workflow.stages[nextIndex];

  // Update workflow stages: Only ONE stage is active at a time!
  const updatedStages: WorkflowStageInfo[] = workflow.stages.map((stage, idx) => {
    if (idx < nextIndex) {
      return {
        ...stage,
        status: 'completed',
        actualDuration: stage.actualDuration === 'In Progress' || stage.actualDuration === 'Pending' ? stage.estimatedDuration : stage.actualDuration
      };
    } else if (idx === nextIndex) {
      return {
        ...stage,
        status: 'active',
        actualDuration: 'In Progress',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      return {
        ...stage,
        status: 'pending',
        actualDuration: 'Pending'
      };
    }
  });

  const nextOrderStatus = mapStageIndexToOrderStatus(nextIndex);
  const updatedOrder: Order = {
    ...order,
    currentStatus: nextOrderStatus,
    status: nextOrderStatus
  };

  let updatedInventory = [...inventory];
  let updatedStats = { ...stats };
  let eventDescription = `Order ${order.orderNumber} advanced to ${nextStage.label}`;
  let eventType: 'progression' | 'qc_fail' | 'inventory_deduct' | 'dispatch' = 'progression';

  // Specific side effects on key stages
  if (nextStage.id === 'inventory_reserved' || nextStage.id === 'inventory_allocated') {
    // Reserve stock in inventory
    const orderSkus = new Set(order.items?.map((it) => it.sku));
    updatedInventory = updatedInventory.map((item) => {
      if (orderSkus.has(item.sku)) {
        const orderItem = order.items?.find((it) => it.sku === item.sku);
        const qty = orderItem?.quantity || 1;
        return {
          ...item,
          reservedQuantity: item.reservedQuantity + qty,
          quantityAvailable: Math.max(0, item.quantityAvailable - qty)
        };
      }
      return item;
    });
    eventDescription = `Inventory reserved and allocated for Order ${order.orderNumber}.`;
  } else if (nextStage.id === 'dispatched' || nextStage.id === 'inventory_updated') {
    // Outbound shipment finalized: deduct from reserved inventory permanently!
    const orderSkus = new Set(order.items?.map((it) => it.sku));
    updatedInventory = updatedInventory.map((item) => {
      if (orderSkus.has(item.sku)) {
        const orderItem = order.items?.find((it) => it.sku === item.sku);
        const qty = orderItem?.quantity || 1;
        return {
          ...item,
          reservedQuantity: Math.max(0, item.reservedQuantity - qty)
        };
      }
      return item;
    });

    updatedStats = {
      ...updatedStats,
      ordersDispatched: updatedStats.ordersDispatched + 1,
      ordersTargetPercent: Math.min(100, updatedStats.ordersTargetPercent + 1),
      healthScore: Math.min(100, updatedStats.healthScore + 1)
    };
    eventDescription = `Order ${order.orderNumber} Dispatched. Inventory deducted and warehouse throughput updated.`;
    eventType = 'dispatch';
  } else if (nextStage.id === 'dashboard_updated' || nextStage.id === 'analytics_updated') {
    updatedStats = {
      ...updatedStats,
      productivityIndex: Number((updatedStats.productivityIndex + 0.01).toFixed(2))
    };
    eventDescription = `Warehouse dashboard and analytics synchronized for Order ${order.orderNumber}.`;
  }

  const updatedWorkflow: OrderWorkflow = {
    ...workflow,
    currentStageId: nextStage.id,
    currentStageIndex: nextIndex,
    stages: updatedStages,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  return {
    updatedWorkflow,
    updatedOrder,
    updatedInventory,
    updatedStats,
    eventDescription,
    eventType
  };
}

/**
 * Triggers the Quality Check failure incident branch:
 * Quality Check -> Issue Detected -> Create Incident -> Allocate Replacement Inventory -> Repack -> Repeat Quality Check -> Dispatch
 */
export function triggerQualityIncident(
  workflow: OrderWorkflow,
  order: Order,
  issueReason: string = 'Barcode mismatch and packaging seal tear detected at Station 2'
): {
  updatedWorkflow: OrderWorkflow;
  updatedOrder: Order;
  incident: QualityIncident;
  eventDescription: string;
} {
  const incident: QualityIncident = {
    incidentId: `INC-${Date.now().toString().slice(-4)}`,
    orderId: order.id,
    detectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    issueReason,
    replacementSku: order.items?.[0]?.sku || 'SKU-ELC-1001',
    replacementQuantity: order.items?.[0]?.quantity || 1,
    assignedInspector: 'Viktor V. (Senior QC Specialist)',
    status: 'Investigating'
  };

  // Build the incident resolution stages
  const incidentStages: WorkflowStageInfo[] = [
    // Preceding completed stages
    ...workflow.stages.slice(0, 8).map((s) => ({ ...s, status: 'completed' as const })),
    // QC Stage marked as Failed
    {
      id: 'quality_check',
      label: 'Quality Check (Failed)',
      stageNumber: 9,
      status: 'failed',
      assignedWorker: 'Viktor V. (Lead QC Specialist)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedDuration: '4m',
      actualDuration: 'Defect Flagged',
      icon: 'cancel',
      notes: `Defect: ${issueReason}`
    },
    {
      id: 'issue_detected',
      label: 'Issue Detected',
      stageNumber: 10,
      status: 'active',
      assignedWorker: 'Viktor V. (QC Specialist)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      estimatedDuration: '2m',
      actualDuration: 'In Progress',
      icon: 'report_problem',
      notes: 'Automated barcode scanner flagged physical carton distortion.'
    },
    {
      id: 'create_incident',
      label: 'Create Incident',
      stageNumber: 11,
      status: 'pending',
      assignedWorker: 'Incident Triage AI',
      timestamp: 'Pending',
      estimatedDuration: '2m',
      actualDuration: 'Pending',
      icon: 'warning',
      notes: `Logged ticket #${incident.incidentId} in WMS exception registry.`
    },
    {
      id: 'allocate_replacement',
      label: 'Allocate Replacement Inventory',
      stageNumber: 12,
      status: 'pending',
      assignedWorker: 'Zone Buffer Manager',
      timestamp: 'Pending',
      estimatedDuration: '5m',
      actualDuration: 'Pending',
      icon: 'swap_horiz',
      notes: `Pulling replacement unit (${incident.replacementSku}) from Reserve Aisle 12.`
    },
    {
      id: 'repack',
      label: 'Repack',
      stageNumber: 13,
      status: 'pending',
      assignedWorker: 'Maya Chen (Pack Station 2)',
      timestamp: 'Pending',
      estimatedDuration: '6m',
      actualDuration: 'Pending',
      icon: 'package_2',
      notes: 'Transferring to reinforced carton with fresh shipping label.'
    },
    {
      id: 'repeat_qc',
      label: 'Repeat Quality Check',
      stageNumber: 14,
      status: 'pending',
      assignedWorker: 'Viktor V. (Senior QC Specialist)',
      timestamp: 'Pending',
      estimatedDuration: '3m',
      actualDuration: 'Pending',
      icon: 'fact_check',
      notes: 'Final verification of replacement serial number.'
    },
    {
      id: 'dispatch',
      label: 'Dispatch',
      stageNumber: 15,
      status: 'pending',
      assignedWorker: 'Dock Bay Express Line',
      timestamp: 'Pending',
      estimatedDuration: '10m',
      actualDuration: 'Pending',
      icon: 'local_shipping',
      notes: 'Expedited dock staging.'
    }
  ];

  const updatedOrder: Order = {
    ...order,
    currentStatus: 'On Hold',
    status: 'On Hold',
    notes: `[QC INCIDENT #${incident.incidentId}]: ${issueReason}`
  };

  const updatedWorkflow: OrderWorkflow = {
    ...workflow,
    currentStageId: 'issue_detected',
    currentStageIndex: 9, // index of issue_detected
    stages: incidentStages,
    hasQualityIncident: true,
    incident,
    lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  return {
    updatedWorkflow,
    updatedOrder,
    incident,
    eventDescription: `Quality Check failed for Order ${order.orderNumber}: ${issueReason}. Incident ${incident.incidentId} created.`
  };
}

export const initialWorkflowEngineState: WorkflowEngineState = {
  isLiveAutoDrive: true,
  speedMultiplier: 1,
  activeOrdersInWorkflow: 18,
  totalCompletedWorkflows: 482,
  lastEventDescription: 'Workflow Engine initialized. 18 orders actively streaming through fulfillment stages.',
  recentEvents: [
    {
      id: 'ev-1',
      orderNumber: 'ORD-89104',
      stageLabel: 'Picking in Progress',
      timestamp: 'Just now',
      details: 'Picker Ravi Kumar scanned 3 items in Zone B.',
      type: 'progression'
    },
    {
      id: 'ev-2',
      orderNumber: 'ORD-89112',
      stageLabel: 'Dispatched & Ledger Updated',
      timestamp: '2m ago',
      details: 'FedEx carrier signed manifest. 14 units deducted from physical inventory.',
      type: 'dispatch'
    },
    {
      id: 'ev-3',
      orderNumber: 'ORD-89125',
      stageLabel: 'Inventory Allocated',
      timestamp: '5m ago',
      details: 'Reserve slots pinned for VIP customer shipment.',
      type: 'inventory_deduct'
    }
  ]
};
