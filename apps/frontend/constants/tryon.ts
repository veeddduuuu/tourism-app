export type GarmentType = "Upper-body" | "Lower-body" | "Dress";

export interface TryOnCategory {
  key: string;
  label: string;
  emoji: string;
  /** Pexels search query used to populate the sample-clothing gallery. */
  query: string;
  /** OOTDiffusion garment category — controls which body region is generated. */
  garmentType: GarmentType;
}

// Sarees / suits / lehengas are full outfits → "Dress" so the whole body
// (including the lower half) is generated. Menswear (kurta) → "Upper-body".
export const TRYON_CATEGORIES: TryOnCategory[] = [
  { key: "sarees", label: "Sarees", emoji: "🥻", query: "indian saree woman full body standing", garmentType: "Dress" },
  { key: "suits", label: "Suits", emoji: "👗", query: "salwar kameez woman full body standing", garmentType: "Dress" },
  { key: "menswear", label: "Menswear", emoji: "👔", query: "indian kurta man full body standing", garmentType: "Upper-body" },
  { key: "bridal", label: "Bridal", emoji: "💍", query: "indian bride lehenga full body standing", garmentType: "Dress" },
];
