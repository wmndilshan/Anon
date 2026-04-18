import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProductCard } from "../components/ui/ProductCard";
import { EmptyState } from "../components/ui/EmptyState";
import { MOCK_PRODUCTS } from "../data/mockProducts";
import { useWishlist } from "../context/WishlistContext";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { theme } from "../theme/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function WishlistScreen() {
  const navigation = useNavigation<Nav>();
  const { ids, toggle, has } = useWishlist();

  const products = useMemo(
    () => MOCK_PRODUCTS.filter((p) => ids.has(p.id)),
    [ids],
  );

  if (products.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <EmptyState
          title="Wishlist is empty"
          message="Tap the heart on a product to save it."
          actionLabel="Browse products"
          onAction={() => navigation.navigate("MainTabs", { screen: "Home" })}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>Wishlist</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            wishlisted={has(item.id)}
            onToggleWishlist={() => toggle(item.id)}
            onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
          />
        )}
      />
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
  list: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  row: { justifyContent: "space-between" },
});
