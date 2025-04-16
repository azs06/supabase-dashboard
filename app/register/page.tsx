import { RegisterForm } from "@/components/auth/register-form"
import { createServerClient } from "@/lib/supabase-server"
import Link from "next/link"

export default async function RegisterPage() {
  try {
    const supabase = createServerClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Instead of redirecting, we'll show a message with a link
    if (session) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
            <div className="text-center">
              <h1 className="text-2xl font-bold">Already Logged In</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">You are already logged in.</p>
            </div>
            <Link
              href="/dashboard"
              className="block w-full py-2 px-4 text-center bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Register to access the SMS Dashboard</p>
          </div>
          <RegisterForm />
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in register page:", error)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Connection Error</h2>
          <p className="text-gray-700 mb-4">Unable to connect to authentication service. Please try again later.</p>
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    )
  }
}
