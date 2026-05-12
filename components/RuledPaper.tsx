// components/v2/RuledPaper.tsx
// Paper-colored wrapper with faint horizontal rules every 24px (RN can't
// render repeating-linear-gradient, so we draw the lines as absolutely-
// positioned Views).

import { View, ViewStyle } from 'react-native';
import { ReactNode, useMemo } from 'react';
import { Colors } from '../../constants/colors';

interface Props {
  children: ReactNode;
  spacing?: number;          // px between rules
  style?: ViewStyle;
}

export function RuledPaper({ children, spacing = 24, style }: Props) {
  // Up to 120 rules — enough for any reasonable scrollable view
  const lines = useMemo(() => Array.from({ length: 120 }, (_, i) => i), []);
  return (
    <View style={[{ flex: 1, backgroundColor: Colors.paper, position: 'relative' }, style]}>
      <View pointerEvents="none" style={{ position: 'absolute', inset: 0 }}>
        {lines.map((i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: i * spacing,
              height: 1,
              backgroundColor: Colors.faint,
            }}
          />
        ))}
      </View>
      {children}
    </View>
  );
}
