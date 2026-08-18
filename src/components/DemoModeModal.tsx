import React, { useState, useEffect, useRef } from 'react';
import { MASCOT_LOGO_URL } from '../mockData';
import { Order, InventoryItem, WarehouseStats } from '../types';

export interface DemoScenario {
  id: string;
  title: string;
  subtitle: string;
  category: 'VIP Order' | 'Low Stock' | 'Packing Delay' | 'Worker Absent' | 'QC Failure' | 'Dispatch Delay' | 'Order Spike';
  icon: string;
  badgeColor: string;
  problem: {
    title: string;
    description: string;
    metricLabel: string;
    metricValue: string;
    severity: 'critical' | 'high' | 'medium';
    affectedEntity: string;
  };
  analysis: {
    rootCause: string;
    projectedRisk: string;
    confidence: number;
    impactCost: string;
  };
  recommendation: {
    title: string;
    actionSummary: string;
    automationScript: string;
    expectedGain: string;
  };
  approval: {
    authority: string;
    role: string;
    decisionNote: string;
  };
  systemUpdate: {
    actionText: string;
    affectedTarget: string;
    liveLog: string[];
  };
  outcome: {
    healthDelta: string;
    healthScoreBefore: number;
    healthScoreAfter: number;
    kpiGains: { label: string; before: string; after: string }[];
    summary: string;
  };
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'vip-order',
    title: 'VIP Order SLA Rescue',
    subtitle: 'High-value client order stuck with 22 minutes to courier cutoff',
    category: 'VIP Order',
    icon: 'star',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    problem: {
      title: 'VIP Order #ORD-89104 Approaching 22-Min SLA Deadline',
      description: 'Order from Tesla Gigafactory Parts (₹1,42,000 value) is in Stock Allocated status while Zone B pickers face heavy congestion.',
      metricLabel: 'SLA Time Remaining',
      metricValue: '22 Minutes',
      severity: 'critical',
      affectedEntity: 'Order #ORD-89104 (VIP Express)'
    },
    analysis: {
      rootCause: 'Oversized carton dimension check stalled in standard queue behind 12 standard batch totes.',
      projectedRisk: 'Carrier cutoff breach resulting in ₹48,000 contract penalty and tier downgrade.',
      confidence: 98,
      impactCost: '₹48,000 SLA Penalty + VIP Churn Risk'
    },
    recommendation: {
      title: 'Expedite via Dedicated Runner to Fast-Track QC Bay 1',
      actionSummary: 'Bypass standard conveyor lane and assign priority runner to deliver directly to packing station.',
      automationScript: 'EXECUTE pipeline.route_override(order_id="ORD-89104", priority="URGENT_P1", destination="QC_BAY_1");',
      expectedGain: '18 minutes clearance speedup, 100% on-time dispatch'
    },
    approval: {
      authority: 'Lead Ops Manager',
      role: 'Operations Lead',
      decisionNote: 'Authorized priority manual bypass for Tesla Gigafactory Parts.'
    },
    systemUpdate: {
      actionText: 'Routing Override Executed • Runner Dispatched',
      affectedTarget: 'Order #ORD-89104 updated to "Picking" -> "Ready for Dispatch"',
      liveLog: [
        '11:15:02 AM - Priority tag assigned to Order #ORD-89104',
        '11:15:05 AM - Runner Ravi Kumar assigned dedicated tote',
        '11:15:18 AM - Optical scan verified at Fast-Track Bay 1',
        '11:15:28 AM - Package sealed & staged for FedEx Jet Express'
      ]
    },
    outcome: {
      healthDelta: '+4 Pts Recovery',
      healthScoreBefore: 91,
      healthScoreAfter: 95,
      kpiGains: [
        { label: 'SLA Compliance', before: '92.4%', after: '99.4%' },
        { label: 'Dispatch Lead Time', before: '38 mins', after: '12 mins' },
        { label: 'Penalty Exposure', before: '₹48,000', after: '₹0' }
      ],
      summary: 'Order #ORD-89104 successfully handed over to FedEx Express 12 minutes before flight cutoff.'
    }
  },
  {
    id: 'low-stock',
    title: 'Low Stock Auto-Replenishment',
    subtitle: 'Packaging buffer cartons near depletion under peak volume',
    category: 'Low Stock',
    icon: 'inventory_2',
    badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    problem: {
      title: 'Critical Inventory Shortage: Box #4 Corrugated Cartons',
      description: 'Only 48 units of Medium Heavy-Duty Box #4 remaining in primary pack buffer stock.',
      metricLabel: 'Stock Remaining',
      metricValue: '48 Units (3.5 Hrs Run-time)',
      severity: 'critical',
      affectedEntity: 'SKU-PKG-1036 (Box #4 Heavy-Duty)'
    },
    analysis: {
      rootCause: 'Surge in multi-item electronics orders consumed 2.8x higher carton rate than historical forecast.',
      projectedRisk: 'Packing bench #2 will halt in 3.5 hours, delaying 85 outgoing parcels across Shift 1.',
      confidence: 96,
      impactCost: '85 Delayed Parcels • ₹1,20,000 Staged Backlog'
    },
    recommendation: {
      title: 'Auto-Trigger PO #9048 to Apex Packaging + Bay-02 Reserve Transfer',
      actionSummary: 'Dispatch automated PO for 250 units with 2-hour courier drop and pull 80 units from overflow bay.',
      automationScript: 'EXECUTE procurement.create_po(supplier="Apex Packaging", sku="SKU-PKG-1036", qty=250, priority="EXPEDITED");',
      expectedGain: 'Zero pack line interruption, 14-day supply buffer restored'
    },
    approval: {
      authority: 'MUTHU Auto-Pilot System',
      role: 'Autonomous Agent',
      decisionNote: 'Autonomous purchase order triggered under approved threshold (< ₹50,000).'
    },
    systemUpdate: {
      actionText: 'PO #9048 Generated • Supplier Acknowledged',
      affectedTarget: 'SKU-PKG-1036 Buffer Stock updated to 128 units (+80 reserve, +250 inbound)',
      liveLog: [
        '09:12:01 AM - Shortage threshold breach detected at Station 2',
        '09:12:04 AM - EDI PO #9048 transmitted to Apex Packaging',
        '09:12:12 AM - Supplier confirmed 90-minute express courier dispatch',
        '09:12:30 AM - Internal transfer of 80 reserve units completed'
      ]
    },
    outcome: {
      healthDelta: '+6 Pts Recovery',
      healthScoreBefore: 88,
      healthScoreAfter: 94,
      kpiGains: [
        { label: 'Stockout Risk', before: '88%', after: '0%' },
        { label: 'Pack Station Uptime', before: '65%', after: '100%' },
        { label: 'Safety Stock Days', before: '0.4 Days', after: '14 Days' }
      ],
      summary: 'Autonomous restock prevented assembly line stall; packing operations maintained 100% throughput.'
    }
  },
  {
    id: 'packing-delay',
    title: 'Packing Delay & Station Balance',
    subtitle: 'Station #2 overload causing conveyor buffer bottleneck',
    category: 'Packing Delay',
    icon: 'hourglass_empty',
    badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    problem: {
      title: 'Packing Station #2 Overload (140% Capacity)',
      description: 'Automated taping arm mechanical latency causing conveyor backlog in Zone C.',
      metricLabel: 'Station Backlog',
      metricValue: '38 Totes Staged',
      severity: 'high',
      affectedEntity: 'Zone C Packing Bench #2'
    },
    analysis: {
      rootCause: 'Taping arm optical sensor dirty; cycle time increased from 18s to 44s per parcel.',
      projectedRisk: 'Upstream tote conveyor jam halting pickers in Zone A & B within 15 minutes.',
      confidence: 95,
      impactCost: '15% Systemic Throughput Drop'
    },
    recommendation: {
      title: 'Dynamic Load Balance: Reroute 40% Totes to Bench #4 + Cross-Train Runner',
      actionSummary: 'Divert conveyor line 2 to Bench #4 and reassign 1 runner from Buffer Staging to packaging.',
      automationScript: 'EXECUTE conveyor.divert_flow(from_station="PACK_2", to_station="PACK_4", ratio=0.40);',
      expectedGain: 'Packing queue reduced by 42%, throughput restored to 110 pkgs/hr'
    },
    approval: {
      authority: 'Floor Supervisor',
      role: 'Warehouse Operations',
      decisionNote: 'Load-balancing protocol approved for next 90 minutes.'
    },
    systemUpdate: {
      actionText: 'Conveyor Diverter Activated • Runner Reallocated',
      affectedTarget: 'Station #2 load reduced to 82%; Station #4 active at 88%',
      liveLog: [
        '10:30:11 AM - Diverter gate 4 opened on Zone C conveyor',
        '10:30:15 AM - Packer Elena Rostova mobilized to Bench 4',
        '10:30:45 AM - Station 2 queue reduced from 38 to 14 totes',
        '10:31:00 AM - Conveyor speed normalized to 1.2 m/s'
      ]
    },
    outcome: {
      healthDelta: '+5 Pts Recovery',
      healthScoreBefore: 89,
      healthScoreAfter: 94,
      kpiGains: [
        { label: 'Avg Packing Time', before: '16.4 mins', after: '9.8 mins' },
        { label: 'Conveyor Latency', before: '24 mins', after: '6 mins' },
        { label: 'Packages / Hour', before: '68 pkgs/h', after: '112 pkgs/h' }
      ],
      summary: 'Diverting parcel flow cleared Zone C staging congestion and restored steady-state packaging flow.'
    }
  },
  {
    id: 'worker-absent',
    title: 'Worker Absenteeism Re-balancing',
    subtitle: '3 Shift-1 packers absent; automated staff redeployment',
    category: 'Worker Absent',
    icon: 'group_remove',
    badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    problem: {
      title: '3 Shift-1 Packers Absent (Severe Weather Transit Delay)',
      description: 'Packing bench staffing dropped by 38%, creating immediate fulfillment shortfall.',
      metricLabel: 'Staffing Deficit',
      metricValue: '-3 Full-Time Packers',
      severity: 'high',
      affectedEntity: 'Shift 1 Packaging Team'
    },
    analysis: {
      rootCause: 'Regional transport strike delayed morning commuter bus routes.',
      projectedRisk: 'Order completion rate will drop from 98.6% to 84.2%; 45 orders will miss 12:00 PM courier sweep.',
      confidence: 94,
      impactCost: '₹85,000 Potential Missed Dispatch Value'
    },
    recommendation: {
      title: 'Stagger Pick Waves (6-min delay) + Reassign 2 Dock Stagers',
      actionSummary: 'Throttle picker releases to avoid buffer jamming and shift cross-trained stagers to packing benches.',
      automationScript: 'EXECUTE workforce.reallocate(staff_ids=["w-6", "w-16"], target_role="Packer", target_zone="Zone C");',
      expectedGain: 'Fulfillment rate maintained at 97.4%, zero missed courier cutoffs'
    },
    approval: {
      authority: 'Shift Coordinator',
      role: 'Workforce Management',
      decisionNote: 'Authorized cross-functional reallocation with overtime allowance.'
    },
    systemUpdate: {
      actionText: 'Staff Shift Executed • Handheld Terminals Updated',
      affectedTarget: 'Grace Hopper & Quentin Miller reassigned to Zone C Packing Benches',
      liveLog: [
        '08:45:10 AM - Absence alert processed for Staff #w-3, #w-8, #w-13',
        '08:45:20 AM - Skills matrix scanned: 4 cross-certified stagers identified',
        '08:45:35 AM - Digital work-orders pushed to RF Scanners',
        '08:46:00 AM - Packing capacity restored to 92% of nominal rate'
      ]
    },
    outcome: {
      healthDelta: '+7 Pts Recovery',
      healthScoreBefore: 86,
      healthScoreAfter: 93,
      kpiGains: [
        { label: 'Order Completion', before: '84.2%', after: '97.8%' },
        { label: 'Worker Utilization', before: '98% (Burnout)', after: '84% (Optimal)' },
        { label: 'On-Time Dispatch', before: '82%', after: '99%' }
      ],
      summary: 'Dynamic workforce balancing absorbed 3-worker absenteeism without sacrificing customer SLA promises.'
    }
  },
  {
    id: 'qc-failure',
    title: 'QC Optical Scanner Self-Correction',
    subtitle: 'False-reject anomaly on high-speed conveyor belt',
    category: 'QC Failure',
    icon: 'flaky',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
    problem: {
      title: '0.4% False-Positive Reject Rate at QC Optical Station 1',
      description: 'Optical barcode verification scanner intermittently rejecting valid compliant cartons.',
      metricLabel: 'False Reject Rate',
      metricValue: '0.42% (Normal < 0.05%)',
      severity: 'medium',
      affectedEntity: 'QC Station #1 Optical Bay'
    },
    analysis: {
      rootCause: 'Dust accumulation on optical prism lens during morning conveyor run.',
      projectedRisk: 'Requires manual handheld re-scanning, adding 45 seconds per flagged package.',
      confidence: 97,
      impactCost: '18 Minutes Manual Inspection Latency'
    },
    recommendation: {
      title: 'Trigger Automated 2-Minute Lens Air-Purge Calibration Sequence',
      actionSummary: 'Execute pneumatic air-purge nozzle and run self-test calibration grid during next 30-second wave gap.',
      automationScript: 'EXECUTE hardware.trigger_purge(station="QC_BAY_1", duration_sec=120, run_calibration=true);',
      expectedGain: 'False-reject rate reduced to 0.01%, 100% optical accuracy'
    },
    approval: {
      authority: 'MUTHU Autonomous Core',
      role: 'AI Self-Healing Engine',
      decisionNote: 'Autonomous diagnostic and remediation triggered without manual dispatch.'
    },
    systemUpdate: {
      actionText: 'Air Purge Triggered • Self-Calibration Complete',
      affectedTarget: 'QC Station #1 Sensor Calibration status: OPTIMAL',
      liveLog: [
        '11:18:02 AM - Telemetry flagged 3 consecutive dimension read retries',
        '11:18:08 AM - Air-purge solenoid activated for 120 seconds',
        '11:18:22 AM - Test pattern scan verified: 100% contrast fidelity',
        '11:18:30 AM - Conveyor resumed full speed (2.4 m/s)'
      ]
    },
    outcome: {
      healthDelta: '+3 Pts Recovery',
      healthScoreBefore: 92,
      healthScoreAfter: 95,
      kpiGains: [
        { label: 'QC Pass Rate', before: '98.2%', after: '99.9%' },
        { label: 'Manual Re-Scans', before: '14 / hr', after: '0 / hr' },
        { label: 'Inspection Speed', before: '32s / item', after: '4s / item' }
      ],
      summary: 'Self-healing sensor purge resolved the optical anomaly autonomously with zero downtime.'
    }
  },
  {
    id: 'dispatch-delay',
    title: 'Outbound Dispatch Delay & Backup Sweep',
    subtitle: 'Primary carrier delayed; dock staging nearing 90% capacity',
    category: 'Dispatch Delay',
    icon: 'local_shipping',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    problem: {
      title: 'FedEx Regional Hub Weather Delay (45 Mins) • Dock 88% Saturated',
      description: 'Outbound staging dock bay 4 saturated with 240 parcels awaiting delayed trailer.',
      metricLabel: 'Dock Staging Load',
      metricValue: '88% Capacity',
      severity: 'high',
      affectedEntity: 'Outbound Staging Bay 1–4'
    },
    analysis: {
      rootCause: 'Severe interstate storm delayed FedEx 18-wheeler arrival window by 45 minutes.',
      projectedRisk: 'Dock floor saturation will block incoming finished pallets from packaging within 20 minutes.',
      confidence: 96,
      impactCost: '₹2,50,000 Outbound Staging Gridlock'
    },
    recommendation: {
      title: 'Call On-Demand DHL Express Trailer Sweep + Buffer Lane 3 Overflow',
      actionSummary: 'Dispatch on-demand secondary carrier trailer to Bay 2 and stage standard parcels in overflow lane.',
      automationScript: 'EXECUTE carrier.request_sweep(carrier="DHL_EXPRESS", bay="BAY_2", capacity=300, cutoff="12:30_PM");',
      expectedGain: 'Dock congestion cleared, 100% daily courier departure compliance'
    },
    approval: {
      authority: 'Dispatch Lead',
      role: 'Logistics Supervisor',
      decisionNote: 'Authorized emergency trailer sweep to maintain SLA commitments.'
    },
    systemUpdate: {
      actionText: 'DHL Trailer Booked • Dock Bay 2 Assigned',
      affectedTarget: 'Outbound Dock Bay 2 loading 180 express parcels for DHL freight',
      liveLog: [
        '10:15:10 AM - FedEx GPS telemetry logged 45-min arrival delay',
        '10:15:15 AM - API request sent to DHL Freight on-demand dispatch',
        '10:15:45 AM - DHL confirms Sprinter Van & 32-ft trailer dispatched',
        '10:16:15 AM - 240 parcels transferred to active loading dock'
      ]
    },
    outcome: {
      healthDelta: '+6 Pts Recovery',
      healthScoreBefore: 87,
      healthScoreAfter: 93,
      kpiGains: [
        { label: 'Dock Saturation', before: '88%', after: '34%' },
        { label: 'Dispatch SLA', before: '81.4%', after: '99.2%' },
        { label: 'Average Delay', before: '45 mins', after: '0 mins' }
      ],
      summary: 'On-demand carrier sweep cleared dock congestion and ensured 100% on-time daily dispatch.'
    }
  },
  {
    id: 'order-spike',
    title: '500-Order Surge Digital Twin Stress Test',
    subtitle: 'Flash sale influx: 500 new priority orders within 15 minutes',
    category: 'Order Spike',
    icon: 'trending_up',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    problem: {
      title: 'Flash Sale Wave: 500 New Priority Orders Received',
      description: 'Sudden demand spike flooding picking and packing queues across all 8 zones simultaneously.',
      metricLabel: 'Inbound Influx',
      metricValue: '+500 New Orders',
      severity: 'critical',
      affectedEntity: 'Whole Warehouse Operation'
    },
    analysis: {
      rootCause: 'Mid-day enterprise promotional campaign triggered massive B2B checkout wave.',
      projectedRisk: 'Picking latency will increase to 42 minutes; projected 65-min dispatch delay across 140 orders.',
      confidence: 97,
      impactCost: '₹3,80,000 Potential SLA Breach Liabilities'
    },
    recommendation: {
      title: 'Deploy Algorithmic Zone Wave-Batching + Temporary Overtime Slots',
      actionSummary: 'Cluster orders by 3D aisle coordinates, mobilize 4 reserve pickers, and stagger wave releases.',
      automationScript: 'EXECUTE twin.deploy_scenario(wave_id="FLASH_SURGE_500", cluster_mode="GEO_AISLE_3D", priority="DYNAMIC");',
      expectedGain: 'Pick travel time cut by 48%, all 500 orders fulfilled within standard SLA'
    },
    approval: {
      authority: 'Lead Ops Manager',
      role: 'Operations Director',
      decisionNote: 'Approved algorithmic wave cluster deployment across all zones.'
    },
    systemUpdate: {
      actionText: 'Dynamic Wave Clustering Activated • 8 Zones Synchronized',
      affectedTarget: '500 orders partitioned into 14 optimized batch pick waves',
      liveLog: [
        '10:42:01 AM - Influx spike detected: 500 orders in 15 mins',
        '10:42:05 AM - MUTHU Digital Twin simulated 4 operational topologies',
        '10:42:15 AM - Dynamic batching algorithm generated 14 pick clusters',
        '10:42:30 AM - All picking runners routed via shortest-path travel map'
      ]
    },
    outcome: {
      healthDelta: '+8 Pts Recovery',
      healthScoreBefore: 84,
      healthScoreAfter: 92,
      kpiGains: [
        { label: 'Avg Picking Time', before: '42 mins', after: '16 mins' },
        { label: 'Fulfillment Rate', before: '76%', after: '98.6%' },
        { label: 'Dispatched on Time', before: '62%', after: '99.4%' }
      ],
      summary: 'Algorithmic batch clustering allowed the facility to absorb a 500-order rush with zero SLA violations.'
    }
  }
];

interface DemoModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyScenarioToLiveApp?: (scenario: DemoScenario) => void;
  onShowToast: (title: string, description?: string, type?: 'success' | 'warning' | 'error' | 'info') => void;
}

export const DemoModeModal: React.FC<DemoModeModalProps> = ({
  isOpen,
  onClose,
  onApplyScenarioToLiveApp,
  onShowToast
}) => {
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const [activeStep, setActiveStep] = useState<number>(0); // 0: Problem, 1: Analysis, 2: Recommendation, 3: Approval, 4: System Update, 5: Outcome
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayTimer, setAutoPlayTimer] = useState<number>(0);

  const scenario = DEMO_SCENARIOS[selectedScenarioIndex];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = [
    { id: 0, title: 'STEP 1 — Problem Detected', icon: 'warning', desc: 'Real-time bottleneck telemetry' },
    { id: 1, title: 'STEP 2 — Root Cause Analysis', icon: 'psychology', desc: 'Root cause & risk calculation' },
    { id: 2, title: 'STEP 3 — Muthu Recommends', icon: 'smart_toy', desc: 'Optimal operational remedy' },
    { id: 3, title: 'STEP 4 — Manager Decision', icon: 'verified_user', desc: 'Supervisor decision approval' },
    { id: 4, title: 'STEP 5 — Action Executed', icon: 'sync', desc: 'Pipeline execution & state update' },
    { id: 5, title: 'STEP 6 — Operational Impact', icon: 'task_alt', desc: 'Health score & SLA recovery' }
  ];

  // Auto-play stepper
  useEffect(() => {
    if (!isOpen) {
      setIsAutoPlaying(false);
      return;
    }

    if (isAutoPlaying) {
      timerRef.current = setInterval(() => {
        setAutoPlayTimer((prev) => {
          if (prev >= 100) {
            // Advance step
            setActiveStep((currStep) => {
              if (currStep < 5) {
                return currStep + 1;
              } else {
                // Loop to next scenario or stop
                setIsAutoPlaying(false);
                onShowToast(
                  'Demo Scenario Complete',
                  `Successfully demonstrated full "${scenario.title}" operational workflow!`,
                  'success'
                );
                return currStep;
              }
            });
            return 0;
          }
          return prev + 25; // 4 ticks = 1 step (~2.4 seconds per step)
        });
      }, 600);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setAutoPlayTimer(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAutoPlaying, isOpen, scenario.title, onShowToast]);

  const handleSelectScenario = (idx: number) => {
    setSelectedScenarioIndex(idx);
    setActiveStep(0);
    setIsAutoPlaying(false);
    setAutoPlayTimer(0);
  };

  const handleNextStep = () => {
    if (activeStep < 5) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleApplyToLiveApp = () => {
    if (onApplyScenarioToLiveApp) {
      onApplyScenarioToLiveApp(scenario);
    }
    onShowToast(
      'Live State Synchronized',
      `Applied ${scenario.title} outcome directly to active warehouse database & dashboard.`,
      'success'
    );
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      id="demo-mode-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-scrim/60 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        id="demo-mode-modal-card"
        className="bg-surface-container-lowest border border-outline-variant/40 rounded-3xl shadow-ambient-lg w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-xs border border-outline-variant/30 shrink-0">
              <img src={MASCOT_LOGO_URL} alt="MUTHU" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-sm text-[18px] md:text-[20px] font-bold text-on-surface">
                  MUTHU Hackathon Demo Mode
                </h2>
                <span className="font-label-caps text-[10px] px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-bold tracking-wider">
                  Live Showcase
                </span>
              </div>
              <p className="font-body-sm text-[13px] text-on-surface-variant">
                Autonomous Problem-to-Resolution Interactive Simulation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-demo-autoplay"
              onClick={() => {
                if (isAutoPlaying) {
                  setIsAutoPlaying(false);
                } else {
                  if (activeStep === 5) setActiveStep(0);
                  setIsAutoPlaying(true);
                  onShowToast('Auto-Play Started', 'Cycling through full decision intelligence cycle...', 'info');
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-label-md text-[13px] font-bold transition-all shadow-xs cursor-pointer ${
                isAutoPlaying
                  ? 'bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-primary text-on-primary hover:bg-primary/90'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">
                {isAutoPlaying ? 'pause' : 'play_arrow'}
              </span>
              <span>{isAutoPlaying ? 'Pause Walkthrough' : 'Auto-Play Walkthrough'}</span>
            </button>

            <button
              id="btn-close-demo-modal"
              onClick={onClose}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[22px]">close</span>
            </button>
          </div>
        </div>

        {/* Scenario Selection Tabs */}
        <div className="px-6 py-3 bg-surface-container-lowest border-b border-outline-variant/30 overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <span className="font-label-caps text-[11px] text-on-surface-variant font-bold uppercase mr-1">
              Select Scenario:
            </span>
            {DEMO_SCENARIOS.map((sc, idx) => {
              const isSelected = selectedScenarioIndex === idx;
              return (
                <button
                  key={sc.id}
                  id={`btn-select-scenario-${sc.id}`}
                  onClick={() => handleSelectScenario(idx)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[13px] font-bold transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-primary text-on-primary border-primary shadow-xs'
                      : 'bg-surface-container-high text-on-surface-variant border-outline-variant/30 hover:bg-surface-container-highest hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{sc.icon}</span>
                  <span>{sc.category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Active Scenario Title Card */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${scenario.badgeColor}`}>
                  {scenario.category}
                </span>
                <span className="font-headline-sm text-[16px] md:text-[18px] font-bold text-on-surface">
                  {scenario.title}
                </span>
              </div>
              <p className="font-body-md text-[14px] text-on-surface-variant">
                {scenario.subtitle}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                  AI Confidence
                </div>
                <div className="font-headline-sm text-[18px] font-bold text-primary">
                  {scenario.analysis.confidence}%
                </div>
              </div>
              <div className="w-px h-8 bg-outline-variant/40" />
              <div className="text-right">
                <div className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                  Impact Recovery
                </div>
                <div className="font-headline-sm text-[18px] font-bold text-emerald-600">
                  {scenario.outcome.healthDelta}
                </div>
              </div>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-2">
              {steps.map((st) => {
                const isCurrent = activeStep === st.id;
                const isPassed = activeStep > st.id;
                return (
                  <button
                    key={st.id}
                    id={`btn-step-${st.id}`}
                    onClick={() => {
                      setActiveStep(st.id);
                      setIsAutoPlaying(false);
                    }}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-primary/10 border-primary shadow-xs ring-1 ring-primary/30'
                        : isPassed
                        ? 'bg-emerald-500/5 border-emerald-500/20 text-on-surface'
                        : 'bg-surface-container-high/50 border-outline-variant/20 text-on-surface-variant/70'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 w-full mb-1">
                      <span
                        className={`material-symbols-outlined text-[16px] ${
                          isCurrent
                            ? 'text-primary font-bold'
                            : isPassed
                            ? 'text-emerald-600'
                            : 'text-outline'
                        }`}
                      >
                        {isPassed ? 'check_circle' : st.icon}
                      </span>
                      <span
                        className={`font-label-caps text-[11px] font-bold truncate ${
                          isCurrent ? 'text-primary' : isPassed ? 'text-emerald-700' : 'text-on-surface-variant'
                        }`}
                      >
                        Step {st.id + 1}
                      </span>
                    </div>
                    <span className="font-body-sm text-[11px] text-on-surface font-semibold line-clamp-1">
                      {st.title.split('. ')[1]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* AutoPlay progress indicator line */}
            {isAutoPlaying && (
              <div className="w-full bg-surface-container-highest h-1 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full transition-all duration-300 rounded-full"
                  style={{ width: `${autoPlayTimer}%` }}
                />
              </div>
            )}
          </div>

          {/* Active Step Content Display */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest border border-outline-variant/40 shadow-ambient-sm min-h-[260px] flex flex-col justify-between">
            {/* STEP 0: Problem */}
            {activeStep === 0 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-start justify-between gap-4 pb-3 border-b border-outline-variant/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[24px]">error</span>
                    </div>
                    <div>
                      <div className="font-label-caps text-[11px] text-rose-600 uppercase font-bold tracking-wider">
                        Operational Alert Triggered
                      </div>
                      <h3 className="font-headline-sm text-[17px] font-bold text-on-surface">
                        {scenario.problem.title}
                      </h3>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                    {scenario.problem.severity.toUpperCase()}
                  </span>
                </div>

                <p className="font-body-md text-[14px] text-on-surface-variant leading-relaxed">
                  {scenario.problem.description}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                      Target Entity
                    </div>
                    <div className="font-body-md text-[14px] font-bold text-on-surface mt-0.5">
                      {scenario.problem.affectedEntity}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                    <div className="font-label-caps text-[10px] text-rose-600 uppercase font-bold">
                      {scenario.problem.metricLabel}
                    </div>
                    <div className="font-headline-sm text-[16px] font-bold text-rose-600 mt-0.5">
                      {scenario.problem.metricValue}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Analysis */}
            {activeStep === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">psychology</span>
                  </div>
                  <div>
                    <div className="font-label-caps text-[11px] text-primary uppercase font-bold tracking-wider">
                      MUTHU Diagnostic Engine
                    </div>
                    <h3 className="font-headline-sm text-[17px] font-bold text-on-surface">
                      Root Cause & Risk Assessment
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30">
                    <div className="flex items-center gap-2 font-label-md text-[12px] font-bold text-on-surface mb-1">
                      <span className="material-symbols-outlined text-[16px] text-primary">analytics</span>
                      <span>Root Cause Identified</span>
                    </div>
                    <p className="font-body-md text-[14px] text-on-surface-variant">
                      {scenario.analysis.rootCause}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20">
                      <div className="font-label-caps text-[10px] text-amber-600 uppercase font-bold">
                        Projected Risk
                      </div>
                      <p className="font-body-sm text-[13px] text-on-surface mt-1">
                        {scenario.analysis.projectedRisk}
                      </p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-rose-500/5 border border-rose-500/20">
                      <div className="font-label-caps text-[10px] text-rose-600 uppercase font-bold">
                        Financial Impact Exposure
                      </div>
                      <div className="font-headline-sm text-[15px] font-bold text-rose-600 mt-1">
                        {scenario.analysis.impactCost}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Recommendation */}
            {activeStep === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
                  <div className="w-10 h-10 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">smart_toy</span>
                  </div>
                  <div>
                    <div className="font-label-caps text-[11px] text-tertiary uppercase font-bold tracking-wider">
                      Prescriptive Intelligence
                    </div>
                    <h3 className="font-headline-sm text-[17px] font-bold text-on-surface">
                      {scenario.recommendation.title}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-body-md text-[14px] text-on-surface-variant">
                    {scenario.recommendation.actionSummary}
                  </p>

                  <div className="p-3 rounded-xl bg-surface-container-highest font-mono text-[12px] text-primary border border-outline-variant/40 overflow-x-auto">
                    {scenario.recommendation.automationScript}
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                    <span className="font-body-sm text-[13px] text-emerald-800 font-semibold">
                      Expected Gain: {scenario.recommendation.expectedGain}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Approval */}
            {activeStep === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">verified_user</span>
                  </div>
                  <div>
                    <div className="font-label-caps text-[11px] text-emerald-600 uppercase font-bold tracking-wider">
                      Executive & Autonomous Governance
                    </div>
                    <h3 className="font-headline-sm text-[17px] font-bold text-on-surface">
                      Decision Authorized & Signed
                    </h3>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-headline-sm text-[15px] font-bold text-on-surface">
                        {scenario.approval.authority}
                      </div>
                      <div className="font-label-caps text-[11px] text-on-surface-variant">
                        {scenario.approval.role}
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[12px] font-bold bg-amber-500/10 text-amber-700 border border-amber-500/20 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[14px]">pending</span>
                      <span>Awaiting Decision</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/20 italic font-body-sm text-[13px] text-on-surface-variant">
                    "{scenario.approval.decisionNote}"
                  </div>

                  <div className="flex items-center gap-3 pt-2 border-t border-outline-variant/20">
                    <button
                      onClick={() => {
                        setActiveStep(4);
                        onShowToast('Decision Approved', `Manager approved recommendation for ${scenario.title}. Executing pipeline action...`, 'success');
                      }}
                      className="flex-1 py-2.5 px-4 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <span className="material-symbols-outlined text-base">check_circle</span>
                      Approve Recommendation
                    </button>
                    <button
                      onClick={() => {
                        setActiveStep(0);
                        onShowToast('Recommendation Dismissed', 'Manager dismissed recommendation. Recalculating queue metrics...', 'info');
                      }}
                      className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high text-on-surface rounded-xl text-xs font-bold border border-outline-variant/30 transition-colors cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: System Update */}
            {activeStep === 4 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">sync</span>
                  </div>
                  <div>
                    <div className="font-label-caps text-[11px] text-primary uppercase font-bold tracking-wider">
                      Autonomous Pipeline Execution
                    </div>
                    <h3 className="font-headline-sm text-[17px] font-bold text-on-surface">
                      {scenario.systemUpdate.actionText}
                    </h3>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 mb-2">
                  <div className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold">
                    Target State Transition
                  </div>
                  <div className="font-body-md text-[14px] font-bold text-on-surface mt-0.5">
                    {scenario.systemUpdate.affectedTarget}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-surface-container-highest font-mono text-[11px] text-on-surface space-y-1 max-h-32 overflow-y-auto border border-outline-variant/30">
                  {scenario.systemUpdate.liveLog.map((lg, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-emerald-600">✓</span>
                      <span>{lg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: Outcome */}
            {activeStep === 5 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
                <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">task_alt</span>
                  </div>
                  <div>
                    <div className="font-label-caps text-[11px] text-emerald-600 uppercase font-bold tracking-wider">
                      Measurable Operational Outcome
                    </div>
                    <h3 className="font-headline-sm text-[17px] font-bold text-on-surface">
                      Warehouse Health & KPI Optimization
                    </h3>
                  </div>
                </div>

                {/* Score recovery badge */}
                <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                  <div>
                    <div className="font-label-caps text-[11px] text-emerald-700 uppercase font-bold">
                      Warehouse Health Recovery
                    </div>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="font-headline-sm text-[22px] font-bold text-on-surface-variant line-through">
                        {scenario.outcome.healthScoreBefore}
                      </span>
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">
                        arrow_forward
                      </span>
                      <span className="font-headline-sm text-[26px] font-bold text-emerald-600">
                        {scenario.outcome.healthScoreAfter} / 100
                      </span>
                    </div>
                  </div>

                  <span className="px-3.5 py-1.5 rounded-full text-[13px] font-bold bg-emerald-600 text-white shadow-xs">
                    {scenario.outcome.healthDelta}
                  </span>
                </div>

                {/* KPI comparison grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  {scenario.outcome.kpiGains.map((kpi, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-surface-container-low border border-outline-variant/30">
                      <div className="font-label-caps text-[10px] text-on-surface-variant uppercase font-bold truncate">
                        {kpi.label}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 font-body-sm text-[12px]">
                        <span className="text-rose-600 line-through">{kpi.before}</span>
                        <span className="text-outline">→</span>
                        <span className="text-emerald-600 font-bold">{kpi.after}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="font-body-md text-[13px] text-on-surface-variant italic">
                  "{scenario.outcome.summary}"
                </p>
              </div>
            )}

            {/* Stepper Navigation Footer */}
            <div className="flex items-center justify-between pt-4 mt-2 border-t border-outline-variant/20">
              <button
                id="btn-prev-step"
                onClick={handlePrevStep}
                disabled={activeStep === 0}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-label-md text-[13px] font-semibold transition-all ${
                  activeStep === 0
                    ? 'opacity-40 cursor-not-allowed text-outline'
                    : 'text-on-surface hover:bg-surface-container-high cursor-pointer'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                <span>Previous Step</span>
              </button>

              <div className="flex items-center gap-2">
                {activeStep === 5 ? (
                  <button
                    id="btn-apply-live-scenario"
                    onClick={handleApplyToLiveApp}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-label-md text-[13px] font-bold hover:bg-emerald-700 transition-all shadow-xs cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                    <span>Apply Outcome to Live Dashboard</span>
                  </button>
                ) : (
                  <button
                    id="btn-next-step"
                    onClick={handleNextStep}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-[13px] font-bold hover:bg-primary/90 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Next Step</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-surface-container-low border-t border-outline-variant/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-label-caps text-[11px] text-on-surface-variant font-semibold">
              Hackathon Showcase • Ready for Jury Evaluation
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high font-label-md text-[13px] font-semibold transition-colors cursor-pointer"
            >
              Exit Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
