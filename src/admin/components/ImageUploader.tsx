import { useCallback, useState } from "react";
import { useImageUpload } from "@/admin/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ImageUploaderProps {
  chaletId: string;
  currentImageCount: number;
}

export default function ImageUploader({ chaletId, currentImageCount }: ImageUploaderProps) {
  const { upload } = useImageUpload();
  const [previews, setPreviews] = useState<{ file: File; url: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const validFiles: { file: File; url: string }[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds 5MB limit`);
        continue;
      }
      validFiles.push({ file, url: URL.createObjectURL(file) });
    }
    setPreviews((prev) => [...prev, ...validFiles]);
  }, []);

  const removePreview = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
  };

  const uploadAll = async () => {
    let order = currentImageCount;
    for (const { file } of previews) {
      try {
        await upload.mutateAsync({ file, chaletId, displayOrder: order++ });
      } catch (e: any) {
        toast.error(`Failed to upload ${file.name}: ${e.message}`);
        return;
      }
    }
    setPreviews([]);
    toast.success("Images uploaded successfully");
  };

  return (
    <div className="space-y-4">
      <div
        className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
          isDragging ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"
        }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
      >
        <Upload className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground mb-2">Drag & drop images here, or click to browse</p>
        <label className="cursor-pointer">
          <Button variant="outline" size="sm" type="button" asChild>
            <span>Choose Files</span>
          </Button>
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
        <p className="mt-2 text-xs text-muted-foreground">JPEG, PNG, WebP — Max 5MB each</p>
      </div>

      {previews.length > 0 && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {previews.map((preview, i) => (
              <div key={i} className="group relative aspect-square rounded-lg overflow-hidden border border-border/50">
                <img src={preview.url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePreview(i)}
                  className="absolute top-1 right-1 rounded-full bg-black/60 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
          <Button onClick={uploadAll} disabled={upload.isPending} type="button">
            {upload.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading...</> : `Upload ${previews.length} image${previews.length > 1 ? "s" : ""}`}
          </Button>
        </div>
      )}
    </div>
  );
}
