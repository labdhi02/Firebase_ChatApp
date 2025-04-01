export default {
  expo: {
    name: "FirebaseChatApplication",
    slug: "FirebaseChatApplication",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      "**/*"
    ],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.labdhishah.firebasechatapplication"
    },
    android: {
      package: "com.labdhishah.firebasechatapplication",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#FFFFFF"
      }
    },
    plugins: [
      "expo-router"
    ]
  }
};
