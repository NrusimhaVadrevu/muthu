import { MonthlyOperationsReport } from './types';

export const INITIAL_MONTHLY_REPORTS: MonthlyOperationsReport[] = [
  {
    month: 'February 2026 (Current Month)',
    isCurrentMonth: true,
    executiveSummary: 'This month the warehouse processed 1,842 orders. SLA compliance improved by 7% following Muthu packer reallocations. Packing Station 2 emerged as the primary bottleneck during Week 3. Muthu recommends adding one additional packer during the 2 PM–6 PM shift to achieve an estimated 14% reduction in packing delays.',
    topAchievement: 'Zero SLA breaches on high-priority B2B hospital supply contracts across 480 shipments.',
    biggestRisk: 'Packing Station 2 conveyor congestion during 2 PM–6 PM peak shift hours.',
    primaryBottleneck: 'Packing Bench 2 Box Sealing Machine PM-02 maintenance outage.',
    topPerformerName: 'Ravi Kumar (98% SLA Contribution, 186 packages packed, 18% above team speed)',
    equipmentRiskName: 'Forklift FL-07 (Hydraulic service due in 3 days, 88% utilization)',
    inventoryRiskItem: 'Medical Sterile Packaging (SKU-PKG-1042) buffer at 14% safety threshold',
    muthuTopRecommendation: 'Reallocate 2 packers from Zone B to Packing Station 2 between 2 PM–6 PM to reduce packing delays by 14%.',

    orders: {
      received: 1842,
      picked: 1810,
      packed: 1780,
      dispatched: 1740,
      delivered: 1680,
      cancelled: 12,
      delayed: 8
    },
    logistics: {
      trucksDispatched: 72,
      trucksDelivered: 68,
      trucksReturning: 4,
      avgDispatchMinutes: 18.5,
      avgDeliveryHours: 4.2,
      delayedShipmentsCount: 2
    },
    workforce: {
      workersActive: 32,
      packagesPicked: 4120,
      packagesPacked: 3980,
      avgProductivityScore: 92.4,
      slaContributionPercent: 96.8,
      attendancePercent: 95.8
    },
    inventory: {
      unitsProcessed: 18500,
      lowStockEventsCount: 17,
      outOfStockEventsCount: 2,
      damagedItemsCount: 14,
      reordersTriggeredCount: 12
    },
    equipment: {
      machinesUsedCount: 18,
      maintenanceEventsCount: 3,
      downtimeHours: 6.5,
      backupEquipmentUsageHours: 18.0
    },
    businessImpact: {
      orderValueFulfilledInr: 14800000,
      estimatedRevenueSupportedInr: 16200000,
      estimatedDelayCostInr: 32000,
      estimatedEfficiencyPercent: 94.2,
      projectedImprovementPercent: 14.0
    }
  },
  {
    month: 'January 2026',
    isCurrentMonth: false,
    executiveSummary: 'In January, facility throughput reached 1,710 orders. Cold wave conditions along NH44 created regional highway fog disruptions which were mitigated by Muthu early dispatch routing. Zone B picking tote elevator experienced a brief jam during Week 2 surge.',
    topAchievement: 'Maintained 95.8% SLA compliance despite severe regional highway fog disruptions.',
    biggestRisk: 'Overnight shift driver availability along the Chennai logistics corridor.',
    primaryBottleneck: 'Zone B picking tote elevator jam during Week 2 surge.',
    topPerformerName: 'Vikram Singh (194 QC inspections, 0 defect escapes to customers)',
    equipmentRiskName: 'Automated Sorter AS-01 (Sensor calibration required)',
    inventoryRiskItem: 'Dual Monitor Mount Arms (SKU-FUR-1015) replenishment delay',
    muthuTopRecommendation: 'Deploy backup Forklift FL-03 to Outbound Dock 2 to shorten pallet loading cycle time.',

    orders: {
      received: 1710,
      picked: 1690,
      packed: 1660,
      dispatched: 1630,
      delivered: 1590,
      cancelled: 15,
      delayed: 14
    },
    logistics: {
      trucksDispatched: 68,
      trucksDelivered: 64,
      trucksReturning: 4,
      avgDispatchMinutes: 21.0,
      avgDeliveryHours: 4.8,
      delayedShipmentsCount: 4
    },
    workforce: {
      workersActive: 30,
      packagesPicked: 3850,
      packagesPacked: 3720,
      avgProductivityScore: 89.8,
      slaContributionPercent: 94.1,
      attendancePercent: 94.2
    },
    inventory: {
      unitsProcessed: 16900,
      lowStockEventsCount: 21,
      outOfStockEventsCount: 4,
      damagedItemsCount: 19,
      reordersTriggeredCount: 15
    },
    equipment: {
      machinesUsedCount: 18,
      maintenanceEventsCount: 5,
      downtimeHours: 11.2,
      backupEquipmentUsageHours: 24.5
    },
    businessImpact: {
      orderValueFulfilledInr: 13200000,
      estimatedRevenueSupportedInr: 14500000,
      estimatedDelayCostInr: 58000,
      estimatedEfficiencyPercent: 91.5,
      projectedImprovementPercent: 9.5
    }
  },
  {
    month: 'December 2025',
    isCurrentMonth: false,
    executiveSummary: 'Holiday and year-end inventory surge peaked at 1,950 orders. Warehouse productivity index exceeded 1.28 with seasonal contract workers integrated seamlessly. Mezzanine sorting operated at 95% capacity throughout the month.',
    topAchievement: 'Peak holiday dispatch volume of 1,890 orders with 95.0% on-time delivery.',
    biggestRisk: 'Packaging material depletion during mid-month promotional rush.',
    primaryBottleneck: 'Outbound dock trailer staging congestion between 5 PM and 8 PM.',
    topPerformerName: 'Meena Iyer (Directed 480 floor orders with zero SLA breaches)',
    equipmentRiskName: 'Main Conveyor CV-02 (Roller friction wear)',
    inventoryRiskItem: 'Heavy Duty Packaging Tape (SKU-PKG-1037) stock depletion',
    muthuTopRecommendation: 'Trigger automated supplier reorder 48 hours earlier for holiday packaging buffers.',

    orders: {
      received: 1950,
      picked: 1930,
      packed: 1910,
      dispatched: 1890,
      delivered: 1840,
      cancelled: 18,
      delayed: 16
    },
    logistics: {
      trucksDispatched: 80,
      trucksDelivered: 76,
      trucksReturning: 4,
      avgDispatchMinutes: 22.4,
      avgDeliveryHours: 4.5,
      delayedShipmentsCount: 5
    },
    workforce: {
      workersActive: 30,
      packagesPicked: 4400,
      packagesPacked: 4250,
      avgProductivityScore: 91.2,
      slaContributionPercent: 95.0,
      attendancePercent: 93.5
    },
    inventory: {
      unitsProcessed: 21000,
      lowStockEventsCount: 28,
      outOfStockEventsCount: 5,
      damagedItemsCount: 22,
      reordersTriggeredCount: 19
    },
    equipment: {
      machinesUsedCount: 18,
      maintenanceEventsCount: 6,
      downtimeHours: 14.0,
      backupEquipmentUsageHours: 32.0
    },
    businessImpact: {
      orderValueFulfilledInr: 16400000,
      estimatedRevenueSupportedInr: 17800000,
      estimatedDelayCostInr: 64000,
      estimatedEfficiencyPercent: 92.8,
      projectedImprovementPercent: 11.2
    }
  }
];
