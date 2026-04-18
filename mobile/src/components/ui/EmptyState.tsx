import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../theme/colors";
import { theme } from "../../theme/theme";
import { PrimaryButton } from "./PrimaryButton";

type Props = {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({ title, message, actionLabel, onAction }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.msg}>{message}</Text> : null}
      {actionLabel && onAction ? <PrimaryButton title={actionLabel} onPress={onAction} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    padding: theme.spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  title: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.lg,
    color: colors.eerieBlack,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  msg: {
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.md,
    color: colors.sonicSilver,
    textAlign: "center",
    marginBottom: theme.spacing.lg,
  },
});
