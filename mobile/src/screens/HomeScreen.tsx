import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { fetchProducts } from "../api/products";
import { ProductCard } from "../components/ui/ProductCard";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { CATEGORIES } from "../data/categories";
import type { Product } from "../data/mockProducts";
import { MOCK_PRODUCTS } from "../data/mockProducts";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { theme } from "../theme/theme";

const { width } = Dimensions.get("window");

const NEW_PRODUCTS_GAP = 12;

const BANNERS = [
  require("../../assets/images/banner-1.jpg"),
  require("../../assets/images/banner-2.jpg"),
  require("../../assets/images/banner-3.jpg"),
];

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { width: winW } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { toggle, has } = useWishlist();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS.slice(0, 8));
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const gridPad = theme.spacing.lg * 2;
  const newProductColWidth = (winW - gridPad - NEW_PRODUCTS_GAP) / 2;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchProducts();
      setProducts(list.slice(0, 8));
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const list = await fetchProducts();
      setProducts(list.slice(0, 8));
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.salmonPink} />
        }
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, theme.spacing.lg) + theme.spacing.xl }}
      >
        <View style={styles.topBar}>
          <Text style={styles.logoText}>Anon</Text>
          <View style={styles.topActions}>
            <Pressable onPress={() => navigation.navigate("Search")} hitSlop={8}>
              <Ionicons name="search-outline" size={26} color={colors.eerieBlack} />
            </Pressable>
            <Pressable onPress={() => navigation.navigate("Cart")} hitSlop={8}>
              <Ionicons name="bag-handle-outline" size={26} color={colors.eerieBlack} />
            </Pressable>
          </View>
        </View>

        <View style={styles.alert}>
          <Text style={styles.alertText}>
            <Text style={styles.alertBold}>Free Shipping</Text> This Week Order Over - $55
          </Text>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.bannerList}
        >
          {BANNERS.map((src, i) => (
            <ImageBackground key={`b-${i}`} source={src} style={styles.banner} imageStyle={styles.bannerImg}>
              <View style={styles.bannerOverlay} />
            </ImageBackground>
          ))}
        </ScrollView>

        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
          {CATEGORIES.map((c) => (
            <Pressable
              key={c.slug}
              style={styles.catChip}
              onPress={() => navigation.navigate("CategoryProducts", { categorySlug: c.slug, title: c.title })}
            >
              <View style={styles.catIconBox}>
                <Ionicons name={c.icon as "shirt-outline"} size={22} color={colors.eerieBlack} />
              </View>
              <Text style={styles.catTitle} numberOfLines={2}>
                {c.title}
              </Text>
              <Text style={styles.catCount}>{c.countLabel}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>New Products</Text>
          <Pressable onPress={() => navigation.navigate("Shop")}>
            <Text style={styles.seeAll}>See all</Text>
          </Pressable>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.salmonPink} style={{ marginVertical: 24 }} />
        ) : (
          <View style={styles.grid}>
            {products.map((p) => (
              <View key={p.id} style={{ width: newProductColWidth }}>
                <ProductCard
                  product={p}
                  compact
                  wishlisted={has(p.id)}
                  onToggleWishlist={() => toggle(p.id)}
                  onPress={() => navigation.navigate("ProductDetail", { productId: p.id })}
                />
              </View>
            ))}
          </View>
        )}

        <View style={styles.dealCard}>
          <Text style={styles.dealTitle}>Deal of the day</Text>
          <ExpoImage
            source={require("../../assets/images/products/shampoo.jpg")}
            style={styles.dealImg}
            contentFit="cover"
            transition={150}
          />
          <Text style={styles.dealName} numberOfLines={2}>
            Shampoo & face care pack
          </Text>
          <View style={styles.dealPrice}>
            <Text style={styles.price}>$150.00</Text>
            <Text style={styles.compare}>$200.00</Text>
          </View>
          <PrimaryButton
            title="Add to cart"
            onPress={() => {
              addToCart("p-deal", 1);
              navigation.navigate("Cart");
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  logoText: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.xl,
    color: colors.eerieBlack,
    letterSpacing: 1,
  },
  topActions: { flexDirection: "row", gap: theme.spacing.lg },
  alert: {
    backgroundColor: colors.cultured,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  alertText: { fontSize: theme.fontSize.sm, color: colors.davysGray, fontFamily: theme.fontFamily.regular },
  alertBold: { fontFamily: theme.fontFamily.bold, color: colors.eerieBlack },
  bannerList: { maxHeight: width * 0.55 },
  banner: { width, height: width * 0.5, justifyContent: "flex-end" },
  bannerImg: { borderRadius: 0 },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.08)" },
  sectionTitle: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.lg,
    color: colors.eerieBlack,
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  sectionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  seeAll: { color: colors.salmonPink, fontFamily: theme.fontFamily.medium, fontSize: theme.fontSize.sm },
  catRow: { paddingHorizontal: theme.spacing.md, paddingVertical: theme.spacing.md, gap: theme.spacing.sm },
  catChip: {
    width: 120,
    padding: theme.spacing.sm,
    backgroundColor: colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: theme.spacing.sm,
  },
  catIconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.radii.sm,
    backgroundColor: colors.cultured,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
  },
  catTitle: { fontFamily: theme.fontFamily.medium, fontSize: theme.fontSize.sm, color: colors.eerieBlack },
  catCount: { fontSize: theme.fontSize.xs, color: colors.sonicSilver, marginTop: 4 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "flex-start",
    columnGap: NEW_PRODUCTS_GAP,
    rowGap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
  },
  dealCard: {
    margin: theme.spacing.lg,
    padding: theme.spacing.lg,
    backgroundColor: colors.cultured,
    borderRadius: theme.radii.md,
  },
  dealTitle: { fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.lg, marginBottom: theme.spacing.md },
  dealImg: { width: "100%", height: 160, borderRadius: theme.radii.sm, marginBottom: theme.spacing.sm },
  dealName: { fontFamily: theme.fontFamily.medium, fontSize: theme.fontSize.md, color: colors.eerieBlack },
  dealPrice: { flexDirection: "row", gap: 12, marginVertical: theme.spacing.sm },
  price: { color: colors.salmonPink, fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.lg },
  compare: {
    color: colors.spanishGray,
    textDecorationLine: "line-through",
    fontFamily: theme.fontFamily.regular,
  },
});
