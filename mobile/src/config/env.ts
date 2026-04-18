import Constants from "expo-constants";

function getExtra(key: string): string | undefined {
  const extra = Constants.expoConfig?.extra as Record<string, string> | undefined;
  return extra?.[key];
}

/** API base URL — prefer EXPO_PUBLIC_API_BASE_URL; fallback for local mock. */
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  getExtra("apiBaseUrl") ??
  "https://api.example.com/v1";

export const USE_MOCK_API = API_BASE_URL.includes("example.com");
