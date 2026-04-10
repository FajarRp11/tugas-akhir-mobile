/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

export const Colors = {
  light: {
    primary: "#2E7D32",
    secondary: "#81C784",
    alert: "#D32F2F",
    warning: "#F57C00",
    chicken: "#F9A825",
    background: "#F5F5F5",
    card: "#FFFFFF",
    text: "#212121",
    textSecondary: "#757575",
    border: "#E0E0E0",
    white: "#FFFFFF",
  },
  dark: {
    primary: "#4CAF50",
    secondary: "#81C784",
    alert: "#E57373",
    warning: "#FFB74D",
    chicken: "#FFD54F",
    background: "#121212",
    card: "#1E1E1E",
    text: "#E0E0E0",
    textSecondary: "#BDBDBD",
    border: "#333333",
    white: "#FFFFFF",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "Manrope",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "Manrope",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "Manrope, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
