import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { theme } from "../theme/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

function Row({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={22} color={colors.eerieBlack} />
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.spanishGray} />
    </Pressable>
  );
}

export function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>Account</Text>
      <View style={styles.card}>
        {user ? (
          <>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            <Pressable style={styles.outlineBtn} onPress={() => logout()}>
              <Text style={styles.outlineBtnText}>Log out</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.hint}>Sign in to sync orders and profile (mock).</Text>
            <Pressable style={styles.primaryBtn} onPress={() => navigation.navigate("Login")}>
              <Text style={styles.primaryBtnText}>Log in</Text>
            </Pressable>
            <Pressable style={styles.link} onPress={() => navigation.navigate("Register")}>
              <Text style={styles.linkText}>Create account</Text>
            </Pressable>
          </>
        )}
      </View>
      <Row icon="receipt-outline" label="Orders" onPress={() => navigation.navigate("Orders")} />
      <Row icon="settings-outline" label="Settings" onPress={() => navigation.navigate("Settings")} />
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
  card: {
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: colors.cultured,
    borderRadius: theme.radii.md,
    marginBottom: theme.spacing.lg,
  },
  name: { fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.lg, color: colors.eerieBlack },
  email: { fontFamily: theme.fontFamily.regular, color: colors.sonicSilver, marginTop: 4 },
  hint: { fontFamily: theme.fontFamily.regular, color: colors.davysGray, marginBottom: theme.spacing.md },
  primaryBtn: {
    backgroundColor: colors.salmonPink,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.radii.sm,
    alignItems: "center",
  },
  primaryBtnText: { color: colors.white, fontFamily: theme.fontFamily.semibold },
  link: { marginTop: theme.spacing.md, alignItems: "center" },
  linkText: { color: colors.salmonPink, fontFamily: theme.fontFamily.medium },
  outlineBtn: {
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radii.sm,
    alignItems: "center",
  },
  outlineBtnText: { fontFamily: theme.fontFamily.medium, color: colors.eerieBlack },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowPressed: { backgroundColor: colors.cultured },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: theme.spacing.md },
  rowLabel: { fontFamily: theme.fontFamily.medium, fontSize: theme.fontSize.md, color: colors.eerieBlack },
});
