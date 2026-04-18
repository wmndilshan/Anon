import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  StyleSheet,
  TextInput,
  View,
  Text,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { fetchProducts } from "../api/products";
import { ProductCard } from "../components/ui/ProductCard";
import type { Product } from "../data/mockProducts";
import { useWishlist } from "../context/WishlistContext";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { theme } from "../theme/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const { toggle, has } = useWishlist();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  const run = useCallback(async (text: string) => {
    setLoading(true);
    const list = await fetchProducts({ q: text });
    setResults(list);
    setLoading(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.row}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.eerieBlack} />
        </Pressable>
        <TextInput
          style={styles.input}
          placeholder="Enter your product name..."
          placeholderTextColor={colors.spanishGray}
          value={q}
          onChangeText={setQ}
          onSubmitEditing={() => run(q)}
          returnKeyType="search"
        />
        <Pressable onPress={() => run(q)}>
          <Ionicons name="search-outline" size={24} color={colors.eerieBlack} />
        </Pressable>
      </View>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 24 }} color={colors.salmonPink} />
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          numColumns={2}
          keyboardShouldPersistTaps="handled"
          columnWrapperStyle={styles.col}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text style={styles.hint}>Type and search — matches website search field behavior.</Text>
          }
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              wishlisted={has(item.id)}
              onToggleWishlist={() => toggle(item.id)}
              onPress={() => navigation.navigate("ProductDetail", { productId: item.id })}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    flex: 1,
    fontFamily: theme.fontFamily.regular,
    fontSize: theme.fontSize.md,
    color: colors.eerieBlack,
    paddingVertical: theme.spacing.sm,
  },
  list: { padding: theme.spacing.md },
  col: { justifyContent: "space-between" },
  hint: { textAlign: "center", color: colors.sonicSilver, marginTop: theme.spacing.xl, paddingHorizontal: theme.spacing.lg },
});
