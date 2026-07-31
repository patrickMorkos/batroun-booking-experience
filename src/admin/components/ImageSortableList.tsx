import { useState, useEffect } from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, rectSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useImageUpload } from "@/admin/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { GripVertical, Trash2, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { ChaletImage } from "@/types/database";

interface ImageSortableListProps {
  images: ChaletImage[];
}

function SortableImage({ image, onDelete, onSetPrimary, isDeleting, isSettingPrimary }: { image: ChaletImage; onDelete: () => void; onSetPrimary: () => void; isDeleting: boolean; isSettingPrimary: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative aspect-square rounded-lg border border-border/50 overflow-hidden bg-muted">
      <img
        src={image.url}
        alt=""
        width={200}
        height={200}
        loading="lazy"
        decoding="async"
        className="h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors" />

      {(isDeleting || isSettingPrimary) && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/50">
          <Loader2 className="h-6 w-6 text-white animate-spin" />
        </div>
      )}

      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 rounded bg-black/60 p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-white" />
      </button>

      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={onSetPrimary}
          disabled={isSettingPrimary || image.is_primary}
          className={`rounded p-1 ${image.is_primary ? "bg-primary text-primary-foreground" : "bg-black/60 text-white hover:bg-primary"}`}
          title={image.is_primary ? "Primary image" : "Set as primary"}
        >
          <Star className="h-4 w-4" fill={image.is_primary ? "currentColor" : "none"} />
        </button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button type="button" className="rounded bg-black/60 p-1 text-white hover:bg-destructive" disabled={isDeleting}>
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this image?</AlertDialogTitle>
              <AlertDialogDescription>This will permanently remove the image from storage.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {image.is_primary && (
        <div className="absolute bottom-2 left-2 rounded bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
          Primary
        </div>
      )}
    </div>
  );
}

export default function ImageSortableList({ images: initialImages }: ImageSortableListProps) {
  const [images, setImages] = useState(initialImages);
  const { deleteImage, reorder } = useImageUpload();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = images.findIndex((img) => img.id === active.id);
    const newIndex = images.findIndex((img) => img.id === over.id);
    const reordered = arrayMove(images, oldIndex, newIndex);

    const updates = reordered.map((img, i) => ({
      id: img.id,
      display_order: i,
      is_primary: i === 0,
    }));

    setImages(reordered.map((img, i) => ({ ...img, display_order: i, is_primary: i === 0 })));
    reorder.mutate(updates, { onError: () => toast.error("Failed to reorder") });
  };

  const handleDelete = (image: ChaletImage) => {
    deleteImage.mutate(
      { imageId: image.id, storagePath: image.storage_path },
      {
        onSuccess: () => {
          setImages((prev) => prev.filter((img) => img.id !== image.id));
          toast.success("Image deleted");
        },
        onError: (e) => toast.error(e.message),
      }
    );
  };

  const handleSetPrimary = (targetId: string) => {
    const updates = images.map((img) => ({
      id: img.id,
      display_order: img.display_order,
      is_primary: img.id === targetId,
    }));
    setImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === targetId })));
    reorder.mutate(updates, { onError: (e) => toast.error(`Failed to set primary: ${e.message}`) });
  };

  if (images.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No images uploaded yet.</p>;
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={images.map((img) => img.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((image) => (
            <SortableImage
              key={image.id}
              image={image}
              onDelete={() => handleDelete(image)}
              onSetPrimary={() => handleSetPrimary(image.id)}
              isDeleting={deleteImage.isPending && deleteImage.variables?.imageId === image.id}
              isSettingPrimary={reorder.isPending}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
