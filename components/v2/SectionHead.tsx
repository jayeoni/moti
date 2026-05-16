import { View, Text } from 'react-native';
import { Colors } from '../../constants/colors';

interface Props {
  title: string;
  meta?: string;
}

export function SectionHead({ title, meta }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        borderBottomWidth: 1.5,
        borderBottomColor: Colors.ink,
        paddingBottom: 4,
        marginBottom: 10,
      }}
    >
      <Text
        style={{
          fontFamily: Colors.font.stencil,
          fontSize: 16,
          letterSpacing: 2,
          color: Colors.ink,
        }}
      >
        {title.toUpperCase()}
      </Text>
      {meta && (
        <Text
          style={{
            fontFamily: Colors.font.mono,
            fontSize: 8,
            letterSpacing: 1.5,
            color: Colors.muted,
          }}
        >
          {meta.toUpperCase()}
        </Text>
      )}
    </View>
  );
}
