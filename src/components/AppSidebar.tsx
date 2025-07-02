
import { useState } from "react"
import { 
  Home, 
  Search, 
  Heart, 
  BarChart3, 
  Music, 
  Settings, 
  LogOut, 
  User
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

const items = [
  { title: "Home", url: "/", icon: Home },
  { title: "Search", url: "/search", icon: Search },
  { title: "Liked Songs", url: "/liked", icon: Heart },
  { title: "Statistics", url: "/stats", icon: BarChart3 },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const { profile, signOut } = useAuth()
  const { toast } = useToast()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({
        title: "Signed out",
        description: "You have been successfully signed out."
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive"
      })
    }
  }

  const isCollapsed = state === "collapsed"

  return (
    <Sidebar
      className={`${isCollapsed ? "w-14" : "w-60"} bg-gray-900 border-gray-800`}
      collapsible="icon"
    >
      <SidebarTrigger className="m-2 self-end text-white hover:bg-gray-800" />

      <SidebarContent className="bg-gray-900">
        {/* KanYe Player Header */}
        {!isCollapsed && (
          <div className="px-4 py-6 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg">
                <img 
                  src="https://fwsnptiumwcikdrhkpme.supabase.co/storage/v1/object/public/songs/SignUp/Screenshot%202025-07-01%20072126.png"
                  alt="KanYe Player"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">KanYe Player</h1>
              </div>
            </div>
            <a 
              href="https://discord.gg/Vj3SkyRdzu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 text-sm transition-colors underline"
            >
              Join our Discord
            </a>
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-400">Music Player</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-2 h-4 w-4 text-gray-300" />
                      {!isCollapsed && <span className="text-gray-300">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-gray-900 border-t border-gray-800">
        {!isCollapsed && profile && (
          <div className="flex items-center gap-2 mb-2 p-2 bg-gray-800/50 rounded-lg">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {profile.username}
              </p>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-300 hover:text-white hover:bg-gray-800"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
