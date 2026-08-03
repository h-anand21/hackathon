import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  Platform,
  RefreshControl,
  Share,
  Alert,
  Pressable,
  TextInput,
  BackHandler,
  Modal
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter, useFocusEffect } from 'expo-router';
import { BrutalButton, BrutalInput } from '../../components/Brutal';
import { api, setAuthToken, initTokenGetter } from '../../utils/api';
import { 
  LogOut, 
  RefreshCw, 
  BarChart2, 
  Trash2, 
  Play, 
  CheckCircle2, 
  Users, 
  Clock, 
  TrendingUp, 
  Zap, 
  Search, 
  HelpCircle, 
  FileText,
  Megaphone,
  Share2,
  SlidersHorizontal,
  X,
  Check,
  Filter
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const TrashIcon = Trash2 as any;
const LogOutIcon = LogOut as any;
const RefreshCwIcon = RefreshCw as any;
const BarChart2Icon = BarChart2 as any;
const PlayIcon = Play as any;
const CheckCircle2Icon = CheckCircle2 as any;
const UsersIcon = Users as any;
const ClockIcon = Clock as any;
const TrendingUpIcon = TrendingUp as any;
const ZapIcon = Zap as any;
const SearchIcon = Search as any;
const HelpCircleIcon = HelpCircle as any;
const FileTextIcon = FileText as any;
const MegaphoneIcon = Megaphone as any;
const Share2Icon = Share2 as any;
const SlidersHorizontalIcon = SlidersHorizontal as any;
const XIcon = X as any;
const CheckIcon = Check as any;
const FilterIcon = Filter as any;

export default function DashboardScreen() {
  const { isLoaded, userId, getToken, signOut } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  const brandAccent = isDark ? '#FFCC00' : '#009689';
  const textColor = isDark ? '#FFFFFF' : '#09090b';
  const subTextColor = isDark ? '#A1A1AA' : '#52525B';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const cardBorder = isDark ? '#27272A' : '#09090b';

  const [polls, setPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  
  // Search state for guest/direct voting & live title search filter
  const [searchPollId, setSearchPollId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'published' | 'expired'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);

  useEffect(() => {
    if (isLoaded && getToken) {
      initTokenGetter(getToken);
    }
  }, [isLoaded, getToken]);

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      return () => {
        subscription.remove();
      };
    }, [])
  );

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

  // Auto refresh live metrics whenever returning to the Dashboard tab
  useFocusEffect(
    React.useCallback(() => {
      if (isLoaded && userId) {
        fetchPolls(true);
      }
    }, [isLoaded, userId])
  );

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

  // Helper to format real expiry time
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

  // Calculated Stats
  const activePollsCount = polls.filter(p => p.status === 'active').length;
  const publishedPollsCount = polls.filter(p => p.status === 'published').length;
  const expiredPollsCount = polls.filter(p => {
    if (p.status === 'expired') return true;
    if (p.expiresAt && new Date(p.expiresAt) <= new Date() && p.status !== 'published') return true;
    return false;
  }).length;
  const totalVotesCount = polls.reduce((sum, p) => sum + (p.totalVotes || p.responseCount || 0), 0);

  // Live Filtered Polls Array by status & title search query
  const filteredPolls = polls.filter((item) => {
    // 1. Status Filter
    if (filterStatus === 'active' && item.status !== 'active') return false;
    if (filterStatus === 'published' && item.status !== 'published') return false;
    if (filterStatus === 'expired') {
      const isExp = item.status === 'expired' || (item.expiresAt && new Date(item.expiresAt) <= new Date() && item.status !== 'published');
      if (!isExp) return false;
    }

    // 2. Search Query Title / Description / ID Filter
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const titleMatch = (item.title || '').toLowerCase().includes(q);
      const descMatch = (item.description || '').toLowerCase().includes(q);
      const idMatch = (item._id || '').toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !idMatch) return false;
    }

    return true;
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchPolls(true)}
            tintColor={brandAccent}
          />
        }
      >
        {/* Top Header matching mockup image */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: textColor }]}>DASHBOARD</Text>
            <Text style={[styles.headerSubtitle, { color: subTextColor }]}>
              Create, manage and analyze your polls
            </Text>
          </View>
          {userId ? (
            <Pressable onPress={handleLogout} style={[styles.logoutBtn, { backgroundColor: cardBg, borderColor: cardBorder }]}>
              <LogOutIcon size={22} color={textColor} />
            </Pressable>
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

        {/* Mega Banner Card "JOIN A POLL ROOM" */}
        <View style={[styles.megaYellowCard, { backgroundColor: brandAccent }]}>
          <View style={styles.megaYellowContent}>
            <Text style={[styles.megaYellowTitle, !isDark && { color: '#FFFFFF' }]}>JOIN A POLL ROOM</Text>
            <Text style={[styles.megaYellowSubtitle, !isDark && { color: '#E4E4E7' }]}>Enter Poll ID to join and vote</Text>

            <View style={styles.megaSearchRow}>
              <TextInput
                placeholder="Paste Poll ID here..."
                placeholderTextColor="#6B7280"
                value={searchPollId}
                onChangeText={setSearchPollId}
                style={styles.nativeSearchInput}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Pressable onPress={handleSearchPoll} style={styles.megaGoBtn}>
                <Text style={styles.megaGoBtnText}>GO</Text>
              </Pressable>
            </View>
          </View>

          {/* Megaphone / Mic Badge Illustration */}
          <View style={styles.megaIllustrationWrapper}>
            <View style={styles.megaMicBadge}>
              <MegaphoneIcon size={34} color="#09090b" strokeWidth={2.5} />
            </View>
          </View>
        </View>

        {/* 4 Mini Stat Cards Grid (Pure White Neo-Brutalist Cards) */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.statsRow}
        >
          {/* Card 1: Total Polls */}
          <View style={styles.miniStatCard}>
            <View style={[styles.miniIconCircle, { backgroundColor: '#E6F4EA' }]}>
              <BarChart2Icon size={20} color="#10B981" strokeWidth={2.5} />
            </View>
            <Text style={styles.miniStatValue}>{polls.length}</Text>
            <Text style={styles.miniStatTitle}>Total Polls</Text>
            <Text style={[styles.miniStatSub, { color: '#10B981' }]}>All time</Text>
            <View style={[styles.miniCardBottomLine, { backgroundColor: '#10B981' }]} />
          </View>

          {/* Card 2: Active Polls */}
          <View style={styles.miniStatCard}>
            <View style={[styles.miniIconCircle, { backgroundColor: '#FEF3C7' }]}>
              <PlayIcon size={20} color="#F59E0B" strokeWidth={2.5} />
            </View>
            <Text style={styles.miniStatValue}>{activePollsCount}</Text>
            <Text style={styles.miniStatTitle}>Active Polls</Text>
            <Text style={[styles.miniStatSub, { color: '#F59E0B' }]}>Ongoing</Text>
            <View style={[styles.miniCardBottomLine, { backgroundColor: '#F59E0B' }]} />
          </View>

          {/* Card 3: Published */}
          <View style={styles.miniStatCard}>
            <View style={[styles.miniIconCircle, { backgroundColor: '#F3E8FF' }]}>
              <CheckCircle2Icon size={20} color="#8B5CF6" strokeWidth={2.5} />
            </View>
            <Text style={styles.miniStatValue}>{publishedPollsCount}</Text>
            <Text style={styles.miniStatTitle}>Published</Text>
            <Text style={[styles.miniStatSub, { color: '#8B5CF6' }]}>Completed</Text>
            <View style={[styles.miniCardBottomLine, { backgroundColor: '#8B5CF6' }]} />
          </View>

          {/* Card 4: Total Votes */}
          <View style={styles.miniStatCard}>
            <View style={[styles.miniIconCircle, { backgroundColor: '#FCE7F3' }]}>
              <UsersIcon size={20} color="#EC4899" strokeWidth={2.5} />
            </View>
            <Text style={styles.miniStatValue}>{totalVotesCount}</Text>
            <Text style={styles.miniStatTitle}>Total Votes</Text>
            <Text style={[styles.miniStatSub, { color: '#EC4899' }]}>All polls</Text>
            <View style={[styles.miniCardBottomLine, { backgroundColor: '#EC4899' }]} />
          </View>
        </ScrollView>

        {/* MY POLL CAMPAIGNS ⚡ Section Header */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <View style={styles.sectionTitleRow}>
              <Text style={[styles.sectionTitleText, { color: textColor }]}>MY POLL CAMPAIGNS</Text>
              <ZapIcon size={20} color={brandAccent} fill={brandAccent} />
            </View>
            <Text style={[styles.sectionSubtitleText, { color: subTextColor }]}>
              Manage your polls and track responses
            </Text>
          </View>

          <View style={styles.sectionActionIcons}>
            <Pressable 
              onPress={() => setShowSearchBar(!showSearchBar)} 
              style={[
                styles.headerIconBtn, 
                { backgroundColor: cardBg, borderColor: cardBorder },
                (showSearchBar || searchQuery.trim() !== '') && { backgroundColor: brandAccent, borderColor: '#09090b' }
              ]}
            >
              <SearchIcon size={18} color={(showSearchBar || searchQuery.trim() !== '') ? (isDark ? '#09090b' : '#FFFFFF') : brandAccent} />
            </Pressable>
            <Pressable 
              onPress={() => setShowFilterModal(true)} 
              style={[
                styles.headerIconBtn, 
                { backgroundColor: cardBg, borderColor: cardBorder },
                filterStatus !== 'all' && { backgroundColor: brandAccent, borderColor: '#09090b' }
              ]}
            >
              <SlidersHorizontalIcon size={18} color={filterStatus !== 'all' ? (isDark ? '#09090b' : '#FFFFFF') : brandAccent} />
            </Pressable>
          </View>
        </View>

        {/* Live Search Input Bar */}
        {showSearchBar ? (
          <View style={[styles.searchBarWrapper, { backgroundColor: cardBg, borderColor: brandAccent }]}>
            <SearchIcon size={18} color={subTextColor} style={{ marginLeft: 12 }} />
            <TextInput
              placeholder="Search polls by title..."
              placeholderTextColor={subTextColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchBarInput, { color: textColor }]}
              autoCapitalize="none"
              autoFocus
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')} style={{ padding: 8 }}>
                <XIcon size={16} color={subTextColor} />
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {/* Active Filter Pill Badge */}
        {(filterStatus !== 'all' || searchQuery.trim() !== '') ? (
          <View style={styles.activeFilterBadgeRow}>
            <Text style={styles.activeFilterBadgeText}>
              {filterStatus !== 'all' ? `Filter: ${filterStatus.toUpperCase()}` : ''}
              {filterStatus !== 'all' && searchQuery.trim() !== '' ? ' • ' : ''}
              {searchQuery.trim() !== '' ? `Search: "${searchQuery}"` : ''}
              {` (${filteredPolls.length})`}
            </Text>
            <Pressable onPress={() => { setFilterStatus('all'); setSearchQuery(''); }} style={styles.clearFilterBtn}>
              <Text style={styles.clearFilterBtnText}>RESET ALL</Text>
            </Pressable>
          </View>
        ) : null}

        {/* Dynamic Poll Cards List */}
        {!userId ? (
          <View style={styles.guestInfoContainer}>
            <BarChart2Icon size={64} color="#A1A1AA" />
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
          <ActivityIndicator size="large" color="#FFCC00" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredPolls.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {polls.length === 0 ? "No polls created yet." : "No polls match your search/filter criteria."}
            </Text>
            {polls.length === 0 ? (
              <BrutalButton
                title="Create First Poll"
                variant="primary"
                onPress={() => router.push('/(tabs)/two')}
              />
            ) : (
              <BrutalButton
                title="Clear Filters"
                variant="primary"
                onPress={() => { setFilterStatus('all'); setSearchQuery(''); }}
              />
            )}
          </View>
        ) : (
          filteredPolls.map((item) => {
            const isActive = item.status === 'active';
            const isPublished = item.status === 'published';
            const bannerBg = isActive ? '#FFCC00' : isPublished ? '#10B981' : '#E4E4E7';
            const badgeBg = isActive ? '#FFCC00' : isPublished ? '#10B981' : '#27272A';
            const badgeText = isActive ? '#09090b' : '#FFFFFF';

            // Real Stats calculation for card pills
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
              <View key={item._id} style={styles.pollCampaignCard}>
                {/* Wavy Accent Header Banner */}
                <View style={[styles.cardHeaderBanner, { backgroundColor: bannerBg }]}>
                  <View style={[styles.statusPill, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.statusPillText, { color: badgeText }]}>
                      {item.status.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.cardHeaderRight}>
                    <Text style={styles.cardDateText}>
                      {formattedDate}
                    </Text>
                    <Pressable 
                      onPress={() => handleDeletePoll(item._id, item.title)}
                      style={styles.deleteCircleBtn}
                    >
                      <TrashIcon size={16} color="#EF4444" />
                    </Pressable>
                  </View>
                </View>

                {/* Card Body (Pure White Background) */}
                <View style={styles.cardMainBody}>
                  {/* Title & Description row */}
                  <View style={styles.pollTitleRow}>
                    <View style={[styles.avatarCircle, { backgroundColor: bannerBg }]}>
                      <MegaphoneIcon size={22} color="#09090b" />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.pollTitleText}>{item.title}</Text>
                      {item.description ? (
                        <Text style={styles.pollDescText} numberOfLines={1}>
                          {item.description}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  {/* 4 Stat Pills Grid (2x2) */}
                  <View style={styles.statPillsGrid}>
                    <View style={styles.statPillBox}>
                      <UsersIcon size={16} color="#10B981" />
                      <View style={styles.statPillTextWrapper}>
                        <Text style={styles.statPillValue}>{votesCount}</Text>
                        <Text style={styles.statPillLabel}>
                          {votesCount === 1 ? 'Vote' : 'Votes'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.statPillBox}>
                      <HelpCircleIcon size={16} color="#8B5CF6" />
                      <View style={styles.statPillTextWrapper}>
                        <Text style={styles.statPillValue}>{questionCount}</Text>
                        <Text style={styles.statPillLabel}>
                          {questionCount === 1 ? 'Question' : 'Questions'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.statPillBox}>
                      <ClockIcon size={16} color="#F59E0B" />
                      <View style={styles.statPillTextWrapper}>
                        <Text style={styles.statPillValue}>{expiryObj.val}</Text>
                        <Text style={styles.statPillLabel}>{expiryObj.label}</Text>
                      </View>
                    </View>

                    <View style={styles.statPillBox}>
                      <TrendingUpIcon size={16} color="#EC4899" />
                      <View style={styles.statPillTextWrapper}>
                        <Text style={styles.statPillValue}>{responseRate}</Text>
                        <Text style={styles.statPillLabel}>Response</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons Row */}
                  <View style={styles.actionRow}>
                    {/* STATS Button */}
                    <Pressable 
                      onPress={() => router.push(`/analytics/${item._id}` as any)}
                      style={styles.statsActionBtn}
                    >
                      <BarChart2Icon size={18} color="#09090b" />
                      <Text style={styles.statsActionBtnText}>STATS</Text>
                    </Pressable>

                    {/* VOTE NOW or FINAL RESULTS Button */}
                    {isPublished ? (
                      <Pressable 
                        onPress={() => router.push(`/published/${item._id}` as any)}
                        style={styles.finalResultsActionBtn}
                      >
                        <FileTextIcon size={16} color="#FFFFFF" />
                        <Text style={styles.finalResultsBtnText}>FINAL RESULTS</Text>
                      </Pressable>
                    ) : (
                      <Pressable 
                        onPress={() => router.push(`/poll/${item._id}` as any)}
                        style={[styles.voteNowActionBtn, { backgroundColor: brandAccent }]}
                      >
                        <UsersIcon size={16} color={isDark ? '#09090b' : '#FFFFFF'} />
                        <Text style={[styles.voteNowBtnText, { color: isDark ? '#09090b' : '#FFFFFF' }]}>VOTE NOW</Text>
                      </Pressable>
                    )}

                    {/* SHARE Button */}
                    <Pressable 
                      onPress={() => handleShare(item._id, item.title)}
                      style={styles.shareActionBtn}
                    >
                      <Share2Icon size={16} color="#09090b" />
                      <Text style={styles.shareBtnText}>SHARE</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Interactive Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowFilterModal(false)} />
          <View style={[styles.filterModalContent, { backgroundColor: cardBg, borderColor: brandAccent, paddingBottom: Math.max(insets.bottom + 28, 34) }]}>
            {/* Sheet Handle */}
            <View style={styles.sheetHandleWrapper}>
              <View style={styles.sheetHandleBar} />
            </View>

            <View style={styles.filterModalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <SlidersHorizontalIcon size={20} color={brandAccent} />
                <Text style={[styles.filterModalTitle, { color: textColor }]}>FILTER CAMPAIGNS</Text>
              </View>
              <Pressable onPress={() => setShowFilterModal(false)} style={styles.closeModalBtn}>
                <XIcon size={20} color={textColor} />
              </Pressable>
            </View>

            <View style={styles.filterOptionsList}>
              <Pressable
                onPress={() => { setFilterStatus('all'); setShowFilterModal(false); }}
                style={[
                  styles.filterOptionItem,
                  { backgroundColor: isDark ? '#09090b' : '#F4F4F5', borderColor: cardBorder },
                  filterStatus === 'all' && { backgroundColor: brandAccent, borderColor: '#09090b' }
                ]}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: textColor },
                  filterStatus === 'all' && { color: isDark ? '#09090b' : '#FFFFFF' }
                ]}>
                  ALL CAMPAIGNS ({polls.length})
                </Text>
                {filterStatus === 'all' ? <CheckIcon size={18} color={isDark ? '#09090b' : '#FFFFFF'} strokeWidth={3} /> : null}
              </Pressable>

              <Pressable
                onPress={() => { setFilterStatus('active'); setShowFilterModal(false); }}
                style={[
                  styles.filterOptionItem,
                  { backgroundColor: isDark ? '#09090b' : '#F4F4F5', borderColor: cardBorder },
                  filterStatus === 'active' && { backgroundColor: brandAccent, borderColor: '#09090b' }
                ]}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: textColor },
                  filterStatus === 'active' && { color: isDark ? '#09090b' : '#FFFFFF' }
                ]}>
                  ⚡ ACTIVE ONLY ({activePollsCount})
                </Text>
                {filterStatus === 'active' ? <CheckIcon size={18} color={isDark ? '#09090b' : '#FFFFFF'} strokeWidth={3} /> : null}
              </Pressable>

              <Pressable
                onPress={() => { setFilterStatus('published'); setShowFilterModal(false); }}
                style={[
                  styles.filterOptionItem,
                  { backgroundColor: isDark ? '#09090b' : '#F4F4F5', borderColor: cardBorder },
                  filterStatus === 'published' && { backgroundColor: brandAccent, borderColor: '#09090b' }
                ]}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: textColor },
                  filterStatus === 'published' && { color: isDark ? '#09090b' : '#FFFFFF' }
                ]}>
                  🏆 PUBLISHED ONLY ({publishedPollsCount})
                </Text>
                {filterStatus === 'published' ? <CheckIcon size={18} color={isDark ? '#09090b' : '#FFFFFF'} strokeWidth={3} /> : null}
              </Pressable>

              <Pressable
                onPress={() => { setFilterStatus('expired'); setShowFilterModal(false); }}
                style={[
                  styles.filterOptionItem,
                  { backgroundColor: isDark ? '#09090b' : '#F4F4F5', borderColor: cardBorder },
                  filterStatus === 'expired' && { backgroundColor: brandAccent, borderColor: '#09090b' }
                ]}
              >
                <Text style={[
                  styles.filterOptionText,
                  { color: textColor },
                  filterStatus === 'expired' && { color: isDark ? '#09090b' : '#FFFFFF' }
                ]}>
                  ⏰ EXPIRED ONLY ({expiredPollsCount})
                </Text>
                {filterStatus === 'expired' ? <CheckIcon size={18} color={isDark ? '#09090b' : '#FFFFFF'} strokeWidth={3} /> : null}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 30,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    textTransform: 'uppercase',
  },
  headerSubtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#A1A1AA',
    marginTop: 2,
  },
  logoutBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#3F3F46',
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
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
  
  // Mega Yellow Banner Card "JOIN A POLL ROOM"
  megaYellowCard: {
    backgroundColor: '#FFCC00',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#09090b',
    padding: 18,
    marginBottom: 20,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 5,
  },
  megaYellowContent: {
    width: '74%',
    zIndex: 2,
  },
  megaYellowTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '900',
    color: '#09090b',
    textTransform: 'uppercase',
  },
  megaYellowSubtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#09090b',
    marginTop: 4,
    marginBottom: 14,
  },
  megaSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nativeSearchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    color: '#09090b',
    borderWidth: 2.5,
    borderColor: '#09090b',
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '700',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  megaGoBtn: {
    backgroundColor: '#09090b',
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: '#09090b',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  megaGoBtnText: {
    color: '#FFFFFF',
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
  },
  megaIllustrationWrapper: {
    position: 'absolute',
    right: 14,
    top: 18,
    zIndex: 3,
  },
  megaMicBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },

  // 4 Mini Stat Cards Grid (Pure White Neo-Brutalist Cards)
  statsRow: {
    gap: 12,
    marginBottom: 24,
    paddingRight: 10,
  },
  miniStatCard: {
    width: 118,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2.5,
    borderColor: '#09090b',
    padding: 12,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  miniIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  miniStatValue: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    fontWeight: '900',
    color: '#09090b',
  },
  miniStatTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
    color: '#09090b',
    marginTop: 2,
  },
  miniStatSub: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: 6,
  },
  miniCardBottomLine: {
    height: 5,
    borderRadius: 3,
    width: '100%',
  },

  // MY POLL CAMPAIGNS ⚡ Section Header
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  sectionSubtitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#A1A1AA',
    marginTop: 2,
  },
  sectionActionIcons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3F3F46',
    backgroundColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconBtnActive: {
    backgroundColor: '#FFCC00',
    borderColor: '#09090b',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFCC00',
    marginBottom: 16,
    height: 48,
  },
  searchBarInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 10,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  activeFilterBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#27272A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#3F3F46',
  },
  activeFilterBadgeText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFCC00',
  },
  clearFilterBtn: {
    backgroundColor: '#09090b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  clearFilterBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  filterModalContent: {
    backgroundColor: '#18181B',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 2.5,
    borderColor: '#FFCC00',
    padding: 20,
  },
  sheetHandleWrapper: {
    alignItems: 'center',
    marginBottom: 10,
  },
  sheetHandleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3F3F46',
  },
  filterModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#27272A',
    paddingBottom: 12,
  },
  filterModalTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  closeModalBtn: {
    padding: 6,
  },
  filterOptionsList: {
    gap: 10,
  },
  filterOptionItem: {
    height: 50,
    backgroundColor: '#09090b',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#27272A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  filterOptionActive: {
    backgroundColor: '#FFCC00',
    borderColor: '#09090b',
  },
  filterOptionText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  filterOptionTextActive: {
    color: '#09090b',
  },

  // Poll Campaign Cards (Solid White Card with Accent Header Banner)
  pollCampaignCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 2.5,
    borderColor: '#09090b',
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  cardHeaderBanner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#09090b',
  },
  statusPillText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cardDateText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#09090b',
  },
  deleteCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardMainBody: {
    padding: 16,
  },
  pollTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollTitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '900',
    color: '#09090b',
  },
  pollDescText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#4B5563',
    marginTop: 2,
  },
  
  // 4 Stat Pills Grid (2x2) inside off-white container
  statPillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  statPillBox: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  statPillTextWrapper: {
    flex: 1,
  },
  statPillValue: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '900',
    color: '#09090b',
  },
  statPillLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: '#6B7280',
  },

  // Action Buttons Row
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  statsActionBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#09090b',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  statsActionBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#09090b',
  },
  voteNowActionBtn: {
    flex: 1.2,
    height: 44,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#09090b',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  voteNowBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  finalResultsActionBtn: {
    flex: 1.3,
    height: 44,
    backgroundColor: '#8B5CF6',
    borderWidth: 2,
    borderColor: '#09090b',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  finalResultsBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  shareActionBtn: {
    flex: 1,
    height: 44,
    backgroundColor: '#FFCC00',
    borderWidth: 2,
    borderColor: '#09090b',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  shareBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#09090b',
  },
  
  guestInfoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 16,
  },
  guestInfoText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  loader: {
    marginVertical: 40,
  },
  errorContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  errorText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
    color: '#EF4444',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 16,
  },
  emptyText: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
