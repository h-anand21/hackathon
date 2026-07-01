import { Tabs } from 'expo-router';
import { BarChart3, PlusSquare, CheckSquare, Settings } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const BarChart3Icon = BarChart3 as any;
const PlusSquareIcon = PlusSquare as any;
const CheckSquareIcon = CheckSquare as any;
const SettingsIcon = Settings as any;

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopWidth: 2,
          borderTopColor: colors.tabBarBorder,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Polls',
          tabBarIcon: ({ color }) => <BarChart3Icon size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="three"
        options={{
          title: 'Vote',
          tabBarIcon: ({ color }) => <CheckSquareIcon size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Create',
          tabBarIcon: ({ color }) => <PlusSquareIcon size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="four"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SettingsIcon size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
