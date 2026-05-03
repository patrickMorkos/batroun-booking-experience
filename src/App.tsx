import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { usePageTracking } from "@/hooks/usePageTracking";
import Index from "./pages/Index";
import ChaletDetail from "./pages/ChaletDetail";
import NotFound from "./pages/NotFound";

const AdminLogin = lazy(() => import("@/admin/pages/AdminLogin"));
const AdminForgotPassword = lazy(() => import("@/admin/pages/AdminForgotPassword"));
const AdminLayout = lazy(() => import("@/admin/layouts/AdminLayout"));
const ProtectedRoute = lazy(() => import("@/admin/components/ProtectedRoute"));
const AdminDashboard = lazy(() => import("@/admin/pages/AdminDashboard"));
const AdminChalets = lazy(() => import("@/admin/pages/AdminChalets"));
const AdminChaletEdit = lazy(() => import("@/admin/pages/AdminChaletEdit"));
const AdminUsers = lazy(() => import("@/admin/pages/AdminUsers"));
const AdminSiteImages = lazy(() => import("@/admin/pages/AdminSiteImages"));
const AdminGallery = lazy(() => import("@/admin/pages/AdminGallery"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnMount: "always",
      refetchOnWindowFocus: false,
    },
  },
});

function AppShell() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  usePageTracking();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/chalets" element={<Navigate to="/#chalets" replace />} />
      <Route path="/chalets/:slug" element={<ChaletDetail />} />

      {/* Admin routes */}
      <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><AdminLogin /></Suspense>} />
      <Route path="/admin/forgot-password" element={<Suspense fallback={<AdminFallback />}><AdminForgotPassword /></Suspense>} />
      <Route element={<Suspense fallback={<AdminFallback />}><ProtectedRoute /></Suspense>}>
        <Route element={<Suspense fallback={<AdminFallback />}><AdminLayout /></Suspense>}>
          <Route path="/admin" element={<Suspense fallback={<AdminFallback />}><AdminDashboard /></Suspense>} />
          <Route path="/admin/chalets" element={<Suspense fallback={<AdminFallback />}><AdminChalets /></Suspense>} />
          <Route path="/admin/chalets/:id" element={<Suspense fallback={<AdminFallback />}><AdminChaletEdit /></Suspense>} />
          <Route path="/admin/users" element={<Suspense fallback={<AdminFallback />}><AdminUsers /></Suspense>} />
          <Route path="/admin/site-images" element={<Suspense fallback={<AdminFallback />}><AdminSiteImages /></Suspense>} />
          <Route path="/admin/gallery" element={<Suspense fallback={<AdminFallback />}><AdminGallery /></Suspense>} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const AdminFallback = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Analytics />
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
