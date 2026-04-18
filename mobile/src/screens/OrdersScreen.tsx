import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EmptyState } from "../components/ui/EmptyState";
import { colors } from "../theme/colors";
import { theme } from "../theme/theme";

export function OrdersScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>Orders</Text>
      <View style={styles.fill}>
        <EmptyState
          title="No orders yet"
          message="When you place an order, it will appear here. Connect a real API to show history."
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  fill: { flex: 1 },
  title: {
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSize.xl,
    padding: theme.spacing.lg,
    color: colors.eerieBlack,
  },
});
