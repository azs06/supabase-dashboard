import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { createServerClient } from "@/lib/supabase-server"
import { LogoutButton } from "@/components/auth/logout-button"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = createServerClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center max-w-md p-6 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-yellow-600">Authentication Required</h2>
            <p className="text-gray-700 mb-4">You need to be logged in to access the dashboard.</p>
            <div className="flex justify-center space-x-4">
              <Link href="/login" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                Login
              </Link>
              <Link href="/register" className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md">
                Register
              </Link>
            </div>
          </div>
        </div>
      )
    }


 
    const data = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
    const profile = data.data
    console.log({ data });
    // If profile doesn't exist, try to create one via the API route
    if (!profile) {
      console.log("Profile not found, attempting to create one via API")

      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Profile Not Found</h2>
            <p className="text-gray-700 mb-4">
              Your user profile could not be found!
            </p>
            <div className="mt-4 flex justify-center space-x-4">
              <Link href="/profile-fix" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                Go to Profile Fix
              </Link>
              <LogoutButton variant="outline" />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
        <DashboardSidebar userRole={profile.role} />
        <div className="flex-1 overflow-auto">
          <main className="p-6">{children}</main>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error("Error in dashboard layout:", error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Dashboard Error</h2>
          <p className="text-gray-700 mb-4">Error: {error.message || "There was an error loading the dashboard."}</p>
          <div className="flex justify-center space-x-4">
            <Link href="/" className="py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md">
              Return to Home
            </Link>
            <LogoutButton variant="destructive" />
          </div>
        </div>
      </div>
    )
  }
}
