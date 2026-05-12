// components/v2/SectionHead.tsx
// Stencil-cap heading + bottom rule + optional right-aligned tag.

import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  title: string;
  meta?: string;                     // small mono caption on the right
  size?: 'sm' | 'md' | 'lg';
}

export function SectionHead({ title, meta, size = 'md' }: Props) {
  const stencilSize = size === 'lg' ? 26 : size === 'sm' ? 14 : 18;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        borderBottomWidth: 1.5,
        borderBottomColor: Colors.ink,
        paddingBottom: 4,
        marginBottom: 4,
      }}
    >
      <Text style={{ fontFamily: Colors.font.stencil, fontSize: stencilSize, letterSpacing: 3, color: Colors.ink }}>
        {title.toUpperCase()}
      </Text>
      {meta && (
        <Text style={{ fontFamily: Colors.font.mono, fontSize: 8.5, letterSpacing: 1.5, color: Colors.muted }}>
          {meta}
        </Text>
      )}
    </View>
  );
}
