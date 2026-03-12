"use client";

import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import superjson from "superjson";
import { trpc } from "../lib/trpcClient";

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/trpc"
    })
  ]
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}

