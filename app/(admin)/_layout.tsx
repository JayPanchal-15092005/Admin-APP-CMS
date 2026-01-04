import { Slot } from "expo-router";

// 🟢 Removed Clerk imports and useUser hook
export default function AdminLayout() {
  // We removed the Redirect logic because you are now using 
  // hardcoded credentials in your login screen.
  // This layout will now simply render your admin pages (Complaints, etc.)
  return <Slot />;
}