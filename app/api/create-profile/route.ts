import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const requestData = await request.json()
    const { userId, name, email, role = "user" } = requestData

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing required fields: userId and email are required" }, { status: 400 })
    }

    // Create a Supabase client with service role to bypass RLS
    const supabaseAdmin = createRouteHandlerClient(
      { cookies },
      {
        options: {
          db: { schema: "public" },
          auth: {
            persistSession: false,
          },
        },
      },
    )

    // Check if profile already exists
    const { data: existingProfile } = await supabaseAdmin.from("profiles").select("*").eq("id", userId).maybeSingle()

    if (existingProfile) {
      return NextResponse.json({ profile: existingProfile })
    }

    // Create profile
    const { data: profile, error } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        name: name || email.split("@")[0],
        email,
        role,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating profile:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error: any) {
    console.error("Error in create-profile route:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
