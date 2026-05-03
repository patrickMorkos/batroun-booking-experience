import { Link } from "react-router-dom";
import { useAdminChalets, useDeleteChalet, useToggleChaletActive } from "@/admin/hooks/useChalets";
import AdminHeader from "@/admin/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminChalets() {
  const { data: chalets, isLoading, isError } = useAdminChalets();
  const deleteChalet = useDeleteChalet();
  const toggleActive = useToggleChaletActive();

  const handleDelete = (id: string, name: string) => {
    deleteChalet.mutate(id, {
      onSuccess: () => toast.success(`"${name}" deleted`),
      onError: (e) => toast.error(e.message),
    });
  };

  const handleToggle = (id: string, currentActive: boolean) => {
    toggleActive.mutate(
      { id, isActive: !currentActive },
      { onError: () => toast.error("Failed to update chalet status. Please try again.") }
    );
  };

  return (
    <div className="flex flex-col min-w-0">
      <AdminHeader title="Chalets">
        <Button asChild size="sm">
          <Link to="/admin/chalets/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Chalet
          </Link>
        </Button>
      </AdminHeader>

      <div className="p-6 overflow-hidden">
        <div className="rounded-lg border border-border/50 bg-card overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden md:table-cell">Capacity</TableHead>
                <TableHead className="hidden sm:table-cell">Weekday</TableHead>
                <TableHead className="hidden sm:table-cell">Weekend</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-10 w-10 rounded" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : chalets?.map((chalet) => {
                    const primaryImage = chalet.chalet_images?.find((img) => img.is_primary) || chalet.chalet_images?.[0];
                    const isToggling = toggleActive.isPending && toggleActive.variables?.id === chalet.id;
                    const isDeleting = deleteChalet.isPending && deleteChalet.variables === chalet.id;
                    return (
                      <TableRow key={chalet.id} className={isDeleting ? "opacity-50" : ""}>
                        <TableCell>
                          {primaryImage ? (
                            <img src={primaryImage.url} alt="" className="h-10 w-10 rounded object-cover" />
                          ) : (
                            <div className="h-10 w-10 rounded bg-muted" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{chalet.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{chalet.capacity || "—"}</TableCell>
                        <TableCell className="hidden sm:table-cell">${chalet.weekday_price}</TableCell>
                        <TableCell className="hidden sm:table-cell">${chalet.weekend_price}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {isToggling ? (
                              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                            ) : (
                              <Switch
                                checked={chalet.is_active}
                                onCheckedChange={() => handleToggle(chalet.id, chalet.is_active)}
                                disabled={isToggling}
                              />
                            )}
                            <Badge variant={chalet.is_active ? "default" : "secondary"}>
                              {chalet.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link to={`/admin/chalets/${chalet.id}`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={isDeleting}>
                                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete "{chalet.name}"?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete the chalet and all its images.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(chalet.id, chalet.name)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
            </TableBody>
          </Table>
          {!isLoading && isError && (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-destructive font-medium">Failed to load chalets.</p>
              <p className="text-sm mt-1">Please check your connection and refresh the page.</p>
            </div>
          )}
          {!isLoading && !isError && chalets?.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <p>No chalets yet.</p>
              <Button asChild variant="link" className="mt-2">
                <Link to="/admin/chalets/new">Create your first chalet</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
