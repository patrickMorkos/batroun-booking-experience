interface Props {
  src: string;
  className?: string;
  controls?: boolean;
}

export default function LazyVideo({ src, className = "", controls = false }: Props) {
  return (
    <video
      src={src}
      preload="auto"
      muted
      loop
      autoPlay
      playsInline
      controls={controls}
      className={className}
    />
  );
}
