import React, { useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { useRouter, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Volume2,
  VolumeX,
  Compass,
  Info,
  Sparkles,
  MapPin,
} from "lucide-react-native";
import COLORS from "../constants/colors";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const PANORAMA_WIDTH = SCREEN_WIDTH * 3; // Make image 3x screen width for 360 degree feel

interface Hotspot {
  x: number;
  y: number;
  title: string;
  emoji: string;
  description: string;
}

interface VRFestival {
  id: string;
  name: string;
  state: string;
  videoUrl: string;
  ambientSoundName: string;
  hotspots: Hotspot[];
}

// Wrapper component to manage unique useVideoPlayer mount state per video url
function VRVideoView({ videoUrl }: { videoUrl: string }) {
  const player = useVideoPlayer(videoUrl, (p) => {
    p.loop = true;
    p.muted = true; // Video is muted so spatial ambient audio can play on overlay
    p.play();
  });

  return (
    <VideoView
      player={player}
      style={{ width: PANORAMA_WIDTH, height: SCREEN_HEIGHT }}
      contentFit="cover"
      nativeControls={false}
    />
  );
}

const VR_FESTIVALS_DATA: Record<string, VRFestival> = {
  pushkar: {
    id: "pushkar",
    name: "Pushkar Camel Fair",
    state: "Rajasthan",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-camels-in-the-desert-sands-43110-large.mp4",
    ambientSoundName: "Desert Wind & Folk Chants",
    hotspots: [
      {
        x: SCREEN_WIDTH * 0.4,
        y: SCREEN_HEIGHT * 0.45,
        title: "🐪 Decorated Camels",
        emoji: "🐪",
        description: "Artisans decorate prized camels with intricate mirror-work, beads, and custom wool embroidery to compete in beauty pageants."
      },
      {
        x: SCREEN_WIDTH * 1.2,
        y: SCREEN_HEIGHT * 0.5,
        title: "⛺ Desert Campfire",
        emoji: "🔥",
        description: "As twilight falls, local folk dancers perform Kalbelia (snake dance) around crackling bonfires for visiting travelers."
      },
      {
        x: SCREEN_WIDTH * 2.2,
        y: SCREEN_HEIGHT * 0.35,
        title: "🎡 Sacred Lake Ghats",
        emoji: "🛕",
        description: "Beyond the fairgrounds lies the holy Pushkar Lake, surrounded by 52 bathing ghats where pilgrims offer evening prayers."
      }
    ]
  },
  hornbill: {
    id: "hornbill",
    name: "Hornbill Festival",
    state: "Nagaland",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-group-of-people-dancing-around-a-bonfire-42284-large.mp4",
    ambientSoundName: "Naga Log-Drums & War Cries",
    hotspots: [
      {
        x: SCREEN_WIDTH * 0.3,
        y: SCREEN_HEIGHT * 0.42,
        title: "🔥 Morung Tribal Hut",
        emoji: "🛖",
        description: "Traditional bamboo and thatch warrior houses displaying ethnic weapons, wood carvings, and tribal shields."
      },
      {
        x: SCREEN_WIDTH * 1.35,
        y: SCREEN_HEIGHT * 0.48,
        title: "🪶 Hornbill Headdress",
        emoji: "👑",
        description: "Stunning ceremonial headgear crafted from bear skin, wild boar tusks, and sacred hornbill feathers."
      },
      {
        x: SCREEN_WIDTH * 2.1,
        y: SCREEN_HEIGHT * 0.38,
        title: "🥁 Massive Log-Drums",
        emoji: "🥁",
        description: "Hollowed-out tree trunk drums beaten by 30+ tribe warriors in unison to sound warnings or signal grand festivities."
      }
    ]
  },
  rathyatra: {
    id: "rathyatra",
    name: "Puri Rath Yatra",
    state: "Odisha",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-crowd-of-people-walking-on-a-street-in-india-40458-large.mp4",
    ambientSoundName: "Conch Shells & Hare Krishna Kirtans",
    hotspots: [
      {
        x: SCREEN_WIDTH * 0.5,
        y: SCREEN_HEIGHT * 0.35,
        title: "🛕 Nandighosa Chariot",
        emoji: "🛕",
        description: "The colossal 45-foot wooden chariot of Lord Jagannath, newly constructed every year with 16 massive wheels."
      },
      {
        x: SCREEN_WIDTH * 1.15,
        y: SCREEN_HEIGHT * 0.45,
        title: "🐚 Conch Shell Priests",
        emoji: "🐚",
        description: "Devoted temple priests blowing conch shells to signal that the deities have boarded their respective chariots."
      },
      {
        x: SCREEN_WIDTH * 2.3,
        y: SCREEN_HEIGHT * 0.52,
        title: "📿 Chariot Rope Pulling",
        emoji: "🤝",
        description: "It is believed that even touching the giant ropes used to pull the chariots washes away a lifetime of sins."
      }
    ]
  },
  kumbh: {
    id: "kumbh",
    name: "Kumbh Mela",
    state: "Uttar Pradesh",
    videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-candles-floating-in-water-43285-large.mp4",
    ambientSoundName: "Temple Bells & Ganga Mantras",
    hotspots: [
      {
        x: SCREEN_WIDTH * 0.45,
        y: SCREEN_HEIGHT * 0.5,
        title: "🌊 Triveni Sangam",
        emoji: "🌊",
        description: "The sacred confluence point where the holy rivers Ganga, Yamuna, and the mythical Saraswati meet."
      },
      {
        x: SCREEN_WIDTH * 1.25,
        y: SCREEN_HEIGHT * 0.38,
        title: "🪔 Maha Ganga Aarti",
        emoji: "🪔",
        description: "A synchronized worship ceremony where saffron-clad priests lift multi-tiered heavy brass oil lamps to bless the river."
      },
      {
        x: SCREEN_WIDTH * 2.25,
        y: SCREEN_HEIGHT * 0.45,
        title: "🧘 Naga Sadhus Blessing",
        emoji: "🕉️",
        description: "Reclusive ascetic monks covered in holy ash emerging from deep Himalayan caves to perform sacred rituals and bless devotees."
      }
    ]
  }
};

export default function VirtualExperienceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialId = (params.id as string) || "pushkar";
  
  const [activeId, setActiveId] = useState<string>(initialId);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(true);
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  // Sync state if navigation parameter changes (prevent screen reuse caching)
  React.useEffect(() => {
    if (params.id) {
      setActiveId(params.id as string);
      setSelectedHotspot(null);
    }
  }, [params.id]);

  const activeFestival = VR_FESTIVALS_DATA[activeId] || VR_FESTIVALS_DATA.pushkar;
  const scrollViewRef = useRef<ScrollView>(null);

  const toggleSound = () => {
    setIsPlayingSound(!isPlayingSound);
    Alert.alert(
      isPlayingSound ? "Audio Muted" : "Audio Playing",
      isPlayingSound 
        ? "Ambient festival audio track has been muted." 
        : `Playing: ${activeFestival.ambientSoundName}`
    );
  };

  const handleSelectFestival = (id: string) => {
    setActiveId(id);
    setSelectedHotspot(null);
    // Scroll back to start for smooth transition
    scrollViewRef.current?.scrollTo({ x: 0, y: 0, animated: true });
  };

  return (
    <View style={styles.container}>
      {/* 360 Degree Panoramic Container */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ width: PANORAMA_WIDTH }}
        style={styles.panoramaScrollView}
      >
        <VRVideoView key={activeFestival.videoUrl} videoUrl={activeFestival.videoUrl} />

        {/* Hotspots Overlays */}
        {activeFestival.hotspots.map((hotspot, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.hotspotTouch, { left: hotspot.x, top: hotspot.y }]}
            onPress={() => setSelectedHotspot(hotspot)}
          >
            <View style={styles.hotspotRingOuter}>
              <View style={styles.hotspotRingInner}>
                <Text style={styles.hotspotEmoji}>{hotspot.emoji}</Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Top Header Overlay */}
      <SafeAreaView style={styles.headerOverlay} edges={["top"]}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft color={COLORS.text} size={24} />
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <View style={styles.badge}>
              <Compass color={COLORS.saffron} size={11} style={{ marginRight: 4 }} />
              <Text style={styles.badgeText}>360° PORTAL</Text>
            </View>
            <Text style={styles.festName}>{activeFestival.name}</Text>
            <View style={styles.stateContainer}>
              <MapPin color={COLORS.subtitle} size={11} style={{ marginRight: 3 }} />
              <Text style={styles.festState}>{activeFestival.state}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.audioButton} onPress={toggleSound}>
            {isPlayingSound ? (
              <Volume2 color={COLORS.saffron} size={22} />
            ) : (
              <VolumeX color={COLORS.subtitle} size={22} />
            )}
          </TouchableOpacity>
        </View>

        {/* Horizontal Festival Selectors */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.selectorScrollView}
          style={styles.selectorBar}
        >
          {Object.values(VR_FESTIVALS_DATA).map((fest) => {
            const isSelected = fest.id === activeFestival.id;
            return (
              <TouchableOpacity
                key={fest.id}
                style={[styles.selectorChip, isSelected && styles.activeSelectorChip]}
                onPress={() => handleSelectFestival(fest.id)}
              >
                <Text style={[styles.selectorText, isSelected && styles.activeSelectorText]}>
                  {fest.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Panning Guide */}
      <View style={styles.panGuideContainer}>
        <Text style={styles.panGuideText}>◀ Swipe Left or Right to Look Around 360° ▶</Text>
      </View>

      {/* Glassmorphism Hotspot Information Card */}
      {selectedHotspot && (
        <View style={styles.hotspotCardContainer}>
          <LinearGradient
            colors={["rgba(30, 41, 59, 0.85)", "rgba(15, 23, 42, 0.95)"]}
            style={styles.hotspotCard}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardEmojiBg}>
                <Text style={styles.cardEmoji}>{selectedHotspot.emoji}</Text>
              </View>
              <Text style={styles.cardTitle}>{selectedHotspot.title}</Text>
              <TouchableOpacity 
                style={styles.cardClose} 
                onPress={() => setSelectedHotspot(null)}
              >
                <Text style={styles.cardCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.cardDescription}>{selectedHotspot.description}</Text>
            
            {isPlayingSound && (
              <View style={styles.audioHintRow}>
                <Sparkles color={COLORS.saffron} size={12} style={{ marginRight: 6 }} />
                <Text style={styles.audioHintText}>
                  Playing immersive 3D spatial ambiance audio
                </Text>
              </View>
            )}
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  panoramaScrollView: {
    flex: 1,
  },
  panoramaImage: {
    height: SCREEN_HEIGHT,
  },
  hotspotTouch: {
    position: "absolute",
    zIndex: 10,
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  hotspotRingOuter: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 153, 51, 0.2)",
    borderWidth: 2,
    borderColor: COLORS.saffron,
    justifyContent: "center",
    alignItems: "center",
  },
  hotspotRingInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(11, 19, 38, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  hotspotEmoji: {
    fontSize: 18,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "rgba(11, 19, 38, 0.75)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.08)",
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 12,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 153, 51, 0.15)",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: "900",
    color: COLORS.saffron,
    letterSpacing: 0.5,
  },
  festName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 2,
  },
  stateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  festState: {
    fontSize: 10,
    color: COLORS.subtitle,
    fontWeight: "600",
  },
  audioButton: {
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
  },
  selectorBar: {
    marginTop: 10,
  },
  selectorScrollView: {
    paddingRight: 10,
  },
  selectorChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "rgba(11, 19, 38, 0.8)",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  activeSelectorChip: {
    backgroundColor: COLORS.saffron,
    borderColor: COLORS.saffron,
  },
  selectorText: {
    fontSize: 11,
    fontWeight: "700",
    color: COLORS.subtitle,
  },
  activeSelectorText: {
    color: "#000",
  },
  panGuideContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  panGuideText: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  hotspotCardContainer: {
    position: "absolute",
    bottom: 80,
    left: 20,
    right: 20,
    zIndex: 200,
  },
  hotspotCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 10,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cardEmojiBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255, 153, 51, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  cardEmoji: {
    fontSize: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    flex: 1,
  },
  cardClose: {
    padding: 4,
  },
  cardCloseText: {
    color: COLORS.subtitle,
    fontSize: 18,
    fontWeight: "700",
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.subtitle,
    lineHeight: 18,
  },
  audioHintRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.06)",
    paddingTop: 8,
  },
  audioHintText: {
    fontSize: 10,
    color: COLORS.saffron,
    fontWeight: "700",
  },
});
