"use client";

/**
 * QueryProvider
 * -------------
 * Wraps children with TanStack Query's QueryClientProvider.
 * Must be a Client Component because QueryClient uses React context internally.
 *
 * This is kept as a separate file so it can be imported from the dashboard
 * layout (or any other Server Component tree) without forcing the whole layout
 * to become a Client Component.
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  // Create the QueryClient inside useState so each browser session gets its
  // own instance, avoiding shared state between requests on the server.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data is considered fresh for 30 seconds before a background
            // refetch is triggered.
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" ? (
        <ReactQueryDevtools initialIsOpen={false} />
      ) : null}
    </QueryClientProvider>
  );
}
