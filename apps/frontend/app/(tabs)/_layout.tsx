import { View } from "react-native";
import { Tabs } from "expo-router";
import {
  CalendarDays,
  Home,
  MapPinned,
  User,
  UtensilsCrossed,
} from "lucide-react-native";
import COLORS from "../../constants/colors";
import GuideCompanion from "../../components/guide/GuideCompanion";

export default function TabLayout() {
  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#121212",
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#8E8E93",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="food"
        options={{
          title: "Food",
          tabBarIcon: ({ color, size }) => (
            <UtensilsCrossed color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="festivals"
        options={{
          title: "Festivals",
          tabBarIcon: ({ color, size }) => (
            <CalendarDays color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <MapPinned color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>

      <GuideCompanion />
    </View>
  );
}
