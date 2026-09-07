import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, renderHook, type RenderHookOptions, type RenderOptions } from "@testing-library/react";

export function makeTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 60 * 1000, refetchOnWindowFocus: false },
      mutations: { retry: false },
    },
  });
}

function Wrapper({ client, children }: { client: QueryClient; children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

export function renderWithQueryClient(ui: React.ReactElement, client: QueryClient = makeTestQueryClient(), options?: RenderOptions) {
  return { client, ...render(<Wrapper client={client}>{ui}</Wrapper>, options) };
}

export function renderHookWithQueryClient<TResult, TProps>(
  hook: (props: TProps) => TResult,
  client: QueryClient = makeTestQueryClient(),
  options?: Omit<RenderHookOptions<TProps>, "wrapper">,
) {
  return { client, ...renderHook(hook, { wrapper: ({ children }) => <Wrapper client={client}>{children}</Wrapper>, ...options }) };
}
