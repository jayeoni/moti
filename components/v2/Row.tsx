import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  k: string;
  v: string;
  delta?: string;
  warn?: boolean;
  last?: boolean;
}

export function Row({ k, v, delta, warn = false, last = false }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        paddingVertical: 6,
        borderBottomWidth: last ? 0 : 0.5,
        borderBottomColor: Colors.faint,
      }}
    >
      <Text
        style={{
          fontFamily: Colors.font.mono,
          fontSize: 9,
          letterSpacing: 1,
          color: Colors.muted,
          textTransform: 'uppercase',
        }}
      >
        {k}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
        <Text
          style={{
            fontFamily: Colors.font.mono,
            fontSize: 11,
            color: warn ? Colors.red : Colors.ink,
            fontWeight: warn ? 'bold' : 'normal',
          }}
        >
          {v}
        </Text>
        {delta != null && (
          <Text
            style={{
              fontFamily: Colors.font.mono,
              fontSize: 9,
              color: warn ? Colors.red : Colors.muted,
            }}
          >
            {delta}
          </Text>
        )}
      </View>
    </View>
  );
}
