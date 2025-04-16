"use client"

import { type ReactNode, useState, useEffect } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { SessionContextProvider } from "@supabase/auth-helpers-react"

export function Providers({ children }: { children: ReactNode }) {
  const [supabaseClient, setSupabaseClient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [helpText, setHelpText] = useState<string>("")

  useEffect(() => {
    try {
      // Get environment variables
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      // Check if the URL is the placeholder value
      if (supabaseUrl === "your-supabase-url" || supabaseAnonKey === "your-supabase-anon-key") {
        setError("Placeholder Supabase credentials detected")
        setHelpText("Please update your environment variables with actual Supabase URL and anon key values.")
        setIsLoading(false)
        return
      }

      // Validate environment variables
      if (!supabaseUrl || !supabaseAnonKey) {
        setError("Missing Supabase environment variables")
        setHelpText(
          "Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your environment variables.",
        )
        setIsLoading(false)
        return
      }

      // Validate URL format
      try {
        new URL(supabaseUrl)
      } catch (e) {
        setError(`Invalid Supabase URL format: ${supabaseUrl}`)
        setHelpText("Your Supabase URL should be in the format: https://your-project-id.supabase.co")
        setIsLoading(false)
        return
      }

      // Create client
      const client = createClientComponentClient()
      setSupabaseClient(client)
      setIsLoading(false)
    } catch (e) {
      console.error("Error initializing Supabase client:", e)
      setError("Error initializing Supabase client")
      setHelpText("Please check your browser console for more details.")
      setIsLoading(false)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-500">Connecting to Supabase</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Connection Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
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

  return <SessionContextProvider supabaseClient={supabaseClient}>{children}</SessionContextProvider>
}
