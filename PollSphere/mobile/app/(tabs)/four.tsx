import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Switch,
  Pressable,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useTheme } from '../../contexts/ThemeContext';
import { setAuthToken } from '../../utils/api';
import {
  LogOut,
  Moon,
  Sun,
  User,
  Mail,
  Shield,
  Info,
  ChevronRight,
  Bell,
} from 'lucide-react-native';

const LogOutIcon = LogOut as any;
const MoonIcon = Moon as any;
const SunIcon = Sun as any;
const UserIcon = User as any;
const MailIcon = Mail as any;
const ShieldIcon = Shield as any;
const InfoIcon = Info as any;
const ChevronIcon = ChevronRight as any;
const BellIcon = Bell as any;

function AvatarCircle({ name, email, isDark, colors }: any) {
  const initials = name
    ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : email
    ? email[0].toUpperCase()
    : '?';

  return (
    <View style={[styles.avatarCircle, { backgroundColor: colors.primary, borderColor: colors.border }]}>
      <Text style={[styles.avatarInitials, { color: colors.primaryForeground }]}>{initials}</Text>
    </View>
  );
}

function SettingRow({
  icon,
  label,
  sublabel,
  rightNode,
  onPress,
  colors,
  destructive = false,
}: any) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          opacity: pressed ? 0.75 : 1,
        },
      ]}
    >
      <View style={[styles.settingIcon, { backgroundColor: destructive ? colors.destructive + '22' : colors.muted }]}>
        {React.cloneElement(icon, { size: 18, color: destructive ? colors.destructive : colors.primary })}
      </View>
      <View style={styles.settingLabelCol}>
        <Text style={[styles.settingLabel, { color: destructive ? colors.destructive : colors.foreground }]}>
          {label}
        </Text>
        {sublabel ? (
          <Text style={[styles.settingSubLabel, { color: colors.mutedForeground }]}>{sublabel}</Text>
        ) : null}
      </View>
      {rightNode ?? <ChevronIcon size={16} color={colors.mutedForeground} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { signOut, userId } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { isDark, toggleTheme, colors, mode } = useTheme();

  const displayName = user?.fullName || user?.firstName || null;
  const email = user?.primaryEmailAddress?.emailAddress || null;

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

  const bg = colors.background;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bg }]} edges={['top', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scroll, { backgroundColor: bg }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.foreground }]}>Settings</Text>
          <Text style={[styles.pageSubtitle, { color: colors.mutedForeground }]}>
            Account & Preferences
          </Text>
        </View>

        {/* Profile Card */}
        {userId ? (
          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
            <AvatarCircle name={displayName} email={email} isDark={isDark} colors={colors} />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>
                {displayName ?? 'PollSphere User'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>
                {email ?? 'No email on record'}
              </Text>
              <View style={[styles.badge, { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}>
                <Text style={[styles.badgeText, { color: colors.primary }]}>CREATOR ACCOUNT</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <UserIcon size={32} color={colors.mutedForeground} />
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.foreground }]}>Guest User</Text>
              <Text style={[styles.profileEmail, { color: colors.mutedForeground }]}>Not signed in</Text>
              <Pressable
                style={[styles.signInBtn, { backgroundColor: colors.primary }]}
                onPress={() => router.replace('/login')}
              >
                <Text style={[styles.signInBtnText, { color: colors.primaryForeground }]}>
                  Sign In / Register
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Appearance */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>APPEARANCE</Text>
        <View style={[styles.section, { borderColor: colors.border, shadowColor: colors.shadow }]}>
          <View style={[styles.settingRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.settingIcon, { backgroundColor: colors.muted }]}>
              {isDark ? (
                <MoonIcon size={18} color={colors.primary} />
              ) : (
                <SunIcon size={18} color={colors.accent} />
              )}
            </View>
            <View style={styles.settingLabelCol}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text style={[styles.settingSubLabel, { color: colors.mutedForeground }]}>
                Currently: {mode === 'dark' ? '🌑 Dark' : '☀️ Light'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor={isDark ? colors.primaryForeground : colors.foreground}
            />
          </View>
        </View>

        {/* Account */}
        {userId && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ACCOUNT</Text>
            <View style={[styles.section, { borderColor: colors.border, shadowColor: colors.shadow }]}>
              <SettingRow
                icon={<UserIcon />}
                label="Display Name"
                sublabel={displayName ?? 'Not set'}
                colors={colors}
                onPress={() => Alert.alert('Profile', 'Edit profile via the PollSphere web dashboard.')}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow
                icon={<MailIcon />}
                label="Email Address"
                sublabel={email ?? 'Not set'}
                colors={colors}
                onPress={() => {}}
              />
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <SettingRow
                icon={<ShieldIcon />}
                label="Security"
                sublabel="Manage password & 2FA"
                colors={colors}
                onPress={() => Alert.alert('Security', 'Manage your security settings via the PollSphere web dashboard.')}
              />
            </View>
          </>
        )}

        {/* App Info */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ABOUT</Text>
        <View style={[styles.section, { borderColor: colors.border, shadowColor: colors.shadow }]}>
          <SettingRow
            icon={<InfoIcon />}
            label="App Version"
            sublabel="PollSphere v1.0.0"
            colors={colors}
            onPress={() => {}}
            rightNode={<Text style={[styles.versionText, { color: colors.mutedForeground }]}>v1.0.0</Text>}
          />
        </View>

        {/* Danger Zone */}
        {userId && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.destructive }]}>DANGER ZONE</Text>
            <View style={[styles.section, { borderColor: colors.destructive, shadowColor: colors.destructive }]}>
              <SettingRow
                icon={<LogOutIcon />}
                label="Sign Out"
                sublabel="You will be returned to the login screen"
                colors={colors}
                destructive
                onPress={handleLogout}
                rightNode={null}
              />
            </View>
          </>
        )}

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.mutedForeground }]}>
            PollSphere · Real-time polling platform
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  pageHeader: { marginTop: 16, marginBottom: 20 },
  pageTitle: {
    fontSize: 28,
    fontFamily: 'SpaceMono',
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  pageSubtitle: { fontSize: 13, marginTop: 4 },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderWidth: 2,
    borderRadius: 0,
    marginBottom: 28,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  avatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarInitials: {
    fontSize: 24,
    fontFamily: 'SpaceMono',
    fontWeight: '900',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 17,
    fontFamily: 'SpaceMono',
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  profileEmail: { fontSize: 12, marginTop: 2 },
  badge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 8,
  },
  badgeText: { fontSize: 10, fontFamily: 'SpaceMono', fontWeight: '900' },
  signInBtn: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
  },
  signInBtnText: { fontSize: 12, fontFamily: 'SpaceMono', fontWeight: '900' },

  // Section
  sectionLabel: {
    fontSize: 11,
    fontFamily: 'SpaceMono',
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
    marginTop: 4,
  },
  section: {
    borderWidth: 2,
    marginBottom: 24,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  divider: { height: 1 },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 14,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingLabelCol: { flex: 1 },
  settingLabel: { fontSize: 14, fontFamily: 'SpaceMono', fontWeight: '700' },
  settingSubLabel: { fontSize: 11, marginTop: 2 },
  versionText: { fontSize: 12 },

  footer: { alignItems: 'center', paddingTop: 8 },
  footerText: { fontSize: 11 },
});
