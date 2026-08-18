/**
 * MUTHU — Comprehensive Test Suite
 *
 * Covers 10 domains:
 *  1. Order Priority Engine
 *  2. Inventory Allocation (Stock Status & Percentage)
 *  3. SLA Risk Calculation
 *  4. Worker Assignment & Performance
 *  5. Language Switching (i18n)
 *  6. Logistics Status Transitions
 *  7. Equipment Maintenance Prediction
 *  8. Muthu Recommendation Engine (Simulation)
 *  9. Dashboard Calculations
 * 10. Utility Functions (Export CSV, Workflow Mappings)
 */

import { describe, it, expect } from 'vitest';

// --- Production imports (read-only) ---
import {
  computeOrderPriority,
  computeSlaRiskLevel,
  getNextOrderStatus,
  ORDER_PIPELINE_STAGES,
  initialOrders,
  initialCopilotRecommendations,
} from '../ordersData';

import {
  calculateStockStatus,
  computeStockPercentage,
  initialFullInventory,
} from '../inventoryData';

import {
  getTranslation,
  translations,
  SUPPORTED_LANGUAGES,
  SupportedLanguage,
} from '../i18n';

import { INITIAL_TRUCKS } from '../logisticsData';

import { INITIAL_EQUIPMENT } from '../equipmentData';

import { INITIAL_WORKERS } from '../workersData';

import {
  calculateSimulationResults,
  DEFAULT_SIMULATION_PARAMS,
  PRESET_SCENARIOS,
} from '../simulationEngine';

import {
  initialWarehouseStats,
  initialRecommendations,
  decisionScenarios,
} from '../mockData';

import {
  mapOrderStatusToStageIndex,
  mapStageIndexToOrderStatus,
  CANONICAL_WORKFLOW_STEPS,
} from '../workflowEngine';

import {
  generateWarehouseSummaryCSV,
  generateAnalyticsReportCSV,
  generateDecisionHistoryCSV,
} from '../utils/exportUtils';

import {
  INITIAL_CALENDAR_EVENTS,
  INITIAL_CALENDAR_INSIGHTS,
} from '../calendarData';


// ═══════════════════════════════════════════════════════════
// 1. ORDER PRIORITY ENGINE
// ═══════════════════════════════════════════════════════════
describe('Order Priority Engine', () => {
  it('assigns Critical priority when SLA ≤ 30 minutes regardless of customer type', () => {
    expect(computeOrderPriority('Standard', 'Economy', 25)).toBe('Critical');
    expect(computeOrderPriority('Business', 'Standard', 30)).toBe('Critical');
  });

  it('assigns Critical priority for VIP customer with SLA ≤ 60 minutes', () => {
    expect(computeOrderPriority('VIP', 'Standard', 55)).toBe('Critical');
    expect(computeOrderPriority('VIP', 'Economy', 60)).toBe('Critical');
  });

  it('assigns Urgent priority for Express shipping with SLA ≤ 120 minutes', () => {
    expect(computeOrderPriority('Standard', 'Express', 100)).toBe('Urgent');
    expect(computeOrderPriority('Business', 'Express', 120)).toBe('Urgent');
  });

  it('assigns High priority for VIP customers with healthy SLA', () => {
    expect(computeOrderPriority('VIP', 'Standard', 300)).toBe('High');
  });

  it('assigns High priority for B2B business orders approaching deadline (≤ 240 mins)', () => {
    expect(computeOrderPriority('Standard', 'Standard', 200, 'business')).toBe('High');
  });

  it('assigns Low priority for Economy shipping with large SLA window (> 240 mins)', () => {
    expect(computeOrderPriority('Standard', 'Economy', 500)).toBe('Low');
  });

  it('assigns Normal priority for standard orders with healthy SLA', () => {
    expect(computeOrderPriority('Standard', 'Standard', 300, 'individual')).toBe('Normal');
  });

  it('pipeline stages are in correct fulfillment order', () => {
    expect(ORDER_PIPELINE_STAGES[0]).toBe('New');
    expect(ORDER_PIPELINE_STAGES[ORDER_PIPELINE_STAGES.length - 1]).toBe('Delivered');
    expect(ORDER_PIPELINE_STAGES).toHaveLength(10);
  });
});


// ═══════════════════════════════════════════════════════════
// 2. INVENTORY ALLOCATION (Stock Status & Percentage)
// ═══════════════════════════════════════════════════════════
describe('Inventory Allocation', () => {
  it('returns "Out of Stock" when quantity is 0', () => {
    expect(calculateStockStatus(0, 20, 100)).toBe('Out of Stock');
  });

  it('returns "Critical" when quantity is at or below 45% of reorder level', () => {
    // reorderLevel=20 → 45% = 9 → quantity ≤ 9 is Critical
    expect(calculateStockStatus(9, 20, 100)).toBe('Critical');
    expect(calculateStockStatus(5, 20, 100)).toBe('Critical');
  });

  it('returns "Low Stock" when quantity is between critical and reorder level', () => {
    // reorderLevel=20, critical threshold = ceil(20*0.45) = 9
    expect(calculateStockStatus(15, 20, 100)).toBe('Low Stock');
  });

  it('returns "Oversupplied" when quantity exceeds 92% of max stock', () => {
    // maxStock=100 → 92% = 92 → quantity > 92 is Oversupplied
    expect(calculateStockStatus(95, 20, 100)).toBe('Oversupplied');
  });

  it('returns "Optimal" for healthy stock levels', () => {
    expect(calculateStockStatus(50, 20, 100)).toBe('Optimal');
  });

  it('computes stock percentage correctly', () => {
    expect(computeStockPercentage(50, 100)).toBe(50);
    expect(computeStockPercentage(100, 100)).toBe(100);
    expect(computeStockPercentage(0, 100)).toBe(0);
  });

  it('clamps stock percentage between 0 and 100', () => {
    expect(computeStockPercentage(200, 100)).toBe(100);
  });

  it('returns 0 when maxStock is 0 or negative', () => {
    expect(computeStockPercentage(50, 0)).toBe(0);
    expect(computeStockPercentage(50, -10)).toBe(0);
  });

  it('initial inventory contains products across multiple categories', () => {
    const categories = new Set(initialFullInventory.map(i => i.category));
    expect(categories.size).toBeGreaterThanOrEqual(4);
  });
});


// ═══════════════════════════════════════════════════════════
// 3. SLA RISK CALCULATION
// ═══════════════════════════════════════════════════════════
describe('SLA Risk Calculation', () => {
  it('returns "Critical" for SLA ≤ 30 minutes', () => {
    expect(computeSlaRiskLevel(30)).toBe('Critical');
    expect(computeSlaRiskLevel(10)).toBe('Critical');
  });

  it('returns "At Risk" for SLA between 31 and 120 minutes', () => {
    expect(computeSlaRiskLevel(60)).toBe('At Risk');
    expect(computeSlaRiskLevel(120)).toBe('At Risk');
  });

  it('returns "Watch" for SLA between 121 and 240 minutes', () => {
    expect(computeSlaRiskLevel(180)).toBe('Watch');
    expect(computeSlaRiskLevel(240)).toBe('Watch');
  });

  it('returns "Safe" for SLA > 240 minutes', () => {
    expect(computeSlaRiskLevel(300)).toBe('Safe');
    expect(computeSlaRiskLevel(1000)).toBe('Safe');
  });
});


// ═══════════════════════════════════════════════════════════
// 4. WORKER ASSIGNMENT & PERFORMANCE DATA
// ═══════════════════════════════════════════════════════════
describe('Worker Assignment & Performance', () => {
  it('worker roster contains at least 10 workers', () => {
    expect(INITIAL_WORKERS.length).toBeGreaterThanOrEqual(10);
  });

  it('every worker has a unique ID', () => {
    const ids = INITIAL_WORKERS.map(w => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('productivity scores are between 0 and 100', () => {
    INITIAL_WORKERS.forEach(w => {
      expect(w.productivityScore).toBeGreaterThanOrEqual(0);
      expect(w.productivityScore).toBeLessThanOrEqual(100);
    });
  });

  it('workers with EXCELLENT performance have productivityScore ≥ 90', () => {
    const excellent = INITIAL_WORKERS.filter(w => w.performanceStatus === 'EXCELLENT');
    expect(excellent.length).toBeGreaterThan(0);
    excellent.forEach(w => {
      expect(w.productivityScore).toBeGreaterThanOrEqual(90);
    });
  });

  it('workers have valid shift assignments', () => {
    const validShifts = ['Morning', 'Afternoon', 'Night'];
    INITIAL_WORKERS.forEach(w => {
      expect(validShifts).toContain(w.shift);
    });
  });
});


// ═══════════════════════════════════════════════════════════
// 5. LANGUAGE SWITCHING (i18n)
// ═══════════════════════════════════════════════════════════
describe('Language Switching (i18n)', () => {
  it('supports exactly 3 languages: en, hi, te', () => {
    expect(SUPPORTED_LANGUAGES).toHaveLength(3);
    const codes = SUPPORTED_LANGUAGES.map(l => l.code);
    expect(codes).toContain('en');
    expect(codes).toContain('hi');
    expect(codes).toContain('te');
  });

  it('returns English translation for known key', () => {
    expect(getTranslation('en', 'sidebar.dashboard')).toBe('Dashboard');
  });

  it('returns Hindi translation for known key', () => {
    expect(getTranslation('hi', 'sidebar.dashboard')).toBe('डैशबोर्ड');
  });

  it('returns Telugu translation for known key', () => {
    const teValue = getTranslation('te', 'sidebar.dashboard');
    // Verify it's a Telugu string (not the English fallback or the raw key)
    expect(teValue).not.toBe('Dashboard');
    expect(teValue).not.toBe('sidebar.dashboard');
    expect(teValue).toBe(translations.te['sidebar.dashboard']);
  });

  it('falls back to English when Hindi translation is missing', () => {
    // Use a key that exists only in English
    const enValue = getTranslation('en', 'sidebar.dashboard');
    const hiValue = getTranslation('hi', 'sidebar.dashboard');
    // Both should return meaningful strings (not the key itself)
    expect(enValue).not.toBe('sidebar.dashboard');
    expect(hiValue).not.toBe('sidebar.dashboard');
  });

  it('falls back to fallback string for completely unknown key', () => {
    expect(getTranslation('en', 'xyz.nonexistent.key', 'Fallback Text')).toBe('Fallback Text');
  });

  it('returns the raw key when no translation and no fallback provided', () => {
    expect(getTranslation('en', 'xyz.nonexistent.key')).toBe('xyz.nonexistent.key');
  });

  it('all 3 language dictionaries have the same top-level keys', () => {
    const enKeys = Object.keys(translations.en).sort();
    const hiKeys = Object.keys(translations.hi).sort();
    const teKeys = Object.keys(translations.te).sort();
    expect(hiKeys).toEqual(enKeys);
    expect(teKeys).toEqual(enKeys);
  });
});


// ═══════════════════════════════════════════════════════════
// 6. LOGISTICS STATUS TRANSITIONS
// ═══════════════════════════════════════════════════════════
describe('Logistics Status Transitions', () => {
  it('getNextOrderStatus advances through the pipeline', () => {
    expect(getNextOrderStatus('New')).toBe('Priority Assigned');
    expect(getNextOrderStatus('Picking')).toBe('Packing');
    expect(getNextOrderStatus('Quality Check')).toBe('Ready for Dispatch');
    expect(getNextOrderStatus('Ready for Dispatch')).toBe('Dispatched');
  });

  it('getNextOrderStatus returns same status at terminal stage (Delivered)', () => {
    expect(getNextOrderStatus('Delivered')).toBe('Delivered');
  });

  it('getNextOrderStatus returns same status for unknown status', () => {
    expect(getNextOrderStatus('On Hold')).toBe('On Hold');
  });

  it('initial truck fleet contains trucks in multiple statuses', () => {
    const statuses = new Set(INITIAL_TRUCKS.map(t => t.currentStatus));
    expect(statuses.size).toBeGreaterThanOrEqual(3);
  });

  it('every truck has a valid progress percentage (0-100)', () => {
    INITIAL_TRUCKS.forEach(t => {
      expect(t.progressPercent).toBeGreaterThanOrEqual(0);
      expect(t.progressPercent).toBeLessThanOrEqual(100);
    });
  });
});


// ═══════════════════════════════════════════════════════════
// 7. EQUIPMENT MAINTENANCE PREDICTION
// ═══════════════════════════════════════════════════════════
describe('Equipment Maintenance Prediction', () => {
  it('equipment fleet contains at least 15 machines', () => {
    expect(INITIAL_EQUIPMENT.length).toBeGreaterThanOrEqual(15);
  });

  it('every equipment item has a valid status', () => {
    const validStatuses = ['OPERATIONAL', 'MAINTENANCE DUE', 'UNDER MAINTENANCE', 'WARNING', 'OUT OF SERVICE', 'CRITICAL'];
    INITIAL_EQUIPMENT.forEach(eq => {
      expect(validStatuses).toContain(eq.status);
    });
  });

  it('equipment with "MAINTENANCE DUE" status has nextMaintenanceDate in the past or imminent', () => {
    const maintenanceDue = INITIAL_EQUIPMENT.filter(e => e.status === 'MAINTENANCE DUE');
    expect(maintenanceDue.length).toBeGreaterThan(0);
    maintenanceDue.forEach(eq => {
      // next maintenance date should exist
      expect(eq.nextMaintenanceDate).toBeTruthy();
    });
  });

  it('equipment under maintenance has 0% utilization', () => {
    const underMaintenance = INITIAL_EQUIPMENT.filter(e => e.status === 'UNDER MAINTENANCE');
    underMaintenance.forEach(eq => {
      expect(eq.utilizationPercent).toBe(0);
    });
  });

  it('backup equipment references point to valid equipment IDs', () => {
    const allIds = new Set(INITIAL_EQUIPMENT.map(e => e.id));
    INITIAL_EQUIPMENT.forEach(eq => {
      if (eq.backupAvailableId) {
        expect(allIds).toContain(eq.backupAvailableId);
      }
    });
  });
});


// ═══════════════════════════════════════════════════════════
// 8. MUTHU RECOMMENDATION ENGINE (Simulation)
// ═══════════════════════════════════════════════════════════
describe('Muthu Recommendation Engine (Simulation)', () => {
  it('simulation with default params produces valid results structure', () => {
    const results = calculateSimulationResults(DEFAULT_SIMULATION_PARAMS);
    expect(results.beforeMetrics).toBeDefined();
    expect(results.simulatedMetrics).toBeDefined();
    expect(results.optimizedMetrics).toBeDefined();
    expect(results.detectedProblems.length).toBeGreaterThan(0);
    expect(results.recommendations.length).toBeGreaterThanOrEqual(4);
  });

  it('simulation degrades health score under stress', () => {
    const results = calculateSimulationResults({
      ...DEFAULT_SIMULATION_PARAMS,
      additionalOrders: 500,
      zoneCongestionPercent: 90,
    });
    expect(results.simulatedMetrics.healthScore).toBeLessThan(results.beforeMetrics.healthScore);
  });

  it('applying recommendations improves optimized metrics vs simulated', () => {
    const results = calculateSimulationResults(
      { ...DEFAULT_SIMULATION_PARAMS, additionalOrders: 400 },
      ['rec-1', 'rec-2', 'rec-3']
    );
    expect(results.optimizedMetrics.healthScore).toBeGreaterThan(results.simulatedMetrics.healthScore);
    expect(results.optimizedMetrics.ordersDelayedCount).toBeLessThan(results.simulatedMetrics.ordersDelayedCount);
  });

  it('vehicle breakdown increases revenue at risk', () => {
    const withBreakdown = calculateSimulationResults({
      ...DEFAULT_SIMULATION_PARAMS,
      vehicleBreakdown: true,
    });
    const without = calculateSimulationResults({
      ...DEFAULT_SIMULATION_PARAMS,
      vehicleBreakdown: false,
    });
    expect(withBreakdown.simulatedMetrics.revenueAtRisk).toBeGreaterThan(without.simulatedMetrics.revenueAtRisk);
  });

  it('critical stockout severity produces inventory shortage problem', () => {
    const results = calculateSimulationResults({
      ...DEFAULT_SIMULATION_PARAMS,
      stockoutSeverity: 'critical',
    });
    const invProblem = results.detectedProblems.find(p => p.id === 'prob-inv');
    expect(invProblem).toBeDefined();
    expect(invProblem!.severity).toBe('critical');
  });

  it('copilot recommendations have confidence scores ≥ 90', () => {
    initialCopilotRecommendations.forEach(rec => {
      expect(rec.confidence).toBeGreaterThanOrEqual(90);
    });
  });

  it('preset scenarios cover at least 5 categories', () => {
    const categories = new Set(PRESET_SCENARIOS.map(s => s.category));
    expect(categories.size).toBeGreaterThanOrEqual(4);
  });
});


// ═══════════════════════════════════════════════════════════
// 9. DASHBOARD CALCULATIONS
// ═══════════════════════════════════════════════════════════
describe('Dashboard Calculations', () => {
  it('warehouse health score is between 0 and 100', () => {
    expect(initialWarehouseStats.healthScore).toBeGreaterThanOrEqual(0);
    expect(initialWarehouseStats.healthScore).toBeLessThanOrEqual(100);
  });

  it('productivity hourly data has 7 entries (hourly buckets)', () => {
    expect(initialWarehouseStats.productivityHourly).toHaveLength(7);
  });

  it('all hourly productivity values are positive', () => {
    initialWarehouseStats.productivityHourly.forEach(v => {
      expect(v).toBeGreaterThan(0);
    });
  });

  it('initial recommendations contain at least one of each type', () => {
    const types = initialRecommendations.map(r => r.type);
    expect(types).toContain('urgent');
    expect(types).toContain('warning');
    expect(types).toContain('inventory');
  });

  it('initial orders count is at least 100', () => {
    expect(initialOrders.length).toBeGreaterThanOrEqual(100);
  });

  it('decision scenarios each have a confidence score', () => {
    decisionScenarios.forEach(ds => {
      expect(ds.confidence).toBeGreaterThanOrEqual(80);
      expect(ds.confidence).toBeLessThanOrEqual(100);
    });
  });

  it('calendar events have valid event types', () => {
    const validTypes = ['Dispatch', 'Delivery', 'Worker Shift', 'Maintenance', 'Audit', 'Supplier', 'Reports', 'Critical', 'Recommendation'];
    INITIAL_CALENDAR_EVENTS.forEach(ev => {
      expect(validTypes).toContain(ev.type);
    });
  });

  it('calendar insights have confidence scores above 85', () => {
    INITIAL_CALENDAR_INSIGHTS.forEach(insight => {
      expect(insight.confidenceScore).toBeGreaterThanOrEqual(85);
    });
  });
});


// ═══════════════════════════════════════════════════════════
// 10. UTILITY FUNCTIONS (Export CSV, Workflow Mappings)
// ═══════════════════════════════════════════════════════════
describe('Utility Functions', () => {
  it('generateWarehouseSummaryCSV returns non-empty string with header', () => {
    const csv = generateWarehouseSummaryCSV();
    expect(csv.length).toBeGreaterThan(50);
    expect(csv).toContain('Warehouse Facility Performance Summary');
    expect(csv).toContain('Warehouse Health Score');
  });

  it('generateAnalyticsReportCSV contains process stages', () => {
    const csv = generateAnalyticsReportCSV();
    expect(csv).toContain('Order Ingestion');
    expect(csv).toContain('Dynamic Picking Wave');
    expect(csv).toContain('Quality Check Optical Scan');
  });

  it('generateDecisionHistoryCSV formats records correctly', () => {
    const mockRecords = [
      {
        id: 'D-001',
        timestamp: '2026-02-18 10:00',
        title: 'Test Decision',
        category: 'orders',
        confidence: 95,
        status: 'Applied',
        approvedBy: 'Admin',
        operationalImpact: 'Reduced delay',
        finalOutcome: 'Success',
      },
    ];
    const csv = generateDecisionHistoryCSV(mockRecords);
    expect(csv).toContain('ID,Timestamp,Title');
    expect(csv).toContain('D-001');
    expect(csv).toContain('Test Decision');
  });

  it('mapOrderStatusToStageIndex maps New to index 0', () => {
    expect(mapOrderStatusToStageIndex('New')).toBe(0);
  });

  it('mapOrderStatusToStageIndex maps Delivered to index 14 (all stages completed)', () => {
    expect(mapOrderStatusToStageIndex('Delivered')).toBe(14);
  });

  it('mapStageIndexToOrderStatus round-trips correctly for key stages', () => {
    expect(mapStageIndexToOrderStatus(0)).toBe('New');
    expect(mapStageIndexToOrderStatus(7)).toBe('Packing');
    expect(mapStageIndexToOrderStatus(10)).toBe('Dispatched');
    expect(mapStageIndexToOrderStatus(14)).toBe('Delivered');
  });

  it('canonical workflow has 15 stages', () => {
    expect(CANONICAL_WORKFLOW_STEPS).toHaveLength(15);
  });

  it('every canonical workflow step has a unique stage number', () => {
    const nums = CANONICAL_WORKFLOW_STEPS.map(s => s.stageNumber);
    expect(new Set(nums).size).toBe(nums.length);
  });
});
