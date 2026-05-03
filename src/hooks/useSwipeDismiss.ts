import { useRef, useCallback } from "react";

export function useSwipeDismiss(onDismiss: () => void, threshold = 120) {
  const startY = useRef(0);
  const currentY = useRef(0);
  const isDragging = useRef(false);
  const elRef = useRef<HTMLDivElement>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    currentY.current = e.touches[0].clientY;
    isDragging.current = true;
    if (elRef.current) {
      elRef.current.style.transition = "none";
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging.current) return;
    currentY.current = e.touches[0].clientY;
    const diff = currentY.current - startY.current;
    if (diff > 0 && elRef.current) {
      elRef.current.style.transform = `translateY(${diff}px)`;
      elRef.current.style.opacity = `${Math.max(0.2, 1 - diff / 400)}`;
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = currentY.current - startY.current;

    if (elRef.current) {
      elRef.current.style.transition = "transform 0.2s ease, opacity 0.2s ease";
      if (diff > threshold) {
        elRef.current.style.transform = `translateY(100%)`;
        elRef.current.style.opacity = "0";
        setTimeout(onDismiss, 200);
      } else {
        elRef.current.style.transform = "translateY(0)";
        elRef.current.style.opacity = "1";
      }
    }
  }, [onDismiss, threshold]);

  return { elRef, onTouchStart, onTouchMove, onTouchEnd };
}
