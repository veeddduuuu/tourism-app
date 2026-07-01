import React from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TouchableOpacity,
} from "react-native";

import THEME from "../../constants/theme";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  loading?: boolean;
}

export default function Button({
  title,
  onPress,
  loading = false,
}: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.button}
      onPress={onPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 15,
    borderRadius: THEME.radius.round,
    alignItems: "center",
    justifyContent: "center",
  },

  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: THEME.fonts.body,
  },
});
