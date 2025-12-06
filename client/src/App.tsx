import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Diagnose from "@/pages/Diagnose";
import Library from "@/pages/Library";
import CropLibrary from "@/pages/CropLibrary";
import RagAssistant from "@/pages/RagAssistant";
import Dashboard from "@/pages/Dashboard";
import Experts from "@/pages/Experts";
import Weather from "@/pages/Weather";
import Contact from "@/pages/Contact";
import FarmConnect from "@/pages/FarmConnect";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/AdminDashboard";
import ContentManager from "@/components/admin/ContentManager";
import UserManagement from "@/components/admin/UserManagement";
import DocumentManager from "@/components/admin/DocumentManager";
import CropLibraryManager from "@/components/admin/CropLibraryManager";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminFooter from "@/components/admin/AdminFooter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/diagnose" component={Diagnose} />
      <Route path="/library" component={Library} />
      <Route path="/crop-library" component={CropLibrary} />
      <Route path="/chat" component={RagAssistant} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/experts" component={Experts} />
      <Route path="/alerts" component={Weather} />
      <Route path="/contact" component={Contact} />
      <Route path="/farm-connect" component={FarmConnect} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AdminRouter() {
  return (
    <Switch>
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/content" component={ContentManager} />
      <Route path="/admin/crop-library" component={CropLibraryManager} />
      <Route path="/admin/documents" component={DocumentManager} />
      <Route path="/admin/users" component={UserManagement} />
      <Route path="/admin">
        <Redirect to="/admin/crop-library" />
      </Route>
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminRoute = location.startsWith("/admin");

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <LanguageProvider>
            {isAdminRoute ? (
              // Admin layout with fixed sidebar, header, and footer
              <div className="flex min-h-screen flex-col">
                <div className="fixed top-0 left-0 h-full w-64 z-50">
                  <AdminSidebar />
                </div>
                <div className="flex-1 flex flex-col ml-64">
                  <div className="sticky top-0 z-40">
                    <AdminHeader />
                  </div>
                  <div className="flex-1 overflow-auto">
                    <AdminRouter />
                  </div>
                  <AdminFooter />
                </div>
              </div>
            ) : (
              // Regular app layout
              <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-1 pt-14 sm:pt-16 lg:pt-20">
                  <Router />
                </main>
                <Footer />
              </div>
            )}
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;