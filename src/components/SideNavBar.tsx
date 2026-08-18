import React, { useState } from 'react';
import { PageId } from '../types';
import { MASCOT_LOGO_URL } from '../mockData';

interface SideNavBarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  onSelectOrderStatusFilter?: (status: string) => void;
  ordersCounts?: Record<string, number>;
  onOpenNewReport: () => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
  onOpenDemoMode?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
}

export const SideNavBar: React.FC<SideNavBarProps> = ({
  currentPage,
  onNavigate,
  onSelectOrderStatusFilter,
  ordersCounts,
  onOpenNewReport,
  onOpenSettings,
  onOpenSupport,
  onOpenDemoMode,
  isMobileOpen = false,
  onCloseMobile,
  isCollapsed = false
}) => {
  const [isOrdersSubmenuOpen, setIsOrdersSubmenuOpen] = useState(true);
  const [activeSubFilter, setActiveSubFilter] = useState<string>('All');

  // Exact 12 navigation sections requested in Section 1
  const navItems: { id: PageId | 'settings'; label: string; icon: string; isAiCopilot?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'orders', label: 'Orders', icon: 'shopping_cart' },
    { id: 'inventory', label: 'Inventory', icon: 'inventory_2' },
    { id: 'logistics', label: 'Logistics', icon: 'local_shipping' },
    { id: 'workers', label: 'Workers', icon: 'group' },
    { id: 'equipment', label: 'Equipment', icon: 'precision_manufacturing' },
    { id: 'simulation', label: 'Simulation Center', icon: 'model_training' },
    { id: 'analytics', label: 'Analytics', icon: 'analytics' },
    { id: 'reports', label: 'Reports', icon: 'assessment' },
    { id: 'decision', label: '🤎 Meet Muthu', icon: 'smart_toy', isAiCopilot: true },
    { id: 'help', label: 'Help Center', icon: 'help' },
    { id: 'settings', label: 'Settings', icon: 'settings' }
  ];

  // Nested Orders Submenu Items (Section 16)
  const orderStatusSubItems = [
    { key: 'All', label: 'All Orders', countKey: 'All' },
    { key: 'RECEIVED', label: 'Received', countKey: 'RECEIVED' },
    { key: 'PICKING', label: 'Picking', countKey: 'PICKING' },
    { key: 'PACKING', label: 'Packing', countKey: 'PACKING' },
    { key: 'QUALITY CHECK', label: 'Quality Check', countKey: 'QUALITY CHECK' },
    { key: 'READY FOR DISPATCH', label: 'Ready for Dispatch', countKey: 'READY FOR DISPATCH' },
    { key: 'DISPATCHED', label: 'Dispatched', countKey: 'DISPATCHED' },
    { key: 'ON THE WAY', label: 'On the Way', countKey: 'ON THE WAY' },
    { key: 'DELIVERED', label: 'Delivered', countKey: 'DELIVERED' }
  ];

  const handleItemClick = (id: PageId | 'settings') => {
    if (id === 'settings') {
      onOpenSettings();
      if (onCloseMobile) onCloseMobile();
      return;
    }

    if (id === 'orders') {
      setIsOrdersSubmenuOpen((prev) => !prev);
    }
    onNavigate(id);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleSubItemClick = (statusKey: string) => {
    setActiveSubFilter(statusKey);
    onNavigate('orders');
    if (onSelectOrderStatusFilter) {
      onSelectOrderStatusFilter(statusKey);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const navContent = (collapsed: boolean) => (
    <div className={`flex flex-col h-full py-4 gap-2.5 ${collapsed ? 'px-2' : 'px-3.5'}`}>
      {/* Header / Logo */}
      <div
        id="nav-brand-header"
        onClick={() => handleItemClick('dashboard')}
        className={`flex items-center gap-3 cursor-pointer select-none group mb-1 ${
          collapsed ? 'justify-center px-1' : 'px-2'
        }`}
        title={collapsed ? 'MUTHU — Your Smart Operations Partner' : undefined}
      >
        <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover:scale-105 bg-white border border-zinc-200">
          <img
            alt="MUTHU Mascot Logo"
            className="w-full h-full object-cover"
            src={MASCOT_LOGO_URL}
          />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="font-headline-sm text-[18px] font-bold text-zinc-900 leading-tight tracking-tight truncate">
              MUTHU
            </h1>
            <p className="font-label-caps text-[9px] text-zinc-500 uppercase tracking-wider truncate font-mono">
              Smart Operations Partner
            </p>
          </div>
        )}
      </div>

      {/* Navigation Links */}
      <nav id="sidebar-nav-links" className="flex-1 flex flex-col gap-0.5 overflow-y-auto pr-0.5 scrollbar-thin">
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          const isOrders = item.id === 'orders';

          return (
            <div key={item.id} className="w-full space-y-0.5">
              <button
                id={`nav-link-${item.id}`}
                onClick={() => handleItemClick(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center gap-2.5 py-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  collapsed ? 'justify-center px-2' : 'px-3 text-left'
                } ${
                  isActive
                    ? 'font-bold text-zinc-900 bg-zinc-150 shadow-2xs border border-zinc-250'
                    : 'font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                }`}
              >
                <span
                  className={`material-symbols-outlined text-[19px] transition-colors shrink-0 ${
                    isActive
                      ? 'icon-fill text-zinc-900'
                      : item.isAiCopilot
                      ? 'text-amber-600'
                      : 'text-zinc-500'
                  }`}
                >
                  {item.icon}
                </span>
                {!collapsed && (
                  <span className="font-label-md text-[12.5px] flex-1 truncate">{item.label}</span>
                )}
                {!collapsed && isOrders && (
                  <span className="material-symbols-outlined text-base text-zinc-400">
                    {isOrdersSubmenuOpen ? 'expand_less' : 'expand_more'}
                  </span>
                )}
                {!collapsed && item.isAiCopilot && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                )}
              </button>

              {/* Nested Expandable Orders Submenu with Live Counts (Section 16) */}
              {isOrders && !collapsed && isOrdersSubmenuOpen && (
                <div className="pl-4 space-y-0.5 py-1 border-l-2 border-amber-300 ml-5 animate-fadeIn">
                  {orderStatusSubItems.map((sub) => {
                    const count = ordersCounts ? ordersCounts[sub.countKey] ?? 0 : 0;
                    const isSubActive = currentPage === 'orders' && activeSubFilter === sub.key;

                    return (
                      <button
                        key={sub.key}
                        id={`orders-submenu-${sub.key.toLowerCase().replace(/\s+/g, '-')}`}
                        onClick={() => handleSubItemClick(sub.key)}
                        className={`w-full flex items-center justify-between px-2.5 py-1 rounded-lg text-[11.5px] transition-colors cursor-pointer text-left ${
                          isSubActive
                            ? 'font-bold text-amber-950 bg-amber-100/70'
                            : 'font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                        }`}
                      >
                        <span className="truncate">{sub.label}</span>
                        <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold ${
                          isSubActive
                            ? 'bg-amber-200 text-amber-900'
                            : 'bg-zinc-150 text-zinc-600'
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer Navigation & Actions */}
      <div className="mt-auto flex flex-col gap-1.5 pt-2 border-t border-zinc-200 shrink-0">
        {onOpenDemoMode && (
          <button
            id="btn-sidebar-demo-mode"
            onClick={onOpenDemoMode}
            title={collapsed ? 'Demo Mode Showcase' : undefined}
            className={`w-full py-1.5 bg-gradient-to-r from-amber-500/15 via-amber-100/40 to-amber-500/15 border border-amber-300 text-amber-900 font-label-md text-[12px] rounded-xl hover:bg-amber-500/20 transition-all flex items-center shadow-2xs cursor-pointer group ${
              collapsed ? 'justify-center px-2' : 'justify-between px-3'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[17px] text-amber-600 group-hover:scale-110 transition-transform shrink-0">
                smart_toy
              </span>
              {!collapsed && <span className="font-bold text-zinc-900">Demo Mode</span>}
            </div>
            {!collapsed && (
              <span className="font-label-caps text-[8px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 uppercase">
                Showcase
              </span>
            )}
          </button>
        )}

        <button
          id="btn-new-report"
          onClick={onOpenNewReport}
          title={collapsed ? 'New Report' : undefined}
          className={`w-full py-1.5 bg-zinc-900 text-white font-label-md text-[12px] rounded-xl hover:bg-zinc-800 transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer ${
            collapsed ? 'px-2' : 'px-3'
          }`}
        >
          <span className="material-symbols-outlined text-[17px] shrink-0">add</span>
          {!collapsed && <span>New Report</span>}
        </button>

        <button
          id="nav-link-support"
          onClick={onOpenSupport}
          title={collapsed ? 'Support' : undefined}
          className={`flex items-center gap-2.5 py-1.5 font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 rounded-xl transition-colors cursor-pointer text-left ${
            collapsed ? 'justify-center px-2' : 'px-3'
          }`}
        >
          <span className="material-symbols-outlined text-[19px] shrink-0">support_agent</span>
          {!collapsed && <span className="font-label-md text-[12px]">Support</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        id="desktop-sidebar"
        className={`h-screen sticky left-0 top-0 bg-white hidden md:flex flex-col shrink-0 border-r border-zinc-200 z-30 select-none transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[76px]' : 'w-[260px]'
        }`}
      >
        {navContent(isCollapsed)}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          id="mobile-drawer-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 md:hidden transition-opacity"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        id="mobile-sidebar"
        className={`fixed top-0 bottom-0 left-0 w-[280px] bg-white z-50 md:hidden flex flex-col shadow-xl transition-transform duration-300 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            id="btn-close-mobile-nav"
            onClick={onCloseMobile}
            className="p-2 text-zinc-500 hover:text-zinc-900 rounded-lg cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {navContent(false)}
      </aside>
    </>
  );
};
