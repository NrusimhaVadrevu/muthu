import React, { useState } from 'react';
import { DecisionScenario } from '../types';
import { decisionScenarios } from '../mockData';

interface DecisionWorkspaceViewProps {
  onApplyStrategy: (scenario: DecisionScenario) => void;
  onAdjustParameters: (scenario: DecisionScenario) => void;
}

export const DecisionWorkspaceView: React.FC<DecisionWorkspaceViewProps> = ({
  onApplyStrategy,
  onAdjustParameters
}) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(decisionScenarios[0].id);
  const [promptInput, setPromptInput] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [customScenarios, setCustomScenarios] = useState<DecisionScenario[]>(decisionScenarios);

  const currentScenario = customScenarios.find((s) => s.id === selectedScenarioId) || customScenarios[0];

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsSimulating(true);
    setTimeout(() => {
      const newScenario: DecisionScenario = {
        id: `custom-${Date.now()}`,
        title: promptInput.length > 28 ? `${promptInput.slice(0, 25)}...` : promptInput,
        description: `Simulated impact of: "${promptInput}"`,
        prompt: promptInput,
        strategyTitle: `Optimize Dispatch Matrix for: ${promptInput}`,
        strategyDescription: `Muthu synthesized a custom flow based on your request. Resources dynamically rebalanced.`,
        confidence: Math.floor(Math.random() * 8) + 90,
        triggerTitle: 'User Interactive Simulation',
        triggerDescription: `Custom parameters: ${promptInput}`,
        solutionTitle: 'Dynamic Dispatch Re-assignment',
        solutionDescription: 'Automated batch clustering with real-time picker telemetry rerouting.',
        currentThroughput: 740,
        predictedThroughput: 865,
        currentClearanceTime: 110,
        predictedClearanceTime: 36,
        priorityLevel: 'High',
        slaAssessment: 'All priority orders safe',
        timeline: [
          { time: 'Just Now', description: `User triggered prompt: "${promptInput}"` },
          { time: 'T+10s', description: 'Simulated neural route graph' },
          { time: 'NOW', description: 'Custom strategy synthesized', isNow: true }
        ]
      };

      setCustomScenarios([newScenario, ...customScenarios]);
      setSelectedScenarioId(newScenario.id);
      setPromptInput('');
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div id="decision-workspace-view" className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Top Workspace Header Bar */}
      <div className="flex flex-wrap justify-between items-center px-6 md:px-10 h-auto md:h-[72px] py-3 md:py-0 shrink-0 border-b border-outline-variant/25 bg-surface-container-lowest/80 backdrop-blur-md z-20 gap-3">
        <div className="flex items-center gap-3 md:gap-4">
          <h2 className="font-headline-sm text-[20px] md:text-headline-sm text-on-surface">
            Muthu's Decision Workspace
          </h2>
          <div className="h-6 w-px bg-outline-variant/40 hidden sm:block" />
          <span className="px-3 py-1.5 bg-[#bacbb4]/30 text-tertiary rounded-full font-label-caps text-[11px] flex items-center gap-1.5 border border-tertiary/20 tracking-wider">
            <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
            Simulation Active
          </span>
        </div>
      </div>

      {/* Main Copilot Workspace Grid */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sub-Panel: Meet Muthu & Scenarios */}
        <aside className="w-full lg:w-[320px] bg-surface-container-lowest border-r border-outline-variant/20 flex flex-col shrink-0 z-10">
          <div className="p-5 md:p-6 flex-1 overflow-y-auto space-y-6">
            {/* Ask AI Input */}
            <div>
              <h3 className="font-label-caps text-on-surface-variant mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                Meet Muthu
              </h3>
              <form onSubmit={handleSendPrompt} className="relative">
                <textarea
                  id="decision-prompt-textarea"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="What if we rerouted Shift 2?"
                  rows={3}
                  className="w-full bg-surface border border-outline-variant/40 rounded-2xl py-3.5 px-4 pr-12 font-body-md text-[14px] text-on-surface placeholder:text-on-surface-variant/50 focus:ring-2 focus:ring-tertiary-container/30 focus:border-tertiary-container outline-none resize-none transition-all"
                />
                <button
                  type="submit"
                  disabled={isSimulating}
                  className="absolute right-3 bottom-3.5 p-2 bg-tertiary-container text-on-tertiary-container rounded-xl shadow-xs hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                  aria-label="Send prompt to Muthu"
                >
                  <span className={`material-symbols-outlined text-[18px] ${isSimulating ? 'animate-spin' : ''}`}>
                    {isSimulating ? 'refresh' : 'send'}
                  </span>
                </button>
              </form>
            </div>

            {/* Suggested Scenarios */}
            <div>
              <h3 className="font-label-caps text-outline mb-3 tracking-wider">
                Suggested Scenarios
              </h3>
              <div className="space-y-2.5">
                {customScenarios.map((scenario) => {
                  const isSelected = scenario.id === selectedScenarioId;
                  return (
                    <div
                      key={scenario.id}
                      id={`scenario-card-${scenario.id}`}
                      onClick={() => setSelectedScenarioId(scenario.id)}
                      className={`rounded-2xl p-4 cursor-pointer transition-all border ${
                        isSelected
                          ? 'bg-surface-container-high border-primary/40 shadow-xs'
                          : 'bg-surface-container-low border-outline-variant/20 hover:bg-surface-container'
                      }`}
                    >
                      <h4
                        className={`font-label-md text-[14px] font-bold mb-1 ${
                          isSelected ? 'text-primary' : 'text-on-surface'
                        }`}
                      >
                        {scenario.title}
                      </h4>
                      <p className="font-body-md text-[13px] leading-relaxed text-on-surface-variant">
                        {scenario.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Canvas: AI Decision Summary */}
        <section className="flex-1 overflow-y-auto bg-surface-bright relative px-6 py-8 lg:px-12 lg:py-10">
          <div className="max-w-[920px] mx-auto relative z-10 space-y-8">
            {/* 1. Decision Summary Header */}
            <header className="flex flex-col sm:flex-row items-start justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-tertiary-container text-[20px]">
                    smart_toy
                  </span>
                  <span className="font-label-caps text-tertiary-container tracking-widest uppercase text-[11px] font-bold">
                    Optimal Strategy Identified
                  </span>
                </div>
                <h1 className="font-headline-md text-[32px] md:text-[38px] leading-tight text-on-surface font-bold text-balance">
                  {currentScenario.strategyTitle}
                </h1>
                <p className="font-body-lg text-[16px] md:text-[17px] text-on-surface-variant mt-2.5 max-w-2xl leading-relaxed">
                  {currentScenario.strategyDescription}
                </p>
              </div>

              {/* Confidence Score Radial Indicator */}
              <div className="shrink-0">
                <div className="inline-flex flex-col items-center justify-center w-24 h-24 rounded-full border-[6px] border-[#bacbb4]/30 relative bg-surface-container-lowest shadow-xs">
                  <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      className="text-tertiary-container"
                      cx="50"
                      cy="50"
                      fill="none"
                      r="42"
                      stroke="currentColor"
                      strokeDasharray="264"
                      strokeDashoffset={264 - (264 * currentScenario.confidence) / 100}
                      strokeWidth="6"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="font-display-lg text-[26px] text-on-surface relative z-10 leading-none mt-1 font-bold">
                    {currentScenario.confidence}<span className="text-[14px] font-normal text-on-surface-variant">%</span>
                  </span>
                  <span className="font-label-caps text-[9px] text-on-surface-variant relative z-10 mt-0.5">
                    Confidence
                  </span>
                </div>
              </div>
            </header>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 py-5 border-y border-outline-variant/30">
              <button
                id="btn-apply-strategy"
                onClick={() => onApplyStrategy(currentScenario)}
                className="px-6 py-3 bg-primary text-on-primary rounded-xl font-label-md text-[14px] hover:bg-primary/90 transition-all shadow-xs flex items-center gap-2 cursor-pointer active:scale-98"
              >
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                Apply Strategy Now
              </button>
              <button
                id="btn-adjust-parameters"
                onClick={() => onAdjustParameters(currentScenario)}
                className="px-6 py-3 bg-surface-container-lowest text-on-surface rounded-xl font-label-md text-[14px] hover:bg-surface-container-low transition-all border border-outline-variant/40 shadow-xs flex items-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">tune</span>
                Adjust Parameters
              </button>
            </div>

            {/* Core Reasoning & Impact Prediction */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column (2-Span) */}
              <div className="lg:col-span-2 space-y-6">
                {/* 2. Reasoning Context Card */}
                <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl shadow-ambient border border-outline-variant/20 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-[#bacbb4]/20 to-transparent rounded-bl-full pointer-events-none" />

                  <h3 className="font-label-caps text-on-surface-variant mb-6 tracking-widest flex items-center gap-2 text-[11px]">
                    <span className="material-symbols-outlined text-[18px]">psychology</span>
                    Reasoning Context
                  </h3>

                  <div className="space-y-6 relative">
                    {/* Trigger */}
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-error-container/50 flex items-center justify-center shrink-0 text-error mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">warning</span>
                      </div>
                      <div>
                        <h4 className="font-label-md text-on-surface font-bold mb-1">
                          {currentScenario.triggerTitle}
                        </h4>
                        <p className="font-body-md text-[14px] text-on-surface-variant leading-relaxed">
                          {currentScenario.triggerDescription}
                        </p>
                      </div>
                    </div>

                    {/* Connecting line */}
                    <div className="w-px h-6 bg-outline-variant/40 ml-5 -my-3" />

                    {/* Solution */}
                    <div className="flex gap-4 items-start">
                      <div className="w-10 h-10 rounded-full bg-tertiary-container/20 flex items-center justify-center shrink-0 text-tertiary-container mt-0.5">
                        <span className="material-symbols-outlined text-[20px]">lightbulb</span>
                      </div>
                      <div>
                        <h4 className="font-label-md text-on-surface font-bold mb-1">
                          {currentScenario.solutionTitle}
                        </h4>
                        <p className="font-body-md text-[14px] text-on-surface-variant leading-relaxed">
                          {currentScenario.solutionDescription}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Before vs After Comparison Grid */}
                <div className="bg-surface-container-lowest p-6 md:p-8 rounded-3xl shadow-ambient border border-outline-variant/20">
                  <h3 className="font-label-caps text-on-surface-variant mb-6 tracking-widest flex items-center gap-2 text-[11px]">
                    <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                    Operational Impact Prediction
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Metric 1 */}
                    <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/20">
                      <p className="font-label-md text-on-surface-variant mb-3 font-semibold text-[13px]">
                        Overall Throughput
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-[12px] text-on-surface-variant/70 mb-0.5">Current</p>
                          <p className="font-headline-sm text-on-surface text-[20px] font-bold">
                            {currentScenario.currentThroughput}{' '}
                            <span className="text-[12px] font-normal text-on-surface-variant">u/hr</span>
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-tertiary-container text-[20px]">
                          arrow_right_alt
                        </span>
                        <div className="flex-1 bg-[#bacbb4]/20 rounded-xl p-2.5 border border-tertiary/20">
                          <p className="text-[12px] text-tertiary font-medium mb-0.5">Predicted</p>
                          <p className="font-headline-sm text-tertiary text-[20px] font-bold">
                            {currentScenario.predictedThroughput}{' '}
                            <span className="text-[12px] font-normal">u/hr</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metric 2 */}
                    <div className="p-4 rounded-2xl bg-surface-container-low/50 border border-outline-variant/20">
                      <p className="font-label-md text-on-surface-variant mb-3 font-semibold text-[13px]">
                        Queue Clearance Time
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <p className="text-[12px] text-on-surface-variant/70 mb-0.5">Current</p>
                          <p className="font-headline-sm text-on-surface text-[20px] font-bold">
                            {currentScenario.currentClearanceTime}{' '}
                            <span className="text-[12px] font-normal text-on-surface-variant">mins</span>
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-tertiary-container text-[20px]">
                          arrow_right_alt
                        </span>
                        <div className="flex-1 bg-[#bacbb4]/20 rounded-xl p-2.5 border border-tertiary/20">
                          <p className="text-[12px] text-tertiary font-medium mb-0.5">Predicted</p>
                          <p className="font-headline-sm text-tertiary text-[20px] font-bold">
                            {currentScenario.predictedClearanceTime}{' '}
                            <span className="text-[12px] font-normal">mins</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column (1-Span): Timeline & SLA Meta */}
              <div className="space-y-6">
                {/* Priority & SLA Box */}
                <div className="bg-primary/5 p-6 rounded-3xl border border-primary/15 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-label-md text-primary font-bold text-[14px]">Priority Level</span>
                    <span className="px-2.5 py-1 bg-error/15 text-error rounded-md text-[11px] font-bold tracking-wider uppercase">
                      {currentScenario.priorityLevel}
                    </span>
                  </div>
                  <div className="h-px w-full bg-primary/10 mb-4" />
                  <h4 className="font-label-md text-primary mb-2 font-bold text-[13px]">
                    SLA Risk Assessment
                  </h4>
                  <div className="flex items-center gap-2 text-tertiary font-medium text-[13px]">
                    <span className="material-symbols-outlined text-[18px]">verified_user</span>
                    <span>{currentScenario.slaAssessment}</span>
                  </div>
                </div>

                {/* Analysis Timeline */}
                <div className="bg-surface-container-lowest p-6 rounded-3xl shadow-ambient border border-outline-variant/20">
                  <h3 className="font-label-caps text-outline mb-6 tracking-widest text-[11px]">
                    Analysis Timeline
                  </h3>
                  <div className="relative pl-3 space-y-6">
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-outline-variant/30" />
                    {currentScenario.timeline.map((item, idx) => (
                      <div key={idx} className="relative flex gap-4">
                        <div
                          className={`w-2.5 h-2.5 rounded-full outline outline-4 outline-surface-container-lowest mt-1 relative z-10 ${
                            item.isNow
                              ? 'bg-tertiary-container ring-2 ring-tertiary/40'
                              : 'bg-outline-variant'
                          }`}
                        />
                        <div>
                          <p
                            className={`font-label-caps text-[10px] mb-1 ${
                              item.isNow ? 'text-tertiary font-bold' : 'text-outline'
                            }`}
                          >
                            {item.time}
                          </p>
                          <p className="font-body-md text-[13px] text-on-surface leading-snug">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
