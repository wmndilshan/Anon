import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React, { useCallback, useState } from "react";
import { LayoutChangeEvent, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import type { Product } from "../../data/mockProducts";
import { colors } from "../../theme/colors";
import { theme } from "../../theme/theme";

type Props = {
  product: Product;
  onPress: () => void;
  onToggleWishlist?: () => void;
  wishlisted?: boolean;
  compact?: boolean;
};

export function ProductCard({ product, onPress, onToggleWishlist, wishlisted, compact }: Props) {
  /** Android needs explicit px size on Image for cover-crop; aspectRatio-only parents often fail */
  const [thumbPx, setThumbPx] = useState(0);

  const onThumbLayout = useCallback((e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0) {
      const rounded = Math.round(w);
      setThumbPx((prev) => (prev === rounded ? prev : rounded));
    }
  }, []);

  return (
    <Pressable
      style={[styles.card, compact ? styles.cardCompact : styles.cardInList]}
      onPress={onPress}
    >
      <View
        collapsable={false}
        style={[styles.imageWrap, thumbPx > 0 ? { height: thumbPx } : styles.imageWrapSizing]}
        onLayout={onThumbLayout}
      >
        <Image
          source={product.image}
          style={thumbPx > 0 ? { width: thumbPx, height: thumbPx } : styles.imageFallback}
          contentFit="cover"
          transition={0}
        />
        {product.badge === "sale" && (
          <View style={[styles.badge, styles.badgeSale]}>
            <Text style={styles.badgeText}>SALE</Text>
          </View>
        )}
        {product.badge === "new" && (
          <View style={[styles.badge, styles.badgeNew]}>
            <Text style={styles.badgeText}>NEW</Text>
          </View>
        )}
        {product.badge === "percent" && product.discountPct != null && (
          <View style={[styles.badge, styles.badgePct]}>
            <Text style={styles.badgeText}>{product.discountPct}%</Text>
          </View>
        )}
        {onToggleWishlist && (
          <Pressable
            style={styles.heartBtn}
            onPress={onToggleWishlist}
            hitSlop={8}
          >
            <Ionicons name={wishlisted ? "heart" : "heart-outline"} size={20} color={colors.eerieBlack} />
          </Pressable>
        )}
      </View>
      <Text style={styles.cat} numberOfLines={1}>
        {product.category}
      </Text>
      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>
      <View style={styles.priceRow}>
        <Text style={styles.price}>${product.price.toFixed(2)}</Text>
        {product.compareAt != null && (
          <Text style={styles.compare}>${product.compareAt.toFixed(2)}</Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "100%",
    maxWidth: "100%",
    overflow: "hidden",
    backgroundColor: colors.white,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: theme.spacing.sm,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
      default: {},
    }),
  },
  /** Home grid uses fixed-width cells; avoid flex so two columns wrap correctly. */
  cardCompact: {},
  /** FlatList numColumns: share row width evenly */
  cardInList: {
    flex: 1,
    marginHorizontal: 4,
    marginBottom: theme.spacing.sm,
  },
  imageWrap: {
    width: "100%",
    alignSelf: "stretch",
    borderRadius: theme.radii.sm,
    overflow: "hidden",
    marginBottom: theme.spacing.sm,
    position: "relative",
    backgroundColor: colors.cultured,
  },
  /** Until onLayout runs, reserve a square so layout does not jump wildly */
  imageWrapSizing: {
    aspectRatio: 1,
  },
  imageFallback: {
    width: "100%",
    aspectRatio: 1,
  },
  badge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.radii.sm,
  },
  badgeSale: { backgroundColor: colors.eerieBlack },
  badgeNew: { backgroundColor: colors.salmonPink },
  badgePct: { backgroundColor: colors.bittersweet },
  badgeText: {
    color: colors.white,
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.xs,
  },
  heartBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 6,
  },
  cat: {
    fontSize: theme.fontSize.xs,
    color: colors.salmonPink,
    fontFamily: theme.fontFamily.medium,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  title: {
    fontSize: theme.fontSize.sm,
    color: colors.eerieBlack,
    fontFamily: theme.fontFamily.medium,
    lineHeight: 18,
    minHeight: 36,
  },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 6 },
  price: {
    fontSize: theme.fontSize.md,
    color: colors.salmonPink,
    fontFamily: theme.fontFamily.bold,
  },
  compare: {
    fontSize: theme.fontSize.sm,
    color: colors.spanishGray,
    textDecorationLine: "line-through",
    fontFamily: theme.fontFamily.regular,
  },
});
