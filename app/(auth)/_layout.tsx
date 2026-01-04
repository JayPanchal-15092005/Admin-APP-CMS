import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* 🟢 Only the login screen is kept here */}
      <Stack.Screen name="login" />
    </Stack>
  );
}