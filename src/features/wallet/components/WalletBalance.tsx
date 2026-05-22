interface Props {
  balance: number | null;
  isLoading: boolean;
}

export function WalletBalance({ balance, isLoading }: Props) {
  const formatAmount = (num: number) => {
    if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-cyan-200 border-4 border-black p-6 mb-8 shadow-[8px_8px_0px_0px_#000] text-center relative overflow-hidden">
      <h2 className="text-xl font-bold uppercase mb-2 relative z-10">Current Balance</h2>
      <div 
        className="text-5xl md:text-6xl font-black px-4 py-2 relative z-10 tracking-tight"
        title={balance !== null ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : undefined}
      >
        {isLoading ? (
          <span className="animate-pulse">...</span>
        ) : balance !== null ? (
          `$${formatAmount(balance)}`
        ) : (
          '--'
        )}
      </div>
      
      {/* Decorative elements */}
      <div className="absolute -top-4 -right-4 bg-yellow-300 border-4 border-black w-16 h-16 rounded-full opacity-50"></div>
      <div className="absolute -bottom-6 -left-6 bg-pink-300 border-4 border-black w-24 h-24 rounded-full opacity-50"></div>
    </div>
  );
}
