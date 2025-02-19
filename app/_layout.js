import { View, ActivityIndicator, Text } from 'react-native';
import React, { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import '../global.css';
import { AuthContextProvider, useAuth } from '../context/authContext';
import { MenuProvider } from 'react-native-popup-menu';

const Mainlayout = () => {
  const { isAuthenticated, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (typeof isAuthenticated === 'undefined') return; // Wait for auth state

    const inAuthRoutes = segments?.[0] === 'signIn' || segments?.[0] === 'signUp';

    if (isAuthenticated && !inAuthRoutes) {
      // User is authenticated, redirect to the home page
      router.replace('/home');
    } else if (!isAuthenticated && !inAuthRoutes) {
      // User is not authenticated, redirect to signIn
      router.replace('/signIn');
    }
  }, [isAuthenticated, segments]);

  // Show a loading indicator if auth state is still undefined
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
    <MenuProvider>
      <AuthContextProvider>
      <Mainlayout />
    </AuthContextProvider>
    </MenuProvider>
    
  );
}
