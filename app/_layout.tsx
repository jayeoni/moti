import '../global.css';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, Platform } from 'react-native';
import { useFonts } from 'expo-font';
import { Newsreader_500Medium, Newsreader_500Medium_Italic } from '@expo-google-fonts/newsreader';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { IBMPlexMono_500Medium, IBMPlexMono_700Bold } from '@expo-google-fonts/ibm-plex-mono';
import { AuthContext, useAuthState } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/colors';

if (Platform.OS !== 'web') {
  require('react-native-url-polyfill/auto');
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuthState();
  const segments = useSegments();
  const router = useRouter();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [checkingOnboarding, setCheckingOnboarding] = useState(false);

  useEffect(() => {
    if (loading) return;

    async function checkOnboarding(userId: string) {
      setCheckingOnboarding(true);
      const { data } = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('user_id', userId)
        .maybeSingle();
      setOnboardingComplete(data?.onboarding_complete ?? false);
      setCheckingOnboarding(false);
    }

    if (!session) {
      setOnboardingComplete(null);
      const inAuth = segments[0] === '(auth)';
      if (!inAuth) router.replace('/(auth)/login');
    } else {
      checkOnboarding(session.user.id);
    }
  }, [session, loading]);

  useEffect(() => {
    if (loading || checkingOnboarding || onboardingComplete === null) return;
    if (!session) return;

    const inOnboarding = segments[0] === 'onboarding';
    const inTabs = segments[0] === '(tabs)';

    if (!onboardingComplete && !inOnboarding) {
      router.replace('/onboarding');
    } else if (onboardingComplete && !inTabs) {
      router.replace('/(tabs)');
    }
  }, [onboardingComplete, checkingOnboarding]);

  if (loading || checkingOnboarding) {
    return (
      <View className="flex-1 items-center justify-center bg-cream">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const authState = useAuthState();
  const [fontsLoaded] = useFonts({
    Newsreader_500Medium,
    Newsreader_500Medium_Italic,
    BebasNeue_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.paper }}>
        <ActivityIndicator color={Colors.ink} />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={authState}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <AuthGate>
          <Slot />
        </AuthGate>
      </GestureHandlerRootView>
    </AuthContext.Provider>
  );
}
