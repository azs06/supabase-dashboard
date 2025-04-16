import { SendSmsForm } from "@/components/dashboard/send-sms-form"

export default function SendSmsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Send SMS</h1>
      <p className="text-gray-600 dark:text-gray-400">Send SMS messages to multiple recipients</p>
      <SendSmsForm />
    </div>
  )
}
