
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, Heart, Settings, BarChart } from 'lucide-react';
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

const navigationItems = [
  { title: 'Home', url: '/', icon: Home },
  { title: 'Search', url: '/search', icon: Search },
  { title: 'Liked Songs', url: '/liked', icon: Heart },
  { title: 'Stats', url: '/stats', icon: BarChart },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { openAdminPanel } = useAdmin();
  const isCollapsed = state === 'collapsed';

  const getNavClass = (isActive: boolean) =>
    isActive 
      ? 'bg-white/10 text-white font-medium border-r-2 border-white animate-fade-in' 
      : 'text-gray-300 hover:text-white hover:bg-white/5 hover-scale transition-all duration-200';

  return (
    <Sidebar className="bg-gradient-to-b from-gray-900 via-black to-gray-900 border-r border-gray-800 animate-slide-in-left">
      <SidebarHeader className="p-6 border-b border-gray-800 animate-fade-in bg-gradient-to-r from-gray-900/80 to-black/80">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-white animate-shimmer">
            KanYe Player
          </h1>
          {!isCollapsed && (
            <a 
              href="https://discord.gg/Vj3SkyRdzu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-gray-400 hover:text-gray-300 transition-colors duration-200 mt-1 hover-scale"
            >
              https://discord.gg/Vj3SkyRdzu
            </a>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="p-4 bg-gradient-to-b from-black/50 to-gray-900/50">
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-4 animate-fade-in">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item, index) => {
                const isActive = location.pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <SidebarMenuButton asChild className="h-12 rounded-lg">
                      <NavLink 
                        to={item.url} 
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${getNavClass(isActive)}`}
                      >
                        <item.icon className="w-5 h-5" />
                        {!isCollapsed && (
                          <span className="font-medium">{item.title}</span>
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
          <SidebarGroupLabel className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-4 animate-fade-in">
            Admin
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem className="animate-fade-in">
                <SidebarMenuButton 
                  onClick={openAdminPanel}
                  className="h-12 rounded-lg flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 hover-scale transition-all duration-200"
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
