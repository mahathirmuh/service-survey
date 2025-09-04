import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import SurveyResults from "./pages/SurveyResults";
import UserLogin from "./pages/UserLogin";
import EmployeeManagement from "./pages/EmployeeManagement";
import Submission from "./pages/Submission";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<UserLogin />} />
            <Route path="/employee" element={<EmployeeManagement />} />
            <Route path="/user-management" element={<EmployeeManagement />} />
            <Route path="/submission" element={<Submission />} />
            <Route path="/results" element={<SurveyResults />} />
            <Route path="/results/managerial" element={<SurveyResults />} />
            <Route path="/results/non-managerial" element={<SurveyResults />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
