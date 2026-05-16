import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  open: string;   // e.g. "13:00"
  close: string;  // e.g. "19:00"
  nowHour: number; // e.g. 14.5
}

function toHour(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h + m / 60;
}

export function FastBar({ open, close, nowHour }: Props) {
  const openH = toHour(open);
  const closeH = toHour(close);
  const windowLen = closeH - openH;
  const isOpen = nowHour >= openH && nowHour <= closeH;
  const nowPct = Math.min(1, Math.max(0, (nowHour - openH) / windowLen));

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text style={{ fontFamily: Colors.font.mono, fontSize: 9, letterSpacing: 2, color: Colors.muted }}>
          EATING WINDOW
        </Text>
        <Text style={{ fontFamily: Colors.font.mono, fontSize: 9, letterSpacing: 1, color: isOpen ? Colors.ink : Colors.muted }}>
          {isOpen ? 'OPEN' : 'CLOSED'}
        </Text>
      </View>
      <View style={{ height: 6, backgroundColor: Colors.faint, position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            height: 6,
            width: `${nowPct * 100}%`,
            backgroundColor: isOpen ? Colors.ink : Colors.muted,
          }}
        />
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
        <Text style={{ fontFamily: Colors.font.mono, fontSize: 8, color: Colors.muted }}>{open}</Text>
        <Text style={{ fontFamily: Colors.font.mono, fontSize: 8, color: Colors.muted }}>{close}</Text>
      </View>
    </View>
  );
}
