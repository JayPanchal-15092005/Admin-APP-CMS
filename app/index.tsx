import { useUser } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return null;

  const role = user?.publicMetadata?.role;

  if (role === "admin") {
    return <Redirect href="/(admin)/complain" />;
  }

  // ❌ Non-admins blocked
  return <Redirect href="/(auth)/login" />;
}
