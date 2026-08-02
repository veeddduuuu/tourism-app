const PEXELS_API_KEY = process.env.EXPO_PUBLIC_PEXELS_API_KEY!;

export async function getPexelsImage(query: string) {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=1`,
    {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    }
  );

  const data = await response.json();

  if (!data.photos?.length) {
    return null;
  }

  return data.photos[0].src.large2x;
}

export interface PexelsPhoto {
  id: number;
  url: string; // full-res-ish image for display + try-on
  thumb: string; // small image for the gallery
}

/** Search Pexels and return several photos (used for the try-on clothing gallery). */
export async function searchPexels(
  query: string,
  perPage = 10
): Promise<PexelsPhoto[]> {
  const response = await fetch(
    `https://api.pexels.com/v1/search?query=${encodeURIComponent(
      query
    )}&per_page=${perPage}&orientation=portrait`,
    {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    }
  );

  const data = await response.json();
  if (!data.photos?.length) return [];

  return data.photos.map((p: any) => ({
    id: p.id,
    url: p.src.large,
    thumb: p.src.medium,
  }));
}