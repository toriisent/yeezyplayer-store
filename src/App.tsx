
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import Index from "./pages/Index";
import Search from "./pages/Search";
import Releases from "./pages/Releases";
import LikedSongs from "./pages/LikedSongs";
import Stats from "./pages/Stats";
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
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-black text-white">
                <AppSidebar />
                
                <div className="flex-1 flex flex-col">
                  <header className="h-16 flex items-center px-6 bg-black border-b border-gray-800">
                    <SidebarTrigger className="text-white hover:bg-white/10 transition-colors duration-200" />
                  </header>
                  
                  <main className="flex-1 overflow-auto">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/releases" element={<Releases />} />
                      <Route path="/liked" element={<LikedSongs />} />
                      <Route path="/stats" element={<Stats />} />
                      <Route path="/release/:id" element={<ReleaseDetail />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </div>
              <MusicPlayer />
              <AdminPanel />
            </SidebarProvider>
          </BrowserRouter>
        </MusicProvider>
      </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
