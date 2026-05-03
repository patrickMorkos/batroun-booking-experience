import { useNavigate, useParams } from "react-router-dom";
import { useAdminChalet, useCreateChalet, useUpdateChalet } from "@/admin/hooks/useChalets";
import AdminHeader from "@/admin/components/AdminHeader";
import ChaletForm, { type ChaletFormValues } from "@/admin/components/ChaletForm";
import ImageUploader from "@/admin/components/ImageUploader";
import ImageSortableList from "@/admin/components/ImageSortableList";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function AdminChaletEdit() {
  const { id } = useParams();
  const isNew = id === "new";
  const navigate = useNavigate();

  const { data: chalet, isLoading } = useAdminChalet(isNew ? undefined : id);
  const createChalet = useCreateChalet();
  const updateChalet = useUpdateChalet();

  const handleSubmit = async (data: ChaletFormValues) => {
    const payload = {
      name: data.name,
      slug: data.slug,
      tagline: data.tagline,
      capacity: data.capacity || null,
      features: data.features.split("\n").map((f) => f.trim()).filter(Boolean),
      weekday_price: data.weekday_price,
      weekend_price: data.weekend_price,
      check_in: data.check_in,
      check_out: data.check_out,
    };

    try {
      if (isNew) {
        const result = await createChalet.mutateAsync(payload);
        toast.success("Chalet created!");
        navigate(`/admin/chalets/${result.id}`);
      } else {
        await updateChalet.mutateAsync({ id: id!, updates: payload });
        toast.success("Chalet updated!");
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (!isNew && isLoading) {
    return (
      <div className="flex flex-col">
        <AdminHeader title="Loading..." />
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <AdminHeader title={isNew ? "New Chalet" : `Edit: ${chalet?.name || ""}`}>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/admin/chalets">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </AdminHeader>

      <div className="p-6">
        {isNew ? (
          <div className="rounded-lg border border-border/50 bg-card p-6">
            <ChaletForm
              onSubmit={handleSubmit}
              isSubmitting={createChalet.isPending}
            />
          </div>
        ) : (
          <Tabs defaultValue="details" className="space-y-4">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="images">Images</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <div className="rounded-lg border border-border/50 bg-card p-6">
                <ChaletForm
                  chalet={chalet}
                  onSubmit={handleSubmit}
                  isSubmitting={updateChalet.isPending}
                />
              </div>
            </TabsContent>

            <TabsContent value="images">
              <div className="space-y-6 rounded-lg border border-border/50 bg-card p-6">
                <div>
                  <h3 className="text-sm font-medium mb-3">Current Images</h3>
                  <ImageSortableList images={chalet?.chalet_images?.sort((a, b) => a.display_order - b.display_order) || []} />
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-3">Upload New Images</h3>
                  <ImageUploader chaletId={id!} currentImageCount={chalet?.chalet_images?.length || 0} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}
