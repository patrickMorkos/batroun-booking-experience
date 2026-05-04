import { useRef, useState } from "react";
import { useAdminAmenities, useCreateAmenity, useUpdateAmenity, useDeleteAmenity, useUploadAmenityImage } from "@/admin/hooks/useAmenities";
import AdminHeader from "@/admin/components/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Amenity } from "@/types/database";

interface FormState {
  name: string;
  icon: string;
  image_url: string;
  display_order: string;
}

const emptyForm: FormState = { name: "", icon: "", image_url: "", display_order: "0" };

export default function AdminAmenities() {
  const { data: amenities, isLoading, isError } = useAdminAmenities();
  const createAmenity = useCreateAmenity();
  const updateAmenity = useUpdateAmenity();
  const deleteAmenity = useDeleteAmenity();
  const uploadImage = useUploadAmenityImage();

  const [formOpen, setFormOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<Amenity | undefined>();
  const [form, setForm] = useState<FormState>(emptyForm);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCreate = () => {
    setEditingAmenity(undefined);
    setForm({ ...emptyForm, display_order: String(amenities?.length ?? 0) });
    setFormOpen(true);
  };

  const openEdit = (amenity: Amenity) => {
    setEditingAmenity(amenity);
    setForm({
      name: amenity.name,
      icon: amenity.icon,
      image_url: amenity.image_url || "",
      display_order: String(amenity.display_order),
    });
    setFormOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadImage.mutate(file, {
      onSuccess: (url) => {
        setForm((f) => ({ ...f, image_url: url }));
        toast.success("Image uploaded");
      },
      onError: (err) => toast.error(err.message),
    });
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Name is required"); return; }
    if (!form.icon.trim()) { toast.error("Icon is required"); return; }
    const display_order = parseInt(form.display_order) || 0;

    if (editingAmenity) {
      updateAmenity.mutate(
        { id: editingAmenity.id, updates: { name: form.name, icon: form.icon, image_url: form.image_url || null, display_order } },
        {
          onSuccess: () => { setFormOpen(false); toast.success("Amenity updated"); },
          onError: (e) => toast.error(e.message),
        }
      );
    } else {
      createAmenity.mutate(
        { name: form.name, icon: form.icon, image_url: form.image_url || null, display_order },
        {
          onSuccess: () => { setFormOpen(false); toast.success("Amenity created"); },
          onError: (e) => toast.error(e.message),
        }
      );
    }
  };

  const handleDelete = (amenity: Amenity) => {
    deleteAmenity.mutate(amenity.id, {
      onSuccess: () => toast.success(`"${amenity.name}" deleted`),
      onError: (e) => toast.error(e.message),
    });
  };

  const isSaving = createAmenity.isPending || updateAmenity.isPending;

  return (
    <div className="flex flex-col">
      <AdminHeader title="Amenities">
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Amenity
        </Button>
      </AdminHeader>

      <div className="p-6">
        <div className="rounded-lg border border-border/50 bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="hidden sm:table-cell">Image</TableHead>
                <TableHead className="hidden sm:table-cell">Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-8" /></TableCell>
                      <TableCell><Skeleton className="h-8 w-20 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                : amenities?.map((amenity) => (
                    <TableRow key={amenity.id}>
                      <TableCell className="text-2xl">{amenity.icon}</TableCell>
                      <TableCell className="font-medium">{amenity.name}</TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {amenity.image_url ? (
                          <img src={amenity.image_url} alt={amenity.name} className="h-10 w-14 object-cover rounded" />
                        ) : (
                          <span className="text-muted-foreground text-sm">No image</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">{amenity.display_order}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(amenity)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" disabled={deleteAmenity.isPending && deleteAmenity.variables === amenity.id}>
                                {deleteAmenity.isPending && deleteAmenity.variables === amenity.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete "{amenity.name}"?</AlertDialogTitle>
                                <AlertDialogDescription>This will permanently remove this amenity.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(amenity)}>Delete</AlertDialogAction>
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
              <p className="text-destructive font-medium">Failed to load amenities.</p>
              <p className="text-sm mt-1">Please check your connection and refresh.</p>
            </div>
          )}
          {!isLoading && !isError && amenities?.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">No amenities found.</div>
          )}
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={(v) => !v && setFormOpen(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAmenity ? "Edit Amenity" : "Add Amenity"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Shared Pool" />
            </div>
            <div>
              <Label>Icon (emoji)</Label>
              <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="e.g. 🏊" />
            </div>
            <div>
              <Label>Image</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {form.image_url ? (
                <div className="mt-2 relative">
                  <img src={form.image_url} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="absolute bottom-2 right-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadImage.isPending}
                  >
                    {uploadImage.isPending ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                    Replace
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-1"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadImage.isPending}
                >
                  {uploadImage.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading...</> : <><Upload className="h-4 w-4 mr-2" />Upload Image</>}
                </Button>
              )}
            </div>
            <div>
              <Label>Display Order</Label>
              <Input type="number" min="0" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setFormOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : editingAmenity ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
