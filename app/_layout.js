import { View, ActivityIndicator } from 'react-native';
import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import '../global.css';
import { AuthContextProvider, useAuth } from '../context/authContext';

const Mainlayout = () => {
  const { isAuthenticated } = useAuth();
  const segment = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (typeof isAuthenticated === 'undefined') return; // Wait until authentication state is known

    const inApp = segment?.[0] === 'app'; // Check if user is in the app section

    if (isAuthenticated && !inApp) {
      router.replace('home'); // Redirect to 'home' if authenticated
    } else if (isAuthenticated === false) {
      router.replace('signIn'); // Redirect to 'signIn' if not authenticated
    }
  }, [isAuthenticated, segment]);

  // Show a loading indicator if authentication state is undefined
  if (isAuthenticated === undefined) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return <Slot />;
};

export default function RootLayout() {
  return (
    <AuthContextProvider>
      <Mainlayout />
    </AuthContextProvider>
  );
}
