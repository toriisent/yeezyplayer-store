
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ReleaseDetail from "./pages/ReleaseDetail";
import NotFound from "./pages/NotFound";
import { AdminProvider } from "./contexts/AdminContext";
import { MusicProvider } from "./contexts/MusicContext";
import { MusicPlayer } from "./components/MusicPlayer";
import { AdminPanel } from "./components/AdminPanel";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <MusicProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <div className="min-h-screen bg-black text-white">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/release/:id" element={<ReleaseDetail />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <MusicPlayer />
              <AdminPanel />
            </div>
          </BrowserRouter>
        </MusicProvider>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
