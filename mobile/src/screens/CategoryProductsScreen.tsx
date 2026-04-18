import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchProducts } from "../api/products";
import { ProductCard } from "../components/ui/ProductCard";
import { EmptyState } from "../components/ui/EmptyState";
import type { Product } from "../data/mockProducts";
import { useWishlist } from "../context/WishlistContext";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { theme } from "../theme/theme";

type R = RouteProp<RootStackParamList, "CategoryProducts">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CategoryProductsScreen() {
  const { params } = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const { toggle, has } = useWishlist();
  const [list, setList] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const products = await fetchProducts({ category: params.categorySlug });
      if (!cancelled) {
        setList(products);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.categorySlug]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.salmonPink} />
      </SafeAreaView>
    );
  }

  if (list.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.header}>{params.title}</Text>
        <EmptyState
          title="No products"
          message="Try another category or search."
          actionLabel="Go to shop"
          onAction={() => navigation.navigate("MainTabs", { screen: "Shop" })}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.header}>{params.title}</Text>
      <FlatList
        data={list}
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
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.lg,
    padding: theme.spacing.lg,
    color: colors.eerieBlack,
  },
  list: { paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xxl },
  row: { justifyContent: "space-between" },
});
