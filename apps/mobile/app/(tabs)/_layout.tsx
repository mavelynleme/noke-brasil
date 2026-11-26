import { Tabs } from "expo-router";
import { colors } from "@noke/design-tokens";
export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        headerShown: false,
      }}
    >
      <Tabs.Screen name="home" options={{ title: "Início" }} />
      <Tabs.Screen name="compras" options={{ title: "Compras" }} />
      <Tabs.Screen name="gastos" options={{ title: "Gastos" }} />
      <Tabs.Screen name="perfil" options={{ title: "Perfil" }} />
    </Tabs>
  );
}
