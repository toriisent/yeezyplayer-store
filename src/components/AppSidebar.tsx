
import { useState } from "react"
import { 
  Home, 
  Search, 
  Heart, 
  BarChart3, 
  Music, 
  Settings, 
  LogOut, 
  User,
  Shield
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useAdmin } from "../contexts/AdminContext"

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
  { title: "Stats", url: "/stats", icon: BarChart3 },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const { profile, signOut } = useAuth()
  const { openAdminPanel } = useAdmin()
  const { toast } = useToast()
  const location = useLocation()
  const currentPath = location.pathname

  const isActive = (path: string) => currentPath === path

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
      className={`${isCollapsed ? "w-16" : "w-64"} bg-gray-900 border-r border-gray-700`}
      collapsible="icon"
    >
      <SidebarContent className="bg-gray-900 h-full">
        {/* KanYe Player Header */}
        {!isCollapsed && (
          <div className="px-6 py-6 bg-gray-900">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg">
                <img 
                  src="https://fwsnptiumwcikdrhkpme.supabase.co/storage/v1/object/public/songs/SignUp/Screenshot%202025-07-01%20072126.png"
                  alt="KanYe Player"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-white font-bold text-xl">KanYe Player</h1>
              </div>
            </div>
            <a 
              href="https://discord.gg/Vj3SkyRdzu" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 text-sm transition-colors underline"
            >
              https://discord.gg/Vj3SkyRdzu
            </a>
          </div>
        )}

        {/* Navigation Section */}
        <div className="px-4 py-4">
          <div className="mb-6">
            <h2 className="text-gray-400 text-sm font-semibold mb-4 px-2">NAVIGATION</h2>
            <div className="space-y-2">
              {items.map((item) => (
                <NavLink
                  key={item.title}
                  to={item.url}
                  end
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all duration-200 ${
                      isActive
                        ? "bg-gray-800 text-white border border-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!isCollapsed && <span className="font-medium">{item.title}</span>}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Admin Section */}
          <div className="mb-6">
            <h2 className="text-gray-400 text-sm font-semibold mb-4 px-2">ADMIN</h2>
            <div className="space-y-2">
              <button
                onClick={openAdminPanel}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-white w-full text-left"
              >
                <Shield className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span className="font-medium">Admin Panel</span>}
              </button>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-gray-900 border-t border-gray-700">
        {!isCollapsed && profile && (
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-800 rounded-lg">
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
          <LogOut className="mr-3 h-4 w-4" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
