import { View, Text, ActivityIndicator } from 'react-native';
import React from 'react';

export default function Startpage() {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="gray" />
      <Text className="text-lg text-gray-700 mt-4">Loading...</Text>
    </View>
  );
}
