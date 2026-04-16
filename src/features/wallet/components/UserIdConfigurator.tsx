import { User } from 'lucide-react';

interface Props {
  userId: string;
  setUserId: (id: string) => void;
}

export function UserIdConfigurator({ userId, setUserId }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <label className="font-black uppercase text-sm">Target User ID (Testing)</label>
      <div className="flex items-center gap-4">
        <div className="bg-yellow-200 border-4 border-black p-2 shadow-[2px_2px_0px_0px_#000]">
          <User size={20} />
        </div>
        <input
          type="text"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter User ID..."
          className="flex-1 bg-white border-4 border-black p-2 font-bold focus:outline-none focus:bg-yellow-50 transition-colors shadow-[4px_4px_0px_0px_#000] focus:shadow-none focus:translate-x-[4px] focus:translate-y-[4px]"
        />
      </div>
    </div>
  );
}
