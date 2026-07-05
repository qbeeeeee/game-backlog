"use client";

import { useState } from "react";
import { DashboardGameStatus } from "@/lib/game-api";

import {
  Gamepad2,
  Bookmark,
  Trophy,
  ChevronDown,
  Check,
  Trash2,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AddToLibraryProps {
  initialStatus?: DashboardGameStatus | "";
}

export default function AddToLibrary({
  initialStatus = "",
}: AddToLibraryProps) {
  const [libraryStatus, setLibraryStatus] = useState<DashboardGameStatus | "">(
    initialStatus,
  );

  const options = [
    { value: "Backlog", label: "Backlog", icon: Bookmark },
    { value: "Playing", label: "Playing", icon: Gamepad2 },
    { value: "Completed", label: "Completed", icon: Trophy },
  ] as const;

  const selectedOption = options.find((opt) => opt.value === libraryStatus);
  const ActiveIcon = selectedOption?.icon;

  const handleSelect = (value: DashboardGameStatus | "") => {
    setLibraryStatus(value);

    // TODO: Trigger your API call here to save (or remove) the value in the database
    // If value === "", you tell your database to delete the record!
  };

  return (
    <div className="flex items-center justify-center gap-6">
      <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">
        Add to your library
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger
          className={`h-12 w-full sm:w-50 px-4 flex items-center justify-between uppercase tracking-widest transition-all duration-300 border rounded-md text-sm font-medium focus:outline-none ${
            libraryStatus
              ? "bg-cyan-950/40 text-cyan-300 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:bg-cyan-900/50 hover:text-cyan-200"
              : "bg-transparent border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800/50 hover:border-gray-700"
          }`}
        >
          <div className="flex items-center">
            {ActiveIcon ? (
              <ActiveIcon className="w-4 h-4 mr-2.5 opacity-80" />
            ) : null}
            {selectedOption ? selectedOption.label : "Select..."}
          </div>
          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          className="w-50 bg-gray-950 border-gray-800"
        >
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = libraryStatus === option.value;

            return (
              <DropdownMenuItem
                key={option.value}
                onClick={() =>
                  handleSelect(option.value as DashboardGameStatus)
                }
                className={`flex items-center justify-between px-3 py-3 cursor-pointer uppercase tracking-wider text-xs focus:bg-gray-800 focus:text-white transition-colors ${
                  isSelected ? "text-cyan-400 font-medium" : "text-gray-400"
                }`}
              >
                <div className="flex items-center">
                  <Icon className="w-4 h-4 mr-3 opacity-80" />
                  {option.label}
                </div>

                {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
              </DropdownMenuItem>
            );
          })}

          {libraryStatus && (
            <>
              <DropdownMenuSeparator className="bg-gray-800" />
              <DropdownMenuItem
                onClick={() => handleSelect("")}
                className="flex items-center px-3 py-3 cursor-pointer uppercase tracking-wider text-xs text-gray-500 focus:bg-red-950/40 focus:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-3 opacity-80" />
                Remove
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
