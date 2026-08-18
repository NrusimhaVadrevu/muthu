/**
 * Real browser file download helper for CSV and text reports.
 */
export function downloadFile(filename: string, content: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function generateWarehouseSummaryCSV(): string {
  return `Warehouse Facility Performance Summary - MUTHU Intelligence
Generated Date,${new Date().toISOString()}
Facility,Bay-04 Central Fulfillment
Shift,Shift 1 (Active)

Metric,Current Value,Benchmark,Status
Warehouse Health Score,94 / 100,90 / 100,Optimal
Orders Processed,55 Active / 1402 Total,1200 / day,+16% above target
SLA On-Time Compliance,99.4%,98.0%,Protected
Worker Utilization Rate,81.4%,85.0%,Optimal
Avg Order Cycle Time,36.4 minutes,45.0 minutes,-19% latency
Quality Check First-Pass Yield,99.6%,99.0%,Protected
Dock Staging Velocity,14.1 minutes,18.0 minutes,On Schedule
`;
}

export function generateAnalyticsReportCSV(): string {
  return `MUTHU Executive Analytics & Telemetry Report
Generated Date,${new Date().toISOString()}

Process Stage,Avg Cycle Time (min),Efficiency,Throughput Rate,AI Status
Order Ingestion & AI Priority,1.8,Optimal,120 pkgs/hr,Automated
Inventory Audit & Allocation,2.6,Optimal,110 pkgs/hr,Synchronized
Dynamic Picking Wave,11.4,Fast,94 pkgs/hr,TSP Optimized
Packaging & Seal Station,7.2,Optimal,88 pkgs/hr,Dual-Lane Active
Quality Check Optical Scan,3.4,Optimal,99.6% Yield,Verified
Dock Staging & Trailer Dispatch,14.1,Optimal,14 trailers/day,On Schedule
`;
}

export function generateDecisionHistoryCSV(records: any[]): string {
  const headers = 'ID,Timestamp,Title,Category,Confidence,Status,Approved By,Operational Impact,Final Outcome\n';
  const rows = records.map(r => 
    `"${r.id}","${r.timestamp}","${r.title}","${r.category}","${r.confidence}%","${r.status}","${r.approvedBy}","${r.operationalImpact}","${r.finalOutcome}"`
  ).join('\n');
  return headers + rows;
}

export function generateWorkerPerformanceCSV(workers: any[]): string {
  const headers = 'ID,Name,Role,Shift,Status,Utilization Rate,Tasks Completed,Avg Pick Time (min),Avg Pack Time (min),Zone\n';
  const rows = workers.map(w =>
    `"${w.id}","${w.name}","${w.role}","${w.shift}","${w.status}","${w.utilizationRate}%","${w.tasksCompleted}","${w.avgPickingTime}","${w.avgPackingTime}","${w.zone}"`
  ).join('\n');
  return headers + rows;
}

export function generateSimulationReportCSV(): string {
  return `MUTHU Digital Twin Simulation Report
Generated Date,${new Date().toISOString()}
Scenario,500 New Orders Rush Wave
Confidence Score,96%

Metric,Baseline,Simulated State,MUTHU Optimized State
Warehouse Health,95,72,94
Dispatch Delay,24 min,182 min,36 min
SLA Compliance,99.2%,68.4%,98.8%
Delayed Orders,2,38,3
Worker Utilization,81%,98%,86%
Revenue at Risk,₹0,₹185000,₹8500

Applied Recommendations:
1. Reallocate 3 Floor Workers to Packing Line (Dual-Lane mode)
2. Activate VIP Priority Fast-Track Wave
3. Trigger Backup Courier Sweep & Cross-Dock Staging
4. Auto-Generate Expedited PO for Packaging Stock
`;
}
