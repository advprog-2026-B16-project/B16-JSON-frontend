import { User } from 'lucide-react';

interface Props {
  username: string;
}

export function UserIdConfigurator({ username }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-2">
      <label className="font-black uppercase text-sm">
        Current User
      </label>

      <div className="flex items-center gap-4">
        <div className="bg-yellow-200 border-4 border-black p-2 shadow-[2px_2px_0px_0px_#000]">
          <User size={20} />
        </div>

        <div className="flex-1 bg-white border-4 border-black p-2 font-bold shadow-[4px_4px_0px_0px_#000]">
          {username || "No user"}
        </div>
      </div>
    </div>
  );
}