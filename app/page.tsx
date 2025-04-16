import Link from "next/link"
import { createServerClient } from "@/lib/supabase-server"

export default async function Home() {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Instead of redirecting, we'll render links
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <h1 className="text-3xl font-bold mb-6">SMS Dashboard</h1>
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
          {session ? (
            <div className="space-y-4">
              <p className="text-center">You are logged in.</p>
              <Link
                href="/dashboard"
                className="block w-full py-2 px-4 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-center">Please log in to access the dashboard.</p>
              <Link
                href="/login"
                className="block w-full py-2 px-4 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-md"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="block w-full py-2 px-4 text-center bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    )
  } catch (error: any) {
    console.error("Error creating Supabase client:", error)

    // Determine the specific error message to show
    let errorMessage = "Failed to connect to Supabase"
    let helpText = "Please check your Supabase environment variables in your Vercel project settings."

    if (error.message.includes("Placeholder Supabase credentials")) {
      errorMessage = "Placeholder Supabase credentials detected"
      helpText = "Please update your environment variables with actual Supabase URL and anon key values."
    } else if (error.message.includes("Invalid Supabase URL format")) {
      errorMessage = "Invalid Supabase URL format"
      helpText = "Your Supabase URL should be in the format: https://your-project-id.supabase.co"
    } else if (error.message.includes("Missing Supabase environment")) {
      errorMessage = "Missing Supabase environment variables"
      helpText = "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables."
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Connection Error</h2>
          <p className="text-gray-700 mb-4">{errorMessage}</p>
          <p className="text-sm text-gray-500 mb-4">{helpText}</p>
          <div className="text-left bg-gray-100 p-4 rounded-md text-sm">
            <p className="font-semibold mb-2">How to fix:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Go to your Vercel project dashboard</li>
              <li>Navigate to "Settings" {"->"} "Environment Variables"</li>
              <li>
                Update the following variables with your actual Supabase values:
                <ul className="list-disc pl-5 mt-1">
                  <li>NEXT_PUBLIC_SUPABASE_URL (e.g., https://abcdefg.supabase.co)</li>
                  <li>NEXT_PUBLIC_SUPABASE_ANON_KEY (your public anon key)</li>
                </ul>
              </li>
              <li>Redeploy your application</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }
}
