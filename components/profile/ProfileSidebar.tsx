import { Badge } from "@/components/ui/badge";
import { LogoutButton } from "@/components/auth/LogoutButton";

export function ProfileSidebar() {
  return (
    <aside className="h-full" aria-label="Profile navigation sidebar">
      <div className="flex h-full flex-col justify-between">
        <div>
          <div className="mb-24 flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              🕹️
            </span>
            <span className="text-sm font-bold tracking-widest text-purple-300 uppercase">
              Game Backlog
            </span>
            <Badge
              variant="outline"
              className="border-cyan-500/40 text-cyan-300 uppercase tracking-widest"
            >
              Arcade
            </Badge>
          </div>

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Profile
          </p>
          <div className="flex h-52 items-center justify-center rounded-xl border border-dashed border-gray-800 bg-gray-900/30">
            <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">
              Profile nav empty for now
            </p>
          </div>
        </div>

        <ul className="flex items-center gap-2 list-none">
          <LogoutButton />
        </ul>
      </div>
    </aside>
  );
}
