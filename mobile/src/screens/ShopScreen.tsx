import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CATEGORIES } from "../data/categories";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { theme } from "../theme/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ShopScreen() {
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Categories</Text>
        <Pressable onPress={() => navigation.navigate("Search")}>
          <Ionicons name="search-outline" size={24} color={colors.eerieBlack} />
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.grid}>
        {CATEGORIES.map((c) => (
          <Pressable
            key={c.slug}
            style={styles.tile}
            onPress={() => navigation.navigate("CategoryProducts", { categorySlug: c.slug, title: c.title })}
          >
            <View style={styles.iconBox}>
              <Ionicons name={c.icon as "shirt-outline"} size={28} color={colors.eerieBlack} />
            </View>
            <Text style={styles.tileTitle}>{c.title}</Text>
            <Text style={styles.tileCount}>{c.countLabel}</Text>
            <Text style={styles.cta}>Show all</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  title: { fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.xl, color: colors.eerieBlack },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: theme.spacing.md,
    gap: theme.spacing.md,
  },
  tile: {
    width: "47%",
    backgroundColor: colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: theme.spacing.md,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.radii.sm,
    backgroundColor: colors.cultured,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  tileTitle: { fontFamily: theme.fontFamily.medium, fontSize: theme.fontSize.sm, color: colors.eerieBlack },
  tileCount: { fontSize: theme.fontSize.xs, color: colors.sonicSilver, marginTop: 4 },
  cta: {
    marginTop: theme.spacing.sm,
    color: colors.salmonPink,
    fontFamily: theme.fontFamily.medium,
    fontSize: theme.fontSize.sm,
  },
});
