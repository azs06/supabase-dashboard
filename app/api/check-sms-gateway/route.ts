import { NextResponse } from "next/server"

export async function GET() {
  const smsGatewayUrl = process.env.SMS_GATEWAY_URL
  const smsGatewayToken = process.env.SMS_GATEWAY_TOKEN

  const configured = !!smsGatewayUrl && !!smsGatewayToken

  return NextResponse.json({
    configured,
    // Don't expose the actual values for security reasons
    hasUrl: !!smsGatewayUrl,
    hasToken: !!smsGatewayToken,
  })
}
