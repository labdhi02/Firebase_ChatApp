import React from 'react';
import { Text, View } from 'react-native';
import { MenuOption } from 'react-native-popup-menu';

export const MenuItem = ({ text, action, value, icon }) => {
  return (
    <MenuOption onSelect={() => action(value)}>
      <View className="px-4 py-2 flex-row justify-start items-center">
        <Text style={{ fontSize: 16 }}>{icon}</Text>
        <Text style={{ fontSize: 16, marginLeft: 10 }}>{text}</Text>
      </View>
    </MenuOption>
  );
};
