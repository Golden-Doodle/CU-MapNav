import i18n from '@/app/config/i18n'; // Should be first import -- i18n must be initialized before anything else
import { Stack } from "expo-router";
import { AuthProvider } from "@/app/contexts/AuthContext";


export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
