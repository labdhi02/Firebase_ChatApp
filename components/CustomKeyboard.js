import React from "react";
import {
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  View,
} from "react-native";

export default function CustomKeyboard({ children }) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }} // Ensure bottom padding for visibility
        keyboardShouldPersistTaps="handled" // Dismiss keyboard on outside taps
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1 }}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
