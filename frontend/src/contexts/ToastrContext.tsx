import React, { createContext, useContext } from 'react';
import toast, { ToastOptions } from 'react-hot-toast';

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const showSuccess = (message: string) => {
    toast.success(message, {
      ...defaultOptions,
      className: 'bg-green-50',
      icon: '✅',
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      ...defaultOptions,
      duration: 5000,
      className: 'bg-red-50',
      icon: '❌',
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      ...defaultOptions,
      className: 'bg-blue-50',
      icon: 'ℹ️',
    });
  };

  const showWarning = (message: string) => {
    toast(message, {
      ...defaultOptions,
      className: 'bg-yellow-50',
      icon: '⚠️',
    });
  };

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning }}>{children}</ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
