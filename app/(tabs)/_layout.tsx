import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { Colors } from '../../constants/colors';

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text
      style={{
        fontFamily: Colors.font.stencil,
        fontSize: 11,
        letterSpacing: 1.5,
        color: focused ? Colors.ink : Colors.muted,
      }}
    >
      {label}
    </Text>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.paper,
          borderTopWidth: 1.5,
          borderTopColor: Colors.ink,
          height: 56,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: Colors.ink,
        tabBarInactiveTintColor: Colors.muted,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="TODAY" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="PLAN" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="LOG" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="ME" focused={focused} />,
        }}
      />
    </Tabs>
  );
}
