import { Link, type Href } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  type TextInputProps,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "@noke/design-tokens";
import type { ReactNode } from "react";
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  card: {
    padding: spacing.lg,
    borderRadius: radius.card,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    gap: spacing.sm,
  },
  title: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 28,
    color: colors.textPrimary,
  },
  text: {
    fontFamily: "Poppins_400Regular",
    fontSize: 16,
    color: colors.textSecondary,
  },
  button: {
    backgroundColor: colors.primary,
    color: colors.surface,
    textAlign: "center",
    padding: spacing.md,
    borderRadius: radius.input,
    overflow: "hidden",
    fontFamily: "Poppins_600SemiBold",
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radius.input,
    minHeight: 48,
    padding: spacing.sm,
    color: colors.textPrimary,
  },
});
export function Screen({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right"]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}
export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}
export function TextLine({ children }: { children: ReactNode }) {
  return <Text style={styles.text}>{children}</Text>;
}
export function Action({
  href,
  children,
}: {
  href: Href;
  children: ReactNode;
}) {
  return (
    <Link href={href} style={styles.button}>
      {children}
    </Link>
  );
}
export function Field({ label, ...props }: TextInputProps & { label: string }) {
  return (
    <View>
      <TextLine>{label}</TextLine>
      <TextInput accessibilityLabel={label} style={styles.input} {...props} />
    </View>
  );
}
