import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Image } from "expo-image";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { EmptyState } from "../components/ui/EmptyState";
import { useCart } from "../context/CartContext";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { theme } from "../theme/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CartScreen() {
  const { lines, removeLine, setQty, subtotal, itemCount } = useCart();
  const navigation = useNavigation<Nav>();

  if (lines.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          title="Your cart is empty"
          message="Browse products and tap Add to cart."
          actionLabel="Start shopping"
          onAction={() => navigation.navigate("MainTabs", { screen: "Home" })}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>Cart ({itemCount})</Text>
      <ScrollView contentContainerStyle={styles.scroll}>
        {lines.map((line) => (
          <View key={line.productId} style={styles.line}>
            <Image source={line.image} style={styles.thumb} contentFit="cover" transition={100} />
            <View style={styles.meta}>
              <Text style={styles.lineTitle} numberOfLines={2}>
                {line.title}
              </Text>
              <Text style={styles.linePrice}>${line.price.toFixed(2)}</Text>
              <View style={styles.qtyRow}>
                <Pressable onPress={() => setQty(line.productId, line.qty - 1)} style={styles.qtyBtn}>
                  <Ionicons name="remove" size={18} color={colors.eerieBlack} />
                </Pressable>
                <Text style={styles.qty}>{line.qty}</Text>
                <Pressable onPress={() => setQty(line.productId, line.qty + 1)} style={styles.qtyBtn}>
                  <Ionicons name="add" size={18} color={colors.eerieBlack} />
                </Pressable>
                <Pressable style={styles.remove} onPress={() => removeLine(line.productId)}>
                  <Text style={styles.removeText}>Remove</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Subtotal</Text>
          <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <PrimaryButton title="Checkout" onPress={() => navigation.navigate("Checkout")} />
      </ScrollView>
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
  scroll: { padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl },
  line: { flexDirection: "row", gap: theme.spacing.md, marginBottom: theme.spacing.lg },
  thumb: { width: 88, height: 88, borderRadius: theme.radii.sm, backgroundColor: colors.cultured },
  meta: { flex: 1 },
  lineTitle: { fontFamily: theme.fontFamily.medium, fontSize: theme.fontSize.md, color: colors.eerieBlack },
  linePrice: { color: colors.salmonPink, fontFamily: theme.fontFamily.bold, marginTop: 4 },
  qtyRow: { flexDirection: "row", alignItems: "center", marginTop: theme.spacing.sm, gap: 8 },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qty: { fontFamily: theme.fontFamily.medium, minWidth: 24, textAlign: "center" },
  remove: { marginLeft: "auto" },
  removeText: { color: colors.bittersweet, fontFamily: theme.fontFamily.medium },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.lg },
  totalValue: { fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.lg, color: colors.salmonPink },
});
