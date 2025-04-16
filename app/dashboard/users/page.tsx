import { UserManagement } from "@/components/dashboard/user-management"
import { createServerClient } from "@/lib/supabase-server"
import { redirect } from "next/navigation"

export default async function UsersPage() {
  const supabase = createServerClient()

  // Get current user's profile
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  const { data: currentUserProfile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  // Only allow admin and superadmin to access this page
  if (!currentUserProfile || (currentUserProfile.role !== "admin" && currentUserProfile.role !== "superadmin")) {
    redirect("/dashboard")
  }

  // Get all users
  const { data: users } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">User Management</h1>
      <p className="text-gray-600 dark:text-gray-400">Manage users and their roles</p>
      <UserManagement users={users || []} currentUserRole={currentUserProfile.role} />
    </div>
  )
}
