import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmClassName?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmClassName = 'bg-black text-white hover:bg-main hover:text-black',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 16 }}
            className="w-full max-w-md border-4 border-black bg-white p-7 text-black shadow-[12px_12px_0px_0px_#000]"
          >
            <div className="mb-5 flex items-start gap-4">
              <div className="border-2 border-black bg-yellow-300 p-2 shadow-[2px_2px_0px_0px_#000]">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase">{title}</h2>
                <p className="mt-2 font-bold text-gray-700">{message}</p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="border-4 border-black bg-white px-5 py-3 font-black uppercase shadow-[4px_4px_0px_0px_#000] hover:bg-gray-100 disabled:opacity-50"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className={`border-4 border-black px-5 py-3 font-black uppercase shadow-[4px_4px_0px_0px_#000] disabled:opacity-50 ${confirmClassName}`}
              >
                {isLoading ? 'Processing...' : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
