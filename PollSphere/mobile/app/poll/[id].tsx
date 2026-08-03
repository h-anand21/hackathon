import React, { useEffect, useState, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  ActivityIndicator, 
  Platform,
  Alert,
  KeyboardAvoidingView,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';
import { BrutalCard, BrutalButton } from '../../components/Brutal';
import { Colors } from '../../constants/Theme';
import { api } from '../../utils/api';
import { socket } from '../../utils/socket';
import { Clock, AlertTriangle, CheckCircle, ArrowLeft, Lock } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const ClockIcon = Clock as any;
const AlertTriangleIcon = AlertTriangle as any;
const CheckCircleIcon = CheckCircle as any;
const ArrowLeftIcon = ArrowLeft as any;
const LockIcon = Lock as any;

export default function PollVotingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isLoaded: isAuthLoaded, userId, isSignedIn } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  const [poll, setPoll] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    // Connect socket and join poll room immediately
    socket.connect();
    socket.emit('join_poll_room', id);

    // Fetch poll data
    api.get(`/public/poll/${id}`)
      .then(res => {
        if (res.data.success) {
          const pollData = res.data.poll;
          
          // If poll is already expired or published, redirect directly to results
          if (pollData.status === 'published' || pollData.status === 'expired') {
            router.replace(`/published/${id}` as any);
            return;
          }
          
          setPoll(pollData);
          setQuestions(res.data.questions || []);
        }
      })
      .catch(err => {
        console.error(err);
        const msg = err.response?.data?.error || "Failed to load poll room.";
        setError(msg);
      })
      .finally(() => setLoading(false));

    return () => {
      socket.emit('leave_poll_room', id);
      socket.disconnect();
    };
  }, [id]);

  const handleOptionSelect = (questionId: string, optionId: string, isMulti: boolean) => {
    setAnswers(prev => {
      if (isMulti) {
        const current = (prev[questionId] as string[]) || [];
        const next = current.includes(optionId) 
          ? current.filter(item => item !== optionId) 
          : [...current, optionId];
        return { ...prev, [questionId]: next };
      }
      return { ...prev, [questionId]: optionId };
    });
  };

  const handleSubmitVote = async () => {
    setError('');

    // Mandatory checks
    const missingQuestionIds: string[] = [];
    questions.forEach(q => {
      if (q.isMandatory) {
        const ans = answers[q._id];
        if (!ans || (Array.isArray(ans) && ans.length === 0)) {
          missingQuestionIds.push(q._id);
        }
      }
    });

    if (missingQuestionIds.length > 0) {
      Alert.alert('Validation Error', 'Please answer all mandatory questions.');
      return;
    }

    setSubmitting(true);

    const formattedAnswers = Object.keys(answers).map(qId => {
      const val = answers[qId];
      if (Array.isArray(val)) {
        return { questionId: qId, optionIds: val };
      }
      return { questionId: qId, optionId: val };
    });

    try {
      const res = await api.post(`/public/poll/${id}/submit`, {
        answers: formattedAnswers
      });

      if (res.data.success) {
        Alert.alert('Success', 'Vote submitted successfully!', [
          { text: 'View Results', onPress: () => router.replace(`/published/${id}` as any) }
        ]);
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || 'Failed to submit vote. Try again.';
      Alert.alert('Vote Failed', errMsg);
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.foreground }]}>Entering Poll Room...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !poll) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <AlertTriangleIcon size={48} color={colors.destructive} />
          <Text style={[styles.errorText, { color: colors.foreground }]}>Room Error</Text>
          <Text style={[styles.errorSub, { color: colors.mutedForeground }]}>{error || 'Poll not found'}</Text>
          <BrutalButton
            title="Go back to Dashboard"
            variant="default"
            onPress={() => router.replace('/(tabs)')}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (poll.responseMode === 'authenticated' && isAuthLoaded && !isSignedIn) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <LockIcon size={48} color={colors.accent} />
          <Text style={[styles.errorText, { color: colors.foreground }]}>Login Required</Text>
          <Text style={[styles.errorSub, { color: colors.mutedForeground }]}>
            The creator of this poll requires voters to sign in to participate.
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
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flexContainer}
      >
        {/* Simple Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <BrutalButton
            title="< Back"
            variant="default"
            onPress={() => router.back()}
            style={styles.backBtn}
            textStyle={styles.backBtnText}
          />
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Voting Room</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Poll Card Header */}
          <BrutalCard variant="accent" style={styles.pollInfoCard}>
            <Text style={styles.pollTitle}>{poll.title}</Text>
            {poll.description ? <Text style={styles.pollDesc}>{poll.description}</Text> : null}
            
            <View style={styles.expiryRow}>
              <ClockIcon size={14} color="#09090b" />
              <Text style={styles.expiryText}>
                Expires: {new Date(poll.expiresAt).toLocaleTimeString()}
              </Text>
            </View>
          </BrutalCard>

          {/* Render Questions */}
          {questions.map((q, qIdx) => {
            return (
              <BrutalCard key={q._id} variant="default" style={styles.questionCard}>
                <View style={styles.questionHeadingRow}>
                  <Text style={[styles.questionIndex, { color: colors.primary }]}>Question {qIdx + 1}</Text>
                  {q.isMandatory && <Text style={styles.requiredBadge}>Required</Text>}
                </View>
                <Text style={[styles.questionText, { color: colors.foreground }]}>{q.text}</Text>

                {/* Options List */}
                <View style={styles.optionsList}>
                  {q.options.map((opt: any) => {
                    const isMulti = q.allowMultiple;
                    const isSelected = isMulti 
                      ? (answers[q._id] as string[])?.includes(opt._id)
                      : answers[q._id] === opt._id;

                    return (
                      <Pressable 
                        key={opt._id}
                        onPress={() => handleOptionSelect(q._id, opt._id, isMulti)}
                        style={[
                          styles.optionButton,
                          {
                            backgroundColor: isSelected ? colors.primary + '1F' : colors.card,
                            borderColor: isSelected ? colors.primary : colors.border,
                          }
                        ]}
                      >
                        <View style={[
                          styles.checkbox,
                          isMulti && styles.checkboxSquare,
                          {
                            borderColor: isSelected ? colors.primary : colors.border,
                            backgroundColor: isSelected ? colors.primary : 'transparent',
                          }
                        ]}>
                          {isSelected && <CheckCircleIcon size={12} color="#ffffff" />}
                        </View>
                        <Text style={[
                          styles.optionText,
                          { color: isSelected ? colors.primary : colors.foreground }
                        ]}>
                          {opt.text}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </BrutalCard>
            );
          })}

          {/* Action Trigger */}
          {submitting ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <BrutalButton
              title="Cast My Vote Now"
              variant="primary"
              onPress={handleSubmitVote}
              style={styles.submitBtn}
            />
          )}

          <Text style={styles.footnote}>
            One vote per IP address • Secure encrypted submission
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090b',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  flexContainer: {
    flex: 1,
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
    color: Colors.mutedForeground,
    fontFamily: 'SpaceMono',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  pollInfoCard: {
    marginVertical: 0,
    marginBottom: 20,
  },
  pollTitle: {
    color: '#09090b',
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  pollDesc: {
    color: '#1f2937',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 12,
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  expiryText: {
    color: '#09090b',
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
  },
  questionCard: {
    marginBottom: 20,
  },
  questionHeadingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionIndex: {
    color: Colors.primary,
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  requiredBadge: {
    backgroundColor: Colors.destructive,
    color: '#09090b',
    fontFamily: 'SpaceMono',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  questionText: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 16,
  },
  optionsList: {
    gap: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSquare: {
    borderRadius: 4,
  },
  optionText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  submitBtn: {
    marginTop: 10,
    height: 56,
    justifyContent: 'center',
  },
  footnote: {
    color: Colors.mutedForeground,
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
});
