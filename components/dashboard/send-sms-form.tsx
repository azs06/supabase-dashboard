"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase-client"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Upload, X } from "lucide-react"

export function SendSmsForm() {
  const [phoneNumbers, setPhoneNumbers] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const csvData = event.target?.result as string
      // Simple CSV parsing - assumes one phone number per line
      const numbers = csvData.split(/\r?\n/).filter(Boolean).join(", ")

      setPhoneNumbers((prev) => {
        if (prev && !prev.endsWith(", ")) {
          return prev + ", " + numbers
        }
        return prev + numbers
      })
    }
    reader.readAsText(file)

    // Reset the input
    e.target.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate and clean phone numbers
      const numbersArray = phoneNumbers
        .split(",")
        .map((num) => num.trim())
        .filter(Boolean)

      if (numbersArray.length === 0) {
        throw new Error("Please enter at least one phone number")
      }

      if (!message) {
        throw new Error("Please enter a message")
      }

      // In a real app, you would integrate with an SMS API here
      // For this example, we'll just save to the database

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase.from("messages").insert({
        user_id: user.id,
        content: message,
        recipients: numbersArray.length,
        phone_numbers: numbersArray,
        status: "sent", // In a real app, this would be updated based on the SMS API response
      })

      if (error) {
        throw error
      }

      toast({
        title: "SMS sent successfully",
        description: `Message sent to ${numbersArray.length} recipient${numbersArray.length !== 1 ? "s" : ""}`,
      })

      // Reset form
      setPhoneNumbers("")
      setMessage("")

      // Refresh the page to update the dashboard
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Failed to send SMS",
        description: error.message || "An error occurred while sending the SMS",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="phoneNumbers">Phone Numbers</Label>
        <div className="flex flex-col space-y-2">
          <Textarea
            id="phoneNumbers"
            placeholder="Enter phone numbers separated by commas"
            value={phoneNumbers}
            onChange={(e) => setPhoneNumbers(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex items-center">
            <Label
              htmlFor="csvUpload"
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-md cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import from CSV
            </Label>
            <Input id="csvUpload" type="file" accept=".csv" onChange={handleCsvUpload} className="hidden" />
            {phoneNumbers && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-2 text-gray-500"
                onClick={() => setPhoneNumbers("")}
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[150px]"
        />
        <div className="text-right text-xs text-gray-500">{message.length} characters</div>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Sending..." : "Send SMS"}
      </Button>
    </form>
  )
}
