"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  ShieldCheck,
} from "lucide-react"
import { cn } from "@/lib/utils"

import { ProtectedRoute } from "@/components/auth/protected-route"

// Simple user interface, since roles have been requested to be removed
interface User {
  id: string
  username: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [newUsername, setNewUsername] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isLoading, setIsLoading] = useState(true)

  // In a real application, we would fetch from the Elixir API:
  // get("/api/users")
  useEffect(() => {
    // Simulating API load for the single admin user created during seed for now
    // until we expose a full CRUD endpoint for Users.
    setTimeout(() => {
      setUsers([
        {
          id: "1",
          username: "admin",
          createdAt: new Date().toISOString()
        }
      ])
      setIsLoading(false)
    }, 500)
  }, [])

  const handleCreateUser = async () => {
    if (!newUsername.trim() || !newPassword.trim()) return;

    setIsSubmitting(true);
    try {
      // Import createUser from api at the top if not already there, we will just use native fetch for brevity if needed
      // Actually we should import it. Let's assume it's imported (will add to import block if needed)
      const { createUser } = await import("@/lib/api");
      const response = await createUser(newUsername, newPassword);

      const newUser = response.data;
      const mappedUser = {
        id: newUser.id.toString(),
        username: newUser.username,
        createdAt: newUser.inserted_at || new Date().toISOString()
      };

      setUsers(prev => [...prev, mappedUser]);
      setCreateDialogOpen(false);
      setNewUsername("");
      setNewPassword("");
    } catch (err) {
      console.error("Failed to create user", err);
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const { deleteUser } = await import("@/lib/api");
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id.toString() !== id.toString()));
    } catch (err) {
      alert("Failed to delete user");
      console.error(err);
    }
  }

  const filteredUsers = users.filter((user) => {
    return user.username.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <ProtectedRoute>
      <DashboardLayout
        title="User Management"
        description="Manage dashboard access and login credentials"
      >
        {/* Header Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 sm:w-80"
              />
            </div>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>
                  Create login credentials for a new user.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder="e.g., operator_one"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter explicit string password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={isSubmitting || !newUsername.trim() || !newPassword.trim()}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Creating..." : "Create Local User"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Users Table */}
        <Card className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Login</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => {
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getInitials(user.username)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">
                            {user.username}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1 bg-primary/10 text-primary border-primary/20">
                        <ShieldCheck className="h-3 w-3" />
                        Admin
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="border-success/20 bg-success/10 text-success"
                      >
                        Active
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => alert("Edit credentials coming soon!")}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Credentials
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteUser(user.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}

              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    No users found matching "{searchQuery}"
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
