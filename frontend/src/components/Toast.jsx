import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Info, 
  Sparkles, 
  X 
} from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} className="toast-icon text-success" />;
      case 'error':
        return <XCircle size={18} className="toast-icon text-danger" />;
      case 'warning':
        return <AlertTriangle size={18} className="toast-icon text-warning" />;
      case 'ai':
        return <Sparkles size={18} className="toast-icon text-ai" />;
      default:
        return <Info size={18} className="toast-icon text-info" />;
    }
  };

  return (
    <div className={`toast-card toast-${toast.type || 'info'}`}>
      <div className="toast-icon-wrapper">
        {getIcon()}
      </div>
      <div className="toast-content">
        {toast.title && <div className="toast-title">{toast.title}</div>}
        <div className="toast-message">{toast.message}</div>
      </div>
      <button 
        className="toast-close-btn" 
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  );
}
