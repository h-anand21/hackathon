import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'login',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

import { ClerkProvider, ClerkLoaded, useAuth } from '@clerk/clerk-expo';
import { useRouter, useSegments } from 'expo-router';
import { tokenCache } from '../utils/tokenCache';
import { ThemeProvider as AppThemeProvider } from '../contexts/ThemeContext';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_YnJpZ2h0LW9jdG9wdXMtNDIuY2xlcmsuYWNjb3VudHMuZGV2JA';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <AppThemeProvider>
      <ClerkProvider tokenCache={tokenCache} publishableKey={publishableKey}>
        <ClerkLoaded>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <NavigationWrapper />
          </ThemeProvider>
        </ClerkLoaded>
      </ClerkProvider>
    </AppThemeProvider>
  );
}

import { useRef } from 'react';

function NavigationWrapper() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const segments = useSegments();
  const hasHandled = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;

    const inTabsGroup = segments[0] === '(tabs)';
    const inLoginScreen = segments[0] === 'login';

    // Only redirect when on the wrong screen — avoids re-firing mid-transition
    if (isSignedIn && inLoginScreen) {
      router.replace('/(tabs)');
    } else if (!isSignedIn && inTabsGroup) {
      router.replace('/login');
    }
    // If already on the right screen, do nothing
  }, [isLoaded, isSignedIn]); // ← segments intentionally excluded to prevent mid-transition flicker

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
