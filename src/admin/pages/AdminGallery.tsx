import { useRef, useState } from "react";
import {
  useAdminGalleryMedia,
  useGalleryMediaUpload,
  useGalleryMediaDelete,
  useGalleryMediaReorder,
  useGalleryMediaUpdateTitle,
} from "@/admin/hooks/useGalleryMedia";
import AdminHeader from "@/admin/components/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Upload, Trash2, Loader2, GripVertical, Film, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { GalleryMedia } from "@/types/database";

const ACCEPTED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "video/mp4", "video/webm", "video/quicktime",
];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

export default function AdminGallery() {
  const { data: items, isLoading } = useAdminGalleryMedia();
  const uploadMutation = useGalleryMediaUpload();
  const deleteMutation = useGalleryMediaDelete();
  const reorderMutation = useGalleryMediaReorder();
  const updateTitleMutation = useGalleryMediaUpdateTitle();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ name: string; pct: number }[]>([]);

  const handleFiles = (files: FileList) => {
    const valid: File[] = [];
    for (const file of Array.from(files)) {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error(`"${file.name}" is not a valid image or video file.`);
        continue;
      }
      const maxSize = file.type.startsWith("video/") ? MAX_VIDEO_SIZE : MAX_IMAGE_SIZE;
      if (file.size > maxSize) {
        toast.error(`"${file.name}" is too large. ${file.type.startsWith("video/") ? "Videos must be under 50MB. Try compressing the video first." : "Images must be under 5MB."}`);
        continue;
      }
      valid.push(file);
    }
    if (valid.length === 0) return;

    setUploadProgress(valid.map((f) => ({ name: f.name, pct: 0 })));
    let completed = 0;
    let failed = 0;

    for (let i = 0; i < valid.length; i++) {
      const file = valid[i];
      const idx = i;
      uploadMutation.mutate(
        {
          file,
          onProgress: (pct) => {
            setUploadProgress((prev) => prev.map((p, j) => j === idx ? { ...p, pct } : p));
          },
        },
        {
          onSuccess: () => {
            completed++;
            setUploadProgress((prev) => prev.map((p, j) => j === idx ? { ...p, pct: 100 } : p));
            if (completed + failed === valid.length) {
              setTimeout(() => setUploadProgress([]), 1000);
              if (failed === 0) toast.success(`${valid.length} file${valid.length > 1 ? "s" : ""} uploaded.`);
              else toast.warning(`${completed} uploaded, ${failed} failed.`);
            }
          },
          onError: (e) => {
            failed++;
            setUploadProgress((prev) => prev.map((p, j) => j === idx ? { ...p, pct: -1 } : p));
            toast.error(`Failed to upload "${file.name}": ${e.message}`);
            if (completed + failed === valid.length) {
              setTimeout(() => setUploadProgress([]), 2000);
              if (completed > 0) toast.warning(`${completed} uploaded, ${failed} failed.`);
            }
          },
        }
      );
    }
  };

  const handleDelete = (item: GalleryMedia) => {
    deleteMutation.mutate(
      { id: item.id, storagePath: item.storage_path },
      {
        onSuccess: () => toast.success("Media deleted."),
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleMoveUp = (index: number) => {
    if (!items || index === 0) return;
    const reordered = [...items];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    const updates = reordered.map((item, i) => ({ id: item.id, display_order: i }));
    reorderMutation.mutate(updates);
  };

  const handleMoveDown = (index: number) => {
    if (!items || index === items.length - 1) return;
    const reordered = [...items];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    const updates = reordered.map((item, i) => ({ id: item.id, display_order: i }));
    reorderMutation.mutate(updates);
  };

  const handleTitleBlur = (id: string, title: string) => {
    updateTitleMutation.mutate({ id, title });
  };

  return (
    <div className="flex flex-col min-w-0">
      <AdminHeader title="Gallery">
        <div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/mp4,video/webm,video/quicktime"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload Media
          </Button>
        </div>
      </AdminHeader>

      {uploadProgress.length > 0 && (
        <div className="px-6 pt-4 space-y-2">
          {uploadProgress.map((item, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate max-w-[200px] text-muted-foreground">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.pct === -1 ? "Failed" : `${item.pct}%`}
                </span>
              </div>
              <Progress value={item.pct === -1 ? 100 : item.pct} className={`h-2 ${item.pct === -1 ? "[&>div]:bg-destructive" : ""}`} />
            </div>
          ))}
        </div>
      )}

      <div className="p-6 space-y-4">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex gap-4 items-center">
                    <Skeleton className="w-32 h-20 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-8 w-64" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : items?.length === 0
          ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No gallery media yet.</p>
              <p className="text-sm mt-1">Upload images or videos of your common area.</p>
            </div>
          )
          : items?.map((item, index) => {
              const isDeleting = deleteMutation.isPending && deleteMutation.variables?.id === item.id;
              return (
                <Card key={item.id} className={isDeleting ? "opacity-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex gap-4 items-center">
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => handleMoveUp(index)}
                          disabled={index === 0 || reorderMutation.isPending}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <GripVertical className="h-4 w-4 rotate-180" />
                        </button>
                        <button
                          onClick={() => handleMoveDown(index)}
                          disabled={index === (items?.length ?? 0) - 1 || reorderMutation.isPending}
                          className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="w-32 h-20 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                        {item.type === "video" ? (
                          <video src={item.url} className="w-full h-full object-cover" muted />
                        ) : (
                          <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="shrink-0">
                            {item.type === "video" ? <><Film className="h-3 w-3 mr-1" /> Video</> : <><ImageIcon className="h-3 w-3 mr-1" /> Image</>}
                          </Badge>
                          <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        </div>
                        <Input
                          defaultValue={item.title}
                          placeholder="Title (optional)"
                          className="h-8 text-sm"
                          onBlur={(e) => handleTitleBlur(item.id, e.target.value)}
                        />
                      </div>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive shrink-0" disabled={isDeleting}>
                            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this media?</AlertDialogTitle>
                            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(item)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
