import { chalets } from "@/data/chalets";
import ChaletCard from "./ChaletCard";

interface Props {
  limit?: number;
}

export default function ChaletsList({ limit }: Props) {
  const items = limit ? chalets.slice(0, limit) : chalets;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {items.map((c) => (
        <ChaletCard key={c.id} chalet={c} />
      ))}
    </div>
  );
}
