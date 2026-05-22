import { useState } from 'react';
import { AlertCircle, Send } from 'lucide-react';
import { ConfirmModal } from '@/components/ConfirmModal';

interface Props {
  isLoading: boolean;
  onSubmit: (transactionId: string, reason: string) => void;
  initialTransactionId?: string;
  lockedTransaction?: boolean;
  disabledReason?: string;
}

const REASON_PRESETS = [
  'Item was not delivered',
  'Item does not match the order',
  'Jastiper cancelled after payment',
];

export function RefundActionForm({ isLoading, onSubmit, initialTransactionId, lockedTransaction = false, disabledReason }: Props) {
  const [transactionId, setTransactionId] = useState(initialTransactionId || '');
  const [reason, setReason] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const canSubmit = transactionId.trim().length > 0 && reason.trim().length >= 10;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    onSubmit(transactionId.trim(), reason.trim());
    setIsConfirmOpen(false);
    setReason('');
    if (!lockedTransaction) setTransactionId('');
  };

  return (
    <form onSubmit={handleSubmit} className="border-4 border-black bg-white p-6 shadow-[10px_10px_0px_0px_#000]">
      <div className="mb-5 flex items-start gap-3 border-b-4 border-black pb-4">
        <div className="border-2 border-black bg-purple-200 p-2">
          <AlertCircle size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase">Refund Claim</h2>
          <p className="text-sm font-bold text-gray-600">Explain the issue so admin can validate the refund request.</p>
        </div>
      </div>

      <div className="space-y-5">
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-gray-500">Transaction ID</span>
          <input
            type="text"
            value={transactionId}
            onChange={(event) => setTransactionId(event.target.value)}
            disabled={isLoading || lockedTransaction}
            placeholder="Transaction ID"
            className="w-full border-4 border-black bg-white p-4 font-mono font-bold shadow-[4px_4px_0px_0px_#000] outline-none disabled:bg-gray-100 disabled:text-gray-500"
          />
        </label>

        <div>
          <span className="mb-2 block text-xs font-black uppercase text-gray-500">Quick Reasons</span>
          <div className="grid grid-cols-1 gap-2">
            {REASON_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setReason(preset)}
                disabled={isLoading}
                className="border-2 border-black bg-purple-50 px-3 py-2 text-left text-sm font-black shadow-[2px_2px_0px_0px_#000] hover:bg-purple-200 disabled:opacity-50"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase text-gray-500">Detailed Reason</span>
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            disabled={isLoading}
            placeholder="Tell us what happened..."
            rows={5}
            className="w-full resize-none border-4 border-black bg-white p-4 font-bold shadow-[4px_4px_0px_0px_#000] outline-none disabled:opacity-50"
          />
          <span className="mt-1 block text-xs font-bold text-gray-500">{reason.trim().length}/10 minimum characters</span>
        </label>

        <button
          type="submit"
          disabled={isLoading || !canSubmit}
          className="flex w-full items-center justify-center gap-2 border-4 border-black bg-black p-4 text-lg font-black uppercase text-white shadow-[4px_4px_0px_0px_#000] hover:bg-purple-300 hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send size={20} />
          {isLoading ? 'Submitting...' : 'Submit Refund'}
        </button>
        {disabledReason && (
          <p className="border-l-4 border-red-400 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
            {disabledReason}
          </p>
        )}
      </div>
      <ConfirmModal
        open={isConfirmOpen}
        title="Submit Refund?"
        message="Submit this refund claim for admin review."
        confirmText="Submit"
        confirmClassName="bg-purple-400 text-white hover:bg-purple-500"
        isLoading={isLoading}
        onCancel={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
      />
    </form>
  );
}
