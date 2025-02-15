import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import CustomKeyboard from "../components/CustomKeyboard";
import { useAuth } from "../context/authContext"; // Import useAuth from its correct location

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [profileUrl, setProfileUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth(); // useAuth is now properly imported and used

  const handleRegister = async () => {
    if (!email || !password || !username || !profileUrl) {
      Alert.alert("Sign Up", "Please fill all fields!");
      return;
    }
  
    setIsLoading(true);
  
    try {
      const response = await register(email, password, username, profileUrl);
      setIsLoading(false);
  
      if (response.success) {
        // Navigate to the home page
        router.push("/app/home");
      } else {
        Alert.alert("Sign Up", response.msg);
      }
    } catch (error) {
      setIsLoading(false);
      Alert.alert("Sign Up", "An error occurred. Please try again.");
    }
  };
  
  

  return (
    <CustomKeyboard>
      <View className="flex-1 bg-neutral-100">
        <StatusBar style="dark" />

        {/* Image Section */}
        <View className="items-center mt-10">
          <Image
            source={require("../assets/images/signIn.jpg")}
            style={{ width: wp("60%"), height: hp("30%") }}
          />
        </View>

        {/* Sign Up Title */}
        <Text
          style={{ fontSize: hp(4) }}
          className="text-center text-neutral-800 font-bold mt-4"
        >
          Sign Up
        </Text>

        {/* Input Fields */}
        <View className="gap-4 px-4 mt-10">
          <View
            style={{ height: hp("7%") }}
            className="flex-row gap-4 px-4 bg-neutral-200 items-center rounded-xl shadow"
          >
            <Ionicons name="person-outline" size={hp(3)} color="gray" />
            <TextInput
              value={username}
              onChangeText={setUsername}
              style={{ fontSize: hp(2) }}
              className="flex-1 font-semibold text-neutral-700"
              placeholder="Username"
              placeholderTextColor="gray"
            />
          </View>

          <View
            style={{ height: hp("7%") }}
            className="flex-row gap-4 px-4 bg-neutral-200 items-center rounded-xl shadow"
          >
            <Ionicons name="link-outline" size={hp(3)} color="gray" />
            <TextInput
              value={profileUrl}
              onChangeText={setProfileUrl}
              style={{ fontSize: hp(2) }}
              className="flex-1 font-semibold text-neutral-700"
              placeholder="Profile URL"
              placeholderTextColor="gray"
            />
          </View>

          <View
            style={{ height: hp("7%") }}
            className="flex-row gap-4 px-4 bg-neutral-200 items-center rounded-xl shadow"
          >
            <Ionicons name="mail-outline" size={hp(3)} color="gray" />
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={{ fontSize: hp(2) }}
              className="flex-1 font-semibold text-neutral-700"
              placeholder="Email address"
              placeholderTextColor="gray"
              keyboardType="email-address"
            />
          </View>

          <View
            style={{ height: hp("7%") }}
            className="flex-row gap-4 px-4 bg-neutral-200 items-center rounded-xl shadow"
          >
            <Ionicons name="lock-closed-outline" size={hp(3)} color="gray" />
            <TextInput
              value={password}
              onChangeText={setPassword}
              style={{ fontSize: hp(2) }}
              className="flex-1 font-semibold text-neutral-700"
              placeholder="Password"
              secureTextEntry={true}
              placeholderTextColor="gray"
            />
          </View>
        </View>

        {/* Sign Up Button */}
        <Pressable
          onPress={handleRegister}
          style={{ height: hp(6.5) }}
          className={`${
            isLoading ? "bg-indigo-300" : "bg-indigo-500"
          } rounded-xl justify-center items-center mx-4 mt-6 shadow`}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text
              style={{ fontSize: hp(2.7) }}
              className="text-white font-bold tracking-wider"
            >
              Sign Up
            </Text>
          )}
        </Pressable>

        {/* Sign In Section */}
        <View className="flex-row justify-center mt-4">
          <Text className="text-neutral-700">Already have an account? </Text>
          <Pressable onPress={() => router.push("/signIn")}>
            <Text className="text-indigo-500 font-semibold">Sign In</Text>
          </Pressable>
        </View>
      </View>
    </CustomKeyboard>
  );
}
