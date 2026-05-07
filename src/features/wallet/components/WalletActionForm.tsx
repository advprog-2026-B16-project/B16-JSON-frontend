import { Plus, Minus } from 'lucide-react';
import { useState } from 'react';

interface Props {
  type: 'topup' | 'withdraw';
  isLoading: boolean;
  onSubmit: (type: 'topup' | 'withdraw', amount: string) => void;
  maxAmount?: number | null;
}

export function WalletActionForm({ type, isLoading, onSubmit, maxAmount }: Props) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(type, amount);
    setAmount('');
  };

  const isTopUp = type === 'topup';
  
  return (
    <div className={`border-4 border-black p-5 shadow-[4px_4px_0px_0px_#000] relative ${isTopUp ? 'bg-pink-50' : 'bg-purple-50'}`}>
      <h3 className="text-2xl font-black uppercase mb-4 flex items-center gap-2">
        {isTopUp ? <Plus size={24} className="text-green-600" strokeWidth={4} /> : <Minus size={24} className="text-red-600" strokeWidth={4} />} 
        {isTopUp ? 'Top Up' : 'Withdraw'}
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative flex items-center">
          <span className="absolute left-4 font-black text-xl">$</span>
          <input
            type="number"
            min="1"
            max={!isTopUp && maxAmount !== null && maxAmount !== undefined ? maxAmount : undefined}
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className={`w-full bg-white border-4 border-black p-3 pl-10 font-bold focus:outline-none transition-colors shadow-[2px_2px_0px_0px_#000] focus:shadow-none focus:translate-x-[2px] focus:translate-y-[2px] ${isTopUp ? 'focus:bg-pink-100' : 'focus:bg-purple-100'}`}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || (!isTopUp && maxAmount !== null && maxAmount !== undefined && Number(amount) > maxAmount)}
          className={`w-full border-4 border-black py-3 font-black uppercase flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-60 disabled:cursor-not-allowed ${isTopUp ? 'bg-green-400' : 'bg-pink-400'}`}
        >
          {isLoading ? 'Processing...' : `Confirm ${isTopUp ? 'Top-Up' : 'Withdraw'}`}
        </button>
      </form>
    </div>
  );
}
