import '../global.css';

import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SessionProvider } from '@/features/session/SessionContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'SVN-PFDinTextPro-CondensedBold': require('../../assets/Fonts/SVN-PFDinTextPro-CondensedBold.otf'),
    'SVN-PFDinTextPro-Regular': require('../../assets/Fonts/SVN-PFDinTextPro-Regular.otf'),
    'SVN-PFDinTextPro-Medium': require('../../assets/Fonts/SVN-PFDinTextPro-Medium.otf'),
    'SVN-PFDinTextPro-Bold': require('../../assets/Fonts/SVN-PFDinTextPro-Bold.otf'),
    'SVN-PFDinTextPro-Light': require('../../assets/Fonts/SVN-PFDinTextPro-Light.otf'),
    'SVN-PFDinTextPro-Italic': require('../../assets/Fonts/SVN-PFDinTextPro-Italic.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </SessionProvider>
    </SafeAreaProvider>
  );
}
