import { Text, View } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  children: string;
  rotate?: number;
}

export function RedStamp({ children, rotate = -6 }: Props) {
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: Colors.red,
        paddingHorizontal: 6,
        paddingVertical: 2,
        transform: [{ rotate: `${rotate}deg` }],
      }}
    >
      <Text
        style={{
          fontFamily: Colors.font.stencil,
          fontSize: 13,
          letterSpacing: 3,
          color: Colors.red,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
