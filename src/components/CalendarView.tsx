import React, { useState, useMemo } from 'react';
import { CalendarEvent, CalendarEventType, MuthuCalendarInsight } from '../calendarData';
import { useLanguage } from '../context/LanguageContext';

interface CalendarViewProps {
  events: CalendarEvent[];
  insights: MuthuCalendarInsight[];
  onShowToast: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  onApplyInsightAction?: (insightId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  events,
  insights,
  onShowToast,
  onApplyInsightAction
}) => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'Day' | 'Week' | 'Month'>('Month');
  const [selectedDate, setSelectedDate] = useState<string>('2026-02-18');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [appliedInsights, setAppliedInsights] = useState<Set<string>>(new Set());

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const matchesType = typeFilter === 'All' || ev.type === typeFilter;
      if (viewMode === 'Day') {
        return matchesType && ev.date === selectedDate;
      }
      return matchesType;
    });
  }, [events, typeFilter, viewMode, selectedDate]);

  // Calendar dates for Month Grid (Feb 2026)
  const monthDays = useMemo(() => {
    const days = [];
    // 28 days of Feb 2026 (starting Sunday Feb 1)
    for (let i = 1; i <= 28; i++) {
      const dayStr = i < 10 ? `0${i}` : `${i}`;
      const fullDate = `2026-02-${dayStr}`;
      const dayEvents = events.filter((e) => e.date === fullDate);
      days.push({
        dayNumber: i,
        dateStr: fullDate,
        isCurrentMonth: true,
        events: dayEvents,
        hasCritical: dayEvents.some((e) => e.type === 'Critical' || e.isHighPriority),
        hasMaintenance: dayEvents.some((e) => e.type === 'Maintenance')
      });
    }
    return days;
  }, [events]);

  const handleApplyInsight = (insight: MuthuCalendarInsight) => {
    setAppliedInsights((prev) => new Set(prev).add(insight.id));
    if (onApplyInsightAction) {
      onApplyInsightAction(insight.id);
    }
    onShowToast('Action Approved', `Muthu plan applied: ${insight.recommendedAction}`, 'success');
  };

  const eventTypeFilters: { label: string; key: string; icon: string }[] = [
    { label: t('cal.allEvents', 'All Events'), key: 'All', icon: 'event' },
    { label: t('cal.dispatch', 'Dispatch'), key: 'Dispatch', icon: 'local_shipping' },
    { label: t('cal.delivery', 'Delivery'), key: 'Delivery', icon: 'inventory_2' },
    { label: t('cal.shifts', 'Worker Shifts'), key: 'Worker Shift', icon: 'group' },
    { label: t('cal.maintenance', 'Maintenance'), key: 'Maintenance', icon: 'build' },
    { label: t('cal.audit', 'Audits'), key: 'Audit', icon: 'assignment' },
    { label: t('cal.supplier', 'Supplier Inbound'), key: 'Supplier', icon: 'factory' },
    { label: t('cal.reports', 'Reports'), key: 'Reports', icon: 'monitoring' },
    { label: t('cal.critical', 'Critical'), key: 'Critical', icon: 'warning' }
  ];

  return (
    <div id="calendar-view" className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
              Operational Planning Engine
            </span>
            <span className="text-xs text-zinc-500 font-medium font-mono">• February 2026</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 tracking-tight mt-1">
            {t('cal.title', 'Operations Planning Calendar')}
          </h1>
          <p className="text-xs md:text-sm text-zinc-500 mt-0.5">
            {t('cal.subtitle', 'Integrated dispatch schedules, worker shifts, supplier deliveries & maintenance windows.')}
          </p>
        </div>

        {/* View Mode Switcher (Day / Week / Month) & Export */}
        <div className="flex items-center gap-2.5">
          <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs font-bold">
            {(['Day', 'Week', 'Month'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                  viewMode === mode
                    ? 'bg-white text-zinc-900 shadow-2xs font-extrabold'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                {t(`cal.${mode.toLowerCase()}View`, mode)}
              </button>
            ))}
          </div>

          <button
            onClick={() => onShowToast('Calendar Export', 'Operations calendar ledger exported to CSV.', 'success')}
            className="px-3.5 py-2 bg-white border border-zinc-300 hover:bg-zinc-50 text-zinc-800 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">download</span>
            <span>{t('action.export', 'Export')}</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 4: MUTHU CALENDAR INSIGHTS ("Muthu Observes") */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-50/70 to-amber-500/10 rounded-3xl p-5 md:p-6 border border-amber-300 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500 text-zinc-950 font-bold flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-2xl">smart_toy</span>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 font-mono">
              Muthu Observes • Predictive Schedule Triage
            </span>
            <h3 className="text-base md:text-lg font-bold text-zinc-900">
              {t('cal.muthuInsights', 'Muthu Calendar Insights & Schedule Optimizations')}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {insights.map((insight) => {
            const isApplied = appliedInsights.has(insight.id);

            return (
              <div
                key={insight.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 flex flex-col justify-between ${
                  isApplied ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-amber-200/90 shadow-2xs'
                }`}
              >
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold font-mono">
                      {insight.targetDate}
                    </span>
                    <span className="text-[10.5px] font-mono text-zinc-500 font-bold">
                      {insight.confidenceScore}% Confidence
                    </span>
                  </div>

                  <h4 className="font-bold text-zinc-900 text-xs md:text-sm leading-snug">{insight.title}</h4>

                  <p className="text-zinc-700 leading-relaxed text-[11.5px]">{insight.observation}</p>

                  <div className="p-2.5 bg-amber-50/80 rounded-xl border border-amber-200/80 text-[11px] space-y-1">
                    <span className="font-bold text-amber-950 uppercase text-[9.5px] block font-mono">
                      Muthu Action Plan:
                    </span>
                    <p className="text-zinc-900 font-semibold">{insight.recommendedAction}</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
                  {isApplied ? (
                    <span className="text-emerald-800 font-bold flex items-center gap-1 text-[11px]">
                      <span className="material-symbols-outlined text-sm">task_alt</span>
                      Action Active on Floor
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApplyInsight(insight)}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1 text-xs"
                    >
                      <span className="material-symbols-outlined text-sm">check</span>
                      <span>Approve Recommendation</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 5: CALENDAR FILTERS & EVENT TYPE TOOLBAR */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 font-mono">
            {t('action.filter', 'Filter Events')}:
          </span>
          {eventTypeFilters.map((flt) => (
            <button
              key={flt.key}
              onClick={() => setTypeFilter(flt.key)}
              className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 border text-xs ${
                typeFilter === flt.key
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                  : 'bg-zinc-50 text-zinc-700 border-zinc-250 hover:bg-zinc-100'
              }`}
            >
              <span className="material-symbols-outlined text-sm">{flt.icon}</span>
              <span>{flt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MONTH GRID VIEW */}
      {/* ========================================================================= */}
      {viewMode === 'Month' && (
        <div className="bg-white rounded-3xl p-5 md:p-6 border border-zinc-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-900 font-mono">February 2026</h2>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setSelectedDate('2026-02-18')}
                className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold cursor-pointer"
              >
                {t('cal.today', 'Today (Feb 18)')}
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase text-zinc-400 font-mono border-b border-zinc-100 pb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          {/* Month Day Cells */}
          <div className="grid grid-cols-7 gap-2 md:gap-3">
            {monthDays.map((day) => {
              const isToday = day.dateStr === '2026-02-18';
              const isSelected = day.dateStr === selectedDate;

              return (
                <div
                  key={day.dateStr}
                  onClick={() => setSelectedDate(day.dateStr)}
                  className={`min-h-[110px] md:min-h-[130px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                      : isToday
                      ? 'border-zinc-400 bg-zinc-50'
                      : 'border-zinc-200/80 bg-white hover:border-zinc-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold ${
                        isToday ? 'bg-amber-500 text-zinc-950' : 'text-zinc-700'
                      }`}
                    >
                      {day.dayNumber}
                    </span>
                    {day.events.length > 0 && (
                      <span className="text-[10px] font-bold font-mono text-zinc-400">
                        {day.events.length}
                      </span>
                    )}
                  </div>

                  {/* Micro Event Chips */}
                  <div className="space-y-1 my-1 overflow-hidden">
                    {day.events.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedEvent(ev);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[9.5px] font-bold truncate flex items-center gap-1 border ${ev.badgeColor.bg} ${ev.badgeColor.text} ${ev.badgeColor.border}`}
                        title={ev.title}
                      >
                        <span className="material-symbols-outlined text-[10px] shrink-0">{ev.icon}</span>
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                    {day.events.length > 2 && (
                      <span className="text-[9px] font-bold text-zinc-500 block pl-1">
                        +{day.events.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DAY & SCHEDULE LIST VIEW */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-zinc-900">
            Scheduled Operational Events for {viewMode === 'Day' ? selectedDate : 'February 2026'} ({filteredEvents.length})
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((ev) => (
            <div
              key={ev.id}
              onClick={() => setSelectedEvent(ev)}
              className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-2xs hover:shadow-md hover:border-zinc-300 transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase font-mono border ${ev.badgeColor.bg} ${ev.badgeColor.text} ${ev.badgeColor.border}`}>
                      {ev.type}
                    </span>
                    <span className="text-xs font-mono font-bold text-zinc-500">{ev.time}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-zinc-400">{ev.date}</span>
                </div>

                <h4 className="text-sm font-bold text-zinc-900 group-hover:text-amber-800 transition-colors leading-snug">
                  {ev.title}
                </h4>

                <div className="p-2.5 bg-zinc-50 rounded-xl border border-zinc-150 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold">Zone / Location:</span>
                    <span className="font-semibold text-zinc-800 truncate">{ev.locationZone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 text-[10px] uppercase font-bold">Assigned:</span>
                    <span className="font-semibold text-zinc-800 truncate">{ev.assignedPersonnel}</span>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed line-clamp-2">{ev.description}</p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <span className="font-medium text-amber-900">{ev.status}</span>
                <span className="material-symbols-outlined text-base text-zinc-400 group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* EVENT DETAIL DRAWER / MODAL */}
      {/* ========================================================================= */}
      {selectedEvent && (
        <div
          id="calendar-event-modal-backdrop"
          onClick={() => setSelectedEvent(null)}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end animate-fadeIn"
        >
          <div
            id="calendar-event-modal"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-white h-full shadow-2xl p-6 md:p-8 overflow-y-auto space-y-6 animate-slideLeft"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
              <div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold uppercase font-mono border ${selectedEvent.badgeColor.bg} ${selectedEvent.badgeColor.text} ${selectedEvent.badgeColor.border}`}>
                  {selectedEvent.type}
                </span>
                <h2 className="text-xl font-bold text-zinc-900 mt-1">{selectedEvent.title}</h2>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 text-zinc-400 hover:text-zinc-800 rounded-lg cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-150">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Scheduled Date & Time</span>
                  <span className="text-sm font-bold font-mono text-zinc-900">{selectedEvent.date} @ {selectedEvent.time}</span>
                </div>
                <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-150">
                  <span className="text-zinc-500 block text-[10px] uppercase font-bold">Estimated Duration</span>
                  <span className="text-sm font-bold font-mono text-zinc-900">{selectedEvent.duration}</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
                <span className="font-bold text-zinc-900 block uppercase text-[10px] font-mono">Location & Personnel</span>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Assigned Zone:</span>
                  <span className="font-bold text-zinc-900">{selectedEvent.locationZone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Lead Personnel:</span>
                  <span className="font-bold text-zinc-900">{selectedEvent.assignedPersonnel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-600">Event Status:</span>
                  <span className="font-bold text-emerald-800">{selectedEvent.status}</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-1">
                <span className="font-bold text-zinc-900 block uppercase text-[10px] font-mono">Operational Scope</span>
                <p className="text-zinc-800 leading-relaxed">{selectedEvent.description}</p>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1 text-amber-950 font-medium">
                <span className="font-bold uppercase block text-[10px] text-amber-800 font-mono">Simulated Business Impact:</span>
                <p>{selectedEvent.businessImpact}</p>
              </div>

              <div className="pt-2 border-t border-zinc-100 flex items-center gap-3">
                <button
                  onClick={() => {
                    onShowToast('Schedule Updated', `${selectedEvent.title} confirmed on operations manifest.`, 'success');
                    setSelectedEvent(null);
                  }}
                  className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold rounded-xl cursor-pointer shadow-2xs"
                >
                  Confirm & Sync to Floor Manifest ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
