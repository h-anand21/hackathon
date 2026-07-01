import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  Platform,
  RefreshControl,
  Share,
  Alert,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { BrutalCard, BrutalButton, BrutalInput } from '../../components/Brutal';
import { Colors } from '../../constants/Theme';
import { api, setAuthToken, initTokenGetter } from '../../utils/api';
import { Search, LogOut, Plus, RefreshCw, BarChart2, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const TrashIcon = Trash2 as any;

export default function DashboardScreen() {
  const { isLoaded, userId, getToken, signOut } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Search state for guest/direct voting
  const [searchPollId, setSearchPollId] = useState('');

  // Wire up the axios interceptor with Clerk's getToken so every API
  // request automatically carries a fresh JWT — no manual setAuthToken needed.
  useEffect(() => {
    if (isLoaded && getToken) {
      initTokenGetter(getToken);
    }
  }, [isLoaded, getToken]);

  const fetchPolls = async (isRef = false) => {
    if (!userId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRef) setRefreshing(true);
    else setLoading(true);

    setError('');

    try {
      // Token is now injected automatically by the axios interceptor
      const res = await api.get('/polls');
      if (res.data.success) {
        setPolls(res.data.polls || []);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to load polls. Pull to refresh.';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchPolls();
    }
  }, [isLoaded, userId]);

  const extractPollId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const parts = trimmed.split('/');
      return parts[parts.length - 1] || trimmed;
    }
    return trimmed;
  };

  const handleSearchPoll = () => {
    if (!searchPollId.trim()) {
      Alert.alert('Error', 'Please enter a valid Poll ID/Code or URL');
      return;
    }
    const cleanId = extractPollId(searchPollId);
    router.push(`/poll/${cleanId}`);
  };

  const handleShare = async (pollId: string, title: string) => {
    try {
      const webUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://pollsphere.vercel.app';
      await Share.share({
        message: `Vote on this Poll: "${title}"\nLink: ${webUrl}/poll/slug/${pollId}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setAuthToken(null);
    router.replace('/login');
  };

  const handleDeletePoll = async (pollId: string, title: string) => {
    Alert.alert(
      'Delete Poll Campaign',
      `Are you sure you want to delete "${title}" permanently? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete Permanently', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getToken();
              setAuthToken(token);
              const res = await api.delete(`/polls/${pollId}`);
              if (res.data.success) {
                Alert.alert('Success', 'Campaign deleted successfully.');
                setPolls(prev => prev.filter(p => p._id !== pollId));
              } else {
                Alert.alert('Error', 'Failed to delete poll.');
              }
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'An error occurred while deleting.');
            }
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* App Title & Logout (if logged in) */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>Dashboard</Text>
          {userId ? (
            <PressableIcon icon={LogOut} onPress={handleLogout} color={colors.foreground} bgColor={colors.card} />
          ) : (
            <BrutalButton 
              title="Sign In" 
              variant="accent" 
              onPress={() => router.replace('/login')}
              style={styles.signInButton}
              textStyle={styles.signInButtonText}
            />
          )}
        </View>

        {/* Guest Search bar - ONLY show for guest users */}
        {!userId && (
          <BrutalCard variant="accent" style={styles.searchCard}>
            <Text style={styles.searchTitle}>Join A Poll Room</Text>
            <View style={styles.searchRow}>
              <BrutalInput
                placeholder="Paste Poll ID here..."
                value={searchPollId}
                onChangeText={setSearchPollId}
                style={styles.searchInput}
              />
              <BrutalButton
                title="Go"
                variant="primary"
                onPress={handleSearchPoll}
                style={styles.searchBtn}
              />
            </View>
          </BrutalCard>
        )}

        {/* User's Polls Title */}
        {userId && (
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>My Poll Campaigns</Text>
            <PressableIcon icon={RefreshCw} onPress={() => fetchPolls(true)} color={colors.foreground} bgColor={colors.card} />
          </View>
        )}

        {/* Dynamic Polls list */}
        {!userId ? (
          <View style={styles.guestInfoContainer}>
            <BarChart2 size={64} color={colors.mutedForeground} />
            <Text style={[styles.guestInfoText, { color: colors.mutedForeground }]}>
              You are currently browsing as a Guest. Sign in to create your own live polling rooms!
            </Text>
            <BrutalButton
              title="Get Creator Account"
              variant="primary"
              onPress={() => router.replace('/login')}
            />
          </View>
        ) : loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.destructive }]}>{error}</Text>
          </View>
        ) : polls.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: colors.foreground }]}>No polls created yet.</Text>
            <BrutalButton
              title="Create First Poll"
              variant="primary"
              onPress={() => router.push('/(tabs)/two')}
            />
          </View>
        ) : (
          <FlatList
            data={polls}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchPolls(true)}
                tintColor={colors.foreground}
              />
            }
            renderItem={({ item }) => {
              return (
                <BrutalCard variant="default" style={styles.pollCard}>
                  <View style={styles.badgeRow}>
                    <Text style={[
                      styles.statusBadge,
                      { borderColor: colors.border, color: colors.foreground },
                      item.status === 'published' && styles.publishedBadge,
                      item.status === 'active' && styles.activeBadge,
                      item.status === 'draft' && { backgroundColor: colors.muted, color: colors.mutedForeground, borderColor: colors.muted },
                    ]}>
                      {item.status}
                    </Text>
                    <View style={styles.rightBadgeRow}>
                      <Text style={[styles.dateText, { color: colors.mutedForeground }]}>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </Text>
                      <Pressable 
                        onPress={() => handleDeletePoll(item._id, item.title)}
                        style={({ pressed }) => [
                          styles.deleteIconBtn,
                          pressed && { opacity: 0.6 }
                        ]}
                      >
                        <TrashIcon size={16} color={colors.destructive} />
                      </Pressable>
                    </View>
                  </View>

                  <Text style={[styles.pollTitle, { color: colors.foreground }]}>{item.title}</Text>
                  {item.description ? (
                    <Text style={[styles.pollDesc, { color: colors.mutedForeground }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  ) : null}

                  <View style={styles.cardActions}>
                    <BrutalButton
                      title="Stats"
                      variant="default"
                      onPress={() => router.push(`/analytics/${item._id}`)}
                      style={styles.cardActionBtn}
                      textStyle={styles.cardActionBtnText}
                    />
                    <BrutalButton
                      title="Vote"
                      variant="primary"
                      onPress={() => router.push(`/poll/${item._id}`)}
                      style={styles.cardActionBtn}
                      textStyle={styles.cardActionBtnText}
                    />
                    <BrutalButton
                      title="Share"
                      variant="accent"
                      onPress={() => handleShare(item._id, item.title)}
                      style={styles.cardActionBtn}
                      textStyle={styles.cardActionBtnText}
                    />
                  </View>
                </BrutalCard>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// Icon helper
const PressableIcon = ({ icon: Icon, onPress, color, bgColor }: { icon: any, onPress: () => void, color: string, bgColor: string }) => (
  <Pressable 
    onPress={onPress} 
    style={({ pressed }) => [
      styles.iconContainer,
      { borderColor: color, backgroundColor: bgColor },
      pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] }
    ]}
  >
    <Icon size={20} color={color} />
  </Pressable>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090b',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontFamily: 'SpaceMono',
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  signInButton: {
    marginVertical: 0,
    height: 40,
    justifyContent: 'center',
    paddingVertical: 0,
  },
  signInButtonText: {
    fontSize: 12,
  },
  searchCard: {
    marginVertical: 0,
    marginBottom: 24,
  },
  searchTitle: {
    color: '#09090b',
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#ffffff',
    color: '#09090b',
    borderColor: '#09090b',
    height: 48,
    marginVertical: 0,
  },
  searchBtn: {
    marginVertical: 0,
    height: 48,
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  pollCard: {
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  rightBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteIconBtn: {
    marginLeft: 6,
    padding: 4,
  },
  statusBadge: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    borderWidth: 1.5,
    borderColor: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    color: '#ffffff',
  },
  publishedBadge: {
    backgroundColor: Colors.success,
    color: '#09090b',
    borderColor: '#09090b',
  },
  activeBadge: {
    backgroundColor: Colors.accent,
    color: '#09090b',
    borderColor: '#09090b',
  },
  draftBadge: {
    backgroundColor: '#3f3f46',
  },
  dateText: {
    color: Colors.mutedForeground,
    fontFamily: 'SpaceMono',
    fontSize: 10,
  },
  pollTitle: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  pollDesc: {
    color: Colors.mutedForeground,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  cardActionBtn: {
    flex: 1,
    marginVertical: 0,
  },
  cardActionBtnText: {
    fontSize: 12,
  },
  loader: {
    marginTop: 40,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  errorText: {
    color: Colors.destructive,
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
    gap: 16,
  },
  emptyText: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
  },
  guestInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginTop: 20,
    gap: 20,
  },
  guestInfoText: {
    color: Colors.mutedForeground,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
    fontSize: 14,
    lineHeight: 22,
  },
  iconContainer: {
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 8,
    padding: 6,
    backgroundColor: '#18181b',
  },
});
