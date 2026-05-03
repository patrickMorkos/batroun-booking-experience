import React from "react";
import { render, renderHook, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "sonner";

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  route?: string;
  initialEntries?: string[];
  withSidebar?: boolean;
}

function createWrapper({ route = "/", initialEntries, withSidebar = false }: WrapperOptions = {}) {
  const queryClient = createTestQueryClient();
  const entries = initialEntries || [route];

  return function Wrapper({ children }: { children: React.ReactNode }) {
    const content = withSidebar ? <SidebarProvider>{children}</SidebarProvider> : children;
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={entries}>
          {content}
        </MemoryRouter>
        <Toaster />
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: WrapperOptions & Omit<RenderOptions, "wrapper"> = {}
) {
  const { route, initialEntries, withSidebar, ...renderOptions } = options;
  return render(ui, { wrapper: createWrapper({ route, initialEntries, withSidebar }), ...renderOptions });
}

export function renderHookWithProviders<T>(
  hook: () => T,
  options: WrapperOptions = {}
) {
  return renderHook(hook, { wrapper: createWrapper(options) });
}

export { createTestQueryClient, createWrapper };
