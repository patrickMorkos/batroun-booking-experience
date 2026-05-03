import { useState } from "react";
import { useAdminUsers, useCreateUser, useUpdateUser, useDeleteUser } from "@/admin/hooks/useUsers";
import { useAuth } from "@/admin/hooks/useAuth";
import AdminHeader from "@/admin/components/AdminHeader";
import UserForm, { type UserFormValues } from "@/admin/components/UserForm";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Profile } from "@/types/database";

export default function AdminUsers() {
  const { profile: currentUser } = useAuth();
  const { data: users, isLoading, isError } = useAdminUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  const [formOpen, setFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | undefined>();

  const isSuperAdmin = currentUser?.role === "super_admin";

  const handleCreate = (data: UserFormValues) => {
    createUser.mutate(
      { email: data.email, password: data.password!, first_name: data.first_name, last_name: data.last_name, phone: data.phone, role: data.role },
      {
        onSuccess: () => { setFormOpen(false); toast.success("User created"); },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleEdit = (data: UserFormValues) => {
    if (!editingUser) return;
    updateUser.mutate(
      { id: editingUser.id, updates: { first_name: data.first_name, last_name: data.last_name, phone: data.phone || null, role: data.role } },
      {
        onSuccess: () => { setEditingUser(undefined); toast.success("User updated"); },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleDelete = (user: Profile) => {
    deleteUser.mutate(user.id, {
      onSuccess: () => toast.success(`${user.first_name} deleted`),
      onError: (e) => toast.error(e.message),
    });
  };

  return (
    <div className="flex flex-col">
      <AdminHeader title="Admin Users" />

      <div className="p-6">
        <div className="rounded-lg border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Role</TableHead>
                {isSuperAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      {isSuperAdmin && <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>}
                    </TableRow>
                  ))
                : users?.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.first_name} {user.last_name}</TableCell>
                      <TableCell className="hidden sm:table-cell">{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.phone || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "super_admin" ? "default" : "secondary"}>
                          {user.role === "super_admin" ? "Super Admin" : "Admin"}
                        </Badge>
                      </TableCell>
                      {isSuperAdmin && (
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => setEditingUser(user)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            {user.id !== currentUser?.id && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={deleteUser.isPending && deleteUser.variables === user.id}>
                                    {deleteUser.isPending && deleteUser.variables === user.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete {user.first_name}?</AlertDialogTitle>
                                    <AlertDialogDescription>This will permanently remove this admin user.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(user)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {!isLoading && isError && (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-destructive font-medium">Failed to load users.</p>
              <p className="text-sm mt-1">Please check your connection and refresh the page.</p>
            </div>
          )}
          {!isLoading && !isError && users?.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No users found.</div>
          )}
        </div>
      </div>

      <UserForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleCreate}
        isSubmitting={createUser.isPending}
      />
      {editingUser && (
        <UserForm
          open={!!editingUser}
          onClose={() => setEditingUser(undefined)}
          onSubmit={handleEdit}
          user={editingUser}
          isSubmitting={updateUser.isPending}
        />
      )}
    </div>
  );
}
