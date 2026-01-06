import React from "react";

interface SidePanelProps {
  title: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  title,
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="w-96 bg-white shadow-lg rounded-lg p-6 h-fit sticky top-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl"
        >
          ✕
        </button>
      </div>
      {children}
    </div>
  );
};
