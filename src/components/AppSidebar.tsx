
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Heart, Music, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from '@/components/ui/sidebar';
import { useAdmin } from '../contexts/AdminContext';
import { useMusic } from '../contexts/MusicContext';

const navigationItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Search', url: '/search', icon: Search },
  { title: 'Liked Songs', url: '/liked', icon: Heart },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { openAdminPanel } = useAdmin();
  const { likedSongs } = useMusic();
  const isCollapsed = state === 'collapsed';

  const getNavClass = (isActive: boolean) =>
    isActive 
      ? 'bg-white/10 text-white font-medium border-r-2 border-white' 
      : 'text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200';

  return (
    <Sidebar className="bg-gradient-to-b from-gray-900 to-black border-r border-gray-800">
      <SidebarHeader className="p-6 border-b border-gray-800">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            KanYe Player
          </h1>
          {!isCollapsed && (
            <a 
              href="https://discord.gg/Vj3SkyRdzu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors duration-200 mt-1"
            >
              https://discord.gg/Vj3SkyRdzu
            </a>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-4">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="h-12 rounded-lg">
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${getNavClass(isActive)}`}
                      >
                        <item.icon className="w-5 h-5" />
                        {!isCollapsed && (
                          <span className="font-medium">{item.title}</span>
                        )}
                        {item.title === 'Liked Songs' && likedSongs.length > 0 && !isCollapsed && (
                          <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                            {likedSongs.length}
                          </span>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-4">
            Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={openAdminPanel}
                  className="h-12 rounded-lg flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <Settings className="w-5 h-5" />
                  {!isCollapsed && <span className="font-medium">Admin Panel</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
