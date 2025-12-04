"use client"

import { FileSpreadsheet, Sparkles, Settings } from "lucide-react"
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
  SidebarFooter,
} from "@/components/ui/sidebar"

const menuItems = [
  {
    title: "Exports",
    icon: FileSpreadsheet,
    href: "/",
  },
  {
    title: "AI Exports Assistant",
    icon: Sparkles,
    href: "/ai-assistant",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <div className="h-full bg-[#7F1D1D]">
        <SidebarHeader className="border-b px-6 py-4 border-white/20">
          <div className="flex items-center justify-center">
            <img 
              src="/CI_LOGO_BLACK_Logo.svg" 
              alt="Coleridge Initiative" 
              className="h-10 w-auto"
            />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-white/70">Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className="text-white hover:bg-white/10 hover:text-white data-[active=true]:bg-white/20">
                      <a href={item.href}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t px-6 py-4 border-white/20">
          <p className="text-xs text-white/60">
            PII Detection Tool v0.1.0
          </p>
        </SidebarFooter>
      </div>
    </Sidebar>
  )
}