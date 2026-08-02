import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { MapPin, Star, Wifi, ShieldCheck, DollarSign, Hotel } from "lucide-react-native";
import COLORS from "../../constants/colors";

const { width } = Dimensions.get("window");

type StayType = "Hotel" | "Airbnb" | "Dorm" | "Resort";
type BudgetTier = "Budget" | "Moderate" | "Luxury";

interface Stay {
  id: string;
  name: string;
  type: StayType;
  budgetTier: BudgetTier;
  cost: number;
  distance: number;
  rating: number;
  image: string;
  amenities: string[];
  location: string;
}

const STAYS_DATA: Stay[] = [
  {
    id: "st1",
    name: "Saffron Palace Hotel",
    type: "Hotel",
    budgetTier: "Moderate",
    cost: 3500,
    distance: 1.2,
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500",
    amenities: ["AC", "Free Wifi", "Pool", "Breakfast"],
    location: "Jaipur, Rajasthan",
  },
  {
    id: "st2",
    name: "Zostel Backpacker Dorms",
    type: "Dorm",
    budgetTier: "Budget",
    cost: 850,
    distance: 0.8,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=500",
    amenities: ["Free Wifi", "Lounge", "Shared Kitchen"],
    location: "Rishikesh, Uttarakhand",
  },
  {
    id: "st3",
    name: "Goan Heritage Beach Villa",
    type: "Airbnb",
    budgetTier: "Luxury",
    cost: 7200,
    distance: 2.5,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=500",
    amenities: ["Beachfront", "AC", "Private Pool", "Kitchen"],
    location: "Calangute, Goa",
  },
  {
    id: "st4",
    name: "Taj Lake View Resort",
    type: "Resort",
    budgetTier: "Luxury",
    cost: 14500,
    distance: 4.8,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=500",
    amenities: ["Spa", "AC", "Free Wifi", "Bar & Diner"],
    location: "Udaipur, Rajasthan",
  },
  {
    id: "st5",
    name: "Standard Comfort Inn",
    type: "Hotel",
    budgetTier: "Budget",
    cost: 1200,
    distance: 1.5,
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500",
    amenities: ["AC", "Free Wifi", "Elevator"],
    location: "New Delhi",
  },
  {
    id: "st6",
    name: "Himalayan Forest Cabin",
    type: "Airbnb",
    budgetTier: "Moderate",
    cost: 2800,
    distance: 3.1,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=500",
    amenities: ["Mountain View", "Fireplace", "Free Wifi"],
    location: "Manali, Himachal Pradesh",
  },
  {
    id: "st7",
    name: "Backpackers Haven Dorm",
    type: "Dorm",
    budgetTier: "Budget",
    cost: 650,
    distance: 0.5,
    rating: 4.3,
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?w=500",
    amenities: ["Free Wifi", "AC", "Lockers"],
    location: "Fort Kochi, Kerala",
  }
];

export default function StaysScreen() {
  const [selectedType, setSelectedType] = useState<string>("All");
  const [selectedBudget, setSelectedBudget] = useState<string>("All");

  const stayTypes = ["All", "Hotel", "Airbnb", "Dorm", "Resort"];
  const budgetTiers = [
    { key: "All", label: "All Prices" },
    { key: "Budget", label: "Budget (< ₹1.5k)" },
    { key: "Moderate", label: "Moderate (₹1.5k - ₹5k)" },
    { key: "Luxury", label: "Luxury (> ₹5k)" }
  ];

  const handleBookNow = (stay: Stay) => {
    Alert.alert(
      "Confirm Booking",
      `Do you want to book "${stay.name}" for ₹${stay.cost}/night?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: () => {
            Alert.alert(
              "Booking Successful! 🎉",
              `Your stay at "${stay.name}" has been reserved.\nDistance: ${stay.distance} km from your current location.`
            );
          }
        }
      ]
    );
  };

  const filteredStays = STAYS_DATA.filter((stay) => {
    const matchesType = selectedType === "All" || stay.type === selectedType;
    const matchesBudget = selectedBudget === "All" || stay.budgetTier === selectedBudget;
    return matchesType && matchesBudget;
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[COLORS.background, "#131F37", "#0B1326"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nearby Stays</Text>
          <Text style={styles.headerSubtitle}>Discover accommodations near you</Text>
        </View>

        {/* Filters Panel */}
        <View style={styles.filterSection}>
          {/* Accommodation Type Filters */}
          <Text style={styles.filterLabel}>Stay Type</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollView}
          >
            {stayTypes.map((type) => {
              const active = selectedType === type;
              return (
                <TouchableOpacity
                  key={type}
                  style={[styles.filterChip, active && styles.activeFilterChip]}
                  onPress={() => setSelectedType(type)}
                >
                  <Text style={[styles.filterChipText, active && styles.activeFilterChipText]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Budget Filters */}
          <Text style={[styles.filterLabel, { marginTop: 12 }]}>Budget Tier</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScrollView}
          >
            {budgetTiers.map((tier) => {
              const active = selectedBudget === tier.key;
              return (
                <TouchableOpacity
                  key={tier.key}
                  style={[styles.filterChip, active && styles.activeFilterChip]}
                  onPress={() => setSelectedBudget(tier.key)}
                >
                  <Text style={[styles.filterChipText, active && styles.activeFilterChipText]}>
                    {tier.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* List of Stays */}
        {filteredStays.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Hotel color={COLORS.muted} size={48} />
            <Text style={styles.emptyText}>No accommodations match your filter criteria.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredStays}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <LinearGradient
                  colors={["transparent", "rgba(0, 0, 0, 0.95)"]}
                  style={styles.imageOverlay}
                />
                
                {/* Top Badge: Distance */}
                <View style={styles.distanceBadge}>
                  <MapPin color="#FFF" size={10} style={{ marginRight: 2 }} />
                  <Text style={styles.distanceText}>{item.distance} km</Text>
                </View>

                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                  <Star color="#F59E0B" size={10} style={{ marginRight: 2 }} />
                  <Text style={styles.ratingText}>{item.rating}</Text>
                </View>

                <View style={styles.cardDetails}>
                  <View style={styles.row}>
                    <Text style={styles.stayType}>{item.type}</Text>
                    <Text style={styles.stayPrice}>₹{item.cost} <Text style={{ fontSize: 10, color: COLORS.subtitle }}>/ night</Text></Text>
                  </View>
                  <Text style={styles.stayName}>{item.name}</Text>
                  
                  <View style={styles.row}>
                    <Text style={styles.stayLocation}>{item.location}</Text>
                  </View>

                  {/* Amenities Row */}
                  <View style={styles.amenitiesContainer}>
                    {item.amenities.map((amenity, index) => (
                      <View key={index} style={styles.amenityTag}>
                        <Text style={styles.amenityText}>{amenity}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Booking Trigger */}
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookNow(item)}
                  >
                    <LinearGradient
                      colors={[COLORS.saffron, COLORS.marigold]}
                      style={styles.bookButtonGrad}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                    >
                      <Text style={styles.bookButtonText}>Book Now</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1326",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.subtitle,
    marginTop: 2,
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.saffron,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  filterScrollView: {
    paddingBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#131F37",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  activeFilterChip: {
    backgroundColor: COLORS.saffron,
    borderColor: COLORS.saffron,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.subtitle,
  },
  activeFilterChipText: {
    color: "#000",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for tabbar
  },
  card: {
    height: 320,
    borderRadius: 22,
    overflow: "hidden",
    marginBottom: 20,
    backgroundColor: "#131F37",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.06)",
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "60%",
    resizeMode: "cover",
  },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "60%",
  },
  distanceBadge: {
    position: "absolute",
    top: 15,
    left: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  distanceText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  ratingBadge: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "700",
  },
  cardDetails: {
    padding: 16,
    height: "40%",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stayType: {
    fontSize: 11,
    fontWeight: "800",
    color: COLORS.saffron,
    textTransform: "uppercase",
  },
  stayPrice: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.text,
  },
  stayName: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.text,
    marginTop: 4,
  },
  stayLocation: {
    fontSize: 12,
    color: COLORS.subtitle,
    marginTop: 2,
  },
  amenitiesContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  amenityTag: {
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 6,
  },
  amenityText: {
    fontSize: 9,
    color: COLORS.subtitle,
    fontWeight: "600",
  },
  bookButton: {
    width: "100%",
    height: 38,
    borderRadius: 19,
    overflow: "hidden",
    marginTop: 10,
  },
  bookButtonGrad: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  bookButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#000",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    marginTop: 40,
  },
  emptyText: {
    color: COLORS.subtitle,
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 20,
  },
});
