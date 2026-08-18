import React, { useState } from 'react';
import { USER_AVATAR_URL } from '../mockData';
import { GlobalOrderFilter } from '../types';

interface TopNavBarProps {
  onToggleMobileNav: () => void;
  onToggleSidebar?: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  searchPlaceholder?: string;
  globalOrderFilter?: GlobalOrderFilter;
  onOrderFilterChange?: (filter: GlobalOrderFilter) => void;
  onOpenNotifications?: () => void;
  onOpenQuickAssistant?: () => void;
  onOpenProfile?: () => void;
  onOpenDemoMode?: () => void;
  onOpenHelpCenter?: () => void;
}

export const TopNavBar: React.FC<TopNavBarProps> = ({
  onToggleMobileNav,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search operations...',
  globalOrderFilter = 'all',
  onOrderFilterChange,
  onOpenNotifications,
  onOpenQuickAssistant,
  onOpenProfile,
  onOpenDemoMode,
  onOpenHelpCenter
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationsList = [
    { id: 'n1', title: 'Carrier delay alert at Memphis hub', time: '5m ago', unread: true, type: 'warning' },
    { id: 'n2', title: 'Zone B throughput stabilized', time: '18m ago', unread: true, type: 'success' },
    { id: 'n3', title: 'Shift 1 dispatched 1,402 units', time: '1h ago', unread: false, type: 'info' }
  ];

  return (
    <header
      id="top-navbar"
      className="sticky top-0 z-40 flex justify-between items-center w-full px-4 sm:px-6 md:px-8 h-[72px] bg-surface/85 backdrop-blur-md border-b border-outline-variant/30 shrink-0 gap-3"
    >
      {/* Left: Hamburger Sidebar Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile Hamburger Toggle */}
        <button
          id="btn-mobile-menu"
          onClick={onToggleMobileNav}
          className="md:hidden text-on-surface-variant p-2 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
          aria-label="Toggle mobile menu"
          title="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Desktop Hamburger Toggle */}
        <button
          id="btn-desktop-collapse-toggle"
          onClick={onToggleSidebar}
          className="hidden md:flex text-on-surface-variant p-2 rounded-xl hover:bg-surface-container-high transition-colors cursor-pointer"
          aria-label="Toggle desktop sidebar collapse"
          title="Collapse / Expand Sidebar"
        >
          <span className="material-symbols-outlined text-[22px]">menu</span>
        </button>

        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-10 pr-9 py-2 bg-surface-container-high rounded-full border-none focus:ring-2 focus:ring-primary/20 transition-all font-body-md text-[13.5px] text-on-surface placeholder:text-outline outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Center: Global Order Segment Filter (B2B vs B2C vs All) */}
      {onOrderFilterChange && (
        <div
          id="global-order-type-filter"
          className="hidden md:flex items-center p-1 bg-surface-container rounded-full border border-outline-variant/40 shadow-xs shrink-0"
        >
          <button
            id="btn-filter-all-orders"
            onClick={() => onOrderFilterChange('all')}
            className={`px-3 py-1 text-[12px] font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              globalOrderFilter === 'all'
                ? 'bg-surface-container-lowest text-primary shadow-xs font-extrabold'
                : 'text-outline hover:text-on-surface'
            }`}
            title="Show all enterprise and consumer orders"
          >
            <span className="material-symbols-outlined text-[15px]">grid_view</span>
            <span>All Orders</span>
          </button>

          <button
            id="btn-filter-business-orders"
            onClick={() => onOrderFilterChange('business')}
            className={`px-3 py-1 text-[12px] font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              globalOrderFilter === 'business'
                ? 'bg-primary text-on-primary shadow-xs font-extrabold'
                : 'text-outline hover:text-on-surface'
            }`}
            title="Filter to Business Orders (B2B Enterprise & Freight)"
          >
            <span className="material-symbols-outlined text-[15px]">domain</span>
            <span>Business (B2B)</span>
          </button>

          <button
            id="btn-filter-individual-orders"
            onClick={() => onOrderFilterChange('individual')}
            className={`px-3 py-1 text-[12px] font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
              globalOrderFilter === 'individual'
                ? 'bg-secondary text-on-secondary shadow-xs font-extrabold'
                : 'text-outline hover:text-on-surface'
            }`}
            title="Filter to Individual Orders (B2C Consumer & Same-Day)"
          >
            <span className="material-symbols-outlined text-[15px]">person</span>
            <span>Individual (B2C)</span>
          </button>
        </div>
      )}

      {/* Right: Actions & User Info */}
      <div className="flex items-center gap-2 md:gap-3 text-on-surface-variant relative shrink-0">
        {/* Hackathon Demo Mode Pill Button */}
        {onOpenDemoMode && (
          <button
            id="btn-topbar-demo-mode"
            onClick={onOpenDemoMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 via-primary/15 to-amber-500/20 hover:from-amber-500/30 hover:to-amber-500/30 border border-amber-500/30 text-on-surface font-label-md text-[12px] font-bold rounded-full transition-all shadow-xs active:scale-95 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="material-symbols-outlined text-[16px] text-amber-600">smart_toy</span>
            <span className="hidden sm:inline">Demo Mode</span>
          </button>
        )}

        {/* Notifications Button */}
        <div className="relative">
          <button
            id="btn-notifications"
            onClick={() => {
              setShowNotifications(!showNotifications);
              if (onOpenNotifications) onOpenNotifications();
            }}
            className="p-2 rounded-full hover:text-primary hover:bg-surface-container-high transition-colors relative cursor-pointer"
            aria-label="View notifications"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-80 bg-surface-container-lowest rounded-2xl shadow-ambient-lg border border-outline-variant/30 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-outline-variant/20">
                <span className="font-label-md font-bold text-on-surface">Notifications</span>
                <span className="font-label-caps text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  2 New
                </span>
              </div>
              <div className="space-y-2.5 max-h-64 overflow-y-auto">
                {notificationsList.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer text-left ${
                      n.unread ? 'bg-surface-container-low/70 font-medium' : 'hover:bg-surface-container-low'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`material-symbols-outlined text-[16px] mt-0.5 ${
                          n.type === 'warning'
                            ? 'text-error'
                            : n.type === 'success'
                            ? 'text-tertiary'
                            : 'text-primary'
                        }`}
                      >
                        {n.type === 'warning' ? 'warning' : n.type === 'success' ? 'check_circle' : 'info'}
                      </span>
                      <div className="flex-1">
                        <p className="text-[13px] text-on-surface leading-snug">{n.title}</p>
                        <span className="font-label-caps text-[10px] text-outline mt-1 block">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full mt-3 py-1.5 text-center font-label-md text-[12px] text-primary hover:underline"
              >
                Mark all as read
              </button>
            </div>
          )}
        </div>

        {/* Chat / Assistant Button */}
        <button
          id="btn-chat"
          onClick={onOpenQuickAssistant}
          className="p-2 rounded-full hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
          aria-label="Open operations assistant"
        >
          <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
        </button>

        <div className="w-px h-6 bg-outline-variant/30 mx-1 hidden sm:block" />

        {/* User Profile */}
        <div className="relative">
          <button
            id="btn-user-profile"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              if (onOpenProfile) onOpenProfile();
            }}
            className="flex items-center gap-3 hover:bg-surface-container-high p-1.5 md:pr-3 rounded-full transition-colors cursor-pointer text-left"
          >
            <img
              alt="Jane Doe - Operations Manager"
              className="w-8 h-8 rounded-full object-cover border border-outline-variant shrink-0"
              src={USER_AVATAR_URL}
            />
            <div className="hidden lg:block">
              <p className="font-label-md text-label-md text-on-surface leading-tight font-semibold">
                Jane Doe
              </p>
              <p className="font-label-caps text-[10px] text-outline uppercase tracking-wider">
                Operations Mgr
              </p>
            </div>
            <span className="material-symbols-outlined text-outline text-[18px] hidden lg:block">
              expand_more
            </span>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div
              id="profile-dropdown"
              className="absolute right-0 mt-2 w-56 bg-surface-container-lowest rounded-2xl shadow-ambient-lg border border-outline-variant/30 p-2 z-50"
            >
              <div className="px-3 py-2 border-b border-outline-variant/20 mb-1">
                <p className="font-label-md font-bold text-on-surface">Jane Doe</p>
                <p className="text-[12px] text-on-surface-variant">Facility Bay-04 • West Coast</p>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-low rounded-lg transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[18px]">badge</span>
                Operational Profile
              </button>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-on-surface hover:bg-surface-container-low rounded-lg transition-colors text-left"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                Warehouse Preferences
              </button>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-error hover:bg-error-container/20 rounded-lg transition-colors text-left mt-1 border-t border-outline-variant/20 pt-2"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                Lock Terminal
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
