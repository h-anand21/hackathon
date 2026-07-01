import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  Platform,
  Alert,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BrutalCard, BrutalButton } from '../../components/Brutal';
import { Colors } from '../../constants/Theme';
import { api } from '../../utils/api';
import { socket } from '../../utils/socket';
import { Users, TrendingUp, Trophy, ArrowLeft, Heart } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import Svg, { Circle, G } from 'react-native-svg';

const UsersIcon = Users as any;
const TrendingUpIcon = TrendingUp as any;
const TrophyIcon = Trophy as any;
const ArrowLeftIcon = ArrowLeft as any;

export default function PublishedResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();

  const [data, setData] = useState<any>(null);
  const [activeUsers, setActiveUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResults = () => {
    if (!id) return;
    setLoading(true);
    
    api.get(`/public/poll/${id}/results`)
      .then(res => {
        if (res.data.success) {
          setData(res.data);
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.error || "Results are not public or not found");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!id) return;

    fetchResults();

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
          <Text style={[styles.loadingText, { color: colors.foreground }]}>Loading Final Insights...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !data) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <TrophyIcon size={48} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.foreground }]}>Results Locked</Text>
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <BrutalButton
          title="< Back"
          variant="default"
          onPress={() => router.replace('/(tabs)')}
          style={styles.backBtn}
          textStyle={styles.backBtnText}
        />
        <Text style={[styles.headerTitle, { color: colors.foreground }]}>Final Results</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Badge */}
        <View style={[styles.badge, { backgroundColor: colors.primary + '22', borderColor: colors.primary }]}>
          <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.badgeText, { color: colors.primary }]}>LIVE RESULTS</Text>
        </View>

        {/* Title */}
        <Text style={[styles.pollTitle, { color: colors.foreground }]}>{poll.title}</Text>
        {poll.description ? (
          <Text style={[styles.pollDesc, { color: colors.mutedForeground }]}>{poll.description}</Text>
        ) : null}

        {/* Reach Stats */}
        <View style={styles.statsGrid}>
          <BrutalCard variant="primary" style={styles.gridCard}>
            <UsersIcon size={24} color="#09090b" />
            <Text style={styles.gridCardTitle}>Total Votes</Text>
            <Text style={styles.gridCardValue}>{analytics.totalResponses}</Text>
          </BrutalCard>

          <BrutalCard variant="accent" style={styles.gridCard}>
            <TrophyIcon size={24} color="#09090b" />
            <Text style={styles.gridCardTitle}>Active Voters</Text>
            <Text style={styles.gridCardValue}>{activeUsers}</Text>
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

        {/* Donut Chart / Graphical Distribution using Svg */}
        {analytics.questions.map((q: any, qIdx: number) => {
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
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1.5,
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
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
  },
  errorText: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  errorSub: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  pollTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pollDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 14,
    gap: 6,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'SpaceMono',
    fontWeight: '900',
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
    fontSize: 11,
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
});
