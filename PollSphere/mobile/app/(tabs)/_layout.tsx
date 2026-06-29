import { Link, Tabs } from 'expo-router';
import { Platform, Pressable, View } from 'react-native';
import { Colors } from '../../constants/Theme';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { BarChart3, PlusSquare, CheckSquare } from 'lucide-react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: '#09090b',
          borderTopWidth: 2,
          borderTopColor: '#ffffff',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#09090b',
          borderBottomWidth: 2,
          borderBottomColor: '#ffffff',
        },
        headerTitleStyle: {
          color: '#ffffff',
          fontFamily: 'SpaceMono',
          fontWeight: '900',
          textTransform: 'uppercase',
        },
        headerShown: false, // We'll manage headers inside screens for custom styling
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Polls',
          tabBarIcon: ({ color }) => (
            <BarChart3 size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="three"
        options={{
          title: 'Vote',
          tabBarIcon: ({ color }) => (
            <CheckSquare size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => (
            <PlusSquare size={22} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
