import { View, Text, Pressable } from 'react-native';
import React from 'react';
import { useAuth } from '../../context/authContext';

export default function Home() {
  const { logout, user } = useAuth(); // Destructure user from useAuth

  const handleLogout = async () => {
    
      await logout();
     
  };

  console.log('User data:', user); // Safely log user data
  return (
    <View className="flex-1 bg-white">
      <Text>Home</Text>

    </View>
  );
}
