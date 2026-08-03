import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  Platform,
  Alert,
  Pressable,
  Share
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { BrutalCard, BrutalButton } from '../../components/Brutal';
import { Colors } from '../../constants/Theme';
import { api } from '../../utils/api';
import { socket } from '../../utils/socket';
import { Users, TrendingUp, Trophy, Activity, ArrowLeft, FileText, Share2, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Svg, { Circle, G } from 'react-native-svg';

const UsersIcon = Users as any;
const TrendingUpIcon = TrendingUp as any;
const TrophyIcon = Trophy as any;
const ActivityIcon = Activity as any;
const ArrowLeftIcon = ArrowLeft as any;
const FileTextIcon = FileText as any;
const Share2Icon = Share2 as any;
const CheckCircle2Icon = CheckCircle2 as any;

export default function PollAnalyticsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoaded: isAuthLoaded, userId } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const [data, setData] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = () => {
    if (!id) return;
    setLoading(true);
    setError('');
    
    // Try creator analytics endpoint first, fallback to public results endpoint
    api.get(`/analytics/${id}`)
      .then(res => {
        if (res.data.success) {
          setData(res.data);
        }
      })
      .catch(() => {
        // Fallback: If not creator, try public results endpoint
        api.get(`/public/poll/${id}/results`)
          .then(res => {
            if (res.data.success) {
              setData(res.data);
            }
          })
          .catch(err2 => {
            setError(err2.response?.data?.error || "Results are not public or unauthorized");
          });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;

    fetchAnalytics();

    // Connect socket and listen for real-time updates
    socket.connect();
    socket.emit('join_poll_room', id);

    socket.on('poll_updated', (updatedAnalytics) => {
      setData((prev: any) => prev ? { ...prev, analytics: updatedAnalytics } : null);
    });

    socket.on('room_count_update', ({ count }) => {
      setActiveUsers(count);
    });

    return () => {
      socket.emit('leave_poll_room', id);
      socket.off('poll_updated');
      socket.off('room_count_update');
      socket.disconnect();
    };
  }, [id]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.foreground }]}>Fetching Live Stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: colors.foreground }]}>Stats Locked</Text>
          <Text style={[styles.errorSub, { color: colors.mutedForeground }]}>{error || 'Poll data is not public yet.'}</Text>
          <BrutalButton
            title="Back to Dashboard"
            variant="default"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      </SafeAreaView>
    );
  }

  const poll = data.poll;
  const analytics = data.analytics;

  const handlePublishPoll = async () => {
    Alert.alert(
      'Publish Poll Results',
      'Are you sure you want to publish the results now? This will complete active voting and publish final results publicly to all users.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Publish Now',
          style: 'default',
          onPress: async () => {
            try {
              // Call backend API to update poll status to 'published' in MongoDB
              let res;
              try {
                res = await api.patch(`/polls/${id}`, { status: 'published' });
              } catch {
                res = await api.put(`/polls/${id}`, { status: 'published' });
              }

              if (res.data.success) {
                setData((prev: any) => prev ? { ...prev, poll: { ...prev.poll, status: 'published' } } : null);
                // Emit real-time socket event so connected voters update instantly!
                socket.emit('poll_updated', id);
                Alert.alert('Success', 'Poll results published successfully! Voting is now completed.');
              } else {
                Alert.alert('Error', 'Failed to publish poll results.');
              }
            } catch (err: any) {
              console.error('Publish Error:', err);
              Alert.alert('Error', err?.response?.data?.error || 'An error occurred while publishing.');
            }
          }
        }
      ]
    );
  };

  const handleShare = async () => {
    try {
      const webUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://pollsphere.vercel.app';
      await Share.share({
        message: `Vote on this Poll: "${poll?.title || 'Live Poll'}"\nLink: ${webUrl}/poll/slug/${id}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <BrutalButton
          title="< Exit"
          variant="default"
          onPress={() => router.replace('/(tabs)')}
          style={styles.backBtn}
          textStyle={styles.backBtnText}
        />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Analytics Room</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={[styles.pollTitle, { color: colors.foreground }]}>{poll.title}</Text>

        {/* Creator Control & Action Buttons (Publish Results, Vote Now, Share) */}
        <BrutalCard variant="default" style={styles.actionCard}>
          <View style={styles.actionHeaderRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.actionSectionTitle, { color: colors.foreground }]}>
                CAMPAIGN CONTROLS
              </Text>
              <Text style={[styles.statusSubtitle, { color: colors.mutedForeground }]}>
                {poll.status === 'published' 
                  ? 'Final results are live & published' 
                  : 'Voting in Progress • Direct Creator Actions'}
              </Text>
            </View>

            <View style={[
              styles.statusTag, 
              { backgroundColor: poll.status === 'published' ? '#10B981' : poll.status === 'active' ? '#FFCC00' : '#E4E4E7' }
            ]}>
              <Text style={[
                styles.statusTagText, 
                { color: poll.status === 'published' ? '#FFFFFF' : '#09090b' }
              ]}>
                {poll.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.analyticsActionButtonsRow}>
            {poll.status !== 'published' ? (
              <>
                {/* 1. PUBLISH RESULTS BUTTON */}
                <Pressable onPress={handlePublishPoll} style={styles.publishBtn}>
                  <FileTextIcon size={18} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.publishBtnText}>PUBLISH RESULTS</Text>
                </Pressable>

                {/* 2. VOTE NOW BUTTON */}
                <Pressable onPress={() => router.push(`/poll/${id}`)} style={styles.voteBtn}>
                  <UsersIcon size={18} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.voteBtnText}>VOTE NOW</Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* VIEW FINAL RESULTS PAGE BUTTON */}
                <Pressable onPress={() => router.push(`/published/${id}`)} style={styles.publishedViewBtn}>
                  <CheckCircle2Icon size={18} color="#FFFFFF" strokeWidth={2.5} />
                  <Text style={styles.publishedViewBtnText}>VIEW FINAL RESULTS</Text>
                </Pressable>

                {/* SHARE BUTTON */}
                <Pressable onPress={handleShare} style={styles.shareBtn}>
                  <Share2Icon size={18} color="#09090b" strokeWidth={2.5} />
                  <Text style={styles.shareBtnText}>SHARE</Text>
                </Pressable>
              </>
            )}
          </View>
        </BrutalCard>

        {/* Global Reach Stats Grid */}
        <View style={styles.statsGrid}>
          <BrutalCard variant="default" style={styles.gridCard}>
            <UsersIcon size={24} color={colors.foreground} />
            <Text style={[styles.gridCardTitle, { color: colors.foreground }]}>Global Reach</Text>
            <Text style={[styles.gridCardValue, { color: colors.foreground }]}>{analytics.totalResponses}</Text>
          </BrutalCard>

          <BrutalCard variant="default" style={styles.gridCard}>
            <ActivityIcon size={24} color={colors.foreground} />
            <Text style={[styles.gridCardTitle, { color: colors.foreground }]}>Live Status</Text>
            <Text style={[styles.gridCardValue, { color: colors.primary }]}>Active</Text>
          </BrutalCard>
        </View>

        {/* Response Summary Overview */}
        <BrutalCard variant="default">
          <Text style={[styles.sectionTitle, { color: colors.foreground, borderBottomColor: colors.border }]}>Response Summary</Text>
          
          {analytics.questions.map((q: any) => {
            return (
              <View key={q.questionId} style={styles.summaryQuestionBlock}>
                <Text style={[styles.summaryQuestionText, { color: colors.foreground }]}>{q.text}</Text>
                
                {/* Horizontal cumulative bar */}
                <View style={[styles.barContainer, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                  {q.options.map((opt: any, optIdx: number) => {
                    const percentage = parseFloat(opt.percentage);
                    if (percentage === 0) return null;
                    const barColor = Colors.chartColors[optIdx % Colors.chartColors.length];

                    return (
                      <View 
                        key={opt.optionId} 
                        style={[
                          styles.barSegment, 
                          { 
                            width: `${percentage}%`, 
                            backgroundColor: barColor 
                          }
                        ]} 
                      />
                    );
                  })}
                </View>

                {/* Option Legend list */}
                <View style={styles.legendContainer}>
                  {q.options.map((opt: any, optIdx: number) => {
                    const color = Colors.chartColors[optIdx % Colors.chartColors.length];
                    return (
                      <View key={opt.optionId} style={styles.legendItem}>
                        <View style={[styles.legendIndicator, { backgroundColor: color }]} />
                        <Text style={[styles.legendText, { color: colors.foreground }]}>
                          {opt.text} ({opt.percentage}%)
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            );
          })}
        </BrutalCard>

        {/* Live Tracking Cards */}
        <View style={styles.statsGrid}>
          <BrutalCard variant="default" style={styles.gridCard}>
            <TrophyIcon size={20} color={colors.foreground} style={styles.trophyIcon} />
            <Text style={[styles.gridCardTitle, { color: colors.foreground }]}>Crowd Fav</Text>
            <Text style={[styles.gridCardValue, { color: colors.primary }]} numberOfLines={1}>
              {analytics.mostVotedOption?.text || 'N/A'}
            </Text>
          </BrutalCard>

          <BrutalCard variant="default" style={styles.gridCard}>
            <UsersIcon size={20} color={colors.foreground} style={styles.trophyIcon} />
            <Text style={[styles.gridCardTitle, { color: colors.foreground }]}>Active Now</Text>
            <Text style={[styles.gridCardValue, { color: colors.accent }]}>{activeUsers}</Text>
          </BrutalCard>
        </View>

        {/* Donut Chart / Graphical Distribution using Svg */}
        {analytics.questions.map((q: any, qIdx: number) => {
          // Prepare donut chart parameters
          const totalVotes = q.totalVotes;
          let cumulativePercentage = 0;

          return (
            <BrutalCard key={q.questionId} variant="default" style={styles.chartCard}>
              <Text style={[styles.chartCardTitle, { color: colors.foreground }]}>Q{qIdx + 1}. Option Distribution</Text>
              
              <View style={styles.donutWrapper}>
                {totalVotes === 0 ? (
                  <View style={[styles.noVotesBox, { borderColor: colors.border }]}>
                    <Text style={[styles.noVotesText, { color: colors.mutedForeground }]}>No votes recorded yet</Text>
                  </View>
                ) : (
                  <Svg width={180} height={180} viewBox="0 0 120 120">
                    <G rotation="-90" origin="60, 60">
                      {q.options.map((opt: any, optIdx: number) => {
                        const percent = parseFloat(opt.percentage);
                        if (percent === 0) return null;
                        
                        const color = Colors.chartColors[optIdx % Colors.chartColors.length];
                        const radius = 40;
                        const circumference = 2 * Math.PI * radius; // 251.32
                        const strokeDasharray = `${(percent / 100) * circumference} ${circumference}`;
                        const strokeDashoffset = -((cumulativePercentage / 100) * circumference);
                        
                        cumulativePercentage += percent;

                        return (
                          <Circle
                            key={opt.optionId}
                            cx="60"
                            cy="60"
                            r={radius}
                            stroke={color}
                            strokeWidth="15"
                            fill="transparent"
                            strokeDasharray={strokeDasharray}
                            strokeDashoffset={strokeDashoffset}
                          />
                        );
                      })}
                    </G>
                    {/* Inner Label */}
                    <Circle cx="60" cy="60" r="28" fill={colors.card} stroke={colors.border} strokeWidth="1" />
                  </Svg>
                )}

                <View style={styles.donutTextContainer}>
                  <Text style={[styles.donutTextSub, { color: colors.mutedForeground }]}>Total</Text>
                  <Text style={[styles.donutTextMain, { color: colors.foreground }]}>{totalVotes}</Text>
                </View>
              </View>

              {/* Vote Count Details List */}
              <View style={styles.detailsList}>
                {q.options.map((opt: any, optIdx: number) => {
                  const color = Colors.chartColors[optIdx % Colors.chartColors.length];
                  return (
                    <View key={opt.optionId} style={[styles.detailsRow, { borderBottomColor: colors.muted }]}>
                      <View style={styles.detailsLeft}>
                        <View style={[styles.legendIndicator, { backgroundColor: color }]} />
                        <Text style={[styles.detailsName, { color: colors.foreground }]}>{opt.text}</Text>
                      </View>
                      <Text style={[styles.detailsCount, { color: colors.foreground }]}>{opt.voteCount} Votes</Text>
                    </View>
                  );
                })}
              </View>
            </BrutalCard>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090b',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
    borderBottomColor: '#27272a',
  },
  backBtn: {
    marginVertical: 0,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  backBtnText: {
    fontSize: 10,
  },
  headerTitle: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginLeft: 16,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 20,
  },
  loadingText: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
  },
  errorText: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  errorSub: {
    color: Colors.mutedForeground,
    fontFamily: 'SpaceMono',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  pollTitle: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  gridCard: {
    flex: 1,
    marginVertical: 0,
    padding: 16,
  },
  gridCardTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 8,
    letterSpacing: 1.2,
  },
  gridCardValue: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  trophyIcon: {
    marginBottom: 2,
  },
  sectionTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    borderBottomWidth: 1.5,
    paddingBottom: 8,
    marginBottom: 16,
  },
  summaryQuestionBlock: {
    marginBottom: 20,
  },
  summaryQuestionText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  barContainer: {
    height: 16,
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 8,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  barSegment: {
    height: '100%',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
  },
  chartCard: {
    marginBottom: 16,
  },
  chartCardTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  donutWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
    marginVertical: 10,
    position: 'relative',
  },
  donutTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutTextSub: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  donutTextMain: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    fontWeight: '900',
  },
  noVotesBox: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#3f3f46',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noVotesText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  detailsList: {
    marginTop: 16,
    gap: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  detailsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsName: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '700',
  },
  detailsCount: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
  },
  actionCard: {
    marginBottom: 16,
    padding: 16,
  },
  actionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  actionSectionTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  statusSubtitle: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    marginTop: 2,
  },
  statusTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#09090b',
  },
  statusTagText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
  },
  analyticsActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  publishBtn: {
    flex: 1.4,
    height: 46,
    backgroundColor: '#009689',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#09090b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  publishBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  voteBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#10B981',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#09090b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  voteBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  publishedViewBtn: {
    flex: 1.4,
    height: 46,
    backgroundColor: '#10B981',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#09090b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  publishedViewBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  shareBtn: {
    flex: 1,
    height: 46,
    backgroundColor: '#FFCC00',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#09090b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  shareBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#09090b',
  },
});
