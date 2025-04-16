"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Message {
  id: string
  content: string
  recipients: number
  phone_numbers: string[]
  status: string
  created_at: string
}

interface MessageHistoryProps {
  messages: Message[]
}

export function MessageHistory({ messages }: MessageHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const messagesPerPage = 10

  // Calculate pagination
  const indexOfLastMessage = currentPage * messagesPerPage
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage
  const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage)
  const totalPages = Math.ceil(messages.length / messagesPerPage)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleViewDetails = (message: Message) => {
    setSelectedMessage(message)
  }

  return (
    <div className="space-y-4">
      {messages.length > 0 ? (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentMessages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">
                      {formatDistanceToNow(new Date(message.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="max-w-[300px] truncate">{message.content}</TableCell>
                    <TableCell>{message.recipients}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          message.status === "sent"
                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                            : "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/20 dark:text-yellow-400"
                        }`}
                      >
                        {message.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(message)}>
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink isActive={page === currentPage} onClick={() => handlePageChange(page)}>
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}

          {/* Message Details Dialog */}
          <Dialog
            open={!!selectedMessage}
            onOpenChange={(open) => {
              if (!open) setSelectedMessage(null)
            }}
          >
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Message Details</DialogTitle>
              </DialogHeader>
              {selectedMessage && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Sent</h3>
                    <p>{new Date(selectedMessage.created_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</h3>
                    <p className="capitalize">{selectedMessage.status}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Message</h3>
                    <p className="whitespace-pre-wrap">{selectedMessage.content}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Recipients ({selectedMessage.recipients})
                    </h3>
                    <div className="max-h-[200px] overflow-y-auto mt-2 border rounded-md p-2">
                      {selectedMessage.phone_numbers.map((number, index) => (
                        <div key={index} className="py-1 border-b last:border-b-0">
                          {number}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      ) : (
        <div className="text-center py-10 border rounded-md">
          <p className="text-gray-500">No messages found</p>
        </div>
      )}
    </div>
  )
}

import { Button } from "@/components/ui/button"
