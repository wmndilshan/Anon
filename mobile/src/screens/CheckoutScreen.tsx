import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PrimaryButton } from "../components/ui/PrimaryButton";
import { useCart } from "../context/CartContext";
import type { RootStackParamList } from "../navigation/types";
import { colors } from "../theme/colors";
import { theme } from "../theme/theme";

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CheckoutScreen() {
  const navigation = useNavigation<Nav>();
  const { subtotal, clear } = useCart();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");

  const submit = () => {
    if (!name.trim() || !address.trim()) {
      Alert.alert("Missing info", "Please fill name and address.");
      return;
    }
    clear();
    Alert.alert("Order placed", "Thank you — same flow as website checkout (mock).", [
      { text: "OK", onPress: () => navigation.navigate("MainTabs", { screen: "Home" }) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Text style={styles.title}>Checkout</Text>
      <ScrollView contentContainerStyle={styles.form}>
        <Text style={styles.label}>Full name</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Jane Doe" />
        <Text style={styles.label}>Address</Text>
        <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="419 State 414 Rte" />
        <Text style={styles.label}>City</Text>
        <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder="Beaver Dams" />
        <Text style={styles.label}>ZIP</Text>
        <TextInput style={styles.input} value={zip} onChangeText={setZip} placeholder="14812" keyboardType="numeric" />
        <View style={styles.total}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
        </View>
        <PrimaryButton title="Place order" onPress={submit} />
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
  form: { padding: theme.spacing.lg, paddingBottom: 48 },
  label: {
    fontFamily: theme.fontFamily.medium,
    fontSize: theme.fontSize.sm,
    color: colors.davysGray,
    marginBottom: 6,
    marginTop: theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.md,
    fontFamily: theme.fontFamily.regular,
    color: colors.eerieBlack,
  },
  total: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.lg },
  totalValue: { fontFamily: theme.fontFamily.bold, fontSize: theme.fontSize.lg, color: colors.salmonPink },
});
