import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, XCircle, X } from 'lucide-react';
import { ToastMessage } from '../types';

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

export const ToastContainer = NotificationToast;

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#dfbe88] shrink-0" />,
    error: <XCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    warning: <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-[#c5a880] shrink-0" />,
  };

  const borderColors = {
    success: 'border-[#c5a880]/35 bg-[#14100b]/95 text-[#faf7f2] shadow-2xl shadow-black/80',
    error: 'border-rose-500/40 bg-[#1a0f12]/95 text-[#faf7f2] shadow-2xl shadow-black/80',
    warning: 'border-amber-500/40 bg-[#1c140a]/95 text-[#faf7f2] shadow-2xl shadow-black/80',
    info: 'border-[#c5a880]/30 bg-[#120f0d]/95 text-[#faf7f2] shadow-2xl shadow-black/80',
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md transition-all transform animate-fade-in ${
        borderColors[toast.type]
      }`}
    >
      {icons[toast.type]}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-serif font-bold text-[#faf7f2]">{toast.title}</p>
        {toast.message && <p className="text-[11px] text-[#d6cbbe] mt-0.5 leading-relaxed">{toast.message}</p>}
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 text-[#b89f7a] hover:text-[#dfbe88] rounded-md transition"
        aria-label="Dismiss toast"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
