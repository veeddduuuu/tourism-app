import type { Gender, AgeGroup } from "../stores/appStore";

/**
 * Illustrated character art registry.
 *
 * WHERE TO DROP FILES:  apps/frontend/assets/guides/
 * FORMAT:               PNG (transparent background preferred) or JPG,
 *                       square, ideally 512×512 or larger.
 *
 * Metro cannot load images by a dynamic string, so every file must be listed
 * with a static require() below. Uncomment the ones you actually have — any
 * slot you leave out falls back to the built-in vector avatar automatically.
 *
 * Resolution order (most specific wins):
 *   `${id}-${gender}-${age}`  →  `${id}-${gender}`  →  `${id}`  →  vector avatar
 *
 * So you can ship:
 *   • one image per character            e.g. "aarohi": require(".../aarohi.png")
 *   • one per character + gender         e.g. "aarohi-female": ...
 *   • full control per gender + age      e.g. "aarohi-female-adult": ...
 *
 * Character ids: aarohi, ravi, meera, arjun, priya, kabir
 * Genders: female | male    Ages: young | adult | senior
 */
export const GUIDE_ART: Record<string, any> = {
  // ---- Aarohi (Culture Guide) ----
  "aarohi": require("../assets/guides/aarohi.jpg"),
  "aarohi-female-young": require("../assets/guides/aarohi-female-young.jpg"),
  "aarohi-female-adult": require("../assets/guides/aarohi-female-adult.jpg"),
  "aarohi-female-senior": require("../assets/guides/aarohi-female-senior.jpg"),
  // drop the files, then uncomment:
   "aarohi-male-young": require("../assets/guides/aarohi-male-young.jpg"),
   "aarohi-male-adult": require("../assets/guides/aarohi.jpg"),
   "aarohi-male-senior": require("../assets/guides/aarohi-male-senior.jpg"),

  // ---- Ravi (Foodie) ----
  "ravi": require("../assets/guides/ravi.jpg"),
  // "ravi-male-young": require("../assets/guides/ravi-male-young.jpg"),
  // "ravi-male-adult": require("../assets/guides/ravi-male-adult.jpg"),
  // "ravi-male-senior": require("../assets/guides/ravi-male-senior.jpg"),

  // ---- Meera (History Buff) ----
  "meera": require("../assets/guides/meera.jpg"),
  // "meera-male-young": require("../assets/guides/meera-male-young.jpg"),
  // "meera-male-adult": require("../assets/guides/meera-male-adult.jpg"),
  // "meera-male-senior": require("../assets/guides/meera-male-senior.jpg"),

  // ---- Arjun (Adventure Guide) ----
  "arjun": require("../assets/guides/arjun.jpg"),
  // "arjun-male-young": require("../assets/guides/arjun-male-young.jpg"),
  // "arjun-male-adult": require("../assets/guides/arjun-male-adult.jpg"),
  // "arjun-male-senior": require("../assets/guides/arjun-male-senior.jpg"),

  // ---- Priya (Festival Expert) ----
  "priya": require("../assets/guides/priya.jpg"),
  // "priya-male-young": require("../assets/guides/priya-male-young.jpg"),
  // "priya-male-adult": require("../assets/guides/priya-male-adult.jpg"),
  // "priya-male-senior": require("../assets/guides/priya-male-senior.jpg"),

  // ---- Kabir (Local Friend) ----
  "kabir": require("../assets/guides/kabir.jpg"),
  // "kabir-male-young": require("../assets/guides/kabir-male-young.jpg"),
  // "kabir-male-adult": require("../assets/guides/kabir-male-adult.jpg"),
  // "kabir-male-senior": require("../assets/guides/kabir-male-senior.jpg"),
};

/** Returns the best-matching art source for a guide, or null to use the vector avatar. */
export function getGuideArt(
  id: string | undefined,
  gender: Gender,
  age: AgeGroup
): any | null {
  if (!id) return null;
  return (
    GUIDE_ART[`${id}-${gender}-${age}`] ??
    GUIDE_ART[`${id}-${gender}`] ??
    GUIDE_ART[id] ??
    null
  );
}
