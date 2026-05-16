import { ScrollView, View, Text, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useToday } from '../../hooks/useToday';
import { useGoal } from '../../hooks/useGoal';
import { useWeightTrend } from '../../hooks/useWeightTrend';
import { Colors } from '../../constants/colors';

import { RedStamp } from '../../components/v2/RedStamp';
import { Row } from '../../components/v2/Row';
import { SectionHead } from '../../components/v2/SectionHead';
import { FastBar } from '../../components/v2/FastBar';

function dateLine() {
  const d = new Date();
  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${days[d.getDay()]} · ${d.getDate()} ${months[d.getMonth()]} · ${hh}:${mm}`;
}

export default function TodayDashboard() {
  const { dailyPlan, adherence, safety, checkin, loading, refresh } = useToday();
  const { goal, profile, plan } = useGoal();
  const { latestWeight, trend } = useWeightTrend(14);
  const router = useRouter();

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.paper, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={Colors.ink} />
      </View>
    );
  }

  const name = profile?.display_name?.split(' ')[0] ?? 'there';
  const phaseLabel = plan?.phase?.replace('_', ' ').toUpperCase() ?? 'CUT';
  const dayNum = plan?.deadline_days ?? '—';

  const goals: { label: string; tag: string; done: boolean }[] =
    dailyPlan?.non_negotiables?.slice(0, 3).map((label, i) => ({
      label,
      tag: ['FUEL', 'MOVE', 'REST'][i] ?? 'DO',
      done: false,
    })) ?? [
      { label: dailyPlan?.meal_suggestions?.[0]?.suggestion_name ?? 'Eat first meal on time', tag: 'FUEL', done: false },
      { label: dailyPlan?.must_do_workouts?.[0] ?? '25-min recovery walk', tag: 'MOVE', done: false },
      { label: 'Lights out by 23:30', tag: 'REST', done: false },
    ];

  const inRecovery = adherence?.low_willpower_mode || (checkin?.motivation_state === 'struggling');

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.paper }}
      contentContainerStyle={{ paddingBottom: 40 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={refresh} tintColor={Colors.ink} />}
    >
      {/* Masthead */}
      <View
        style={{
          paddingTop: 56,
          paddingHorizontal: 20,
          paddingBottom: 6,
          borderBottomWidth: 2,
          borderBottomColor: Colors.ink,
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <View>
          <Text style={{ fontFamily: Colors.font.mono, fontSize: 9, letterSpacing: 2, color: Colors.ink }}>
            THE MOTI COACH
          </Text>
          <Text style={{ fontFamily: Colors.font.stencil, fontSize: 30, letterSpacing: 4, color: Colors.ink, lineHeight: 30 }}>
            TRAINING LOG
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: Colors.font.mono, fontSize: 9, color: Colors.ink, lineHeight: 14 }}>
            NO. {String(dayNum).padStart(3, '0')}
          </Text>
          <Text style={{ fontFamily: Colors.font.mono, fontSize: 9, color: Colors.muted, lineHeight: 14 }}>
            VOL. {phaseLabel}
          </Text>
        </View>
      </View>

      {/* Date + headline */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Text style={{ fontFamily: Colors.font.mono, fontSize: 10, letterSpacing: 2, color: Colors.ink }}>
            {dateLine()}
          </Text>
          {inRecovery && <RedStamp rotate={-4}>RECOVERY</RedStamp>}
        </View>
        <Text
          style={{
            fontFamily: Colors.font.serif,
            fontSize: 36,
            color: Colors.ink,
            lineHeight: 38,
            letterSpacing: -0.8,
            marginTop: 8,
          }}
        >
          {greeting(name, inRecovery)}
        </Text>
      </View>

      {/* Safety warnings */}
      {safety?.warnings?.map((w, i) => (
        <View key={i} style={{ marginHorizontal: 20, marginTop: 14, padding: 12, borderWidth: 1.5, borderColor: Colors.red }}>
          <Text style={{ fontFamily: Colors.font.mono, fontSize: 9, letterSpacing: 2, color: Colors.red }}>
            {w.severity === 'critical' ? '! CRITICAL' : '! WATCH'}
          </Text>
          <Text style={{ fontFamily: Colors.font.serif, fontSize: 15, color: Colors.ink, marginTop: 2 }}>
            {w.message}
          </Text>
        </View>
      ))}

      {/* Mood checkin prompt */}
      {!checkin && (
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <SectionHead title="Check in" meta="not yet today" />
          <TouchableOpacity
            onPress={() => router.push('/log/checkin' as any)}
            style={{ borderWidth: 1.5, borderColor: Colors.ink, padding: 14, marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <Text style={{ fontFamily: Colors.font.serif, fontSize: 18, color: Colors.ink }}>
              How does today feel?
            </Text>
            <Text style={{ fontFamily: Colors.font.stencil, fontSize: 16, letterSpacing: 3, color: Colors.red }}>STAMP →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Condition table */}
      {checkin && (
        <View style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <SectionHead title="Condition" meta={`CHECKIN ✓ ${formatTime(checkin.created_at)}`} />
          <View style={{ flexDirection: 'row', columnGap: 16 }}>
            <View style={{ flex: 1 }}>
              <Row k="weight"   v={latestWeight ? `${latestWeight.toFixed(1)} kg` : '—'} delta={trend === 'down' ? '↓' : trend === 'up' ? '↑' : '→'} />
              <Row k="sleep"    v={`${checkin.sleep_quality}/5`} delta={checkin.sleep_quality < 3 ? 'low' : undefined} warn={checkin.sleep_quality < 3} />
              <Row k="stress"   v={`${checkin.stress_level ?? '—'} / 10`} />
              <Row k="appetite" v={`${checkin.hunger_level}/5`} delta={checkin.hunger_level >= 4 ? 'high' : undefined} warn={checkin.hunger_level >= 4} last />
            </View>
            <View style={{ flex: 1 }}>
              <Row k="bloating" v={checkin.bloating ?? '—'} />
              <Row k="soreness" v={`${checkin.soreness}/5`} delta={checkin.soreness >= 4 ? 'heavy' : undefined} warn={checkin.soreness >= 4} />
              <Row k="mood"     v={`${checkin.mood}/5`} />
              <Row k="binge risk" v={(safety as any)?.binge_risk?.toUpperCase() ?? 'LOW'} warn={(safety as any)?.binge_risk === 'medium' || (safety as any)?.binge_risk === 'high'} last />
            </View>
          </View>
        </View>
      )}

      {/* Today: The Three */}
      <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
        <SectionHead title="Today · Three Things" meta={inRecovery ? 'LOW-W MODE' : 'KEEP IT SHORT'} />
        {goals.map((g, i) => (
          <View
            key={i}
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: 10,
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: Colors.faint,
              opacity: g.done ? 0.45 : 1,
            }}
          >
            <View
              style={{
                width: 22,
                height: 22,
                borderWidth: 2,
                borderColor: Colors.ink,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {g.done && (
                <Text style={{ fontFamily: Colors.font.stencil, fontSize: 16, color: Colors.red, lineHeight: 16 }}>
                  ✗
                </Text>
              )}
            </View>
            <Text
              style={{
                flex: 1,
                fontFamily: Colors.font.serif,
                fontSize: 19,
                color: Colors.ink,
                lineHeight: 22,
                letterSpacing: -0.3,
                textDecorationLine: g.done ? 'line-through' : 'none',
              }}
            >
              {g.label}
            </Text>
            <Text style={{ fontFamily: Colors.font.mono, fontSize: 9, letterSpacing: 1.5, color: Colors.muted }}>
              {g.tag}
            </Text>
          </View>
        ))}
      </View>

      {/* Eating window */}
      {(dailyPlan as any)?.fasting_window && (
        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <FastBar
            open={(dailyPlan as any).fasting_window.open ?? '13:00'}
            close={(dailyPlan as any).fasting_window.close ?? '19:00'}
            nowHour={new Date().getHours() + new Date().getMinutes() / 60}
          />
        </View>
      )}

      {/* Coach line */}
      {dailyPlan?.focus_statement && (
        <View style={{ paddingHorizontal: 20, marginTop: 22 }}>
          <Text style={{ fontFamily: Colors.font.mono, fontSize: 9, letterSpacing: 2, color: Colors.muted }}>
            COACH'S NOTE
          </Text>
          <Text style={{ fontFamily: Colors.font.serif, fontSize: 16, color: Colors.ink, lineHeight: 22, fontStyle: 'italic', marginTop: 4 }}>
            "{dailyPlan.focus_statement}"
          </Text>
        </View>
      )}

      {/* Quick log row */}
      <View style={{ paddingHorizontal: 20, marginTop: 28, borderTopWidth: 1.5, borderTopColor: Colors.ink, paddingTop: 12 }}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <LogButton label="MEAL"    onPress={() => router.push('/log/meal')} />
          <LogButton label="WEIGHT"  onPress={() => router.push('/log/weight')} />
          <LogButton label="WORKOUT" onPress={() => router.push('/log/workout')} />
        </View>
        <Text style={{ fontFamily: Colors.font.mono, fontSize: 9, letterSpacing: 2, color: Colors.muted, marginTop: 10, textAlign: 'center' }}>
          STREAK {adherence?.current_streak ?? 0}D · FLOUR-FREE {adherence?.flour_free_streak ?? 0}D
        </Text>
      </View>
    </ScrollView>
  );
}

function LogButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flex: 1,
        borderWidth: 2,
        borderColor: Colors.ink,
        paddingVertical: 12,
        alignItems: 'center',
      }}
    >
      <Text style={{ fontFamily: Colors.font.stencil, fontSize: 16, letterSpacing: 3, color: Colors.ink }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function greeting(name: string, recovery: boolean) {
  if (recovery) return `Yesterday was heavy, ${name}. Today, we protect tomorrow.`;
  const h = new Date().getHours();
  if (h < 12)  return `Good morning, ${name}. One steady move at a time.`;
  if (h < 17)  return `Afternoon check, ${name}. Stay with the plan.`;
  return `Wind it down, ${name}. Tomorrow starts at lights-out.`;
}

function formatTime(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
