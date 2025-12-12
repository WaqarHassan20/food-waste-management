import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-md transition-opacity duration-300 ease-out"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto border border-white/20 transition-all duration-300 ease-out animate-in fade-in scale-95">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-100 bg-white/80 backdrop-blur-sm rounded-t-3xl">
          {title && (
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          )}
          <button
            onClick={onClose}
            className="ml-auto p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100/80 rounded-full transition-all duration-200 cursor-pointer"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body with scroll */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {children}
        </div>
      </div>
    </div>
  );
};
