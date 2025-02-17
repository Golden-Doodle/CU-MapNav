import { Stack } from "expo-router";
import { AuthProvider } from "@/app/contexts/AuthContext";


export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
