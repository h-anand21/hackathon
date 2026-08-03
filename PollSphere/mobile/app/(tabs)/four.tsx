import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { setAuthToken } from '../../utils/api';
import {
  Settings,
  LogOut,
  Moon,
  Sun,
  User,
  Mail,
  Shield,
  Info,
  ChevronRight
} from 'lucide-react-native';

const SettingsIcon = Settings as any;
const LogOutIcon = LogOut as any;
const MoonIcon = Moon as any;
const SunIcon = Sun as any;
const UserIcon = User as any;
const MailIcon = Mail as any;
const ShieldIcon = Shield as any;
const InfoIcon = Info as any;
const ChevronIcon = ChevronRight as any;

export default function SettingsScreen() {
  const { signOut, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { isDark, toggleTheme, colors, mode } = useTheme();

  const displayName = user?.fullName || user?.firstName || 'HIMANSHU ANAND';
  const email = user?.primaryEmailAddress?.emailAddress || 'himanshuanand563@gmail.com';

  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'HA';

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of PollSphere?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            setAuthToken(null);
            router.replace('/login');
          },
        },
      ]
    );
  };

  // Dynamic theme colors
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const cardBorder = isDark ? '#27272A' : '#09090b';
  const textColor = isDark ? '#FFFFFF' : '#09090b';
  const subTextColor = isDark ? '#A1A1AA' : '#6B7280';
  const iconBg = isDark ? '#09090b' : '#F4F4F5';
  const brandAccent = isDark ? '#FFCC00' : '#009689';

  const dangerCardBg = isDark ? '#18181B' : '#FFFFFF';
  const dangerIconBg = isDark ? '#451A1A' : '#FEE2E2';
  const dangerTitleColor = isDark ? '#EF4444' : '#DC2626';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: textColor }]}>SETTINGS</Text>
            <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
              Manage your account and app preferences
            </Text>
          </View>
          <View style={[styles.gearIconBadge, { backgroundColor: brandAccent }]}>
            <SettingsIcon size={20} color={isDark ? '#09090b' : '#FFFFFF'} strokeWidth={2.5} />
          </View>
        </View>

        {/* Profile Card */}
        {userId ? (
          <View style={[styles.profileCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={[styles.avatarYellowCircle, { backgroundColor: brandAccent }]}>
              <Text style={[styles.avatarInitialsText, { color: isDark ? '#09090b' : '#FFFFFF' }]}>{initials}</Text>
            </View>

            <View style={styles.profileDetailsCol}>
              <Text style={[styles.profileNameText, { color: textColor }]}>
                {displayName}
              </Text>
              <Text style={[styles.profileEmailText, { color: subTextColor }]} numberOfLines={1}>
                {email}
              </Text>
              <View style={[styles.creatorBadgePill, { borderColor: brandAccent, backgroundColor: brandAccent + '20' }]}>
                <Text style={[styles.creatorBadgeText, { color: brandAccent }]}>CREATOR ACCOUNT</Text>
              </View>
            </View>

            <ChevronIcon size={20} color={subTextColor} />
          </View>
        ) : (
          <View style={[styles.profileCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={[styles.avatarYellowCircle, { backgroundColor: '#E4E4E7' }]}>
              <UserIcon size={28} color="#09090b" />
            </View>
            <View style={styles.profileDetailsCol}>
              <Text style={[styles.profileNameText, { color: textColor }]}>Guest User</Text>
              <Text style={[styles.profileEmailText, { color: subTextColor }]}>Not signed in</Text>
              <Pressable
                onPress={() => router.replace('/login')}
                style={[styles.signInPillBtn, { backgroundColor: brandAccent }]}
              >
                <Text style={[styles.signInPillText, { color: isDark ? '#09090b' : '#FFFFFF' }]}>Sign In / Register</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Section 1: APPEARANCE */}
        <Text style={[styles.sectionCategoryTitle, { color: brandAccent }]}>APPEARANCE</Text>
        <View style={[styles.settingCardGroup, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.settingItemRow}>
            <View style={[styles.itemIconBox, { backgroundColor: iconBg }]}>
              {isDark ? (
                <MoonIcon size={20} color="#FFCC00" strokeWidth={2.5} />
              ) : (
                <SunIcon size={20} color="#009689" strokeWidth={2.5} />
              )}
            </View>
            <View style={styles.itemTextCol}>
              <Text style={[styles.itemTitleText, { color: textColor }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text style={[styles.itemSubText, { color: subTextColor }]}>
                Currently: {isDark ? '🌙 Dark' : '☀️ Light'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: '#D4D4D8', true: brandAccent }}
              thumbColor={isDark ? '#09090b' : '#FFFFFF'}
            />
          </View>
        </View>

        {/* Section 2: ACCOUNT */}
        {userId && (
          <>
            <Text style={[styles.sectionCategoryTitle, { color: brandAccent }]}>ACCOUNT</Text>
            <View style={[styles.settingCardGroup, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              {/* Display Name */}
              <Pressable
                onPress={() => Alert.alert('Profile', 'Edit profile via PollSphere account management.')}
                style={styles.settingItemRow}
              >
                <View style={[styles.itemIconBox, { backgroundColor: iconBg }]}>
                  <UserIcon size={20} color={brandAccent} />
                </View>
                <View style={styles.itemTextCol}>
                  <Text style={[styles.itemTitleText, { color: textColor }]}>Display Name</Text>
                  <Text style={[styles.itemSubText, { color: subTextColor }]}>{displayName}</Text>
                </View>
                <ChevronIcon size={18} color={subTextColor} />
              </Pressable>

              <View style={[styles.itemDividerLine, { backgroundColor: cardBorder }]} />

              {/* Email Address */}
              <View style={styles.settingItemRow}>
                <View style={[styles.itemIconBox, { backgroundColor: iconBg }]}>
                  <MailIcon size={20} color={brandAccent} />
                </View>
                <View style={styles.itemTextCol}>
                  <Text style={[styles.itemTitleText, { color: textColor }]}>Email Address</Text>
                  <Text style={[styles.itemSubText, { color: subTextColor }]} numberOfLines={1}>
                    {email}
                  </Text>
                </View>
                <ChevronIcon size={18} color={subTextColor} />
              </View>

              <View style={[styles.itemDividerLine, { backgroundColor: cardBorder }]} />

              {/* Security */}
              <Pressable
                onPress={() => Alert.alert('Security', 'Manage password and 2FA in account settings.')}
                style={styles.settingItemRow}
              >
                <View style={[styles.itemIconBox, { backgroundColor: iconBg }]}>
                  <ShieldIcon size={20} color={brandAccent} />
                </View>
                <View style={styles.itemTextCol}>
                  <Text style={[styles.itemTitleText, { color: textColor }]}>Security</Text>
                  <Text style={[styles.itemSubText, { color: subTextColor }]}>Manage password & 2FA</Text>
                </View>
                <ChevronIcon size={18} color={subTextColor} />
              </Pressable>
            </View>
          </>
        )}

        {/* Section 3: ABOUT */}
        <Text style={[styles.sectionCategoryTitle, { color: brandAccent }]}>ABOUT</Text>
        <View style={[styles.settingCardGroup, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <View style={styles.settingItemRow}>
            <View style={[styles.itemIconBox, { backgroundColor: iconBg }]}>
              <InfoIcon size={20} color={brandAccent} />
            </View>
            <View style={styles.itemTextCol}>
              <Text style={[styles.itemTitleText, { color: textColor }]}>App Version</Text>
              <Text style={[styles.itemSubText, { color: subTextColor }]}>PollSphere v1.0.0</Text>
            </View>
            <View style={[styles.versionBadgePill, { borderColor: brandAccent }]}>
              <Text style={[styles.versionBadgeText, { color: brandAccent }]}>v1.0.0</Text>
            </View>
            <ChevronIcon size={18} color={subTextColor} />
          </View>
        </View>

        {/* Section 4: DANGER ZONE */}
        {userId && (
          <>
            <Text style={styles.dangerSectionTitle}>DANGER ZONE</Text>
            <View style={[styles.settingCardGroup, styles.dangerCardBorder, { backgroundColor: dangerCardBg }]}>
              <Pressable onPress={handleLogout} style={styles.settingItemRow}>
                <View style={[styles.itemIconBox, { backgroundColor: dangerIconBg, borderColor: '#EF4444' }]}>
                  <LogOutIcon size={20} color="#EF4444" />
                </View>
                <View style={styles.itemTextCol}>
                  <Text style={[styles.dangerItemTitleText, { color: dangerTitleColor }]}>Sign Out</Text>
                  <Text style={[styles.itemSubText, { color: subTextColor }]}>
                    You will be returned to the login screen
                  </Text>
                </View>
                <ChevronIcon size={18} color="#EF4444" />
              </Pressable>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 110,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 28,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    marginTop: 2,
  },
  gearIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFCC00',
    borderWidth: 2,
    borderColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 3,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  avatarYellowCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFCC00',
    borderWidth: 2.5,
    borderColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarInitialsText: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '900',
    color: '#09090b',
  },
  profileDetailsCol: {
    flex: 1,
  },
  profileNameText: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  profileEmailText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    marginTop: 2,
  },
  creatorBadgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFCC00',
    backgroundColor: '#FFCC0015',
    marginTop: 8,
  },
  creatorBadgeText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    color: '#FFCC00',
  },
  signInPillBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FFCC00',
    marginTop: 8,
  },
  signInPillText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    color: '#09090b',
  },
  sectionCategoryTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFCC00',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  settingCardGroup: {
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 0,
    elevation: 3,
  },
  settingItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 12,
  },
  itemIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#3F3F46',
  },
  itemTextCol: {
    flex: 1,
  },
  itemTitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
  },
  itemSubText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    marginTop: 2,
  },
  itemDividerLine: {
    height: 1.5,
  },
  versionBadgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#FFCC00',
    marginRight: 6,
  },
  versionBadgeText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    color: '#FFCC00',
  },
  dangerSectionTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#EF4444',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  dangerCardBorder: {
    borderColor: '#EF4444',
  },
  dangerItemTitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
    color: '#EF4444',
  },
});
