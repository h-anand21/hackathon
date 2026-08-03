import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter, useFocusEffect } from 'expo-router';
import { BrutalButton, BrutalCard } from '../../components/Brutal';
import { api, setAuthToken, initTokenGetter } from '../../utils/api';
import { socket } from '../../utils/socket';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  Play, 
  Zap, 
  ChevronRight,
  RefreshCw,
  Lock
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const BarChart3Icon = BarChart3 as any;
const TrendingUpIcon = TrendingUp as any;
const UsersIcon = Users as any;
const HelpCircleIcon = HelpCircle as any;
const ClockIcon = Clock as any;
const CheckCircle2Icon = CheckCircle2 as any;
const PlayIcon = Play as any;
const ZapIcon = Zap as any;
const ChevronRightIcon = ChevronRight as any;
const RefreshCwIcon = RefreshCw as any;
const LockIcon = Lock as any;

export default function AnalyticsHubScreen() {
  const { isLoaded, userId, getToken } = useAuth();
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'published'>('all');

  const brandAccent = isDark ? '#FFCC00' : '#009689';
  const textColor = isDark ? '#FFFFFF' : '#09090b';
  const subTextColor = isDark ? '#A1A1AA' : '#6B7280';
  const btnTextColor = isDark ? '#09090b' : '#FFFFFF';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const filterPillBg = isDark ? '#18181B' : '#FFFFFF';
  const filterPillBorder = isDark ? '#27272A' : '#09090b';

  useEffect(() => {
    if (isLoaded && getToken) {
      initTokenGetter(getToken);
    }
  }, [isLoaded, getToken]);

  const fetchAnalyticsData = async (isRef = false) => {
    if (!userId) {
      setLoading(false);
      setRefreshing(false);
      return;
    }

    if (isRef) setRefreshing(true);
    else setLoading(true);

    setError('');

    try {
      const res = await api.get('/polls');
      if (res.data.success) {
        setPolls(res.data.polls || []);
      }
    } catch (err: any) {
      console.error('Analytics Hub error:', err);
      setError(err?.response?.data?.error || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (isLoaded) {
      fetchAnalyticsData();
    }
  }, [isLoaded, userId]);

  useFocusEffect(
    useCallback(() => {
      if (isLoaded && userId) {
        fetchAnalyticsData(true);
      }
    }, [isLoaded, userId])
  );

  // Real-time Socket Listener for Live Updates
  useEffect(() => {
    socket.connect();
    socket.on('poll_updated', () => {
      fetchAnalyticsData(true);
    });

    return () => {
      socket.off('poll_updated');
      socket.disconnect();
    };
  }, []);

  // Calculate Aggregated Metrics
  const totalPolls = polls.length;
  const activePolls = polls.filter(p => p.status === 'active').length;
  const publishedPolls = polls.filter(p => p.status === 'published').length;
  const totalVotesCount = polls.reduce((sum, p) => sum + (p.totalVotes || p.responseCount || 0), 0);

  const filteredPolls = polls.filter(p => {
    if (filter === 'active') return p.status === 'active';
    if (filter === 'published') return p.status === 'published';
    return true;
  });

  const formatExpiryTime = (expiresAtStr: string, status: string) => {
    if (status === 'published' || status === 'expired') {
      return { val: 'Completed', label: 'Expired' };
    }
    if (!expiresAtStr) {
      return { val: '2d left', label: 'Expires' };
    }
    const now = new Date();
    const exp = new Date(expiresAtStr);
    const diffMs = exp.getTime() - now.getTime();
    if (diffMs <= 0) {
      return { val: 'Completed', label: 'Expired' };
    }
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays > 0) {
      return { val: `${diffDays}d left`, label: 'Expires' };
    } else if (diffHours > 0) {
      return { val: `${diffHours}h left`, label: 'Expires' };
    } else {
      const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
      return { val: `${diffMins}m left`, label: 'Expires' };
    }
  };

  if (!userId) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.guestContainer}>
          <LockIcon size={64} color="#EF4444" />
          <Text style={[styles.guestTitle, { color: textColor }]}>Login Required</Text>
          <Text style={[styles.guestSub, { color: subTextColor }]}>
            Please sign in with your creator account to view your global analytics & live voter feeds.
          </Text>
          <BrutalButton
            title="Go to Login"
            variant="primary"
            onPress={() => router.replace('/login')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchAnalyticsData(true)}
            tintColor={brandAccent}
          />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.headerTitleRow}>
              <Text style={[styles.headerTitle, { color: textColor }]}>GLOBAL ANALYTICS</Text>
              <ZapIcon size={22} color={brandAccent} fill={brandAccent} />
            </View>
            <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
              Real-time campaign trends & live voter activity
            </Text>
          </View>
          <Pressable onPress={() => fetchAnalyticsData(true)} style={[styles.refreshBtn, { backgroundColor: cardBg, borderColor: filterPillBorder }]}>
            <RefreshCwIcon size={18} color={brandAccent} />
          </Pressable>
        </View>

        {/* Global Summary Grid */}
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCard}>
            <View style={[styles.iconBox, { backgroundColor: '#E6F4EA' }]}>
              <BarChart3Icon size={18} color="#10B981" strokeWidth={2.5} />
            </View>
            <Text style={styles.summaryVal}>{totalPolls}</Text>
            <Text style={styles.summaryLabel}>Campaigns</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FCE7F3' }]}>
              <UsersIcon size={18} color="#EC4899" strokeWidth={2.5} />
            </View>
            <Text style={styles.summaryVal}>{totalVotesCount}</Text>
            <Text style={styles.summaryLabel}>Total Votes</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <PlayIcon size={18} color="#F59E0B" strokeWidth={2.5} />
            </View>
            <Text style={styles.summaryVal}>{activePolls}</Text>
            <Text style={styles.summaryLabel}>Active</Text>
          </View>

          <View style={styles.summaryCard}>
            <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
              <CheckCircle2Icon size={18} color="#8B5CF6" strokeWidth={2.5} />
            </View>
            <Text style={styles.summaryVal}>{publishedPolls}</Text>
            <Text style={styles.summaryLabel}>Published</Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setFilter('all')}
            style={[
              styles.filterPill,
              { backgroundColor: filterPillBg, borderColor: filterPillBorder },
              filter === 'all' && { backgroundColor: brandAccent, borderColor: '#09090b' }
            ]}
          >
            <Text style={[
              styles.filterPillText,
              { color: textColor },
              filter === 'all' && { color: btnTextColor }
            ]}>
              ALL ({totalPolls})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilter('active')}
            style={[
              styles.filterPill,
              { backgroundColor: filterPillBg, borderColor: filterPillBorder },
              filter === 'active' && { backgroundColor: brandAccent, borderColor: '#09090b' }
            ]}
          >
            <Text style={[
              styles.filterPillText,
              { color: textColor },
              filter === 'active' && { color: btnTextColor }
            ]}>
              ACTIVE ({activePolls})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setFilter('published')}
            style={[
              styles.filterPill,
              { backgroundColor: filterPillBg, borderColor: filterPillBorder },
              filter === 'published' && { backgroundColor: brandAccent, borderColor: '#09090b' }
            ]}
          >
            <Text style={[
              styles.filterPillText,
              { color: textColor },
              filter === 'published' && { color: btnTextColor }
            ]}>
              PUBLISHED ({publishedPolls})
            </Text>
          </Pressable>
        </View>

        {/* Campaign Analytics List */}
        <Text style={[styles.sectionHeaderTitle, { color: textColor }]}>CAMPAIGN PERFORMANCE</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#FFCC00" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredPolls.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No campaigns found in this filter.</Text>
          </View>
        ) : (
          filteredPolls.map((item) => {
            const isActive = item.status === 'active';
            const isPublished = item.status === 'published';
            const bannerBg = isActive ? '#FFCC00' : isPublished ? '#10B981' : '#E4E4E7';
            const badgeBg = isActive ? '#FFCC00' : isPublished ? '#10B981' : '#27272A';
            const badgeText = isActive ? '#09090b' : '#FFFFFF';

            const votesCount = typeof item.totalVotes === 'number' 
              ? item.totalVotes 
              : (typeof item.responseCount === 'number' ? item.responseCount : (item.responses ? item.responses.length : 0));

            const questionCount = item.questionCount || (item.questions ? item.questions.length : 1);
            
            let responseRate = '0%';
            if (votesCount > 0) {
              const rateNum = Math.min(100, Math.round((votesCount / Math.max(1, questionCount)) * 100));
              responseRate = `${rateNum > 0 ? rateNum : 100}%`;
            }

            const expiryObj = formatExpiryTime(item.expiresAt, item.status);
            const dateObj = item.createdAt ? new Date(item.createdAt) : (item.updatedAt ? new Date(item.updatedAt) : new Date());
            const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'numeric', year: 'numeric' });

            return (
              <View key={item._id} style={[styles.campaignCard, { backgroundColor: cardBg, borderColor: filterPillBorder }]}>
                {/* Banner Header */}
                <View style={[styles.cardHeaderBanner, { backgroundColor: bannerBg }]}>
                  <View style={[styles.statusPill, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.statusPillText, { color: badgeText }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.cardDateText}>{formattedDate}</Text>
                </View>

                {/* Body */}
                <View style={styles.cardBody}>
                  <Text style={[styles.pollTitle, { color: textColor }]}>{item.title}</Text>
                  {item.description ? (
                    <Text style={[styles.pollDesc, { color: subTextColor }]} numberOfLines={1}>{item.description}</Text>
                  ) : null}

                  {/* 4 Stat Pills */}
                  <View style={styles.statGrid}>
                    <View style={[styles.statBox, { backgroundColor: isDark ? '#09090b' : '#F4F4F5', borderColor: filterPillBorder }]}>
                      <UsersIcon size={14} color="#10B981" />
                      <View style={styles.statTextWrapper}>
                        <Text style={[styles.statVal, { color: textColor }]}>{votesCount}</Text>
                        <Text style={[styles.statLabel, { color: subTextColor }]}>{votesCount === 1 ? 'Vote' : 'Votes'}</Text>
                      </View>
                    </View>

                    <View style={[styles.statBox, { backgroundColor: isDark ? '#09090b' : '#F4F4F5', borderColor: filterPillBorder }]}>
                      <HelpCircleIcon size={14} color="#8B5CF6" />
                      <View style={styles.statTextWrapper}>
                        <Text style={[styles.statVal, { color: textColor }]}>{questionCount}</Text>
                        <Text style={[styles.statLabel, { color: subTextColor }]}>{questionCount === 1 ? 'Question' : 'Questions'}</Text>
                      </View>
                    </View>

                    <View style={[styles.statBox, { backgroundColor: isDark ? '#09090b' : '#F4F4F5', borderColor: filterPillBorder }]}>
                      <ClockIcon size={14} color="#F59E0B" />
                      <View style={styles.statTextWrapper}>
                        <Text style={[styles.statVal, { color: textColor }]}>{expiryObj.val}</Text>
                        <Text style={[styles.statLabel, { color: subTextColor }]}>{expiryObj.label}</Text>
                      </View>
                    </View>

                    <View style={[styles.statBox, { backgroundColor: isDark ? '#09090b' : '#F4F4F5', borderColor: filterPillBorder }]}>
                      <TrendingUpIcon size={14} color="#EC4899" />
                      <View style={styles.statTextWrapper}>
                        <Text style={[styles.statVal, { color: textColor }]}>{responseRate}</Text>
                        <Text style={[styles.statLabel, { color: subTextColor }]}>Response</Text>
                      </View>
                    </View>
                  </View>

                  {/* Progress Bar */}
                  <View style={[styles.progressContainer, { backgroundColor: isDark ? '#27272A' : '#E4E4E7' }]}>
                    <View style={[styles.progressBar, { backgroundColor: brandAccent, width: (responseRate === '0%' ? '5%' : responseRate) as any }]} />
                  </View>

                  {/* Action Button to Open Analytics Room */}
                  <Pressable
                    onPress={() => router.push(`/analytics/${item._id}`)}
                    style={[styles.openAnalyticsBtn, { backgroundColor: brandAccent }]}
                  >
                    <BarChart3Icon size={16} color={btnTextColor} />
                    <Text style={[styles.openAnalyticsBtnText, { color: btnTextColor }]}>OPEN ANALYTICS ROOM</Text>
                    <ChevronRightIcon size={16} color={btnTextColor} />
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 110,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  guestTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  guestSub: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  headerSubtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  refreshBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderWidth: 2,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: '#09090b',
    padding: 10,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  summaryVal: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '900',
    color: '#09090b',
  },
  summaryLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 2,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderWidth: 2,
    borderColor: '#27272A',
  },
  filterPillActive: {
    backgroundColor: '#FFCC00',
    borderColor: '#09090b',
  },
  filterPillText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    color: '#A1A1AA',
  },
  filterPillTextActive: {
    color: '#09090b',
  },
  sectionHeaderTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  loader: {
    marginVertical: 40,
  },
  errorBox: {
    padding: 16,
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#FFFFFF',
  },
  emptyBox: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#27272A',
  },
  emptyText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#A1A1AA',
  },
  campaignCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#09090b',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeaderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 2.5,
    borderBottomColor: '#09090b',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#09090b',
  },
  statusPillText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
  },
  cardDateText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    color: '#09090b',
  },
  cardBody: {
    padding: 14,
  },
  pollTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    color: '#09090b',
    textTransform: 'uppercase',
  },
  pollDesc: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F4F5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E4E4E7',
    gap: 6,
  },
  statTextWrapper: {
    flex: 1,
  },
  statVal: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '900',
    color: '#09090b',
  },
  statLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '700',
    color: '#71717A',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#E4E4E7',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#09090b',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  openAnalyticsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#09090b',
    height: 42,
    marginTop: 12,
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  openAnalyticsBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
