import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  SafeAreaView, 
  Platform,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { BrutalCard, BrutalButton } from '../../components/Brutal';
import { Colors } from '../../constants/Theme';
import { api } from '../../utils/api';
import { socket } from '../../utils/socket';
import { Users, TrendingUp, Trophy, Activity, ArrowLeft } from 'lucide-react-native';
import Svg, { Circle, G } from 'react-native-svg';

const UsersIcon = Users as any;
const TrendingUpIcon = TrendingUp as any;
const TrophyIcon = Trophy as any;
const ActivityIcon = Activity as any;
const ArrowLeftIcon = ArrowLeft as any;

export default function PollAnalyticsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoaded: isAuthLoaded, userId } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = () => {
    if (!id) return;
    setLoading(true);
    
    // For results page, we use the public results endpoint
    api.get(`/public/poll/${id}/results`)
      .then(res => {
        if (res.data.success) {
          setData(res.data);
        }
      })
      .catch(err => {
        console.error(err);
        // Fallback: If not published, maybe they are the creator?
        // Let's try to fetch creator analytics endpoint
        api.get(`/analytics/${id}`)
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
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching Live Stats...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>Stats Locked</Text>
          <Text style={styles.errorSub}>{error || 'Poll data is not public yet.'}</Text>
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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <BrutalButton
          title="< Exit"
          variant="default"
          onPress={() => router.replace('/(tabs)')}
          style={styles.backBtn}
          textStyle={styles.backBtnText}
        />
        <Text style={styles.headerTitle}>Analytics Room</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.pollTitle}>{poll.title}</Text>

        {/* Global Reach Stats Grid */}
        <View style={styles.statsGrid}>
          <BrutalCard variant="primary" style={styles.gridCard}>
            <UsersIcon size={24} color="#09090b" />
            <Text style={styles.gridCardTitle}>Global Reach</Text>
            <Text style={styles.gridCardValue}>{analytics.totalResponses}</Text>
          </BrutalCard>

          <BrutalCard variant="accent" style={styles.gridCard}>
            <ActivityIcon size={24} color="#09090b" />
            <Text style={styles.gridCardTitle}>Live Status</Text>
            <Text style={styles.gridCardValue}>Active</Text>
          </BrutalCard>
        </View>

        {/* Response Summary Overview */}
        <BrutalCard variant="default">
          <Text style={styles.sectionTitle}>Response Summary</Text>
          
          {analytics.questions.map((q: any) => {
            return (
              <View key={q.questionId} style={styles.summaryQuestionBlock}>
                <Text style={styles.summaryQuestionText}>{q.text}</Text>
                
                {/* Horizontal cumulative bar */}
                <View style={styles.barContainer}>
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
                        <Text style={styles.legendText}>
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
            <TrophyIcon size={20} color="#ffffff" style={styles.trophyIcon} />
            <Text style={[styles.gridCardTitle, { color: '#ffffff' }]}>Crowd Fav</Text>
            <Text style={[styles.gridCardValue, { color: Colors.primary }]} numberOfLines={1}>
              {analytics.mostVotedOption?.text || 'N/A'}
            </Text>
          </BrutalCard>

          <BrutalCard variant="default" style={styles.gridCard}>
            <UsersIcon size={20} color="#ffffff" style={styles.trophyIcon} />
            <Text style={[styles.gridCardTitle, { color: '#ffffff' }]}>Active Now</Text>
            <Text style={[styles.gridCardValue, { color: Colors.accent }]}>{activeUsers}</Text>
          </BrutalCard>
        </View>

        {/* Donut Chart / Graphical Distribution using Svg */}
        {analytics.questions.map((q: any, qIdx: number) => {
          // Prepare donut chart parameters
          const totalVotes = q.totalVotes;
          let cumulativePercentage = 0;

          return (
            <BrutalCard key={q.questionId} variant="default" style={styles.chartCard}>
              <Text style={styles.chartCardTitle}>Q{qIdx + 1}. Option Distribution</Text>
              
              <View style={styles.donutWrapper}>
                {totalVotes === 0 ? (
                  <View style={styles.noVotesBox}>
                    <Text style={styles.noVotesText}>No votes recorded yet</Text>
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
                    <Circle cx="60" cy="60" r="28" fill="#09090b" stroke="#ffffff" strokeWidth="1" />
                  </Svg>
                )}

                <View style={styles.donutTextContainer}>
                  <Text style={styles.donutTextSub}>Total</Text>
                  <Text style={styles.donutTextMain}>{totalVotes}</Text>
                </View>
              </View>

              {/* Vote Count Details List */}
              <View style={styles.detailsList}>
                {q.options.map((opt: any, optIdx: number) => {
                  const color = Colors.chartColors[optIdx % Colors.chartColors.length];
                  return (
                    <View key={opt.optionId} style={styles.detailsRow}>
                      <View style={styles.detailsLeft}>
                        <View style={[styles.legendIndicator, { backgroundColor: color }]} />
                        <Text style={styles.detailsName}>{opt.text}</Text>
                      </View>
                      <Text style={styles.detailsCount}>{opt.voteCount} Votes</Text>
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
    color: '#09090b',
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 8,
    letterSpacing: 1.2,
  },
  gridCardValue: {
    color: '#09090b',
    fontFamily: 'SpaceMono',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 4,
  },
  trophyIcon: {
    marginBottom: 2,
  },
  sectionTitle: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    borderBottomWidth: 1.5,
    borderBottomColor: '#ffffff',
    paddingBottom: 8,
    marginBottom: 16,
  },
  summaryQuestionBlock: {
    marginBottom: 20,
  },
  summaryQuestionText: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 10,
  },
  barContainer: {
    height: 16,
    width: '100%',
    backgroundColor: '#18181b',
    borderWidth: 1.5,
    borderColor: '#ffffff',
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
    color: Colors.mutedForeground,
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
  },
  chartCard: {
    marginBottom: 16,
  },
  chartCardTitle: {
    color: '#ffffff',
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
    color: Colors.mutedForeground,
    fontFamily: 'SpaceMono',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  donutTextMain: {
    color: '#ffffff',
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
    color: Colors.mutedForeground,
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
    borderBottomColor: '#18181b',
  },
  detailsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsName: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '700',
  },
  detailsCount: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
  },
});
