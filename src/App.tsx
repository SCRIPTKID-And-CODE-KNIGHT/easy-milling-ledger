import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { LanguageProvider } from "@/hooks/useLanguage";
import { BusinessTypeProvider, useBusinessType } from "@/hooks/useBusinessType";
import Index from "./pages/Index";
import AddRecord from "./pages/AddRecord";
import Reports from "./pages/Reports";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import SelectBusiness from "./pages/SelectBusiness";
import Landing from "./pages/Landing";
import ShopDashboard from "./pages/shop/ShopDashboard";
import ShopProducts from "./pages/shop/ShopProducts";
import ShopAddRecord from "./pages/shop/ShopAddRecord";
import ShopReports from "./pages/shop/ShopReports";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { businessType, loading: btLoading } = useBusinessType();
  if (loading || btLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (!businessType) return <Navigate to="/select-business" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Auth />;
}

function LandingRoute() {
  const { user, loading } = useAuth();
  const { businessType, loading: btLoading } = useBusinessType();
  if (loading || btLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (user && businessType) return <Navigate to={businessType === "shop" ? "/shop" : "/dashboard"} replace />;
  if (user && !businessType) return <Navigate to="/select-business" replace />;
  return <Landing />;
}

function SelectBusinessRoute() {
  const { user, loading } = useAuth();
  const { businessType, loading: btLoading } = useBusinessType();
  if (loading || btLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  if (businessType) return <Navigate to={businessType === "shop" ? "/shop" : "/dashboard"} replace />;
  return <SelectBusiness />;
}

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingRoute />} />
    <Route path="/auth" element={<AuthRoute />} />
    <Route path="/select-business" element={<SelectBusinessRoute />} />
    <Route path="/dashboard" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/add-record" element={<ProtectedRoute><AddRecord /></ProtectedRoute>} />
    <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
    <Route path="/shop" element={<ProtectedRoute><ShopDashboard /></ProtectedRoute>} />
    <Route path="/shop/products" element={<ProtectedRoute><ShopProducts /></ProtectedRoute>} />
    <Route path="/shop/add-record" element={<ProtectedRoute><ShopAddRecord /></ProtectedRoute>} />
    <Route path="/shop/reports" element={<ProtectedRoute><ShopReports /></ProtectedRoute>} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="light" storageKey="biashara-theme">
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <BusinessTypeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </BusinessTypeProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
