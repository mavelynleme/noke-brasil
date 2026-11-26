import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { Poppins_400Regular } from "@expo-google-fonts/poppins/400Regular";
import { Poppins_600SemiBold } from "@expo-google-fonts/poppins/600SemiBold";
export default function Layout() {
  const [loaded, error] = useFonts({ Poppins_400Regular, Poppins_600SemiBold });
  if (!loaded && !error) return null;
  return <Stack screenOptions={{ headerShown: false }} />;
}
