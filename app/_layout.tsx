import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { getAuth, User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { router } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (initializing) {
        setInitializing(false);
        SplashScreen.hideAsync();
      }

      if (!initializing) {
        if (user) {
          router.replace('/');
        } else {
          router.replace('/login');
        }
      }
    });

    return unsubscribe;
  }, [initializing]);

  if (initializing) return null;

  return (
    <Stack 
      screenOptions={{ headerShown: false }}
      initialRouteName="login"
    >
      <Stack.Screen name="login" options={{ gestureEnabled: false }} />
      <Stack.Screen name="signup" options={{ gestureEnabled: false }} />
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
      <Stack.Screen name="chat/[id]" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
