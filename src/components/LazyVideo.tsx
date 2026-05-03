import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";

interface Props {
  src: string;
  className?: string;
  controls?: boolean;
}

export default function LazyVideo({ src, className = "", controls = false }: Props) {
  const { ref, isNearViewport } = useVideoAutoplay();

  return (
    <video
      ref={ref}
      src={isNearViewport ? src : undefined}
      preload="none"
      muted
      loop
      playsInline
      controls={controls}
      className={className}
    />
  );
}
