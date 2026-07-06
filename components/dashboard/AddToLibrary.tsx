"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DASHBOARD_TO_TRACKED_STATUS,
  DashboardGameStatus,
  DashboardTrackedItemStatus,
  gameKeys,
  trackedToDashboardStatus,
} from "@/lib/category-api";
import { DashboardMediaType } from "@/lib/dashboard-categories";

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
  mediaType: DashboardMediaType;
  title: string;
  externalId?: string;
  source?: string;
  initialStatus?: DashboardGameStatus | "";
}

interface TrackedItemRecord {
  id: string;
  status: DashboardTrackedItemStatus;
  title: string;
  externalId?: string | null;
  source?: string | null;
}

interface ApiSuccess<T> {
  ok: true;
  data: T;
}

interface ApiFailure {
  ok: false;
  error: {
    message: string;
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export default function AddToLibrary({
  mediaType,
  title,
  externalId,
  source,
  initialStatus = "",
}: AddToLibraryProps) {
  const queryClient = useQueryClient();
  const [libraryStatus, setLibraryStatus] = useState<DashboardGameStatus | "">(
    initialStatus,
  );
  const [trackedItemId, setTrackedItemId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trackerQueryKey = [
    "tracker-item",
    mediaType,
    title,
    externalId ?? "",
    source ?? "",
  ] as const;

  const options = [
    { value: "Backlog", label: "Backlog", icon: Bookmark },
    { value: "Playing", label: "Playing", icon: Gamepad2 },
    { value: "Completed", label: "Completed", icon: Trophy },
  ] as const;

  const selectedOption = options.find((opt) => opt.value === libraryStatus);
  const ActiveIcon = selectedOption?.icon;

  const trackedItemQuery = useQuery<TrackedItemRecord | null, Error>({
    queryKey: trackerQueryKey,
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        mediaType,
        limit: "20",
      });

      if (externalId) {
        searchParams.set("externalId", externalId);
      }

      if (source) {
        searchParams.set("source", source);
      }

      if (!externalId && title) {
        searchParams.set("search", title);
      }

      const response = await fetch(
        `/api/tracker/items?${searchParams.toString()}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const payload = (await response.json()) as ApiResponse<{
        items: TrackedItemRecord[];
      }>;

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok
            ? "Failed to load current library status."
            : payload.error.message,
        );
      }

      return (
        payload.data.items.find((item) => {
          if (externalId) {
            return item.externalId === externalId && item.source === source;
          }

          return item.title.toLowerCase() === title.toLowerCase();
        }) ?? null
      );
    },
    enabled: Boolean(title),
    retry: 1,
  });

  const createTrackedItemMutation = useMutation<
    TrackedItemRecord,
    Error,
    {
      mediaType: DashboardMediaType;
      status: DashboardTrackedItemStatus;
      title: string;
      externalId?: string;
      source?: string;
    }
  >({
    mutationFn: async (body) => {
      const response = await fetch("/api/tracker/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as ApiResponse<{
        item: TrackedItemRecord;
      }>;

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok
            ? "Failed to add item to your library."
            : payload.error.message,
        );
      }

      return payload.data.item;
    },
  });

  const updateTrackedItemMutation = useMutation<
    TrackedItemRecord,
    Error,
    {
      id: string;
      body: {
        mediaType: DashboardMediaType;
        status: DashboardTrackedItemStatus;
        title: string;
        externalId?: string;
        source?: string;
      };
    }
  >({
    mutationFn: async ({ id, body }) => {
      const response = await fetch(`/api/tracker/items/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const payload = (await response.json()) as ApiResponse<{
        item: TrackedItemRecord;
      }>;

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok ? "Failed to update item status." : payload.error.message,
        );
      }

      return payload.data.item;
    },
  });

  const deleteTrackedItemMutation = useMutation<true, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      const response = await fetch(`/api/tracker/items/${id}`, {
        method: "DELETE",
      });

      const payload = (await response.json()) as ApiResponse<{
        deleted: true;
      }>;

      if (!response.ok || !payload.ok) {
        throw new Error(
          payload.ok
            ? "Failed to remove item from your library."
            : payload.error.message,
        );
      }

      return true;
    },
  });

  const isLoading = trackedItemQuery.isLoading;
  const isSaving =
    createTrackedItemMutation.isPending ||
    updateTrackedItemMutation.isPending ||
    deleteTrackedItemMutation.isPending;

  useEffect(() => {
    if (!trackedItemQuery.isSuccess) {
      return;
    }

    if (trackedItemQuery.data) {
      setTrackedItemId(trackedItemQuery.data.id);
      setLibraryStatus(trackedToDashboardStatus(trackedItemQuery.data.status));
      return;
    }

    setTrackedItemId(null);
    setLibraryStatus(initialStatus);
  }, [trackedItemQuery.data, trackedItemQuery.isSuccess, initialStatus]);

  useEffect(() => {
    if (!trackedItemQuery.error) {
      return;
    }

    setErrorMessage(trackedItemQuery.error.message);
  }, [trackedItemQuery.error]);

  const handleSelect = async (value: DashboardGameStatus | "") => {
    if (isSaving || isLoading) {
      return;
    }

    const previousStatus = libraryStatus;
    setLibraryStatus(value);
    setErrorMessage(null);

    try {
      if (!value) {
        if (trackedItemId) {
          await deleteTrackedItemMutation.mutateAsync({
            id: trackedItemId,
          });
        }

        setTrackedItemId(null);
        await queryClient.invalidateQueries({ queryKey: trackerQueryKey });
        await queryClient.invalidateQueries({ queryKey: gameKeys.all });
        return;
      }

      const body = {
        mediaType,
        status: DASHBOARD_TO_TRACKED_STATUS[value],
        title,
        externalId,
        source,
      };

      if (trackedItemId) {
        await updateTrackedItemMutation.mutateAsync({
          id: trackedItemId,
          body,
        });
        await queryClient.invalidateQueries({ queryKey: trackerQueryKey });
        await queryClient.invalidateQueries({ queryKey: gameKeys.all });

        return;
      }

      const createdItem = await createTrackedItemMutation.mutateAsync(body);
      setTrackedItemId(createdItem.id);
      await queryClient.invalidateQueries({ queryKey: trackerQueryKey });
      await queryClient.invalidateQueries({ queryKey: gameKeys.all });
    } catch (error) {
      setLibraryStatus(previousStatus);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Could not save library change.",
      );
    }
  };

  return (
    <div className="flex items-center justify-center gap-6">
      <p className="text-[10px] uppercase tracking-[0.24em] text-gray-500">
        Add to your library
      </p>

      <DropdownMenu>
        <DropdownMenuTrigger
          disabled={isLoading || isSaving}
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
                onClick={() => {
                  void handleSelect(option.value as DashboardGameStatus);
                }}
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
                onClick={() => {
                  void handleSelect("");
                }}
                className="flex items-center px-3 py-3 cursor-pointer uppercase tracking-wider text-xs text-gray-500 focus:bg-red-950/40 focus:text-red-400 transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-3 opacity-80" />
                Remove
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {errorMessage && (
        <p className="text-[10px] uppercase tracking-[0.2em] text-red-400">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
