/**
 * Global slice image preloader cache to ensure instant, zero-delay rendering.
 */

const imageCache: Record<string, HTMLImageElement> = {};

export function preloadImage(src: string): Promise<HTMLImageElement> {
  if (imageCache[src]) {
    return Promise.resolve(imageCache[src]);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imageCache[src] = img;
      resolve(img);
    };
    img.onerror = () => {
      resolve(img); // resolve on failure to avoid hanging
    };
  });
}

export function getCachedImage(src: string): HTMLImageElement | null {
  return imageCache[src] || null;
}

export function preloadStudySlices(seriesList: any[]) {
  if (!seriesList) return;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  
  seriesList.forEach((series) => {
    series.slices?.forEach((slice: any) => {
      if (slice.file) {
        const fileUrl = slice.file.startsWith("http")
          ? slice.file
          : `${baseUrl}${slice.file}`;
        preloadImage(fileUrl);
      }
    });
  });
}
