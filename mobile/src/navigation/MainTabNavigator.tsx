import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { useCart } from "../context/CartContext";
import { CartScreen } from "../screens/CartScreen";
import { HomeScreen } from "../screens/HomeScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ShopScreen } from "../screens/ShopScreen";
import { WishlistScreen } from "../screens/WishlistScreen";
import { colors } from "../theme/colors";
import { theme } from "../theme/theme";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  const { itemCount } = useCart();

  const tabIcon = (
    routeName: keyof MainTabParamList,
    focused: boolean,
    color: string,
    size: number,
  ) => {
    const pairs: Record<keyof MainTabParamList, [keyof typeof Ionicons.glyphMap, keyof typeof Ionicons.glyphMap]> = {
      Home: ["home-outline", "home"],
      Shop: ["grid-outline", "grid"],
      Cart: ["bag-handle-outline", "bag-handle"],
      Wishlist: ["heart-outline", "heart"],
      Profile: ["person-outline", "person"],
    };
    const [inactive, active] = pairs[routeName];
    return <Ionicons name={focused ? active : inactive} size={size} color={color} />;
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.salmonPink,
        tabBarInactiveTintColor: colors.sonicSilver,
        tabBarLabelStyle: { fontFamily: theme.fontFamily.medium, fontSize: theme.fontSize.xs },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          borderTopColor: colors.border,
          paddingTop: 4,
        },
        tabBarIcon: ({ focused, color, size }) =>
          tabIcon(route.name as keyof MainTabParamList, focused, color, size),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="Shop" component={ShopScreen} options={{ title: "Categories" }} />
      <Tab.Screen
        name="Cart"
        component={CartScreen}
        options={{ title: "Cart", tabBarBadge: itemCount > 0 ? itemCount : undefined }}
      />
      <Tab.Screen name="Wishlist" component={WishlistScreen} options={{ title: "Wishlist" }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: "Account" }} />
    </Tab.Navigator>
  );
}
