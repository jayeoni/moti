// components/v2/FastBar.tsx
// Horizontal eating-window timeline with NOW marker.

import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  open: string;        // "13:00"
  close: string;       // "19:00"
  startHour?: number;  // first tick (default 7)
  endHour?: number;    // last tick (default 19)
  nowHour?: number;    // float, e.g. 11.5
}

export function FastBar({ open, close, startHour = 7, endHour = 19, nowHour = 11.5 }: Props) {
  const span = endHour - startHour;
  const openHr  = parseInt(open.split(':')[0]) + parseInt(open.split(':')[1]) / 60;
  const closeHr = parseInt(close.split(':')[0]) + parseInt(close.split(':')[1]) / 60;
  const eatLeft  = ((openHr - startHour) / span) * 100;
  const eatWidth = ((closeHr - openHr) / span) * 100;
  const nowLeft  = ((nowHour - startHour) / span) * 100;

  const ticks = Array.from({ length: span + 1 }, (_, i) => startHour + i);

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <Text style={{ fontFamily: Colors.font.stencil, fontSize: 18, letterSpacing: 3, color: Colors.ink }}>
          EATING WINDOW
        </Text>
        <Text style={{ fontFamily: Colors.font.mono, fontSize: 10, color: Colors.ink }}>
          {open} · {close}
        </Text>
      </View>

      <View style={{ position: 'relative', height: 26, marginTop: 6 }}>
        {/* baseline */}
        <View style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 2, backgroundColor: Colors.ink, marginTop: -1 }} />

        {/* eating window bar */}
        <View
          style={{
            position: 'absolute',
            left: `${eatLeft}%`,
            width: `${eatWidth}%`,
            top: 8,
            bottom: 8,
            backgroundColor: Colors.red,
            opacity: 0.9,
          }}
        />

        {/* hour ticks */}
        {ticks.map((h, i) => (
          <View
            key={h}
            style={{
              position: 'absolute',
              left: `${(i / span) * 100}%`,
              top: '50%',
              width: 1,
              height: 8,
              backgroundColor: Colors.ink,
              marginLeft: -0.5,
              marginTop: -4,
            }}
          />
        ))}

        {/* NOW marker */}
        <View style={{ position: 'absolute', left: `${nowLeft}%`, top: -4, bottom: -4 }}>
          <View style={{ width: 2, height: '100%', backgroundColor: Colors.ink, marginLeft: -1 }} />
          <Text style={{ position: 'absolute', top: -14, left: -10, fontFamily: Colors.font.mono, fontSize: 8, fontWeight: '700', letterSpacing: 1, color: Colors.ink }}>
            NOW
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
        {[startHour, startHour + Math.floor(span / 4), startHour + Math.floor(span / 2), startHour + Math.floor(3 * span / 4), endHour].map((h, i) => (
          <Text key={i} style={{ fontFamily: Colors.font.mono, fontSize: 8.5, color: Colors.muted }}>
            {h <= 12 ? `${h}am` : `${h - 12}pm`}
          </Text>
        ))}
      </View>
    </View>
  );
}
