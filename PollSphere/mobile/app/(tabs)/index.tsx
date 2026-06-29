import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  FlatList, 
  ActivityIndicator, 
  SafeAreaView, 
  Platform,
  RefreshControl,
  Share,
  Alert
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { BrutalCard, BrutalButton, BrutalInput } from '../../components/Brutal';
import { Colors } from '../../constants/Theme';
import { api, setAuthToken } from '../../utils/api';
import { Search, LogOut, Plus, RefreshCw, BarChart2 } from 'lucide-react-native';

export default function DashboardScreen() {
  const { isLoaded, userId, getToken, signOut } = useAuth();
  const router = useRouter();

  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Search state for guest/direct voting
  const [searchPollId, setSearchPollId] = useState('');

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
      const token = await getToken();
      setAuthToken(token);

      const res = await api.get('/polls');
      if (res.data.success) {
        setPolls(res.data.polls || []);
      }
    } catch (err: any) {
      console.error(err);
      setError('Failed to load polls. Pull to refresh.');
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

  const handleSearchPoll = () => {
    if (!searchPollId.trim()) {
      Alert.alert('Error', 'Please enter a valid Poll ID/Code');
      return;
    }
    // Route directly to voting page
    router.push(`/poll/${searchPollId.trim()}`);
  };

  const handleShare = async (pollId: string, title: string) => {
    try {
      await Share.share({
        message: `Vote on this Poll: "${title}"\nLink: http://localhost:5173/poll/slug/${pollId}`,
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* App Title & Logout (if logged in) */}
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          {userId ? (
            <PressableIcon icon={LogOut} onPress={handleLogout} />
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

        {/* Guest Search bar */}
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

        {/* User's Polls Title */}
        {userId && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Poll Campaigns</Text>
            <PressableIcon icon={RefreshCw} onPress={() => fetchPolls(true)} />
          </View>
        )}

        {/* Dynamic Polls list */}
        {!userId ? (
          <View style={styles.guestInfoContainer}>
            <BarChart2 size={64} color={Colors.mutedForeground} />
            <Text style={styles.guestInfoText}>
              You are currently browsing as a Guest. Sign in to create your own live polling rooms!
            </Text>
            <BrutalButton
              title="Get Creator Account"
              variant="primary"
              onPress={() => router.replace('/login')}
            />
          </View>
        ) : loading ? (
          <ActivityIndicator size="large" color={Colors.primary} style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : polls.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No polls created yet.</Text>
            <BrutalButton
              title="Create First Poll"
              variant="primary"
              onPress={() => router.push('/(tabs)/two')} // Tab two is creation page
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
                tintColor="#ffffff"
              />
            }
            renderItem={({ item }) => {
              return (
                <BrutalCard variant="default" style={styles.pollCard}>
                  <View style={styles.badgeRow}>
                    <Text style={[
                      styles.statusBadge,
                      item.status === 'published' && styles.publishedBadge,
                      item.status === 'active' && styles.activeBadge,
                      item.status === 'draft' && styles.draftBadge
                    ]}>
                      {item.status}
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                  </View>

                  <Text style={styles.pollTitle}>{item.title}</Text>
                  {item.description ? (
                    <Text style={styles.pollDesc} numberOfLines={2}>
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
const PressableIcon = ({ icon: Icon, onPress }: { icon: any, onPress: () => void }) => (
  <View style={styles.iconContainer}>
    <Icon size={20} color="#ffffff" onPress={onPress} />
  </View>
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
