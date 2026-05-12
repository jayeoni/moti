import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { Newsreader_500Medium, Newsreader_500Medium_Italic } from '@expo-google-fonts/newsreader';
import { BebasNeue_400Regular } from '@expo-google-fonts/bebas-neue';
import { IBMPlexMono_500Medium, IBMPlexMono_700Bold } from '@expo-google-fonts/ibm-plex-mono';
import { Colors } from '../constants/colors';
import '../global.css';

export default function RootLayout() {
  const [loaded] = useFonts({
    Newsreader_500Medium,
    Newsreader_500Medium_Italic,
    BebasNeue_400Regular,
    IBMPlexMono_500Medium,
    IBMPlexMono_700Bold,
  });

  if (!loaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.paper }}>
        <ActivityIndicator color={Colors.ink} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.paper } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="log" options={{ presentation: 'modal' }} />
      <Stack.Screen name="report" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
