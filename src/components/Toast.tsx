import React, { useEffect } from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success' || !toast.type;
  const isWarning = toast.type === 'warning';

  return (
    <div
      id="floating-toast"
      className="fixed top-20 right-6 z-50 flex items-center gap-3 bg-surface-container-lowest/95 backdrop-blur-md border border-outline-variant/40 rounded-2xl p-3.5 shadow-ambient-lg animate-in fade-in slide-in-from-top-3 duration-300 max-w-[310px] w-full"
    >
      <div
        className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
          isSuccess ? 'bg-[#bacbb4]/30 text-tertiary' : isWarning ? 'bg-error-container text-error' : 'bg-primary/10 text-primary'
        }`}
      >
        <span className="material-symbols-outlined text-[16px]">
          {isSuccess ? 'check_circle' : isWarning ? 'warning' : 'info'}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="font-label-md font-bold text-on-surface text-[13px] leading-tight truncate">
          {toast.title}
        </h4>
        {toast.description && (
          <p className="text-[11.5px] text-on-surface-variant mt-0.5 leading-snug truncate">{toast.description}</p>
        )}
      </div>

      <button
        onClick={onDismiss}
        className="text-outline hover:text-on-surface p-1 rounded-full shrink-0"
      >
        <span className="material-symbols-outlined text-[15px]">close</span>
      </button>
    </div>
  );
};
