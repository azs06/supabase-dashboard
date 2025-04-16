import { MessageHistory } from "@/components/dashboard/message-history"
import { createServerClient } from "@/lib/supabase-server"

export default async function HistoryPage() {
  const supabase = createServerClient()

  const { data: messages } = await supabase.from("messages").select("*").order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Message History</h1>
      <p className="text-gray-600 dark:text-gray-400">View your sent messages</p>
      <MessageHistory messages={messages || []} />
    </div>
  )
}
