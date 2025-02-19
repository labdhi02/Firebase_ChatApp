import { View, Text, Platform } from 'react-native';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Image } from 'expo-image';
import { useAuth } from '../context/authContext'; // Import Auth Context
import { blurhash } from '../utils/common';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { MenuItem } from './CustomMenuItems';

const ios = Platform.OS === 'ios';

export default function HomeHeader() {
  const { top } = useSafeAreaInsets();
  const { user } = useAuth(); // Access user from context

  const handleProfile = () => {
    // Placeholder for Profile action
    console.log('Profile action triggered');
  };

  const handleLogout = async () => {
    await logout();
    // Placeholder for Logout action
    console.log('Logout action triggered');
  };



  return (
    <View
      className="flex-row justify-between items-center px-5 bg-blue-500 pb-6 rounded-b-3xl shadow"
      style={{ paddingTop: top }}
    >
      <Text style={{ fontSize: hp(3) }} className="text-white font-bold">
        Chats
      </Text>

      <Menu>
        <MenuTrigger>
          {user?.profileUrl ? (
            <Image
              style={{ height: hp(4.3), aspectRatio: 1, borderRadius: 100 }}
              source={{ uri: user.profileUrl }}
              placeholder={{ blurhash }}
              transition={500}
            />
          ) : (
            <Text style={{ color: 'white', fontSize: hp(2) }}>No Image</Text>
          )}
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionsContainer: {
              borderRadius: 10,
              marginTop: 40,
              marginLeft: -30,
              backgroundColor: 'white',
            },
          }}
        >
          <MenuItem text="Profile" action={handleProfile} value="profile" icon="👤" />
          <View
            style={{
              height: 1,
              backgroundColor: '#ccc',
              marginVertical: 5,
              marginHorizontal: 10,
            }}
          />
          <MenuItem text="Logout" action={handleLogout} value="logout" icon="🚪" />
        </MenuOptions>
      </Menu>
    </View>
  );
}
