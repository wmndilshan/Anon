import React from "react";
import { Platform, Pressable, StyleSheet, Text, type ViewStyle } from "react-native";
import { colors } from "../../theme/colors";
import { theme } from "../../theme/theme";

type Props = {
  title: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  style?: ViewStyle;
  disabled?: boolean;
};

export function PrimaryButton({ title, onPress, variant = "primary", style, disabled }: Props) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.outline,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      android_ripple={
        Platform.OS === "android"
          ? { color: variant === "primary" ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)" }
          : undefined
      }
    >
      <Text style={[styles.text, variant === "outline" && styles.textOutline]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radii.sm,
    alignItems: "center",
  },
  primary: {
    backgroundColor: colors.salmonPink,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  text: {
    color: colors.white,
    fontFamily: theme.fontFamily.semibold,
    fontSize: theme.fontSize.md,
  },
  textOutline: {
    color: colors.eerieBlack,
  },
});
