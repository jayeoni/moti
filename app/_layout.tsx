import '../global.css';
import 'react-native-url-polyfill/auto';
import { useEffect, useState } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { AuthContext, useAuthState } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';
import { Colors } from '../constants/colors';

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
