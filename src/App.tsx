import React from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import "./lib/supabaseClient";

import Dashboard from "./components/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import StoreMapPage from "./pages/StoreMapPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SearchPage from "./pages/SearchPage";
import SalesHistoryPage from "./pages/SalesHistoryPage";
import NotFound from "./pages/NotFound";
import PageTransition from "./components/PageTransition";
import { useRouteDirection } from "./hooks/useRouteDirection";

// Ingesta
import IngestionWizardPage from "./pages/IngestionWizardPage";
import IngestionProcessingPage from "./pages/IngestionProcessingPage";

// 👉 Auth (nuevo)
import { AuthProvider } from "@/lib/AuthProvide";
import { RequireAuth } from "@/components/RequireAuth";
import LoginPage from "@/pages/LoginPage";

const queryClient = new QueryClient();

const pickVariant = (pathname: string, dir: "forward" | "back") => {
  const isDetail = /^\/product\/[^/]+$/.test(pathname);
  const isDashboard = pathname === "/dashboard" || pathname === "/";
  if (isDetail) return "detail" as const;
  if (isDashboard) return "back" as const;
  return dir;
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const dir = useRouteDirection();
  const variant = pickVariant(location.pathname, dir);

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition variant={variant}>
              <Dashboard />
            </PageTransition>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PageTransition variant={variant}>
              <Dashboard />
            </PageTransition>
          }
        />
        <Route
          path="/inventory"
          element={
            <PageTransition variant={variant}>
              <InventoryPage />
            </PageTransition>
          }
        />
        <Route
          path="/map"
          element={
            <PageTransition variant={variant}>
              <StoreMapPage />
            </PageTransition>
          }
        />
        <Route
          path="/product/:id"
          element={
            <PageTransition variant={variant}>
              <ProductDetailPage />
            </PageTransition>
          }
        />
        <Route
          path="/search"
          element={
            <PageTransition variant={variant}>
              <SearchPage />
            </PageTransition>
          }
        />
        <Route
          path="/sales-history"
          element={
            <PageTransition variant={variant}>
              <SalesHistoryPage />
            </PageTransition>
          }
        />

        {/* Ingesta: wizard */}
        <Route
          path="/ingest"
          element={
            <PageTransition variant={variant}>
              <IngestionWizardPage />
            </PageTransition>
          }
        />

        {/* Ingesta: proceso */}
        <Route
          path="/ingest/run/:runId"
          element={
            <PageTransition variant={variant}>
              <IngestionProcessingPage />
            </PageTransition>
          }
        />

        <Route
          path="*"
          element={
            <PageTransition variant={variant}>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* Todo lo demás requiere sesión */}
            <Route
              path="/*"
              element={
                <RequireAuth>
                  <div className="h-screen w-screen overflow-hidden">
                    <AnimatedRoutes />
                  </div>
                </RequireAuth>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
