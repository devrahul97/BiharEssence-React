import { useEffect } from 'react';

const Snackbar = ({ message, show, onClose, duration = 3000, type = 'success' }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [show, onClose, duration]);

  if (!show) return null;

  const bgColors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[100] animate-slide-down">
      <div
        className={`${bgColors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[300px] max-w-[500px]`}
      >
        {type === 'success' && <span className="text-2xl">✅</span>}
        {type === 'error' && <span className="text-2xl">❌</span>}
        {type === 'info' && <span className="text-2xl">ℹ️</span>}
        {type === 'warning' && <span className="text-2xl">⚠️</span>}
        <span className="font-medium text-sm md:text-base">{message}</span>
      </div>
    </div>
  );
};

export default Snackbar;
