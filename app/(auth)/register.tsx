import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Colors } from '../../constants/colors';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password) {
      Alert.alert('Missing fields', 'Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak password', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) Alert.alert('Registration failed', error.message);
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-cream"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pt-20 pb-10">
          <View className="items-center mb-12">
            <Text className="text-5xl mb-2">🌸</Text>
            <Text className="text-3xl font-bold text-[#3D2B2B]">Join MotiCutie</Text>
            <Text className="text-base text-[#7A6060] mt-1">Start your journey today</Text>
          </View>

          <View className="gap-4">
            <View>
              <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">Email</Text>
              <TextInput
                className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3.5 text-[#3D2B2B]"
                placeholder="you@example.com"
                placeholderTextColor={Colors.text.muted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">Password</Text>
              <TextInput
                className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3.5 text-[#3D2B2B]"
                placeholder="At least 6 characters"
                placeholderTextColor={Colors.text.muted}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-[#3D2B2B] mb-1.5">Confirm Password</Text>
              <TextInput
                className="bg-white border border-[#F4A7B9] rounded-2xl px-4 py-3.5 text-[#3D2B2B]"
                placeholder="Repeat password"
                placeholderTextColor={Colors.text.muted}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            <TouchableOpacity
              className="bg-primary rounded-2xl py-4 items-center mt-2"
              onPress={handleRegister}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1 }}
            >
              <Text className="text-white font-bold text-base">
                {loading ? 'Creating account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-center mt-8 gap-1">
            <Text className="text-[#7A6060]">Already have an account?</Text>
            <Link href="/(auth)/login">
              <Text className="text-primary font-semibold">Sign In</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
