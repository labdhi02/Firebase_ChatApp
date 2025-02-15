import React, { useState } from "react";
import {
  Alert,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from "react-native-responsive-screen";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "../context/authContext";
import CustomKeyboard from "../components/CustomKeyboard";

export default function SignIn() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();


  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Sign In", "Please fill all fields!");
      return;
    }
  
    setIsLoading(true); // Show loading indicator
  
    try {
      const response = await login(email, password);
  
      if (response.success) {
        router.replace("/home"); // Navigate immediately upon success
      } else {
        Alert.alert("Sign In", response.msg);
      }
    } catch (error) {
      Alert.alert("Sign In", "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false); // Stop the loader
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

      {/* Sign In Title */}
      <Text
        style={{ fontSize: hp(4) }}
        className="text-center text-neutral-800 font-bold mt-4"
      >
        Sign In
      </Text>

      {/* Input Fields */}
      <View className="gap-4 px-4 mt-10">
        {/* Email Input */}
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

        {/* Password Input */}
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

        {/* Forgot Password */}
        <Text
          style={{ fontSize: hp(1.8) }}
          className="font-semibold text-right text-neutral-700"
        >
          Forgot password?
        </Text>
      </View>

      {/* Sign In Button */}
      <Pressable
        onPress={handleLogin}
        style={{
          height: hp(6.5),
        }}
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
            Sign In
          </Text>
        )}
      </Pressable>

      {/* Sign Up Section */}
      <View className="flex-row justify-center mt-4">
        <Text className="text-neutral-700">Don't have an account? </Text>
        <Pressable onPress={() => router.push("/signUp")}>
          <Text className="text-indigo-500 font-semibold">Sign Up</Text>
        </Pressable>
      </View>
     
    </View>
    </CustomKeyboard>
  );
}
