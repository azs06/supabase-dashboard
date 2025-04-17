"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, MessageSquare, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Message {
  id: string
  content: string
  recipients: number
  created_at: string
}

interface DashboardOverviewProps {
  messagesCount: number
  recentMessages: Message[]
}

export function DashboardOverview({ messagesCount, recentMessages }: DashboardOverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messagesCount}</div>
            <p className="text-xs text-gray-500">Messages sent</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Recipients</CardTitle>
            <Users className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentMessages.reduce((acc, msg) => acc + msg.recipients, 0)}</div>
            <p className="text-xs text-gray-500">Total recipients</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Average Recipients</CardTitle>
            <BarChart3 className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recentMessages.length
                ? Math.round(recentMessages.reduce((acc, msg) => acc + msg.recipients, 0) / recentMessages.length)
                : 0}
            </div>
            <p className="text-xs text-gray-500">Per message</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMessages.length > 0 ? (
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div key={message.id} className="flex items-start p-4 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{message.content}</p>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <span>
                        {message.recipients} recipient
                        {message.recipients !== 1 ? "s" : ""}
                      </span>
                      <span className="mx-2">•</span>
                      <span>
                        {formatDistanceToNow(new Date(message.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-4 text-gray-500">No messages sent yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
