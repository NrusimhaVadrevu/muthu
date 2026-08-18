import React from 'react';
import { PageId } from '../types';
import { PRODUCT_TOUR_STEPS } from '../helpData';

interface ProductTourModalProps {
  isOpen: boolean;
  currentStepIndex: number;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSkipTour: () => void;
  onFinishTour: () => void;
  onNavigate: (pageId: PageId) => void;
}

export const ProductTourModal: React.FC<ProductTourModalProps> = ({
  isOpen,
  currentStepIndex,
  onNextStep,
  onPrevStep,
  onSkipTour,
  onFinishTour,
  onNavigate
}) => {
  if (!isOpen) return null;

  const step = PRODUCT_TOUR_STEPS[currentStepIndex] || PRODUCT_TOUR_STEPS[0];
  const isLastStep = currentStepIndex >= PRODUCT_TOUR_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onFinishTour();
    } else {
      const nextStep = PRODUCT_TOUR_STEPS[currentStepIndex + 1];
      if (nextStep) {
        onNavigate(nextStep.pageId);
      }
      onNextStep();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      const prevStep = PRODUCT_TOUR_STEPS[currentStepIndex - 1];
      if (prevStep) {
        onNavigate(prevStep.pageId);
      }
      onPrevStep();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl border border-zinc-200 w-full max-w-xl shadow-2xl overflow-hidden animate-slideUp flex flex-col">
        {/* Header */}
        <div className="p-5 md:p-6 bg-zinc-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-zinc-900 font-bold flex items-center justify-center text-lg">
              {currentStepIndex + 1}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase font-mono">
                  Guided Tour • Step {currentStepIndex + 1} of {PRODUCT_TOUR_STEPS.length}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white tracking-tight mt-0.5">{step.title}</h3>
            </div>
          </div>

          <button
            onClick={onSkipTour}
            className="text-xs text-zinc-400 hover:text-white font-semibold px-2.5 py-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            Skip Tour
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-zinc-100 h-1.5 overflow-hidden">
          <div
            className="bg-amber-500 h-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / PRODUCT_TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="text-sm font-semibold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            {step.subtitle}
          </div>

          <div className="space-y-3 text-zinc-700 leading-relaxed">
            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
              <span className="font-bold text-zinc-900 block mb-0.5 uppercase text-[10px] text-zinc-500">What this page does</span>
              <p className="text-zinc-800 text-xs font-medium">{step.description}</p>
            </div>

            <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-150">
              <span className="font-bold text-zinc-900 block mb-0.5 uppercase text-[10px] text-zinc-500">Why it exists</span>
              <p className="text-zinc-800 text-xs font-medium">{step.whyItExists}</p>
            </div>

            <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60">
              <span className="font-bold text-amber-900 block mb-0.5 uppercase text-[10px]">How to use it</span>
              <p className="text-amber-950 text-xs font-medium">{step.howToUse}</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentStepIndex === 0
                ? 'opacity-40 cursor-not-allowed text-zinc-400'
                : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100 cursor-pointer'
            }`}
          >
            ← Previous
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNext}
              className="px-5 py-2 bg-zinc-900 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1"
            >
              <span>{isLastStep ? 'Finish Tour ✓' : 'Next Step →'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
