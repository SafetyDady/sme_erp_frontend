import React from "react";

interface AlertProps {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onClose?: () => void;
}

export const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  const typeClasses = {
    success: "bg-green-50 border-green-200 text-green-700",
    error: "bg-red-50 border-red-200 text-red-700",
    warning: "bg-yellow-50 border-yellow-200 text-yellow-700",
    info: "bg-blue-50 border-blue-200 text-blue-700",
  };

  return (
    <div
      className={`p-3 border rounded-md ${typeClasses[type]} flex justify-between items-center mb-4`}
    >
      <p className="text-sm">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-lg font-bold hover:opacity-70"
        >
          ✕
        </button>
      )}
    </div>
  );
};
