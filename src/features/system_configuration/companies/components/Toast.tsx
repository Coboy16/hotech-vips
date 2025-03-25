import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'warning';
  message: string;
  onClose: () => void;
  duration?: number;
}

export function Toast({ type, message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-400" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg border shadow-lg flex items-center space-x-3 ${getStyles()}`}>
      {getIcon()}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-white hover:bg-opacity-20"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}