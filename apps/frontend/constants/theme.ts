import COLORS from "./colors";
import FONTS from "./fonts";
import SPACING from "./spacing";

const THEME = {
  colors: COLORS,

  fonts: FONTS,

  spacing: SPACING,

  radius: {
    sm: 12,

    md: 16,

    lg: 24,

    card: 24,

    xl: 32,

    round: 999,
  },

  shadow: {
    shadowColor: "#000",

    shadowOffset: {
      width: 0,

      height: 10,
    },

    shadowOpacity: 0.35,

    shadowRadius: 18,

    elevation: 10,
  },

  glassCard: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.glassBorder,
  },
};

export default THEME;
