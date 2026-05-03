import { useEffect, useRef } from "react";

export function useVideoAutoplay(threshold = 0.4) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
          video.currentTime = 0;
        }
      },
      { threshold }
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [threshold]);

  return ref;
}
