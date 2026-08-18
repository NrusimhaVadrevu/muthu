import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PageId,
  Order,
  OrderStatus,
  InventoryItem,
  Recommendation,
  DecisionScenario,
  ToastMessage,
  OrderWorkflow,
  WorkflowEngineState,
  GlobalOrderFilter
} from './types';
import {
  initialWarehouseStats,
  initialRecommendations,
  initialAutomations,
  initialOrders,
  initialInventory
} from './mockData';
import { calculateStockStatus, computeStockPercentage } from './inventoryData';
import {
  generateOrderWorkflow,
  advanceWorkflowStep,
  triggerQualityIncident,
  initialWorkflowEngineState
} from './workflowEngine';
import {
  INITIAL_TRUCKS
} from './logisticsData';
import { INITIAL_WORKERS } from './workersData';
import { INITIAL_EQUIPMENT } from './equipmentData';
import { INITIAL_MONTHLY_REPORTS } from './reportsData';
import { INITIAL_CALENDAR_EVENTS, INITIAL_CALENDAR_INSIGHTS, CalendarEvent, MuthuCalendarInsight } from './calendarData';
import { LanguageProvider } from './context/LanguageContext';
import { SideNavBar } from './components/SideNavBar';
import { TopNavBar } from './components/TopNavBar';
import { DashboardView } from './components/DashboardView';
import { OrdersView } from './components/OrdersView';
import { InventoryView } from './components/InventoryView';
import { DecisionWorkspaceView } from './components/DecisionWorkspaceView';
import { AnalyticsView } from './components/AnalyticsView';
import { SimulationView } from './components/SimulationView';
import { LogisticsView } from './components/LogisticsView';
import { WorkersView } from './components/WorkersView';
import { EquipmentView } from './components/EquipmentView';
import { CalendarView } from './components/CalendarView';
import { ReportsView } from './components/ReportsView';
import { HelpCenterView } from './components/HelpCenterView';
import { ProductTourModal } from './components/ProductTourModal';
import { SlaRiskModal } from './components/SlaRiskModal';
import { CriticalSkusModal } from './components/CriticalSkusModal';
import { NewReportModal } from './components/NewReportModal';
import { SettingsModal } from './components/SettingsModal';
import { SupportModal } from './components/SupportModal';
import { DemoModeModal, DemoScenario } from './components/DemoModeModal';
import { Toast } from './components/Toast';
import { WorkflowControlBar, WorkflowPanelState } from './components/WorkflowControlBar';
import { WorkflowTimelineModal } from './components/WorkflowTimelineModal';

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}

function AppInner() {
  // Navigation & UI state
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return sessionStorage.getItem('muthu_sidebar_collapsed') === 'true';
  });
  const [globalSearch, setGlobalSearch] = useState('');
  const [globalOrderFilter, setGlobalOrderFilter] = useState<GlobalOrderFilter>('all');

  // Product Tour State
  const [isProductTourOpen, setIsProductTourOpen] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      sessionStorage.setItem('muthu_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleStartTour = () => {
    setTourStepIndex(0);
    setIsProductTourOpen(true);
    setCurrentPage('dashboard');
  };

  // Modals state
  const [isNewReportOpen, setIsNewReportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isDemoModeOpen, setIsDemoModeOpen] = useState(false);
  const [isSlaRiskModalOpen, setIsSlaRiskModalOpen] = useState(false);
  const [isCriticalSkusModalOpen, setIsCriticalSkusModalOpen] = useState(false);
  const [logisticsFilter, setLogisticsFilter] = useState('all');
  const [workflowPanelState, setWorkflowPanelState] = useState<WorkflowPanelState>('closed');

  // App core data state
  const [stats, setStats] = useState(initialWarehouseStats);
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [automations, setAutomations] = useState(initialAutomations);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [inventory, setInventory] = useState<InventoryItem[]>(initialInventory);
  const [trucks, setTrucks] = useState(INITIAL_TRUCKS);

  // Workers, Equipment, Calendar, and Reports state
  const [workers, setWorkers] = useState(INITIAL_WORKERS);
  const [equipment, setEquipment] = useState(INITIAL_EQUIPMENT);
  const [monthlyReports] = useState(INITIAL_MONTHLY_REPORTS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [calendarInsights, setCalendarInsights] = useState<MuthuCalendarInsight[]>(INITIAL_CALENDAR_INSIGHTS);

  // Orders sidebar submenu status filter
  const [ordersSubStatusFilter, setOrdersSubStatusFilter] = useState<string>('All');

  // Live order counts for sidebar submenu badges (Section 16 & 17)
  const ordersCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: orders.length,
      RECEIVED: 0,
      PICKING: 0,
      PACKING: 0,
      'QUALITY CHECK': 0,
      'READY FOR DISPATCH': 0,
      DISPATCHED: 0,
      'ON THE WAY': 0,
      DELIVERED: 0
    };
    orders.forEach((o) => {
      const s = o.currentStatus;
      if (s === 'New' || s === 'Priority Assigned' || s === 'Inventory Checked' || s === 'Stock Allocated') {
        counts['RECEIVED']++;
      } else if (s === 'Picking' || s === 'Active Picking') {
        counts['PICKING']++;
      } else if (s === 'Packing') {
        counts['PACKING']++;
      } else if (s === 'Quality Check' || s === 'Quality Control') {
        counts['QUALITY CHECK']++;
      } else if (s === 'Ready for Dispatch') {
        counts['READY FOR DISPATCH']++;
      } else if (s === 'Dispatched') {
        counts['DISPATCHED']++;
        if (o.assignedTruckId) counts['ON THE WAY']++;
      } else if (s === 'Delivered') {
        counts['DELIVERED']++;
      }
    });
    return counts;
  }, [orders]);

  // Centralized Warehouse Workflow Engine State
  const [engineState, setEngineState] = useState<WorkflowEngineState>(initialWorkflowEngineState);

  // Workflows initialized for all orders
  const [orderWorkflows, setOrderWorkflows] = useState<Record<string, OrderWorkflow>>(() => {
    const initialMap: Record<string, OrderWorkflow> = {};
    initialOrders.forEach((o) => {
      initialMap[o.id] = generateOrderWorkflow(o);
    });
    return initialMap;
  });

  // Selected order for workflow timeline inspection modal
  const [inspectingOrderId, setInspectingOrderId] = useState<string | null>(null);

  // Toast feedback state
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((title: string, description?: string, type: ToastMessage['type'] = 'success') => {
    setToast({
      id: `toast-${Date.now()}-${Math.random().toString().slice(2, 6)}`,
      title,
      description,
      type
    });
  }, []);

  // Handler: Advance an order workflow sequentially with Cross-Module Consistency (Section 20)
  const handleAdvanceWorkflowStep = useCallback((orderId: string) => {
    const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return;

    const currentWorkflow = orderWorkflows[order.id] || generateOrderWorkflow(order);

    const {
      updatedWorkflow,
      updatedOrder,
      updatedInventory,
      updatedStats,
      eventDescription,
      eventType
    } = advanceWorkflowStep(currentWorkflow, order, inventory, stats);

    // Apply synchronized state updates across modules
    setOrders((prev) => prev.map((o) => (o.id === order.id ? updatedOrder : o)));
    setOrderWorkflows((prev) => ({ ...prev, [order.id]: updatedWorkflow }));
    setInventory(updatedInventory);
    setStats(updatedStats);

    // Cross-module update: Worker contribution update
    if (order.assignedPacker || order.assignedPicker) {
      setWorkers((prev) =>
        prev.map((w) => {
          if (w.name.includes(order.assignedPacker) || w.name.includes(order.assignedPicker)) {
            return {
              ...w,
              ordersHandled: w.ordersHandled + 1,
              packagesPacked: w.role === 'Packer' ? w.packagesPacked + order.itemCount : w.packagesPacked,
              packagesPicked: w.role === 'Picker' ? w.packagesPicked + order.itemCount : w.packagesPicked,
              estimatedRevenueSupportedInr: w.estimatedRevenueSupportedInr + Math.round(order.orderValue * 0.1)
            };
          }
          return w;
        })
      );
    }

    // Cross-module update: Truck dispatch sync
    if (eventType === 'dispatch' && order.assignedTruckId) {
      setTrucks((prev) =>
        prev.map((t) =>
          t.id === order.assignedTruckId
            ? {
                ...t,
                currentStatus: 'En Route',
                currentLoadPercent: Math.min(t.currentLoadPercent + 15, 100),
                orderCount: t.orderCount + 1
              }
            : t
        )
      );
    }

    // Append to Workflow Engine real-time telemetry log
    setEngineState((prev) => ({
      ...prev,
      lastEventDescription: eventDescription,
      totalCompletedWorkflows:
        updatedWorkflow.currentStageIndex >= updatedWorkflow.stages.length - 1
          ? prev.totalCompletedWorkflows + 1
          : prev.totalCompletedWorkflows,
      recentEvents: [
        {
          id: `ev-${Date.now()}`,
          orderNumber: order.orderNumber,
          stageLabel: updatedWorkflow.stages[updatedWorkflow.currentStageIndex]?.label || 'Advanced',
          timestamp: 'Just now',
          details: eventDescription,
          type: eventType
        },
        ...prev.recentEvents.slice(0, 14)
      ]
    }));

    if (eventType === 'dispatch') {
      showToast('Order Dispatched & Inventory Deducted', `${order.orderNumber} carrier manifest finalized.`);
    } else {
      showToast('Workflow Stage Advanced', `${order.orderNumber} moved to ${updatedWorkflow.stages[updatedWorkflow.currentStageIndex]?.label}`);
    }
  }, [orders, orderWorkflows, inventory, stats, showToast]);

  // Handler: Trigger Quality Check Exception Loop
  const handleTriggerQcIssue = useCallback((orderId: string) => {
    const order = orders.find((o) => o.id === orderId || o.orderNumber === orderId);
    if (!order) return;

    const currentWorkflow = orderWorkflows[order.id] || generateOrderWorkflow(order);

    const { updatedWorkflow, updatedOrder, incident, eventDescription } = triggerQualityIncident(
      currentWorkflow,
      order
    );

    setOrders((prev) => prev.map((o) => (o.id === order.id ? updatedOrder : o)));
    setOrderWorkflows((prev) => ({ ...prev, [order.id]: updatedWorkflow }));

    // Append to automations and engine telemetry
    setAutomations((prev) => [
      {
        id: `auto-${Date.now()}`,
        title: `Quality Issue Flagged: Order ${order.orderNumber} allocated reserve stock.`,
        timeAgo: 'Just now',
        zone: 'Zone B QC'
      },
      ...prev
    ]);

    setEngineState((prev) => ({
      ...prev,
      lastEventDescription: eventDescription,
      recentEvents: [
        {
          id: `ev-${Date.now()}`,
          orderNumber: order.orderNumber,
          stageLabel: 'QC Defect Flagged',
          timestamp: 'Just now',
          details: `Incident #${incident.incidentId}: ${incident.issueReason}`,
          type: 'qc_fail'
        },
        ...prev.recentEvents.slice(0, 14)
      ]
    }));

    showToast('Quality Check Exception Triggered', `Incident #${incident.incidentId} created for ${order.orderNumber}. Replacement workflow initiated.`, 'error');
  }, [orders, orderWorkflows, showToast]);

  // Step all active workflows simultaneously
  const handleStepAllWorkflows = useCallback(() => {
    const activeOrders = orders.filter((o) => o.currentStatus !== 'Delivered');
    if (activeOrders.length === 0) {
      showToast('All Orders Delivered', 'All current warehouse workflows are at final stage.');
      return;
    }

    // Step first 3 active orders
    const targets = activeOrders.slice(0, 3);
    targets.forEach((target) => {
      handleAdvanceWorkflowStep(target.id);
    });

    showToast('Multi-Stage Progression', `Stepped ${targets.length} active orders across fulfillment pipeline.`);
  }, [orders, handleAdvanceWorkflowStep, showToast]);

  // Simulate QC Defect on the next active order
  const handleSimulateGlobalQcDefect = useCallback(() => {
    const candidate = orders.find(
      (o) => o.currentStatus === 'Quality Check' || o.currentStatus === 'Packing' || o.currentStatus === 'Picking'
    ) || orders[0];

    if (candidate) {
      handleTriggerQcIssue(candidate.id);
      setInspectingOrderId(candidate.id);
    }
  }, [orders, handleTriggerQcIssue]);

  // Live Auto-Drive Background Simulation
  useEffect(() => {
    if (!engineState.isLiveAutoDrive) return;

    const intervalMs = Math.max(2000, 5000 / engineState.speedMultiplier);

    const timer = setInterval(() => {
      const activeOrders = orders.filter(
        (o) => o.currentStatus !== 'Delivered' && o.currentStatus !== 'On Hold'
      );
      if (activeOrders.length === 0) return;

      // Pick one order to advance in the stream
      const randomOrder = activeOrders[Math.floor(Math.random() * activeOrders.length)];
      handleAdvanceWorkflowStep(randomOrder.id);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [engineState.isLiveAutoDrive, engineState.speedMultiplier, orders, handleAdvanceWorkflowStep]);

  // Order status manual update fallback
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    handleAdvanceWorkflowStep(orderId);
  };

  const handleRecommendationAction = (rec: Recommendation) => {
    if (rec.actionType === 'expedite_order') {
      setCurrentPage('orders');
      showToast('Order Prioritized', 'ORD-89021 moved to front of picking queue with expedited SLA.');
    } else if (rec.actionType === 'reallocate_staff') {
      setCurrentPage('decision');
      showToast('Simulation Loaded', 'Viewing optimal staff reallocation model in Decision Workspace.');
    } else if (rec.actionType === 'create_po') {
      setCurrentPage('inventory');
      showToast('Purchase Order Drafted', 'Supplier PO #9042 created for low-stock packaging items.');
    }
  };

  const handleRefreshAnalysis = () => {
    setStats((prev) => ({
      ...prev,
      healthScore: Math.min(prev.healthScore + 1, 98),
      healthScoreDelta: prev.healthScoreDelta + 1
    }));
    showToast('Telemetry Refreshed', 'AI routing graphs updated with latest courier and station throughput.');
  };

  const handleAddItem = (newItem: Omit<InventoryItem, 'id'>) => {
    const item: InventoryItem = {
      ...newItem,
      id: `PRD-${Date.now().toString().slice(-4)}`
    };
    setInventory((prev) => [item, ...prev]);
    showToast('Product Added', `${item.name} (${item.sku}) added to inventory registry.`);
  };

  const handleRestockItem = (id: string, amount: number) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.min(item.quantityAvailable + amount, item.maxStock);
          const stockPercentage = computeStockPercentage(newQty, item.maxStock);
          const status = calculateStockStatus(newQty, item.reorderLevel, item.maxStock);
          return {
            ...item,
            quantityAvailable: newQty,
            currentStock: newQty,
            stockPercentage,
            status,
            lastRestocked: new Date().toISOString().slice(0, 10),
            aiPrediction: status === 'Optimal' ? 'Stable Demand' : status === 'Oversupplied' ? 'Overstock Risk' : item.aiPrediction
          };
        }
        return item;
      })
    );
    showToast('Stock Replenished', `Added ${amount} units to inventory stock.`);
  };

  const handleApplyStrategy = (scenario: DecisionScenario) => {
    setStats((prev) => ({
      ...prev,
      healthScore: 97,
      ordersDispatchedDelta: 15,
      productivityIndex: 1.24
    }));

    const newLog = {
      id: `auto-${Date.now()}`,
      title: `${scenario.strategyTitle}`,
      timeAgo: 'Just now',
      zone: 'Zone B'
    };
    setAutomations((prev) => [newLog, ...prev]);

    showToast('Strategy Applied', `${scenario.strategyTitle} is now actively orchestrated across Facility Bay-04.`);
  };

  const handleApplyDemoScenario = useCallback((demoSc: DemoScenario) => {
    setStats((prev) => ({
      ...prev,
      healthScore: demoSc.outcome.healthScoreAfter,
      slaViolations: 0,
      criticalDecisions: Math.max(0, prev.criticalDecisions - 1)
    }));

    if (demoSc.id === 'vip-order') {
      setOrders((prev) =>
        prev.map((o) =>
          o.orderNumber === '#104' || o.id === 'ORD-89104'
            ? { ...o, currentStatus: 'Ready for Dispatch', priority: 'Critical', slaRemainingMinutes: 45, isNearSlaRisk: false }
            : o
        )
      );
    } else if (demoSc.id === 'low-stock') {
      setInventory((prev) =>
        prev.map((it) =>
          it.sku.includes('PKG-1036') || it.name.includes('Corrugated')
            ? { ...it, quantityAvailable: it.quantityAvailable + 250, status: 'Optimal' }
            : it
        )
      );
    }

    showToast(`Applied: ${demoSc.title}`, demoSc.outcome.summary, 'success');
  }, [showToast]);

  const handleExportData = (reportName: string = 'Operations Summary') => {
    showToast('Export Generated', `${reportName} downloaded successfully.`);
  };

  const inspectedOrder = useMemo(() => {
    if (!inspectingOrderId) return null;
    return orders.find((o) => o.id === inspectingOrderId || o.orderNumber === inspectingOrderId) || null;
  }, [inspectingOrderId, orders]);

  const inspectedWorkflow = useMemo(() => {
    if (!inspectedOrder) return null;
    return orderWorkflows[inspectedOrder.id] || generateOrderWorkflow(inspectedOrder);
  }, [inspectedOrder, orderWorkflows]);

  return (
    <div id="muthu-app-root" className="flex h-screen overflow-hidden bg-background font-body-md text-on-surface">
      {/* Sidebar Navigation */}
      <SideNavBar
        currentPage={currentPage}
        onNavigate={(page) => setCurrentPage(page)}
        onSelectOrderStatusFilter={(status) => {
          setOrdersSubStatusFilter(status);
          setCurrentPage('orders');
        }}
        ordersCounts={ordersCounts}
        onOpenNewReport={() => setIsNewReportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenDemoMode={() => setIsDemoModeOpen(true)}
        isMobileOpen={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        isCollapsed={isSidebarCollapsed}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Top Header Navigation */}
        <TopNavBar
          onToggleMobileNav={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onToggleSidebar={handleToggleSidebar}
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          globalOrderFilter={globalOrderFilter}
          onOrderFilterChange={setGlobalOrderFilter}
          searchPlaceholder={
            currentPage === 'orders'
              ? 'Search orders, SKUs, or locations...'
              : currentPage === 'inventory'
              ? 'Search product names or SKUs...'
              : currentPage === 'help'
              ? 'Search FAQs or Troubleshooting...'
              : 'Search operations...'
          }
          onOpenNotifications={() => {}}
          onOpenQuickAssistant={() => setCurrentPage('decision')}
          onOpenProfile={() => setIsSettingsOpen(true)}
          onOpenDemoMode={() => setIsDemoModeOpen(true)}
          onOpenHelpCenter={() => setCurrentPage('help')}
        />

        {/* View Routing */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative pb-24">
          {currentPage === 'dashboard' && (
            <DashboardView
              stats={stats}
              recommendations={recommendations}
              automations={automations}
              orders={orders}
              engineState={engineState}
              onNavigate={(page) => setCurrentPage(page)}
              onAction={handleRecommendationAction}
              onDismissRecommendation={(recId) => {
                setRecommendations((prev) => prev.filter((r) => r.id !== recId));
                showToast('Recommendation Dismissed', 'Muthu will recalculate dispatch routing.');
              }}
              onExport={() => handleExportData('Warehouse Daily Overview')}
              onSelectOrderWorkflow={(orderId) => setInspectingOrderId(orderId)}
              onStepAllWorkflows={handleStepAllWorkflows}
              onSimulateQcDefect={handleSimulateGlobalQcDefect}
              onOpenSlaRiskModal={() => setIsSlaRiskModalOpen(true)}
              onOpenCriticalSkusModal={() => setIsCriticalSkusModalOpen(true)}
              onNavigateToLogisticsFilter={(filter) => {
                setLogisticsFilter(filter);
                setCurrentPage('logistics');
              }}
              onNavigateToOrdersFilter={() => {
                setGlobalOrderFilter('all');
                setCurrentPage('orders');
              }}
            />
          )}

          {currentPage === 'orders' && (
            <OrdersView
              orders={orders}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              onRefreshAnalysis={handleRefreshAnalysis}
              globalOrderFilter={globalOrderFilter}
              onOrderFilterChange={setGlobalOrderFilter}
              onFilterRiskOrders={() => {
                showToast('Filtering Delayed Shipments', 'Showing orders impacted by FedEx hub weather events.');
              }}
              onNavigateToInventory={() => setCurrentPage('inventory')}
              onAdvanceWorkflowStep={handleAdvanceWorkflowStep}
              onTriggerQcIssue={handleTriggerQcIssue}
              orderWorkflows={orderWorkflows}
              initialStatusFilter={ordersSubStatusFilter}
            />
          )}

          {currentPage === 'inventory' && (
            <InventoryView
              inventory={inventory}
              onAddItem={handleAddItem}
              onRestockItem={handleRestockItem}
              onExport={() => handleExportData('Inventory SKU Manifest')}
              onViewSpaceSimulation={() => setCurrentPage('decision')}
            />
          )}

          {currentPage === 'decision' && (
            <DecisionWorkspaceView
              onApplyStrategy={handleApplyStrategy}
              onAdjustParameters={(scenario) => {
                showToast('Adjusting Parameters', `Editing tuning thresholds for ${scenario.title}`);
              }}
            />
          )}

          {currentPage === 'simulation' && (
            <SimulationView
              onShowToast={showToast}
              onNavigateToOrders={() => setCurrentPage('orders')}
              globalOrderFilter={globalOrderFilter}
            />
          )}

          {currentPage === 'logistics' && (
            <LogisticsView
              trucks={trucks}
              initialFilter={logisticsFilter}
              onSelectOrder={(orderId) => setInspectingOrderId(orderId)}
              onUpdateTruckStatus={(truckId, newStatus) => {
                setTrucks((prev) =>
                  prev.map((t) => (t.id === truckId ? { ...t, currentStatus: newStatus } : t))
                );
              }}
            />
          )}

          {currentPage === 'analytics' && (
            <AnalyticsView
              onExport={() => handleExportData('Facility Performance Report')}
              onShowToast={showToast}
              globalOrderFilter={globalOrderFilter}
              onOrderFilterChange={setGlobalOrderFilter}
            />
          )}

          {currentPage === 'workers' && (
            <WorkersView
              workers={workers}
              onApproveBonus={(workerId) => {
                setWorkers((prev) =>
                  prev.map((w) => (w.id === workerId ? { ...w, bonusApproved: true } : w))
                );
                const w = workers.find((w) => w.id === workerId);
                showToast('Bonus Approved', `₹${w?.recommendedBonusInr?.toLocaleString()} bonus approved for ${w?.name}.`, 'success');
              }}
              onReallocateWorker={(workerId, targetZone) => {
                setWorkers((prev) =>
                  prev.map((w) => (w.id === workerId ? { ...w, zone: targetZone, currentWorkloadPercent: Math.min(w.currentWorkloadPercent + 15, 95) } : w))
                );
              }}
              onShowToast={showToast}
            />
          )}

          {currentPage === 'equipment' && (
            <EquipmentView
              equipment={equipment}
              onScheduleMaintenance={(equipmentId) => {
                setEquipment((prev) =>
                  prev.map((e) => (e.id === equipmentId ? { ...e, status: 'UNDER MAINTENANCE' } : e))
                );
                showToast('Maintenance Scheduled', 'Equipment moved to Under Maintenance status.', 'info');
              }}
              onAssignBackup={(equipmentId, backupId) => {
                setEquipment((prev) =>
                  prev.map((e) => {
                    if (e.id === equipmentId) return { ...e, status: 'UNDER MAINTENANCE' };
                    if (e.id === backupId || e.equipmentId === backupId || e.name.includes('FL-03')) {
                      return { ...e, status: 'OPERATIONAL', utilizationPercent: Math.min(e.utilizationPercent + 30, 95) };
                    }
                    return e;
                  })
                );
                showToast('Backup Asset Assigned', 'Backup unit activated to prevent dock and line disruption.', 'success');
              }}
              onCompleteMaintenance={(equipmentId) => {
                setEquipment((prev) =>
                  prev.map((e) => (e.id === equipmentId ? { ...e, status: 'OPERATIONAL', condition: 'Good' } : e))
                );
                showToast('Maintenance Completed', 'Equipment restored to Operational status.', 'success');
              }}
              onShowToast={showToast}
            />
          )}

          {currentPage === 'calendar' && (
            <CalendarView
              events={calendarEvents}
              insights={calendarInsights}
              onShowToast={showToast}
              onApplyInsightAction={(insightId) => {
                if (insightId === 'mci-101') {
                  // Reallocate packing associates to station 2
                  setWorkers((prev) =>
                    prev.map((w) => (w.name.includes('Asha') || w.name.includes('Ananya') ? { ...w, currentWorkloadPercent: 78 } : w))
                  );
                } else if (insightId === 'mci-102') {
                  // Deploy standby forklift FL-03
                  setEquipment((prev) =>
                    prev.map((e) => {
                      if (e.equipmentId === 'FL-07') return { ...e, nextMaintenanceDate: '2026-02-18 (Night Shift)' };
                      if (e.equipmentId === 'FL-03') return { ...e, status: 'OPERATIONAL', utilizationPercent: 82 };
                      return e;
                    })
                  );
                }
              }}
            />
          )}

          {currentPage === 'reports' && (
            <ReportsView
              reports={monthlyReports}
              onShowToast={showToast}
            />
          )}

          {currentPage === 'help' && (
            <HelpCenterView
              onNavigate={(pageId) => setCurrentPage(pageId)}
              onStartTour={handleStartTour}
              onShowToast={showToast}
            />
          )}
        </main>

        {/* Global Compact Floating Workflow Engine Control Button [⚙] & Panel */}
        <WorkflowControlBar
          panelState={workflowPanelState}
          onSetPanelState={setWorkflowPanelState}
          engineState={engineState}
          onToggleAutoDrive={() =>
            setEngineState((prev) => ({ ...prev, isLiveAutoDrive: !prev.isLiveAutoDrive }))
          }
          onChangeSpeed={(speed) =>
            setEngineState((prev) => ({ ...prev, speedMultiplier: speed }))
          }
          onStepAllWorkflows={handleStepAllWorkflows}
          onSimulateQcDefect={handleSimulateGlobalQcDefect}
          onSelectOrderForWorkflow={(orderId) => setInspectingOrderId(orderId)}
          orders={orders}
        />
      </div>

      {/* Guided Product Tour Modal Overlay */}
      <ProductTourModal
        isOpen={isProductTourOpen}
        currentStepIndex={tourStepIndex}
        onNextStep={() => setTourStepIndex((prev) => prev + 1)}
        onPrevStep={() => setTourStepIndex((prev) => prev - 1)}
        onSkipTour={() => setIsProductTourOpen(false)}
        onFinishTour={() => {
          setIsProductTourOpen(false);
          showToast('Guided Tour Complete', 'You have completed the MUTHU product walkthrough!', 'success');
        }}
        onNavigate={(pageId) => setCurrentPage(pageId)}
      />

      {/* SLA Risk Detailed Audit Modal */}
      <SlaRiskModal
        isOpen={isSlaRiskModalOpen}
        onClose={() => setIsSlaRiskModalOpen(false)}
        orders={orders}
        onApproveRecommendation={(ord) => {
          handleAdvanceWorkflowStep(ord.id);
          showToast('Recommendation Approved', `Moved 2 packers from Zone B to Packing Station 2 for ${ord.orderNumber}. SLA risk mitigated.`);
        }}
        onSelectOrderWorkflow={(id) => setInspectingOrderId(id)}
      />

      {/* Critical SKUs Inventory Modal */}
      <CriticalSkusModal
        isOpen={isCriticalSkusModalOpen}
        onClose={() => setIsCriticalSkusModalOpen(false)}
        inventory={inventory}
        onRestockItem={(id, amt) => {
          handleRestockItem(id, amt);
          showToast('Restock Initiated', `Replenished inventory stock by +${amt} units.`);
        }}
      />

      {/* Workflow Timeline Modal */}
      <WorkflowTimelineModal
        isOpen={Boolean(inspectingOrderId)}
        order={inspectedOrder}
        workflow={inspectedWorkflow}
        onClose={() => setInspectingOrderId(null)}
        onAdvanceStep={(orderId) => handleAdvanceWorkflowStep(orderId)}
        onTriggerQcIssue={(orderId) => handleTriggerQcIssue(orderId)}
      />

      {/* Modals & Floating Components */}
      <NewReportModal
        isOpen={isNewReportOpen}
        onClose={() => setIsNewReportOpen(false)}
        onGenerate={(name, fmt) => handleExportData(`${name} (${fmt})`)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={(settings) => {
          showToast('Settings Saved', `Facility updated to ${settings.warehouseName}`);
        }}
      />

      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Hackathon Demo Showcase Modal */}
      <DemoModeModal
        isOpen={isDemoModeOpen}
        onClose={() => setIsDemoModeOpen(false)}
        onApplyScenarioToLiveApp={handleApplyDemoScenario}
        onShowToast={showToast}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  );
}
