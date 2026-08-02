import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Camera, ImageUp, Sparkles, X } from "lucide-react-native";

import PressableScale from "../components/common/PressableScale";
import { TRYON_CATEGORIES } from "../constants/tryon";
import { searchPexels, type PexelsPhoto } from "../services/pexels";
import { generateTryOn } from "../services/tryon";

interface PickedImage {
  uri: string;
  base64?: string;
}
interface Garment {
  displayUri: string;
  base64?: string;
}

export default function TryOnScreen() {
  const [catIndex, setCatIndex] = useState(0);
  const category = TRYON_CATEGORIES[catIndex];

  const [person, setPerson] = useState<PickedImage | null>(null);
  const [garment, setGarment] = useState<Garment | null>(null);

  const [samples, setSamples] = useState<PexelsPhoto[]>([]);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const samplesCache = useRef<Record<string, PexelsPhoto[]>>({});

  const [result, setResult] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load sample garments for the active category (cached).
  useEffect(() => {
    let active = true;
    const cached = samplesCache.current[category.key];
    if (cached) {
      setSamples(cached);
      return;
    }
    setLoadingSamples(true);
    searchPexels(category.query, 12)
      .then((photos) => {
        if (!active) return;
        samplesCache.current[category.key] = photos;
        setSamples(photos);
      })
      .catch(() => active && setSamples([]))
      .finally(() => active && setLoadingSamples(false));
    return () => {
      active = false;
    };
  }, [category.key, category.query]);

  const pickImage = async (useCamera: boolean): Promise<PickedImage | null> => {
    try {
      if (useCamera) await ImagePicker.requestCameraPermissionsAsync();
      const opts: ImagePicker.ImagePickerOptions = {
        quality: 0.7,
        base64: true,
        allowsEditing: true,
      };
      const res = useCamera
        ? await ImagePicker.launchCameraAsync(opts)
        : await ImagePicker.launchImageLibraryAsync(opts);
      if (res.canceled || !res.assets?.length) return null;
      const a = res.assets[0];
      return { uri: a.uri, base64: a.base64 ?? undefined };
    } catch {
      return null;
    }
  };

  const choosePerson = async (useCamera: boolean) => {
    const img = await pickImage(useCamera);
    if (img) {
      setPerson(img);
      setResult(null);
      setError(null);
    }
  };

  const chooseGarment = async (useCamera: boolean) => {
    const img = await pickImage(useCamera);
    if (img) {
      setGarment({ displayUri: img.uri, base64: img.base64 });
      setResult(null);
      setError(null);
    }
  };

  const selectSample = (photo: PexelsPhoto) => {
    setGarment({ displayUri: photo.url });
    setResult(null);
    setError(null);
  };

  const canTryOn = !!person?.base64 && !!garment && !generating;

  const runTryOn = async () => {
    if (!person?.base64 || !garment) return;
    setGenerating(true);
    setError(null);
    setResult(null);
    try {
      // Person is always a local image → data URI. Sample garments are public
      // URLs (fal fetches them); uploaded garments become data URIs.
      const personRef = `data:image/jpeg;base64,${person.base64}`;
      const garmentRef = garment.base64
        ? `data:image/jpeg;base64,${garment.base64}`
        : garment.displayUri;
      const url = await generateTryOn(personRef, garmentRef, category.label);
      setResult(url);
    } catch (e: any) {
      setError(e?.message ?? "Try-on failed. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <LinearGradient colors={["#0B1326", "#1B1238", "#2C174D"]} style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top"]}>
        <View style={styles.topBar}>
          <PressableScale haptic={false} style={styles.closeBtn} onPress={() => router.back()}>
            <X color="white" size={22} />
          </PressableScale>
          <Text style={styles.topTitle}>✨ AI Attire Studio</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabs}
          >
            {TRYON_CATEGORIES.map((c, i) => {
              const active = i === catIndex;
              return (
                <PressableScale
                  key={c.key}
                  haptic={false}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => setCatIndex(i)}
                >
                  <Text style={styles.tabEmoji}>{c.emoji}</Text>
                  <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                    {c.label}
                  </Text>
                </PressableScale>
              );
            })}
          </ScrollView>

          {/* Your photo */}
          <Text style={styles.section}>1 · Your Photo</Text>
          <View style={styles.personRow}>
            <View style={styles.personBox}>
              {person ? (
                <Image source={{ uri: person.uri }} style={styles.personImg} />
              ) : (
                <Text style={styles.personHint}>Upload a clear{"\n"}full-body photo</Text>
              )}
            </View>
            <View style={styles.personActions}>
              <PressableScale style={styles.pickBtn} onPress={() => choosePerson(false)}>
                <ImageUp color="white" size={18} />
                <Text style={styles.pickText}>Upload Photo</Text>
              </PressableScale>
              <PressableScale style={styles.pickBtn} onPress={() => choosePerson(true)}>
                <Camera color="white" size={18} />
                <Text style={styles.pickText}>Take Photo</Text>
              </PressableScale>
            </View>
          </View>

          {/* Outfit */}
          <Text style={styles.section}>2 · Choose an Outfit</Text>
          <Text style={styles.tip}>
            💡 For the most realistic result, upload a clear photo of the outfit on
            a plain background (e.g. a product image from a shopping site).
          </Text>

          <View style={styles.ownRow}>
            <PressableScale style={styles.ownBtn} onPress={() => chooseGarment(false)}>
              <ImageUp color="#FF9933" size={16} />
              <Text style={styles.ownText}>Upload outfit</Text>
            </PressableScale>
            <PressableScale style={styles.ownBtn} onPress={() => chooseGarment(true)}>
              <Camera color="#FF9933" size={16} />
              <Text style={styles.ownText}>Snap outfit</Text>
            </PressableScale>
          </View>

          <Text style={styles.orText}>or pick a sample {category.label.toLowerCase()}</Text>

          {loadingSamples ? (
            <ActivityIndicator color="#FF9933" style={{ marginVertical: 24 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.gallery}
            >
              {samples.map((p) => {
                const active = garment?.displayUri === p.url;
                return (
                  <PressableScale
                    key={p.id}
                    haptic={false}
                    style={[styles.sample, active && styles.sampleActive]}
                    onPress={() => selectSample(p)}
                  >
                    <Image source={{ uri: p.thumb }} style={styles.sampleImg} />
                  </PressableScale>
                );
              })}
              {samples.length === 0 && (
                <Text style={styles.personHint}>No samples found. Upload your own outfit above.</Text>
              )}
            </ScrollView>
          )}

          {/* Selected garment preview */}
          {garment && (
            <View style={styles.selectedRow}>
              <Image source={{ uri: garment.displayUri }} style={styles.selectedImg} />
              <Text style={styles.selectedText}>Outfit selected ✨</Text>
            </View>
          )}

          {error && <Text style={styles.error}>{error}</Text>}

          <PressableScale
            style={[styles.tryBtn, { opacity: canTryOn ? 1 : 0.45 }]}
            onPress={runTryOn}
            disabled={!canTryOn}
          >
            {generating ? (
              <ActivityIndicator color="#0B1326" />
            ) : (
              <>
                <Sparkles color="#0B1326" size={20} />
                <Text style={styles.tryText}>Try It On</Text>
              </>
            )}
          </PressableScale>

          <View style={{ height: 40 }} />
        </ScrollView>

        {/* Result overlay */}
        {(generating || result) && (
          <View style={styles.overlay}>
            <View style={styles.overlayCard}>
              <View style={styles.overlayHeader}>
                <Text style={styles.overlayTitle}>Your AI Heritage Look</Text>
                <PressableScale
                  haptic={false}
                  style={styles.closeBtn}
                  onPress={() => {
                    setResult(null);
                    if (!generating) setError(null);
                  }}
                >
                  <X color="white" size={20} />
                </PressableScale>
              </View>

              {generating ? (
                <View style={styles.overlayLoading}>
                  <ActivityIndicator color="#FF9933" size="large" />
                  <Text style={styles.overlayLoadingText}>
                    Styling you in {category.label.toLowerCase()}…
                  </Text>
                  <Text style={styles.overlayLoadingSub}>Rendering high-definition fabric & fit ✨</Text>
                </View>
              ) : result ? (
                <>
                  <Image source={{ uri: result }} style={styles.resultImg} resizeMode="contain" />
                  <PressableScale style={styles.againBtn} onPress={runTryOn}>
                    <Text style={styles.againText}>Try Another Outfit</Text>
                  </PressableScale>
                </>
              ) : null}
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 18, paddingBottom: 30 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topTitle: { color: "white", fontSize: 19, fontWeight: "800" },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
    justifyContent: "center",
    alignItems: "center",
  },

  tabs: { gap: 10, paddingVertical: 6 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.14)",
  },
  tabActive: { backgroundColor: "#9333EA", borderColor: "#A855F7" },
  tabEmoji: { fontSize: 16 },
  tabLabel: { color: "#CBD5E1", fontWeight: "700" },
  tabLabelActive: { color: "white" },

  section: { color: "white", fontSize: 17, fontWeight: "800", marginTop: 22, marginBottom: 12 },
  tip: { color: "#D8B4FE", fontSize: 13, lineHeight: 19, marginTop: -4, marginBottom: 14 },

  personRow: { flexDirection: "row", gap: 14 },
  personBox: {
    width: 130,
    height: 170,
    borderRadius: 24,
    backgroundColor: "rgba(19, 31, 55, 0.65)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  personImg: { width: "100%", height: "100%" },
  personHint: { color: "#94A3B8", textAlign: "center", fontSize: 13, paddingHorizontal: 8 },
  personActions: { flex: 1, justifyContent: "center", gap: 12 },
  pickBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.18)",
  },
  pickText: { color: "white", fontWeight: "700" },

  ownRow: { flexDirection: "row", gap: 12 },
  ownBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: "rgba(255, 153, 51, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 153, 51, 0.4)",
  },
  ownText: { color: "#FF9933", fontWeight: "800", fontSize: 13 },
  orText: { color: "#94A3B8", textAlign: "center", marginTop: 16, marginBottom: 12, fontSize: 13 },

  gallery: { gap: 12, paddingVertical: 4 },
  sample: {
    width: 110,
    height: 150,
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  sampleActive: { borderColor: "#FF9933" },
  sampleImg: { width: "100%", height: "100%" },

  selectedRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 16 },
  selectedImg: { width: 46, height: 46, borderRadius: 12 },
  selectedText: { color: "#FF9933", fontWeight: "800" },

  error: { color: "#FCA5A5", marginTop: 16, fontSize: 14, lineHeight: 20 },

  tryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 26,
    paddingVertical: 17,
    borderRadius: 30,
    backgroundColor: "#FF9933",
    shadowColor: "#FF9933",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  tryText: { color: "#0B1326", fontWeight: "800", fontSize: 17 },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11, 19, 38, 0.88)",
    justifyContent: "center",
    padding: 18,
  },
  overlayCard: {
    backgroundColor: "#131F37",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.16)",
  },
  overlayHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  overlayTitle: { color: "white", fontSize: 19, fontWeight: "800" },
  overlayLoading: { alignItems: "center", paddingVertical: 50 },
  overlayLoadingText: { color: "white", fontWeight: "800", marginTop: 18, fontSize: 16 },
  overlayLoadingSub: { color: "#94A3B8", marginTop: 8, fontSize: 13 },
  resultImg: {
    width: "100%",
    height: 420,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  againBtn: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  againText: { color: "white", fontWeight: "700", fontSize: 15 },
});
