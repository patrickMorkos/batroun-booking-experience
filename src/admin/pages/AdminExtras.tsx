import { useState } from "react";
import { useAdminExtras, useCreateExtra, useUpdateExtra, useDeleteExtra } from "@/admin/hooks/useExtras";
import AdminHeader from "@/admin/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Extra } from "@/types/database";

interface FormState {
  name: string;
  price: string;
  available: boolean;
  note: string;
  display_order: string;
}

const emptyForm: FormState = { name: "", price: "5", available: true, note: "", display_order: "0" };

export default function AdminExtras() {
  const { data: extras, isLoading, isError } = useAdminExtras();
  const createExtra = useCreateExtra();
  const updateExtra = useUpdateExtra();
  const deleteExtra = useDeleteExtra();

  const [formOpen, setFormOpen] = useState(false);
  const [editingExtra, setEditingExtra] = useState<Extra | undefined>();
  const [form, setForm] = useState<FormState>(emptyForm);

  const openCreate = () => {
    setEditingExtra(undefined);
    setForm({ ...emptyForm, display_order: String((extras?.length ?? 0)) });
    setFormOpen(true);
  };

  const openEdit = (extra: Extra) => {
    setEditingExtra(extra);
    setForm({
      name: extra.name,
      price: String(extra.price),
      available: extra.available,
      note: extra.note || "",
      display_order: String(extra.display_order),
    });
    setFormOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    const price = parseFloat(form.price) || 0;
    const display_order = parseInt(form.display_order) || 0;

    if (editingExtra) {
      updateExtra.mutate(
        { id: editingExtra.id, updates: { name: form.name, price, available: form.available, note: form.note || null, display_order } },
        {
          onSuccess: () => { setFormOpen(false); toast.success("Extra updated"); },
          onError: (e) => toast.error(e.message),
        }
      );
    } else {
      createExtra.mutate(
        { name: form.name, price, available: form.available, note: form.note || null, display_order },
        {
          onSuccess: () => { setFormOpen(false); toast.success("Extra created"); },
          onError: (e) => toast.error(e.message),
        }
      );
    }
  };

  const handleDelete = (extra: Extra) => {
    deleteExtra.mutate(extra.id, {
      onSuccess: () => toast.success(`"${extra.name}" deleted`),
      onError: (e) => toast.error(e.message),
    });
  };

  const isSaving = createExtra.isPending || updateExtra.isPending;

  return (
    <div className="flex flex-col">
      <AdminHeader title="Extras & Add-ons">
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Extra
        </Button>
      </AdminHeader>

      <div className="p-6">
        <div className="rounded-lg border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Note</TableHead>
                <TableHead className="hidden sm:table-cell">Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : extras?.map((extra) => (
                    <TableRow key={extra.id}>
                      <TableCell className="font-medium">{extra.name}</TableCell>
                      <TableCell>${extra.price}</TableCell>
                      <TableCell>
                        <Badge variant={extra.available ? "default" : "secondary"}>
                          {extra.available ? "Available" : "Unavailable"}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{extra.note || "—"}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{extra.display_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(extra)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={deleteExtra.isPending && deleteExtra.variables === extra.id}>
                                {deleteExtra.isPending && deleteExtra.variables === extra.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{extra.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently remove this extra item.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(extra)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {!isLoading && isError && (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-destructive font-medium">Failed to load extras.</p>
              <p className="text-sm mt-1">Please check your connection and refresh.</p>
            </div>
          )}
          {!isLoading && !isError && extras?.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No extras found.</div>
          )}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={(v) => !v && setFormOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExtra ? "Edit Extra" : "Add Extra"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dental Kit" />
            </div>
            <div>
              <Label>Price ($)</Label>
              <Input type="number" min="0" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Available</Label>
              <Switch checked={form.available} onCheckedChange={(v) => setForm({ ...form, available: v })} />
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="e.g. Coming Soon" />
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" min="0" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : editingExtra ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
