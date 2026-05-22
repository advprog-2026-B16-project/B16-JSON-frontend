import { Wallet, RefreshCw } from 'lucide-react';

interface Props {
  isLoading: boolean;
  onRefresh: () => void;
}

export function WalletHeader({ isLoading, onRefresh }: Props) {
  return (
    <div className="flex items-center justify-between border-b-4 border-black pb-6 mb-6">
      <div className="flex items-center gap-4">
        <div className="bg-green-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000]">
          <Wallet size={36} strokeWidth={2.5} />
        </div>
        <h1 className="text-4xl font-black uppercase tracking-tight">Wallet</h1>
      </div>
      <button 
        onClick={onRefresh} 
        disabled={isLoading}
        className="bg-purple-300 border-4 border-black p-3 shadow-[4px_4px_0px_0px_#000] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#000] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-50"
        title="Refresh"
      >
        <RefreshCw size={24} className={isLoading ? "animate-spin" : ""} />
      </button>
    </div>
  );
}
