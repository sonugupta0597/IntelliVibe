import React from 'react';

const ErrorModal = ({ open, message, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
        <h2 className="text-lg font-bold mb-4 text-red-600">Error</h2>
        <p className="mb-6 text-gray-700 whitespace-pre-line">{message}</p>
        <button
          className="px-6 py-2 bg-primary text-white rounded hover:bg-primary/90 font-semibold"
          onClick={onClose}
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default ErrorModal; 