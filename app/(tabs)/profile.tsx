import { View, Text, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useGoal } from '../../hooks/useGoal';
import { useAuth } from '../../hooks/useAuth';
import { Colors } from '../../constants/colors';

export default function ProfileScreen() {
  const { profile, goal, plan, loading } = useGoal();
  const { signOut, user } = useAuth();

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  if (loading) {
    return (
      <View className="flex-1 bg-cream items-center justify-center">
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-cream" contentContainerStyle={{ padding: 20, paddingTop: 56 }}>
      <Text className="text-2xl font-bold text-[#3D2B2B] mb-6">Profile</Text>

      {/* Avatar & name */}
      <View className="bg-white rounded-3xl p-5 mb-4 items-center shadow-sm">
        <Text className="text-5xl mb-3">🌸</Text>
        <Text className="text-xl font-bold text-[#3D2B2B]">{profile?.display_name ?? '—'}</Text>
        <Text className="text-sm text-[#7A6060]">{user?.email}</Text>
      </View>

      {/* Goal summary */}
      {goal && (
        <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
          <Text className="text-sm font-bold text-[#3D2B2B] mb-3">Current Goal</Text>
          <Row label="Goal type" value={goal.goal_type.replace('_', ' ')} />
          <Row label="Target weight" value={`${goal.target_weight_kg} kg`} />
          <Row label="Deadline" value={goal.deadline_date} />
          <Row label="Current phase" value={goal.current_phase.replace('_', ' ')} />
          {plan && <Row label="Weekly target" value={`-${plan.weekly_target_kg_loss} kg`} />}
        </View>
      )}

      {/* Body stats */}
      {profile && (
        <View className="bg-white rounded-3xl p-5 mb-4 shadow-sm">
          <Text className="text-sm font-bold text-[#3D2B2B] mb-3">Body Stats</Text>
          <Row label="Current weight" value={`${profile.current_weight_kg} kg`} />
          <Row label="Height" value={`${profile.height_cm} cm`} />
          <Row label="Sport" value={profile.sport_type ?? 'General'} />
          <Row label="Motivation" value={profile.motivation_state.replace('_', ' ')} />
        </View>
      )}

      {/* Sign out */}
      <TouchableOpacity
        className="bg-white border-2 border-error rounded-2xl py-4 items-center mt-2 mb-10"
        onPress={handleSignOut}
      >
        <Text className="text-error font-bold">Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between mb-2">
      <Text className="text-xs text-[#B09898]">{label}</Text>
      <Text className="text-xs font-semibold text-[#3D2B2B] capitalize">{value}</Text>
    </View>
  );
}
