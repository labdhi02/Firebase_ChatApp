import { Stack } from "expo-router";
import HomeHeader from "../../components/HomeHeader"; // Import the custom header

export default function _layout() {
  return (
    <Stack>
      <Stack.Screen
        name="home"
        options={{
          header: () => <HomeHeader />, // Set HomeHeader as the custom header
        }}
      />
    </Stack>
  );
}
