import { useEffect, useRef, useState } from "react";

export function useVideoAutoplay(threshold = 0.3) {
  const ref = useRef<HTMLVideoElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsNearViewport(true);
          video.preload = "auto";
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold, rootMargin: "200px" }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isNearViewport };
}
