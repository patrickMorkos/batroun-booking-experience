import { useRef } from "react";
import { useAdminSiteImages, useSiteImageUpload, useSiteImageDelete } from "@/admin/hooks/useSiteImageUpload";
import { SITE_IMAGE_SLOTS } from "@/lib/siteImageSlots";
import AdminHeader from "@/admin/components/AdminHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { SiteImageSlot } from "@/types/database";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 5 * 1024 * 1024;

export default function AdminSiteImages() {
  const { data: siteImages, isLoading, isError } = useAdminSiteImages();
  const uploadMutation = useSiteImageUpload();
  const deleteMutation = useSiteImageDelete();
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const getImageForSlot = (slot: SiteImageSlot) =>
    siteImages?.find((img) => img.slot === slot);

  const handleFileChange = (slot: SiteImageSlot, file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a valid image file (JPEG, PNG, WebP, or GIF).");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error("File size must be under 5MB.");
      return;
    }
    uploadMutation.mutate(
      { file, slot },
      {
        onSuccess: () => toast.success("Image updated successfully."),
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleReset = (slot: SiteImageSlot) => {
    const existing = getImageForSlot(slot);
    if (!existing) return;
    deleteMutation.mutate(
      { id: existing.id, storagePath: existing.storage_path },
      {
        onSuccess: () => toast.success("Reset to default image."),
        onError: (e) => toast.error(e.message),
      }
    );
  };

  return (
    <div className="flex flex-col">
      <AdminHeader title="Site Images" />

      <div className="p-6 space-y-6">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <Skeleton className="w-full sm:w-48 h-32 rounded-lg shrink-0" />
                    <div className="flex-1 space-y-3">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-4 w-64" />
                      <Skeleton className="h-9 w-32" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          : isError
          ? (
            <div className="py-12 text-center text-muted-foreground">
              <p className="text-destructive font-medium">Failed to load site images.</p>
              <p className="text-sm mt-1">Please check your connection and refresh the page.</p>
            </div>
          )
          : SITE_IMAGE_SLOTS.map((config) => {
              const existing = getImageForSlot(config.slot);
              const isCustom = !!existing;
              const previewUrl = existing?.url ?? config.fallback;
              const isBusy =
                (uploadMutation.isPending && uploadMutation.variables?.slot === config.slot) ||
                (deleteMutation.isPending && deleteMutation.variables?.id === existing?.id);

              return (
                <Card key={config.slot}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                      <div className="relative w-full sm:w-48 h-32 rounded-lg overflow-hidden border border-border shrink-0">
                        <img
                          src={previewUrl}
                          alt={existing?.alt || config.defaultAlt}
                          width={192}
                          height={128}
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                        {isBusy && (
                          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-foreground">{config.label}</h3>
                          <Badge variant={isCustom ? "default" : "secondary"}>
                            {isCustom ? "Custom" : "Default"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                        <div className="flex items-center gap-2">
                          <input
                            ref={(el) => { fileInputRefs.current[config.slot] = el; }}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileChange(config.slot, file);
                              e.target.value = "";
                            }}
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isBusy}
                            onClick={() => fileInputRefs.current[config.slot]?.click()}
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {isCustom ? "Replace" : "Upload"}
                          </Button>
                          {isCustom && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={isBusy}
                              onClick={() => handleReset(config.slot)}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Reset to Default
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
      </div>
    </div>
  );
}
