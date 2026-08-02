import { View, StyleSheet, Platform } from "react-native";
import { Tabs } from "expo-router";
import {
  CalendarDays,
  Home,
  MapPinned,
  User,
  UtensilsCrossed,
  Hotel,
} from "lucide-react-native";
import COLORS from "../../constants/colors";
import GuideCompanion from "../../components/guide/GuideCompanion";

export default function TabLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.saffron,
          tabBarInactiveTintColor: "#94A3B8",
          tabBarLabelStyle: styles.label,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused }) => (
              <Home color={color} size={focused ? 23 : 21} />
            ),
          }}
        />

        <Tabs.Screen
          name="food"
          options={{
            title: "Food",
            tabBarIcon: ({ color, focused }) => (
              <UtensilsCrossed color={color} size={focused ? 23 : 21} />
            ),
          }}
        />

        <Tabs.Screen
          name="festivals"
          options={{
            title: "Festivals",
            tabBarIcon: ({ color, focused }) => (
              <CalendarDays color={color} size={focused ? 23 : 21} />
            ),
          }}
        />

        <Tabs.Screen
          name="history"
          options={{
            title: "History",
            tabBarIcon: ({ color, focused }) => (
              <MapPinned color={color} size={focused ? 23 : 21} />
            ),
          }}
        />

        <Tabs.Screen
          name="stays"
          options={{
            title: "Stays",
            tabBarIcon: ({ color, focused }) => (
              <Hotel color={color} size={focused ? 23 : 21} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, focused }) => (
              <User color={color} size={focused ? 23 : 21} />
            ),
          }}
        />
      </Tabs>

      <GuideCompanion />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "rgba(11, 19, 38, 0.88)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.12)",
    height: Platform.OS === "ios" ? 82 : 72,
    paddingBottom: Platform.OS === "ios" ? 22 : 10,
    paddingTop: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2,
  },
});
