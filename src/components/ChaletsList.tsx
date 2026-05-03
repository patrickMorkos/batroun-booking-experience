import { usePublicChalets } from "@/hooks/useChalets";
import ChaletCard from "./ChaletCard";
import { Skeleton } from "@/components/ui/skeleton";

export default function ChaletsList() {
  const { data: chalets, isLoading } = usePublicChalets();

  if (isLoading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-card rounded-2xl overflow-hidden border border-border">
            <Skeleton className="h-56 w-full" />
            <div className="p-6 space-y-3">
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!chalets?.length) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No chalets available at the moment.
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {chalets.map((c) => (
        <ChaletCard key={c.id} chalet={c} />
      ))}
    </div>
  );
}
