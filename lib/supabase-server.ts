import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export const createServerClient =  () => {
  try {
    const cookieStore =  cookies();
    // Get Supabase URL and key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Check if the URL is the placeholder value
    if (
      supabaseUrl === "your-supabase-url" ||
      supabaseKey === "your-supabase-anon-key"
    ) {
      throw new Error(
        "Placeholder Supabase credentials detected. Please update with actual values."
      );
    }

    // Check if URL and key are defined
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase environment variables");
    }

    // Validate URL format
    try {
      new URL(supabaseUrl);
    } catch (e) {
      throw new Error(`Invalid Supabase URL format: ${supabaseUrl}`);
    }

    return createServerComponentClient<Database>({
      cookies: () => cookieStore,
    })
  } catch (error) {
    console.error("Error creating Supabase server client:", error);
    throw error;
  }
};
