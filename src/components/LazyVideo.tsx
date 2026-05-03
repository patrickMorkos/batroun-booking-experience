import { useVideoAutoplay } from "@/hooks/useVideoAutoplay";

interface Props {
  src: string;
  className?: string;
  controls?: boolean;
}

export default function LazyVideo({ src, className = "", controls = false }: Props) {
  const ref = useVideoAutoplay();

  return (
    <video
      ref={ref}
      preload="metadata"
      muted
      loop
      playsInline
      controls={controls}
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
