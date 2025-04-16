"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BarChart3, Home, Menu, MessageSquare, Users, X } from "lucide-react"
import { LogoutButton } from "@/components/auth/logout-button"

interface DashboardSidebarProps {
  userRole: string
}

export function DashboardSidebar({ userRole }: DashboardSidebarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      roles: ["user", "admin", "superadmin"],
    },
    {
      name: "Send SMS",
      href: "/dashboard/send-sms",
      icon: MessageSquare,
      roles: ["user", "admin", "superadmin"],
    },
    {
      name: "Message History",
      href: "/dashboard/history",
      icon: BarChart3,
      roles: ["user", "admin", "superadmin"],
    },
    {
      name: "User Management",
      href: "/dashboard/users",
      icon: Users,
      roles: ["admin", "superadmin"],
    },
  ]

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole))

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="p-6">
            <h2 className="text-2xl font-bold">SMS Dashboard</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </p>
          </div>

          <nav className="flex-1 px-4 space-y-1">
            {filteredNavItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                    isActive
                      ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <LogoutButton
              variant="ghost"
              className="w-full justify-start text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            />
          </div>
        </div>
      </div>

      {/* Overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
