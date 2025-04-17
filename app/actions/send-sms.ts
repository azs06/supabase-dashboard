"use server"

import { createServerClient } from "@/lib/supabase-server"

interface SendSmsResult {
  success: boolean
  message: string
  error?: string
  gatewayResponse?: any
}

export async function sendSms(phoneNumbers: string[], message: string): Promise<SendSmsResult> {
  try {
    // Validate inputs
    if (!phoneNumbers.length) {
      return { success: false, message: "No phone numbers provided", error: "MISSING_NUMBERS" }
    }

    if (!message.trim()) {
      return { success: false, message: "Message text is required", error: "MISSING_TEXT" }
    }

    // Get environment variables
    const smsGatewayUrl = process.env.SMS_GATEWAY_URL
    const smsGatewayToken = process.env.SMS_GATEWAY_TOKEN

    if (!smsGatewayUrl || !smsGatewayToken) {
      return {
        success: false,
        message: "SMS gateway configuration is missing",
        error: "MISSING_GATEWAY_CONFIG",
      }
    }

    // Format phone numbers as comma-separated string
    const numbersString = phoneNumbers.join(",")

    // Prepare the payload according to the specified format
    const payload = {
      numbers: numbersString,
      text: message,
    }

    // Send the SMS via the gateway
    const response = await fetch(smsGatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${smsGatewayToken}`,
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()

    if (!response.ok) {
      return {
        success: false,
        message: `SMS gateway error: ${responseData.message || response.statusText}`,
        error: "GATEWAY_ERROR",
        gatewayResponse: responseData,
      }
    }

    // Get the current user to save the message to the database
    const supabase = createServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, message: "User not authenticated", error: "AUTH_ERROR" }
    }

    // Save the message to the database
    const { error } = await supabase.from("messages").insert({
      user_id: user.id,
      content: message,
      recipients: phoneNumbers.length,
      phone_numbers: phoneNumbers,
      status: "sent", // We assume it's sent if the gateway didn't return an error
    })

    if (error) {
      console.error("Error saving message to database:", error)
      return {
        success: true, // Still return success since the SMS was sent
        message: "SMS sent successfully, but there was an error saving to history",
        gatewayResponse: responseData,
      }
    }

    return {
      success: true,
      message: `SMS sent successfully to ${phoneNumbers.length} recipient(s)`,
      gatewayResponse: responseData,
    }
  } catch (error: any) {
    console.error("Error sending SMS:", error)
    return {
      success: false,
      message: `Error sending SMS: ${error.message}`,
      error: "UNEXPECTED_ERROR",
    }
  }
}
