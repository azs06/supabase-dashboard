import { createServerClient } from "@/lib/supabase-server"
import { LogoutButton } from "@/components/auth/logout-button"
import Link from "next/link"

export default async function ProfileFixPage() {
  try {
    const supabase = createServerClient()

    // Get current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center max-w-md p-6 bg-yellow-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-yellow-600">Authentication Required</h2>
            <p className="text-gray-700 mb-4">You need to be logged in to fix your profile.</p>
            <Link href="/login" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
              Login
            </Link>
          </div>
        </div>
      )
    }

    // Check if profile exists
    const { data: existingProfile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single()

    if (profileError && profileError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" error, other errors should be shown
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2 text-red-600">Profile Check Error</h2>
            <p className="text-gray-700 mb-4">Error: {profileError.message}</p>
            <div className="mt-4">
              <LogoutButton />
            </div>
          </div>
        </div>
      )
    }

    // Get user details
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user

    if (!existingProfile && user) {
      try {
        // Call our API route to create the profile
        const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/create-profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            name: user.user_metadata?.name || user.email?.split("@")[0] || "User",
            email: user.email || "",
            role: "user", // Default role
          }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to create profile")
        }

        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center max-w-md p-6 bg-green-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-2 text-green-600">Profile Created Successfully</h2>
              <p className="text-gray-700 mb-4">Your profile has been created. You can now access the dashboard.</p>
              <div className="flex justify-center space-x-4 mt-4">
                <Link href="/dashboard" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                  Go to Dashboard
                </Link>
              </div>
            </div>
          </div>
        )
      } catch (error: any) {
        return (
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
              <h2 className="text-xl font-semibold mb-2 text-red-600">Profile Creation Error</h2>
              <p className="text-gray-700 mb-4">Error: {error.message || "Unknown error creating profile"}</p>
              <div className="mt-4">
                <LogoutButton />
              </div>
            </div>
          </div>
        )
      }
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-blue-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-blue-600">Profile Status</h2>
          {existingProfile ? (
            <>
              <p className="text-gray-700 mb-4">
                Your profile exists and is working correctly. Role: {existingProfile.role}
              </p>
              <div className="flex justify-center space-x-4 mt-4">
                <Link href="/dashboard" className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md">
                  Go to Dashboard
                </Link>
              </div>
            </>
          ) : (
            <p className="text-gray-700 mb-4">
              Unable to determine profile status. Please try logging out and in again.
            </p>
          )}
          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    )
  } catch (error: any) {
    console.error("Error in profile fix page:", error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-gray-700 mb-4">{error.message || "An error occurred while checking your profile."}</p>
          <div className="mt-4">
            <LogoutButton />
          </div>
        </div>
      </div>
    )
  }
}
