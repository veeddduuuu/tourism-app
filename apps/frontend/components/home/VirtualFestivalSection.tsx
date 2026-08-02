import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Sparkles } from "lucide-react-native";
import COLORS from "../../constants/colors";
import SectionHeader from "../common/SectionHeader";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.82;

interface VirtualFestival {
  id: string;
  name: string;
  state: string;
  tagline: string;
  description: string;
  image: string;
}

const FESTIVALS: VirtualFestival[] = [
  {
    id: "pushkar",
    name: "Pushkar Camel Fair",
    state: "Rajasthan",
    tagline: "Desert Sunset & Camel Trading Caravan",
    description: "Step into the golden sands of Rajasthan. Witness thousands of decorated camels, hear traditional folk music, and experience the twilight desert camp.",
    image: "https://images.unsplash.com/photo-1506461883276-594a12b11db3?w=800",
  },
  {
    id: "hornbill",
    name: "Hornbill Festival",
    state: "Nagaland",
    tagline: "Tribal Bonfire & Folk Dances",
    description: "Experience the ultimate tribal dance gathering at Kisama Heritage Village. Hear war cry chants, see the iconic hornbill headdress, and circle the bonfire.",
    image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=800",
  },
  {
    id: "rathyatra",
    name: "Puri Rath Yatra",
    state: "Odisha",
    tagline: "Grand Chariot Procession",
    description: "Join millions of devotees pulling the massive wooden chariots of Lord Jagannath. Hear holy blowing of conch shells and energetic sankirtans.",
    image: "https://images.unsplash.com/photo-1601181141079-a5d0e6f6f6b0?w=800",
  },
  {
    id: "kumbh",
    name: "Kumbh Mela Aarti",
    state: "Uttar Pradesh",
    tagline: "Holy Dip & River Lantern Blessing",
    description: "Immerse yourself at the Triveni Sangam during the evening Ganga Aarti. Witness rows of glowing oil lamps, hear sacred chants, and feel the spiritual devotion.",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
  }
];

export default function VirtualFestivalSection() {
  const router = useRouter();

  const handleStartExperience = (id: string) => {
    router.push({
      pathname: "/virtual-experience",
      params: { id }
    } as any);
  };

  return (
    <View style={styles.container}>
      <SectionHeader title="Virtual Festival 360°" showViewAll={false} />
      <Text style={styles.subtitle}>
        Can't travel in person? Immerse yourself from home.
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 20}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContainer}
      >
        {FESTIVALS.map((fest) => (
          <TouchableOpacity
            key={fest.id}
            activeOpacity={0.9}
            style={styles.cardWrapper}
            onPress={() => handleStartExperience(fest.id)}
          >
            <ImageBackground source={{ uri: fest.image }} style={styles.cardBg}>
              <LinearGradient
                colors={["rgba(0,0,0,0.2)", "rgba(11,19,38,0.95)"]}
                style={StyleSheet.absoluteFillObject}
              />

              <View style={styles.cardHeader}>
                <View style={styles.vrBadge}>
                  <Sparkles color="#000" size={10} style={{ marginRight: 4 }} />
                  <Text style={styles.vrBadgeText}>360° IMMERSIVE</Text>
                </View>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.stateTag}>{fest.state}</Text>
                <Text style={styles.title}>{fest.name}</Text>
                <Text style={styles.tagline}>{fest.tagline}</Text>
                <Text style={styles.description} numberOfLines={3}>
                  {fest.description}
                </Text>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleStartExperience(fest.id)}
                >
                  <LinearGradient
                    colors={[COLORS.saffron, COLORS.marigold]}
                    style={styles.btnGrad}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Text style={styles.btnText}>Enter 360° Portal</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  subtitle: {
    paddingHorizontal: 20,
    fontSize: 13,
    color: COLORS.subtitle,
    marginTop: -8,
    marginBottom: 16,
  },
  scrollContainer: {
    paddingLeft: 20,
    paddingRight: 10,
  },
  cardWrapper: {
    width: CARD_WIDTH,
    height: 340,
    marginRight: 16,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  cardBg: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  vrBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.saffron,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  vrBadgeText: {
    fontSize: 9,
    fontWeight: "900",
    color: "#000",
    letterSpacing: 0.5,
  },
  cardContent: {
    marginTop: "auto",
  },
  stateTag: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.saffron,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 2,
  },
  tagline: {
    fontSize: 13,
    fontWeight: "700",
    color: "#E2E8F0",
    marginTop: 4,
  },
  description: {
    fontSize: 12,
    color: COLORS.subtitle,
    marginTop: 8,
    lineHeight: 16,
    opacity: 0.85,
  },
  actionButton: {
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    marginTop: 15,
  },
  btnGrad: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  btnText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000",
  },
});
