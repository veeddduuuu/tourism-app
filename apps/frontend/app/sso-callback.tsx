import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

/** Clerk / Expo AuthSession returns here after Google OAuth. */
export default function SsoCallbackScreen() {
  useEffect(() => {
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#06101F",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <ActivityIndicator color="#E8B45C" />
    </View>
  );
}
