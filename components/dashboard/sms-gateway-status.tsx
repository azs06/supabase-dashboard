"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle } from "lucide-react"

export function SmsGatewayStatus() {
  const [status, setStatus] = useState<"loading" | "configured" | "not-configured">("loading")

  useEffect(() => {
    const checkGatewayConfig = async () => {
      try {
        const response = await fetch("/api/check-sms-gateway")
        const data = await response.json()
        setStatus(data.configured ? "configured" : "not-configured")
      } catch (error) {
        console.error("Error checking SMS gateway configuration:", error)
        setStatus("not-configured")
      }
    }

    checkGatewayConfig()
  }, [])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">SMS Gateway Status</CardTitle>
      </CardHeader>
      <CardContent>
        {status === "loading" ? (
          <div className="flex items-center text-gray-500">
            <div className="animate-spin h-4 w-4 border-2 border-gray-500 border-t-transparent rounded-full mr-2"></div>
            Checking configuration...
          </div>
        ) : status === "configured" ? (
          <div className="flex items-center text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            Gateway configured and ready
          </div>
        ) : (
          <div className="flex items-center text-red-600">
            <AlertCircle className="h-4 w-4 mr-2" />
            Gateway not configured
          </div>
        )}
      </CardContent>
    </Card>
  )
}
