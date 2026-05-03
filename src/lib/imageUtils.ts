export function getOptimizedUrl(
  url: string,
  _options: { width?: number; height?: number; quality?: number; format?: "webp" | "avif" | "origin" } = {}
): string {
  return url;
}

export function getSrcSet(
  url: string,
  _widths: number[] = [400, 800, 1200],
  _quality = 75
): string {
  return url;
}
