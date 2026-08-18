import React, { useState, useMemo } from 'react';
import { PageId, FaqCategory } from '../types';
import { FAQ_ITEMS, DEMO_GUIDE_SECTIONS, DEMO_STORY_STEPS } from '../helpData';

interface HelpCenterViewProps {
  onNavigate: (pageId: PageId) => void;
  onStartTour: () => void;
  onShowToast?: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
}

export const HelpCenterView: React.FC<HelpCenterViewProps> = ({
  onNavigate,
  onStartTour,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'faq' | 'guide'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FaqCategory | 'All'>('All');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');
  const [activeDemoStep, setActiveDemoStep] = useState<number>(1);

  const categories: (FaqCategory | 'All')[] = [
    'All',
    'Getting Started',
    'Orders',
    'Inventory',
    'Logistics',
    'Simulation',
    'Analytics',
    'Muthu',
    'Troubleshooting'
  ];

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return FAQ_ITEMS.filter((item) => {
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (item.troubleshootingDetails &&
          (item.troubleshootingDetails.problem.toLowerCase().includes(q) ||
            item.troubleshootingDetails.possibleCause.toLowerCase().includes(q) ||
            item.troubleshootingDetails.resolution.toLowerCase().includes(q)));
      return matchesCat && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const handleStepDemoStory = (stepNum: number, pageId: PageId) => {
    setActiveDemoStep(stepNum);
    onNavigate(pageId);
    if (onShowToast) {
      onShowToast(`Demo Story — Step ${stepNum}`, `Navigated to ${pageId.toUpperCase()} view to execute demo step.`, 'info');
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="rounded-3xl bg-zinc-900 text-white p-6 md:p-8 relative overflow-hidden shadow-xl border border-zinc-800">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold font-mono">
              <span>MUTHU Knowledge & Support</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white">
              Help Center & Documentation
            </h1>
            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed">
              Explore FAQs, troubleshooting solutions, interactive module guides, and product walkthroughs to master your Smart Operations Partner.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onStartTour}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span className="material-symbols-outlined text-lg">explore</span>
              <span>Start Guided Tour</span>
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-8 pt-4 border-t border-zinc-800">
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'faq'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-base">help_outline</span>
            <span>FAQ & Troubleshooting ({FAQ_ITEMS.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-white text-zinc-950 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <span className="material-symbols-outlined text-base">menu_book</span>
            <span>Interactive Demo Guide & Story</span>
          </button>
        </div>
      </div>

      {/* TAB 1: FAQ & TROUBLESHOOTING */}
      {activeTab === 'faq' && (
        <div className="space-y-6">
          {/* Search Bar & Category Filter Pills */}
          <div className="bg-white rounded-2xl p-4 md:p-6 border border-zinc-200 shadow-xs space-y-4">
            <div className="relative max-w-2xl">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 text-xl">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FAQs, SLA Risk, Trucks, Inventory, Troubleshooting..."
                className="w-full bg-zinc-50 border border-zinc-250 rounded-xl pl-12 pr-10 py-3 text-xs md:text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                >
                  <span className="material-symbols-outlined text-base">close</span>
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider shrink-0">
                Category:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-bold shrink-0 transition-all cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                      : 'bg-zinc-100 text-zinc-700 border-zinc-200 hover:bg-zinc-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Accordion List */}
          <div className="space-y-3">
            {filteredFaqs.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-zinc-200 text-zinc-500 space-y-2">
                <span className="material-symbols-outlined text-4xl text-zinc-300">search_off</span>
                <p className="text-xs font-semibold">No questions found matching "{searchQuery}".</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  Reset Search Filters
                </button>
              </div>
            ) : (
              filteredFaqs.map((faq) => {
                const isExpanded = expandedFaqId === faq.id;
                const isTroubleshooting = faq.category === 'Troubleshooting';

                return (
                  <div
                    key={faq.id}
                    className={`bg-white rounded-2xl border transition-all overflow-hidden ${
                      isExpanded
                        ? 'border-amber-400 shadow-md ring-1 ring-amber-400/30'
                        : 'border-zinc-200 hover:border-zinc-300 shadow-2xs'
                    }`}
                  >
                    {/* Question Header */}
                    <button
                      onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                      className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isTroubleshooting
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          <span className="material-symbols-outlined text-base">
                            {isTroubleshooting ? 'build' : 'help'}
                          </span>
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.25 rounded text-[10px] font-bold uppercase font-mono ${
                                isTroubleshooting
                                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                  : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                              }`}
                            >
                              {faq.category}
                            </span>
                          </div>
                          <h4 className="text-xs md:text-sm font-bold text-zinc-900 mt-0.5">
                            {faq.question}
                          </h4>
                        </div>
                      </div>

                      <span
                        className={`material-symbols-outlined text-zinc-400 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 text-amber-600' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </button>

                    {/* Answer / Troubleshooting Details */}
                    {isExpanded && (
                      <div className="px-4 pb-5 md:px-5 border-t border-zinc-100 pt-4 bg-zinc-50/50 space-y-3 text-xs leading-relaxed text-zinc-700">
                        {faq.troubleshootingDetails ? (
                          <div className="space-y-3 bg-white p-4 rounded-xl border border-zinc-200">
                            <div>
                              <span className="font-bold text-rose-700 text-[11px] uppercase tracking-wider block mb-0.5">
                                Problem Description:
                              </span>
                              <p className="text-zinc-800 font-medium">
                                {faq.troubleshootingDetails.problem}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-zinc-100">
                              <span className="font-bold text-amber-800 text-[11px] uppercase tracking-wider block mb-0.5">
                                Possible Cause:
                              </span>
                              <p className="text-zinc-800 font-medium">
                                {faq.troubleshootingDetails.possibleCause}
                              </p>
                            </div>

                            <div className="pt-2 border-t border-zinc-100">
                              <span className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider block mb-0.5">
                                Recommended Resolution:
                              </span>
                              <p className="text-zinc-800 font-semibold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-emerald-950">
                                {faq.troubleshootingDetails.resolution}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-zinc-800 text-xs md:text-sm font-medium leading-relaxed">
                            {faq.answer}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE DEMO GUIDE & DEMO STORY */}
      {activeTab === 'guide' && (
        <div className="space-y-8">
          {/* Section A: 9-Step Demo Story Walkthrough */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-zinc-200 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
              <div>
                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold font-mono">
                  Interactive Story Walkthrough
                </span>
                <h2 className="text-lg md:text-xl font-bold text-zinc-900 mt-1">
                  Complete End-to-End Decision Journey
                </h2>
              </div>
              <span className="text-xs text-zinc-500 font-medium">9 Operational Steps</span>
            </div>

            <p className="text-xs md:text-sm text-zinc-600 leading-relaxed">
              Step through the full decision lifecycle: from VIP order arrival to Muthu bottleneck detection, packer reallocation approval, logistics gate pass clearance, and warehouse health recovery.
            </p>

            {/* Stepper Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEMO_STORY_STEPS.map((step) => {
                const isActive = activeDemoStep === step.stepNumber;

                return (
                  <div
                    key={step.stepNumber}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                      isActive
                        ? 'bg-amber-50/70 border-amber-500 shadow-sm ring-1 ring-amber-500/40'
                        : 'bg-zinc-50/70 border-zinc-200 hover:border-zinc-300'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="w-6 h-6 rounded-full bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                          {step.stepNumber}
                        </span>
                        <span className="text-[10px] font-bold uppercase font-mono text-zinc-400">
                          {step.targetPage}
                        </span>
                      </div>
                      <h4 className="text-xs md:text-sm font-bold text-zinc-900">{step.title}</h4>
                      <p className="text-[11.5px] text-zinc-600 leading-relaxed">{step.description}</p>
                    </div>

                    <button
                      onClick={() => handleStepDemoStory(step.stepNumber, step.targetPage)}
                      className="w-full py-2 px-3 bg-zinc-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>{step.actionText}</span>
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Feature Module Guides */}
          <div className="space-y-6">
            <h2 className="text-lg md:text-xl font-bold text-zinc-900">
              Module Documentation & Best Practices
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DEMO_GUIDE_SECTIONS.map((sec) => (
                <div
                  key={sec.id}
                  className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-xs space-y-4 hover:border-zinc-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-xl">{sec.icon}</span>
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-bold font-mono">
                          {sec.category}
                        </span>
                        <h3 className="text-sm font-bold text-zinc-900">{sec.title}</h3>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed">{sec.overview}</p>

                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150 space-y-2 text-xs">
                      <div>
                        <span className="font-bold text-zinc-900 block text-[10px] uppercase">Purpose:</span>
                        <p className="text-zinc-700">{sec.purpose}</p>
                      </div>

                      <div>
                        <span className="font-bold text-zinc-900 block text-[10px] uppercase">How to use:</span>
                        <p className="text-zinc-700">{sec.howToUse}</p>
                      </div>

                      <div>
                        <span className="font-bold text-emerald-800 block text-[10px] uppercase">Expected outcome:</span>
                        <p className="text-emerald-900 font-semibold">{sec.expectedOutcome}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Best Practices:
                    </span>
                    <ul className="space-y-1 text-xs text-zinc-600">
                      {sec.bestPractices.map((bp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-amber-600 font-bold">•</span>
                          <span>{bp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
