import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Image } from "expo-image";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchProductById } from "../api/products";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import type { Product } from "../data/mockProducts";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { theme } from "../theme/theme";

type R = RouteProp<RootStackParamList, "ProductDetail">;
type Nav = NativeStackNavigationProp<RootStackParamList>;

export function ProductDetailScreen() {
  const { params } = useRoute<R>();
  const navigation = useNavigation<Nav>();
  const { addToCart } = useCart();
  const { toggle, has } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let c = false;
    (async () => {
      setLoading(true);
      const p = await fetchProductById(params.productId);
      if (!c) {
        setProduct(p);
        setLoading(false);
      }
    })();
    return () => {
      c = true;
    };
  }, [params.productId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.salmonPink} size="large" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.err}>Product not found</Text>
        <PrimaryButton title="Back" onPress={() => navigation.goBack()} />
      </SafeAreaView>
    );
  }

  const wish = has(product.id);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.top}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Ionicons name="arrow-back" size={26} color={colors.eerieBlack} />
        </Pressable>
        <Pressable onPress={() => toggle(product.id)}>
          <Ionicons name={wish ? "heart" : "heart-outline"} size={26} color={colors.eerieBlack} />
        </Pressable>
      </View>
      <ScrollView>
        <Image source={product.image} style={styles.hero} resizeMode="cover" />
        <View style={styles.body}>
          <Text style={styles.cat}>{product.category}</Text>
          <Text style={styles.title}>{product.title}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>${product.price.toFixed(2)}</Text>
            {product.compareAt != null && <Text style={styles.compare}>${product.compareAt.toFixed(2)}</Text>}
          </View>
          <Text style={styles.desc}>
            Lorem ipsum dolor sit amet consectetur. Same copy tone as the website product cards.
          </Text>
          <PrimaryButton
            title="Add to cart"
            onPress={() => {
              addToCart(product.id, 1);
              navigation.navigate("MainTabs", { screen: "Cart" });
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, justifyContent: "center", alignItems: "center", padding: theme.spacing.lg },
  err: { fontFamily: theme.fontFamily.medium, marginBottom: theme.spacing.lg },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  scrollContent: { paddingBottom: theme.spacing.xxl },
  hero: { width: "100%", aspectRatio: 1, backgroundColor: colors.cultured },
  body: { padding: theme.spacing.lg },
  cat: {
    color: colors.salmonPink,
    fontFamily: theme.fontFamily.medium,
    textTransform: "uppercase",
    fontSize: theme.fontSize.sm,
    marginBottom: theme.spacing.sm,
  },
  title: { fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.xl, color: colors.eerieBlack },
  priceRow: { flexDirection: "row", gap: 12, marginVertical: theme.spacing.md },
  price: { color: colors.salmonPink, fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.xl },
  compare: { color: colors.spanishGray, textDecorationLine: "line-through" },
  desc: {
    color: colors.sonicSilver,
    fontFamily: theme.fontFamily.regular,
    marginBottom: theme.spacing.lg,
    lineHeight: 22,
  },
});
