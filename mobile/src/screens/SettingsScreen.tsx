import React, { useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../theme/colors";
import { theme } from "../theme/theme";

export function SettingsScreen() {
  const [notifications, setNotifications] = useState(true);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Push notifications</Text>
        <Switch value={notifications} onValueChange={setNotifications} trackColor={{ true: colors.salmonPink }} />
      </View>
      <Text style={styles.note}>
        Website had currency & language selectors in the header — expose the same preferences here when API is
        available.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  title: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.xl,
    padding: theme.spacing.lg,
    color: colors.eerieBlack,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: { fontFamily: theme.fontFamily.medium, fontSize: theme.fontSize.md, color: colors.eerieBlack },
  note: {
    padding: theme.spacing.lg,
    color: colors.sonicSilver,
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.sm,
    lineHeight: 20,
  },
});
