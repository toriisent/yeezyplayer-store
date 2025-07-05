
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { UserProfile } from "./components/UserProfile";
import Index from "./pages/Index";
import Search from "./pages/Search";
import LikedSongs from "./pages/LikedSongs";
import Stats from "./pages/Stats";
import ReleaseDetail from "./pages/ReleaseDetail";
import Profile from "./pages/Profile";
import UserLikedSongs from "./pages/UserLikedSongs";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { AdminProvider } from "./contexts/AdminContext";
import { AuthProvider } from "./contexts/AuthContext";
import { MusicProvider } from "./contexts/MusicContext";
import { MusicPlayer } from "./components/MusicPlayer";
import { AdminPanel } from "./components/AdminPanel";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <AdminProvider>
          <MusicProvider>
            <Toaster />
            <Sonner />
            <HashRouter>
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/*" element={
                  <ProtectedRoute>
                    <SidebarProvider>
                      <div className="min-h-screen flex w-full bg-black text-white">
                        <AppSidebar />
                        
                        <div className="flex-1 flex flex-col">
                          <header className="h-16 flex items-center justify-between px-6 bg-gray-900 border-b border-gray-700">
                            <SidebarTrigger className="text-white hover:bg-gray-800 transition-colors duration-200" />
                            <UserProfile />
                          </header>
                          
                          <main className="flex-1 overflow-auto bg-black">
                            <Routes>
                              <Route path="/" element={<Index />} />
                              <Route path="/search" element={<Search />} />
                              <Route path="/liked" element={<LikedSongs />} />
                              <Route path="/profile" element={<Profile />} />
                              <Route path="/profile/:username" element={<Profile />} />
                              <Route path="/profile/:username/likedsongs" element={<UserLikedSongs />} />
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
                  </ProtectedRoute>
                } />
              </Routes>
            </HashRouter>
          </MusicProvider>
        </AdminProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
