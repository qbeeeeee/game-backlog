import type { DashboardMediaType } from "@/lib/dashboard/categories";

export type TrackedItemStatus =
  | "BACKLOG"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "PAUSED"
  | "DROPPED";

export interface TrackedItemSummary {
  id: string;
  status: TrackedItemStatus;
  title: string;
  externalId?: string | null;
  source?: string | null;
}

interface TrackerItemsResponse {
  ok: true;
  data: {
    items: TrackedItemSummary[];
  };
}

export function normalizeForCompare(value: string) {
  return value.trim().toLowerCase();
}

export function toTrackedStatusFilter<TUiStatus extends string>(
  status: TUiStatus | "All" | undefined,
  statusMap: Record<TUiStatus, TrackedItemStatus>,
): TrackedItemStatus | undefined {
  if (!status || status === "All") {
    return undefined;
  }

  return statusMap[status];
}

export async function fetchTrackedItems(params: {
  mediaType: DashboardMediaType;
  status?: TrackedItemStatus;
  query?: string;
  limit?: number;
}): Promise<TrackedItemSummary[]> {
  const searchParams = new URLSearchParams({
    mediaType: params.mediaType,
    limit: String(params.limit ?? 100),
  });

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.query) {
    searchParams.set("search", params.query);
  }

  const response = await fetch(
    `/api/tracker/items?${searchParams.toString()}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch tracked items: ${response.statusText}`);
  }

  const payload = (await response.json()) as TrackerItemsResponse;
  return payload.data.items;
}

export function mergeTrackedStatusesByExternalIdOrTitle<TItem>(
  items: TItem[],
  trackedItems: TrackedItemSummary[],
  options: {
    getExternalId: (item: TItem) => string | null | undefined;
    getTitle: (item: TItem) => string;
    setStatus: (item: TItem, status: string) => TItem;
    trackedToUiStatus: (status: TrackedItemStatus) => string;
  },
): TItem[] {
  const byExternalId = new Map<string, string>();
  const byTitle = new Map<string, string>();

  trackedItems.forEach((item) => {
    const mappedStatus = options.trackedToUiStatus(item.status);

    if (item.externalId) {
      byExternalId.set(item.externalId, mappedStatus);
    }

    byTitle.set(normalizeForCompare(item.title), mappedStatus);
  });

  return items.map((item) => {
    const externalId = options.getExternalId(item);
    const externalStatus = externalId
      ? byExternalId.get(externalId)
      : undefined;
    const titleStatus = byTitle.get(
      normalizeForCompare(options.getTitle(item)),
    );
    const mergedStatus = externalStatus ?? titleStatus;

    if (!mergedStatus) {
      return item;
    }

    return options.setStatus(item, mergedStatus);
  });
}
