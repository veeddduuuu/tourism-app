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