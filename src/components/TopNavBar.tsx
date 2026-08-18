import React, { useState } from 'react';
import { USER_AVATAR_URL } from '../mockData';
import { GlobalOrderFilter } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n';

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
  searchPlaceholder,
  globalOrderFilter = 'all',
  onOrderFilterChange,
  onOpenNotifications,
  onOpenQuickAssistant,
  onOpenProfile,
  onOpenDemoMode,
  onOpenHelpCenter
}) => {
  const { language, setLanguage, t } = useLanguage();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const notificationsList = [
    { id: 'n1', title: 'Carrier delay alert on Hyderabad–Vijayawada NH65', time: '5m ago', unread: true, type: 'warning' },
    { id: 'n2', title: 'Zone B throughput stabilized after worker rebalance', time: '18m ago', unread: true, type: 'success' },
    { id: 'n3', title: 'Morning Shift dispatched 1,402 units (100% SLA)', time: '1h ago', unread: false, type: 'info' }
  ];

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header
      id="top-navbar"
      className="sticky top-0 z-40 flex justify-between items-center w-full px-4 sm:px-6 md:px-8 h-[72px] bg-white/90 backdrop-blur-md border-b border-zinc-200 shrink-0 gap-3"
    >
      {/* Left: Hamburger Sidebar Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile Hamburger Toggle */}
        <button
          id="btn-mobile-menu"
          onClick={onToggleMobileNav}
          className="md:hidden text-zinc-600 p-2 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
          aria-label="Toggle mobile menu"
          title="Toggle Navigation Menu"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
        </button>

        {/* Global Search Input */}
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 text-[19px]">
            search
          </span>
          <input
            id="global-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder || t('nav.searchPlaceholder', 'Search operations, orders, SKUs...')}
            className="w-full bg-zinc-50 hover:bg-zinc-100/80 focus:bg-white text-zinc-900 placeholder:text-zinc-400 text-xs rounded-xl pl-10 pr-9 py-2 border border-zinc-250 focus:border-amber-500 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>
      </div>

      {/* Center: Global Segment Pills */}
      {onOrderFilterChange && (
        <div className="hidden xl:flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs shrink-0">
          <button
            id="btn-filter-all-orders"
            onClick={() => onOrderFilterChange('all')}
            className={`px-3 py-1 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer ${
              globalOrderFilter === 'all'
                ? 'bg-white text-zinc-900 shadow-2xs font-extrabold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            title="Show all order categories"
          >
            {t('nav.allSegments', 'All Segments')}
          </button>

          <button
            id="btn-filter-business-orders"
            onClick={() => onOrderFilterChange('business')}
            className={`px-3 py-1 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              globalOrderFilter === 'business'
                ? 'bg-amber-600 text-white shadow-2xs font-extrabold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            title="Filter to Business Orders (B2B Enterprise & Wholesale)"
          >
            <span className="material-symbols-outlined text-[14px]">domain</span>
            <span>{t('nav.b2bOnly', 'B2B Enterprise')}</span>
          </button>

          <button
            id="btn-filter-individual-orders"
            onClick={() => onOrderFilterChange('individual')}
            className={`px-3 py-1 text-[11.5px] font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
              globalOrderFilter === 'individual'
                ? 'bg-zinc-900 text-white shadow-2xs font-extrabold'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
            title="Filter to Individual Orders (B2C Direct Consumer)"
          >
            <span className="material-symbols-outlined text-[14px]">person</span>
            <span>{t('nav.b2cOnly', 'B2C Consumer')}</span>
          </button>
        </div>
      )}

      {/* Right: Language Selector, Demo Mode, Notifications & Profile */}
      <div className="flex items-center gap-2 md:gap-3 relative shrink-0">
        {/* ========================================================================= */}
        {/* MULTI-LANGUAGE SELECTOR (English, Hindi, Telugu) */}
        {/* ========================================================================= */}
        <div className="relative">
          <button
            id="btn-language-selector"
            onClick={() => setShowLanguageMenu(!showLanguageMenu)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200/80 border border-zinc-250 text-zinc-800 font-bold text-xs transition-all cursor-pointer shadow-2xs"
            title="Change Application Language"
          >
            <span className="text-sm">{currentLangObj.flag}</span>
            <span className="font-semibold hidden sm:inline">{currentLangObj.nativeLabel}</span>
            <span className="material-symbols-outlined text-xs text-zinc-500">expand_more</span>
          </button>

          {showLanguageMenu && (
            <div
              id="language-dropdown-menu"
              className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-xl border border-zinc-200 p-1.5 z-50 animate-fadeIn"
            >
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-zinc-400 font-mono border-b border-zinc-100">
                {t('nav.language', 'Select Language')}
              </div>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  id={`lang-opt-${lang.code}`}
                  onClick={() => {
                    setLanguage(lang.code);
                    setShowLanguageMenu(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-left ${
                    language === lang.code
                      ? 'bg-amber-100 text-amber-950'
                      : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-950'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <span>{lang.nativeLabel}</span>
                  </div>
                  {language === lang.code && (
                    <span className="material-symbols-outlined text-xs text-amber-700">check</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Hackathon Demo Mode Pill Button */}
        {onOpenDemoMode && (
          <button
            id="btn-topbar-demo-mode"
            onClick={onOpenDemoMode}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/15 via-amber-100/50 to-amber-500/15 hover:bg-amber-500/25 border border-amber-300 text-amber-900 font-label-md text-[11.5px] font-bold rounded-full transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="material-symbols-outlined text-[15px] text-amber-600">smart_toy</span>
            <span className="hidden sm:inline">{t('nav.demoMode', 'Demo Mode')}</span>
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
            className="p-2 rounded-full hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors relative cursor-pointer"
            aria-label="View notifications"
          >
            <span className="material-symbols-outlined text-[20px]">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white" />
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div
              id="notifications-dropdown"
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-zinc-200 p-4 z-50 animate-fadeIn"
            >
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-zinc-100">
                <span className="font-bold text-xs text-zinc-900">{t('nav.notifications', 'Notifications')}</span>
                <span className="text-[10px] text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-full font-mono">
                  3 Active
                </span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {notificationsList.map((n) => (
                  <div
                    key={n.id}
                    className={`p-2.5 rounded-xl transition-colors cursor-pointer text-left text-xs ${
                      n.unread ? 'bg-amber-50/60 font-medium' : 'hover:bg-zinc-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={`material-symbols-outlined text-[16px] mt-0.5 ${
                          n.type === 'warning'
                            ? 'text-amber-600'
                            : n.type === 'success'
                            ? 'text-emerald-600'
                            : 'text-zinc-500'
                        }`}
                      >
                        {n.type === 'warning' ? 'warning' : n.type === 'success' ? 'check_circle' : 'info'}
                      </span>
                      <div className="flex-1">
                        <p className="text-[12px] text-zinc-900 leading-snug">{n.title}</p>
                        <span className="text-[10px] text-zinc-400 mt-1 block font-mono">
                          {n.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setShowNotifications(false)}
                className="w-full mt-3 py-1.5 text-center text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
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
          className="p-2 rounded-full hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          aria-label="Open operations assistant"
          title={t('nav.quickAssistant', 'Quick Copilot')}
        >
          <span className="material-symbols-outlined text-[20px]">chat_bubble</span>
        </button>

        <div className="w-px h-6 bg-zinc-200 mx-1 hidden sm:block" />

        {/* User Profile */}
        <div className="relative">
          <button
            id="btn-user-profile"
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              if (onOpenProfile) onOpenProfile();
            }}
            className="flex items-center gap-2.5 hover:bg-zinc-100 p-1.5 md:pr-3 rounded-full transition-colors cursor-pointer text-left"
          >
            <img
              alt="Jane Doe - Operations Manager"
              className="w-8 h-8 rounded-full object-cover border border-zinc-300 shrink-0"
              src={USER_AVATAR_URL}
            />
            <div className="hidden lg:block">
              <p className="text-xs font-bold text-zinc-900 leading-tight">
                Jane Doe
              </p>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">
                Operations Lead
              </p>
            </div>
            <span className="material-symbols-outlined text-zinc-400 text-[16px] hidden lg:block">
              expand_more
            </span>
          </button>

          {/* Profile Dropdown */}
          {showProfileMenu && (
            <div
              id="profile-dropdown"
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-zinc-200 p-2 z-50 animate-fadeIn"
            >
              <div className="px-3 py-2 border-b border-zinc-100 mb-1">
                <p className="font-bold text-xs text-zinc-900">Jane Doe</p>
                <p className="text-[11px] text-zinc-500 font-mono">HYD-Central Hub • Dock Bay 04</p>
              </div>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">badge</span>
                Operational Profile
              </button>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-zinc-800 hover:bg-zinc-100 rounded-xl transition-colors text-left cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Warehouse Preferences
              </button>
              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 rounded-xl transition-colors text-left mt-1 border-t border-zinc-100 pt-2 cursor-pointer font-bold"
              >
                <span className="material-symbols-outlined text-[16px]">lock</span>
                Lock Terminal
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
