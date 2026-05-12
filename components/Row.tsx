// components/v2/Row.tsx
// Mono key + bold value + optional warning delta. The base unit of any
// V2 data table (condition vitals, weight, macros, etc.)

import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  k: string;             // label, lowercase
  v: string;             // value, e.g. "64.2 kg"
  delta?: string;        // optional context, e.g. "↓ 0.3" or "below avg"
  warn?: boolean;        // delta drawn in red
  last?: boolean;        // suppress bottom border
}

export function Row({ k, v, delta, warn, last }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        paddingVertical: 6,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: Colors.faint,
      }}
    >
      <Text style={{ fontFamily: Colors.font.mono, fontSize: 10, letterSpacing: 1, color: Colors.muted }}>
        {k}
      </Text>
      <View style={{ flexDirection: 'row', gap: 6, alignItems: 'baseline' }}>
        {delta && (
          <Text
            style={{
              fontFamily: Colors.font.mono,
              fontSize: 9,
              color: warn ? Colors.red : Colors.muted,
              fontWeight: warn ? '700' : '400',
            }}
          >
            {delta}
          </Text>
        )}
        <Text style={{ fontFamily: Colors.font.mono, fontSize: 11.5, color: Colors.ink, fontWeight: '600' }}>
          {v}
        </Text>
      </View>
    </View>
  );
}
