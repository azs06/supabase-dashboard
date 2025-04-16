"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { formatDistanceToNow } from "date-fns"
// Update the import to use our consistent client creation
import { createClient } from "@/lib/supabase-client"

interface User {
  id: string
  name: string
  email: string
  role: string
  created_at: string
}

interface UserManagementProps {
  users: User[]
  currentUserRole: string
}

export function UserManagement({ users, currentUserRole }: UserManagementProps) {
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false)
  const [isDeleteUserDialogOpen, setIsDeleteUserDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  })
  const [editUserRole, setEditUserRole] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  // Then replace the supabase client initialization:
  // const supabase = createClientComponentClient()
  // with:
  const supabase = createClient()

  const handleAddUser = async () => {
    try {
      // Create the user in Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUser.email,
        password: newUser.password,
        email_confirm: true,
      })

      if (authError) {
        throw authError
      }

      if (authData.user) {
        // Create a profile for the user
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
        })

        if (profileError) {
          throw profileError
        }
      }

      toast({
        title: "User added successfully",
        description: `${newUser.name} has been added as a ${newUser.role}.`,
      })

      setIsAddUserDialogOpen(false)
      setNewUser({
        name: "",
        email: "",
        password: "",
        role: "user",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Failed to add user",
        description: error.message || "An error occurred while adding the user.",
        variant: "destructive",
      })
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return

    try {
      const { error } = await supabase.from("profiles").update({ role: editUserRole }).eq("id", selectedUser.id)

      if (error) {
        throw error
      }

      toast({
        title: "User updated successfully",
        description: `${selectedUser.name}'s role has been updated to ${editUserRole}.`,
      })

      setIsEditUserDialogOpen(false)
      setSelectedUser(null)

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Failed to update user",
        description: error.message || "An error occurred while updating the user.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    // Check if the user is a superadmin
    if (selectedUser.role === "superadmin") {
      toast({
        title: "Cannot delete superadmin",
        description: "Superadmin users cannot be deleted.",
        variant: "destructive",
      })
      setIsDeleteUserDialogOpen(false)
      setSelectedUser(null)
      return
    }

    try {
      // Delete the user's profile
      const { error: profileError } = await supabase.from("profiles").delete().eq("id", selectedUser.id)

      if (profileError) {
        throw profileError
      }

      // Delete the user from Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(selectedUser.id)

      if (authError) {
        throw authError
      }

      toast({
        title: "User deleted successfully",
        description: `${selectedUser.name} has been deleted.`,
      })

      setIsDeleteUserDialogOpen(false)
      setSelectedUser(null)

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Failed to delete user",
        description: error.message || "An error occurred while deleting the user.",
        variant: "destructive",
      })
    }
  }

  const canEditUser = (user: User) => {
    // Superadmin can edit anyone except other superadmins
    if (currentUserRole === "superadmin") {
      return true
    }

    // Admin can edit users but not superadmins or other admins
    if (currentUserRole === "admin") {
      return user.role === "user"
    }

    return false
  }

  const canDeleteUser = (user: User) => {
    // Superadmin can delete anyone except other superadmins
    if (currentUserRole === "superadmin") {
      return user.role !== "superadmin"
    }

    // Admin can delete users but not superadmins or other admins
    if (currentUserRole === "admin") {
      return user.role === "user"
    }

    return false
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Users</h2>
        <Button onClick={() => setIsAddUserDialogOpen(true)}>Add User</Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === "superadmin"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-800/20 dark:text-purple-400"
                        : user.role === "admin"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400"
                          : "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                    }`}
                  >
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(user.created_at), {
                    addSuffix: true,
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user)
                        setEditUserRole(user.role)
                        setIsEditUserDialogOpen(true)
                      }}
                      disabled={!canEditUser(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user)
                        setIsDeleteUserDialogOpen(true)
                      }}
                      disabled={!canDeleteUser(user)}
                    >
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  {currentUserRole === "superadmin" && <SelectItem value="superadmin">Superadmin</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddUser}>Add User</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p>{selectedUser.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p>{selectedUser.email}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select value={editUserRole} onValueChange={setEditUserRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    {currentUserRole === "superadmin" && <SelectItem value="superadmin">Superadmin</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteUserDialogOpen} onOpenChange={setIsDeleteUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="py-4">
              <p>Are you sure you want to delete {selectedUser.name}? This action cannot be undone.</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteUserDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
