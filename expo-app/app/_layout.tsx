import { Stack } from "expo-router";
import { AuthProvider } from "@/app/contexts/AuthContext";
import Instabug, { InvocationEvent } from "instabug-reactnative";
import { concordiaBurgendyColor } from "./utils/types";

Instabug.init({
  token: "f2056620dadfdf9fa5d6a7f2bf0e3041",
  invocationEvents: [
    InvocationEvent.shake,
    InvocationEvent.screenshot,
    InvocationEvent.floatingButton,
  ],
});
Instabug.setPrimaryColor(concordiaBurgendyColor);

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
