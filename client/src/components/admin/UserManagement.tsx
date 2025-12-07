import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AdminHeader from "./AdminHeader";
import AdminFooter from "./AdminFooter";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, Plus, Edit, Trash2, Eye, Users } from "lucide-react";

// Mock user data
const mockUsers = [
  { id: 1, name: "John Farmer", email: "john@example.com", role: "Farmer", status: "Active", joinDate: "2023-01-15" },
  { id: 2, name: "Sarah Agronomist", email: "sarah@example.com", role: "Expert", status: "Active", joinDate: "2023-02-20" },
  { id: 3, name: "Mike Admin", email: "mike@example.com", role: "Admin", status: "Active", joinDate: "2022-11-05" },
  { id: 4, name: "Emma Researcher", email: "emma@example.com", role: "Expert", status: "Inactive", joinDate: "2023-03-10" },
  { id: 5, name: "David Farmer", email: "david@example.com", role: "Farmer", status: "Active", joinDate: "2023-04-18" },
  { id: 6, name: "Lisa Moderator", email: "lisa@example.com", role: "Moderator", status: "Active", joinDate: "2023-01-30" },
];

export default function UserManagement() {
  const [users] = useState(mockUsers);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "default";
      case "inactive": return "secondary";
      default: return "outline";
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case "admin": return "destructive";
      case "expert": return "default";
      case "moderator": return "secondary";
      default: return "outline";
    }
  };

  return (
    <>
      <AdminHeader />
      <main className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
      <Card className="shadow-md">
        <CardHeader className="border-b border-border bg-card/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary/70 shadow-md">
                <Users className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-xl">User Management</CardTitle>
                <p className="text-sm text-muted-foreground mt-0.5">{filteredUsers.length} total users</p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full sm:w-64 bg-background"
                />
              </div>
              <Button className="gap-2 shadow-sm">
                <Plus className="h-4 w-4" />
                Add User
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">User</TableHead>
                    <TableHead className="whitespace-nowrap">Email</TableHead>
                    <TableHead className="whitespace-nowrap">Role</TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">Join Date</TableHead>
                    <TableHead className="text-right whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium whitespace-nowrap">{user.name}</TableCell>
                      <TableCell className="whitespace-nowrap overflow-hidden max-w-[200px] truncate">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(user.status)}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">{user.joinDate}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground font-medium">No users found</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your search criteria</p>
            </div>
          )}
        </CardContent>
          </Card>
        </div>
      </main>
      <AdminFooter />
    </>
  );
}