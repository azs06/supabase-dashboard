"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface LogoutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function LogoutButton({ variant = "default", size = "default", className = "" }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleLogout = async () => {
    setLoading(true)
    try {
      await supabase.auth.signOut()
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push("/login")
      router.refresh()
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Error",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleLogout} disabled={loading}>
      {loading ? (
        "Logging out..."
      ) : (
        <>
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </>
      )}
    </Button>
  )
}
