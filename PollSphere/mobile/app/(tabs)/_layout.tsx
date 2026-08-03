import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Home, CheckSquare, Plus, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const HomeIcon = Home as any;
const CheckSquareIcon = CheckSquare as any;
const PlusIcon = Plus as any;
const SettingsIcon = Settings as any;

function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  // Lift floating bar cleanly above Android 3-button OS navigation
  const bottomPosition = Math.max(insets.bottom + 8, Platform.OS === 'android' ? 20 : 16);

  return (
    <View style={[tabStyles.floatingContainer, { bottom: bottomPosition }]}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (route.name === 'two') {
          // Central "+ Create" floating black button
          return (
            <Pressable key={route.key} onPress={onPress} style={tabStyles.createTabItem}>
              <View style={tabStyles.createCircle}>
                <PlusIcon size={26} color="#FFFFFF" strokeWidth={3} />
              </View>
              <Text style={tabStyles.createLabel}>Create</Text>
            </Pressable>
          );
        }

        let IconComponent = HomeIcon;
        let label = 'Dashboard';
        if (route.name === 'three') {
          IconComponent = CheckSquareIcon;
          label = 'Vote';
        } else if (route.name === 'four') {
          IconComponent = SettingsIcon;
          label = 'Settings';
        }

        return (
          <Pressable key={route.key} onPress={onPress} style={tabStyles.tabItem}>
            <IconComponent size={22} color="#09090b" strokeWidth={isFocused ? 2.5 : 2} />
            <Text style={[tabStyles.tabLabel, isFocused && tabStyles.tabLabelActive]}>
              {label}
            </Text>
            {isFocused && <View style={tabStyles.activeDot} />}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Dashboard' }} />
      <Tabs.Screen name="three" options={{ title: 'Vote' }} />
      <Tabs.Screen name="two" options={{ title: 'Create' }} />
      <Tabs.Screen name="four" options={{ title: 'Settings' }} />
    </Tabs>
  );
}

const tabStyles = StyleSheet.create({
  floatingContainer: {
    position: 'absolute',
    left: 16,
    right: 16,
    flexDirection: 'row',
    backgroundColor: '#FFCC00',
    borderRadius: 32,
    height: 64,
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
    color: '#09090b',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '900',
  },
  activeDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#09090b',
    marginTop: 2,
  },
  createTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -20,
  },
  createCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFCC00',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 6,
  },
  createLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    color: '#09090b',
    marginTop: 2,
  },
});
