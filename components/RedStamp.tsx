// components/v2/RedStamp.tsx
// Rotated red-bordered stencil label. The V2 "exclamation point".

import { View, Text, ViewStyle } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  children: string;
  rotate?: number;       // degrees
  filled?: boolean;      // solid red bg, paper text
  style?: ViewStyle;
}

export function RedStamp({ children, rotate = -4, filled = false, style }: Props) {
  return (
    <View
      style={[
        {
          alignSelf: 'flex-start',
          borderWidth: 2,
          borderColor: Colors.red,
          backgroundColor: filled ? Colors.red : 'transparent',
          paddingHorizontal: 10,
          paddingTop: 6,
          paddingBottom: 4,
          transform: [{ rotate: `${rotate}deg` }],
        },
        style,
      ]}
    >
      <Text
        style={{
          fontFamily: Colors.font.stencil,
          fontSize: 14,
          letterSpacing: 3,
          color: filled ? Colors.paper : Colors.red,
          lineHeight: 14,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
