import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Pressable,
  Animated,
  Easing,
  Image,
  TextInput
} from 'react-native';
import { useSignIn, useSignUp, useOAuth, useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { BrutalCard, BrutalButton, BrutalInput } from '../components/Brutal';
import { Colors } from '../constants/Theme';
import { setAuthToken } from '../utils/api';
import { 
  Zap, 
  Shield, 
  BarChart3, 
  Users, 
  Trophy, 
  ArrowRight, 
  Plus, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  User, 
  ShieldCheck, 
  ChevronRight 
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '../contexts/ThemeContext';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const ONBOARDING_KEY = 'pollsphere_onboarding_done';

const ZapIcon = Zap as any;
const ShieldIcon = Shield as any;
const BarChartIcon = BarChart3 as any;
const UsersIcon = Users as any;
const TrophyIcon = Trophy as any;
const ArrowRightIcon = ArrowRight as any;
const PlusIcon = Plus as any;
const MailIcon = Mail as any;
const LockIcon = Lock as any;
const EyeIcon = Eye as any;
const EyeOffIcon = EyeOff as any;
const UserIcon = User as any;
const ShieldCheckIcon = ShieldCheck as any;
const ChevronRightIcon = ChevronRight as any;

// --- Animation Components for 6 Onboarding Screens ---
const FloatingPlusOne = ({ delay, left }: { delay: number; left: number }) => {
  const animatedY = useRef(new Animated.Value(0)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      animatedY.setValue(0);
      animatedOpacity.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animatedY, { toValue: -80, duration: 1800, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(animatedOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(animatedOpacity, { toValue: 0, duration: 1500, useNativeDriver: true }),
          ])
        ])
      ]).start(() => run());
    };
    run();
  }, []);

  return (
    <Animated.Text style={[animStyles.plusOneText, { left, transform: [{ translateY: animatedY }], opacity: animatedOpacity }]}>
      +1
    </Animated.Text>
  );
};

const LiveSocketsAnim = () => {
  const [reactVotes, setReactVotes] = useState(45);
  const [nextVotes, setNextVotes] = useState(32);
  const [vueVotes, setVueVotes] = useState(15);
  const [svelteVotes, setSvelteVotes] = useState(8);
  const [hasVoted, setHasVoted] = useState(false);
  const [statusText, setStatusText] = useState('👉 TAP AN OPTION TO CAST A LIVE TEST VOTE');

  const widthReact = useRef(new Animated.Value(0)).current;
  const widthNext = useRef(new Animated.Value(0)).current;
  const widthVue = useRef(new Animated.Value(0)).current;
  const widthSvelte = useRef(new Animated.Value(0)).current;

  const [spawnReact, setSpawnReact] = useState(false);
  const [spawnNext, setSpawnNext] = useState(false);

  useEffect(() => {
    // Initial grow animation
    Animated.parallel([
      Animated.timing(widthReact, { toValue: 45, duration: 1000, useNativeDriver: false }),
      Animated.timing(widthNext, { toValue: 32, duration: 1000, useNativeDriver: false }),
      Animated.timing(widthVue, { toValue: 15, duration: 1000, useNativeDriver: false }),
      Animated.timing(widthSvelte, { toValue: 8, duration: 1000, useNativeDriver: false }),
    ]).start();

    // Automated background fluctuation loop to show the graph is active/moving
    let interval: any;
    let tickCount = 0;

    interval = setInterval(() => {
      if (hasVoted) return;

      tickCount++;
      const deltaReact = Math.sin(tickCount) * 2;
      const deltaNext = Math.cos(tickCount) * 2;
      const deltaVue = Math.sin(tickCount * 1.5) * 1.5;

      const newReact = Math.max(38, Math.min(52, 45 + Math.round(deltaReact)));
      const newNext = Math.max(26, Math.min(38, 32 + Math.round(deltaNext)));
      const newVue = Math.max(10, Math.min(20, 15 + Math.round(deltaVue)));

      setReactVotes(newReact);
      setNextVotes(newNext);
      setVueVotes(newVue);

      Animated.parallel([
        Animated.timing(widthReact, { toValue: newReact, duration: 800, useNativeDriver: false }),
        Animated.timing(widthNext, { toValue: newNext, duration: 800, useNativeDriver: false }),
        Animated.timing(widthVue, { toValue: newVue, duration: 800, useNativeDriver: false }),
      ]).start();
    }, 2500);

    return () => clearInterval(interval);
  }, [hasVoted]);

  const handleVote = (option: string) => {
    if (hasVoted) return;
    setHasVoted(true);

    if (option === 'React') {
      setReactVotes(46);
      setSpawnReact(true);
      setStatusText('⚡ VOTE TRANSMITTED! SYNCING TO CLOUD...');
      Animated.timing(widthReact, { toValue: 46, duration: 300, useNativeDriver: false }).start(() => {
        setTimeout(() => {
          setNextVotes(33);
          setSpawnNext(true);
          setStatusText('📢 USER_482 VOTED FOR NEXT.JS IN REAL-TIME!');
          Animated.timing(widthNext, { toValue: 33, duration: 300, useNativeDriver: false }).start();
        }, 1500);
      });
    } else if (option === 'Next') {
      setNextVotes(33);
      setSpawnNext(true);
      setStatusText('⚡ VOTE TRANSMITTED! SYNCING TO CLOUD...');
      Animated.timing(widthNext, { toValue: 33, duration: 300, useNativeDriver: false }).start(() => {
        setTimeout(() => {
          setReactVotes(46);
          setSpawnReact(true);
          setStatusText('📢 USER_913 VOTED FOR REACT IN REAL-TIME!');
          Animated.timing(widthReact, { toValue: 46, duration: 300, useNativeDriver: false }).start();
        }, 1500);
      });
    } else if (option === 'Vue') {
      setVueVotes(16);
      setStatusText('⚡ VOTE TRANSMITTED! SYNCING TO CLOUD...');
      Animated.timing(widthVue, { toValue: 16, duration: 300, useNativeDriver: false }).start();
    } else if (option === 'Svelte') {
      setSvelteVotes(9);
      setStatusText('⚡ VOTE TRANSMITTED! SYNCING TO CLOUD...');
      Animated.timing(widthSvelte, { toValue: 9, duration: 300, useNativeDriver: false }).start();
    }
  };

  return (
    <View style={animStyles.slideInner}>
      {/* Mock Poll Options */}
      <Pressable style={animStyles.pollOption} onPress={() => handleVote('React')}>
        <View style={animStyles.optionTextRow}>
          <Text style={animStyles.optionLabel}>React</Text>
          <Text style={[animStyles.optionValue, { color: '#2dd4bf' }]}>{reactVotes}% 🔥</Text>
        </View>
        <View style={animStyles.track}>
          <Animated.View style={[animStyles.bar, { width: widthReact.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), backgroundColor: '#2dd4bf' }]} />
        </View>
      </Pressable>

      <Pressable style={animStyles.pollOption} onPress={() => handleVote('Next')}>
        <View style={animStyles.optionTextRow}>
          <Text style={animStyles.optionLabel}>Next.js</Text>
          <Text style={[animStyles.optionValue, { color: '#fbbf24' }]}>{nextVotes}%</Text>
        </View>
        <View style={animStyles.track}>
          <Animated.View style={[animStyles.bar, { width: widthNext.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), backgroundColor: '#fbbf24' }]} />
        </View>
      </Pressable>

      <Pressable style={animStyles.pollOption} onPress={() => handleVote('Vue')}>
        <View style={animStyles.optionTextRow}>
          <Text style={animStyles.optionLabel}>Vue.js</Text>
          <Text style={[animStyles.optionValue, { color: '#c084fc' }]}>{vueVotes}%</Text>
        </View>
        <View style={animStyles.track}>
          <Animated.View style={[animStyles.bar, { width: widthVue.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), backgroundColor: '#c084fc' }]} />
        </View>
      </Pressable>

      <Pressable style={animStyles.pollOption} onPress={() => handleVote('Svelte')}>
        <View style={animStyles.optionTextRow}>
          <Text style={animStyles.optionLabel}>Svelte</Text>
          <Text style={[animStyles.optionValue, { color: '#f43f5e' }]}>{svelteVotes}%</Text>
        </View>
        <View style={animStyles.track}>
          <Animated.View style={[animStyles.bar, { width: widthSvelte.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }), backgroundColor: '#f43f5e' }]} />
        </View>
      </Pressable>

      {/* Floating +1 elements */}
      {spawnReact && <FloatingPlusOne delay={0} left={80} />}
      {spawnNext && <FloatingPlusOne delay={0} left={180} />}

      {/* Status Box */}
      <View style={animStyles.interactiveStatusBox}>
        <Text style={animStyles.interactiveStatusText}>{statusText}</Text>
      </View>
    </View>
  );
};

const SpamShieldAnim = () => {
  const shieldScale = useRef(new Animated.Value(1)).current;
  const statusOpacity = useRef(new Animated.Value(0)).current;
  const spamOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      statusOpacity.setValue(0);
      spamOpacity.setValue(0);
      
      Animated.sequence([
        Animated.timing(spamOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.delay(400),
        Animated.timing(shieldScale, { toValue: 1.25, duration: 250, useNativeDriver: true }),
        Animated.parallel([
          Animated.timing(shieldScale, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(statusOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
        ]),
        Animated.delay(1600),
      ]).start(() => run());
    };
    run();
  }, []);

  return (
    <View style={[animStyles.slideInner, { justifyContent: 'center', alignItems: 'center' }]}>
      <Animated.View style={{ transform: [{ scale: shieldScale }], marginBottom: 12 }}>
        <ShieldIcon size={56} color="#fbbf24" />
      </Animated.View>

      <View style={animStyles.logContainer}>
        <Text style={animStyles.logTitle}>IP REQUEST GATEWAY LOG:</Text>
        <Text style={animStyles.logItemAllowed}>IP 10.19.87.162: ✅ VOTE OK</Text>
        <Animated.View style={{ opacity: spamOpacity }}>
          <Text style={animStyles.logItemAttempt}>IP 10.19.87.162: ⏳ SENDING VOTE...</Text>
        </Animated.View>
        <Animated.View style={{ opacity: statusOpacity }}>
          <Text style={animStyles.logItemBlocked}>IP 10.19.87.162: ❌ BLOCKED (SPAM GATED)</Text>
        </Animated.View>
      </View>
    </View>
  );
};

const AnalyticsChartAnim = () => {
  const bar1 = useRef(new Animated.Value(20)).current;
  const bar2 = useRef(new Animated.Value(45)).current;
  const bar3 = useRef(new Animated.Value(85)).current;
  const bar4 = useRef(new Animated.Value(60)).current;
  const bar5 = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    const loop = (val: Animated.Value, to: number, duration: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: to, duration, useNativeDriver: false }),
          Animated.timing(val, { toValue: 15, duration, useNativeDriver: false }),
        ])
      ).start();
    };
    loop(bar1, 70, 1100);
    loop(bar2, 85, 900);
    loop(bar3, 95, 1400);
    loop(bar4, 75, 1000);
    loop(bar5, 60, 1200);
  }, []);

  return (
    <View style={[animStyles.slideInner, { justifyContent: 'center' }]}>
      <View style={animStyles.chartHeaderRow}>
        <Text style={animStyles.chartHeaderText}>Live Analytics Feed</Text>
        <Text style={animStyles.chartHeaderValue}>Voters: 2,492</Text>
      </View>

      <View style={animStyles.barChartContainer}>
        <Animated.View style={[animStyles.chartBar, { height: bar1, backgroundColor: '#2dd4bf' }]} />
        <Animated.View style={[animStyles.chartBar, { height: bar2, backgroundColor: '#fbbf24' }]} />
        <Animated.View style={[animStyles.chartBar, { height: bar3, backgroundColor: '#60a5fa' }]} />
        <Animated.View style={[animStyles.chartBar, { height: bar4, backgroundColor: '#c084fc' }]} />
        <Animated.View style={[animStyles.chartBar, { height: bar5, backgroundColor: '#f43f5e' }]} />
      </View>
    </View>
  );
};

const ResponseModesAnim = () => {
  const [isSecured, setIsSecured] = useState(false);
  const togglePos = useRef(new Animated.Value(2)).current;

  useEffect(() => {
    let active = false;
    const interval = setInterval(() => {
      active = !active;
      setIsSecured(active);
      Animated.timing(togglePos, {
        toValue: active ? 22 : 2,
        duration: 300,
        useNativeDriver: false
      }).start();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[animStyles.slideInner, { justifyContent: 'center', alignItems: 'center' }]}>
      <View style={animStyles.modeSwitchRow}>
        <Text style={animStyles.modeSwitchLabel}>Voter Login Required</Text>
        <View style={[animStyles.switchTrack, { backgroundColor: isSecured ? '#10b981' : '#3f3f46' }]}>
          <Animated.View style={[animStyles.switchThumb, { left: togglePos }]} />
        </View>
      </View>

      <View style={animStyles.modeStatusCard}>
        <Text style={animStyles.modeStatusTitle}>Room Status:</Text>
        <View style={[animStyles.modeIndicator, { backgroundColor: isSecured ? '#10b981' : '#ef4444' }]}>
          <Text style={animStyles.modeIndicatorText}>
            {isSecured ? 'CLERK SECURED ONLY' : 'ANONYMOUS GUESTS WELCOME'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const CampaignWizardAnim = () => {
  const [typingStage, setTypingStage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingStage((prev) => (prev + 1) % 4);
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={[animStyles.slideInner, { justifyContent: 'center' }]}>
      <View style={animStyles.wizardForm}>
        <View style={animStyles.wizardField}>
          <Text style={animStyles.wizardLabel}>Campaign Title</Text>
          <Text style={animStyles.wizardInputText}>
            {typingStage >= 1 ? 'Office Feedback Poll' : ' '}
          </Text>
        </View>
        <View style={animStyles.wizardField}>
          <Text style={animStyles.wizardLabel}>Choices</Text>
          <Text style={animStyles.wizardInputText}>
            {typingStage >= 2 ? 'Option 1: Espresso ☕\nOption 2: Latte 🥛' : ' '}
          </Text>
        </View>
        <View style={[animStyles.wizardPublishBtn, { backgroundColor: typingStage >= 3 ? '#2dd4bf' : '#3f3f46' }]}>
          <Text style={animStyles.wizardPublishBtnText}>
            {typingStage >= 3 ? '✓ PUBLISHED LIVE' : 'PUBLISH NOW'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const ConfettiItem = ({ emoji, delay, left }: { emoji: string; delay: number; left: number }) => {
  const animatedY = useRef(new Animated.Value(-20)).current;
  const animatedOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const run = () => {
      animatedY.setValue(-20);
      animatedOpacity.setValue(0);
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(animatedY, { toValue: 80, duration: 2200, useNativeDriver: true }),
          Animated.sequence([
            Animated.timing(animatedOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
            Animated.timing(animatedOpacity, { toValue: 0, duration: 1800, useNativeDriver: true }),
          ])
        ])
      ]).start(() => run());
    };
    run();
  }, []);

  return (
    <Animated.Text style={[animStyles.confettiText, { left, transform: [{ translateY: animatedY }], opacity: animatedOpacity }]}>
      {emoji}
    </Animated.Text>
  );
};

const TrophyInsightsAnim = () => {
  const trophyY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(trophyY, { toValue: -20, duration: 500, useNativeDriver: true }),
        Animated.timing(trophyY, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.delay(100),
      ])
    ).start();
  }, []);

  return (
    <View style={[animStyles.slideInner, { justifyContent: 'center', alignItems: 'center' }]}>
      <Animated.View style={{ transform: [{ translateY: trophyY }], marginBottom: 8 }}>
        <TrophyIcon size={48} color="#fbbf24" />
      </Animated.View>

      <Text style={animStyles.winnerTitle}>WINNER DECLARED 👑</Text>
      <View style={animStyles.winnerBox}>
        <Text style={animStyles.winnerLabel}>React.js</Text>
        <Text style={animStyles.winnerValue}>842 Votes (64%)</Text>
      </View>

      {/* Confetti Spawners */}
      <ConfettiItem emoji="🎉" delay={100} left={40} />
      <ConfettiItem emoji="✨" delay={600} left={100} />
      <ConfettiItem emoji="🎈" delay={1100} left={180} />
      <ConfettiItem emoji="👑" delay={1600} left={240} />
    </View>
  );
};

const animStyles = StyleSheet.create({
  center: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  slideInner: {
    width: '100%',
    height: 180,
    position: 'relative',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  pollOption: {
    marginBottom: 6,
  },
  optionTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  optionLabel: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
  },
  optionValue: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
  },
  track: {
    height: 12,
    backgroundColor: '#27272a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ffffff',
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
  },
  plusOneText: {
    position: 'absolute',
    color: '#2dd4bf',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'SpaceMono',
  },
  logContainer: {
    backgroundColor: '#09090b',
    borderColor: '#ffffff',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 8,
    width: '100%',
  },
  logTitle: {
    color: '#a1a1aa',
    fontFamily: 'SpaceMono',
    fontSize: 8,
    fontWeight: '900',
  },
  logItemAllowed: {
    color: '#10b981',
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
  },
  logItemAttempt: {
    color: '#fbbf24',
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
  },
  logItemBlocked: {
    color: '#ef4444',
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    marginTop: 2,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  chartHeaderText: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  chartHeaderValue: {
    color: '#2dd4bf',
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 100,
    backgroundColor: '#09090b',
    borderColor: '#ffffff',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 10,
  },
  chartBar: {
    width: 16,
    borderRadius: 3,
  },
  modeSwitchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    backgroundColor: '#09090b',
    borderColor: '#ffffff',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  modeSwitchLabel: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
  },
  switchTrack: {
    width: 44,
    height: 22,
    borderRadius: 11,
    position: 'relative',
    justifyContent: 'center',
  },
  switchThumb: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#ffffff',
    position: 'absolute',
  },
  modeStatusCard: {
    width: '100%',
    alignItems: 'center',
  },
  modeStatusTitle: {
    color: '#a1a1aa',
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  modeIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#09090b',
  },
  modeIndicatorText: {
    color: '#09090b',
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
  },
  wizardForm: {
    backgroundColor: '#09090b',
    borderColor: '#ffffff',
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 10,
    gap: 6,
  },
  wizardField: {
    marginBottom: 2,
  },
  wizardLabel: {
    color: '#a1a1aa',
    fontFamily: 'SpaceMono',
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  wizardInputText: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 1,
  },
  wizardPublishBtn: {
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
    marginTop: 2,
  },
  wizardPublishBtnText: {
    color: '#09090b',
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
  },
  winnerTitle: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
  },
  winnerBox: {
    backgroundColor: '#fbbf24',
    borderWidth: 1.5,
    borderColor: '#09090b',
    borderRadius: 12,
    padding: 10,
    width: '100%',
    alignItems: 'center',
  },
  winnerLabel: {
    color: '#09090b',
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
  },
  winnerValue: {
    color: '#09090b',
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    marginTop: 1,
  },
  confettiText: {
    position: 'absolute',
    fontSize: 16,
  },
  interactiveStatusBox: {
    backgroundColor: '#18181b',
    borderColor: '#ffffff',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  interactiveStatusText: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
});

export default function LoginScreen() {
  const { isLoaded: isAuthLoaded, isSignedIn } = useAuth();
  const { signIn, setActive, isLoaded } = useSignIn() as any;
  const { signUp } = useSignUp() as any;
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const router = useRouter();
  const { colors } = useTheme();

  // If user is already signed in, automatically redirect to Dashboard directly!
  useEffect(() => {
    if (isAuthLoaded && isSignedIn) {
      router.replace('/(tabs)');
    }
  }, [isAuthLoaded, isSignedIn]);

  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null); // null = loading
  const [currentSlide, setCurrentSlide] = useState(0);

  // Check if user has already seen onboarding before
  useEffect(() => {
    SecureStore.getItemAsync(ONBOARDING_KEY).then((val) => {
      setShowOnboarding(val !== 'true'); // Show only if NOT done before
    }).catch(() => {
      setShowOnboarding(true); // On error, show onboarding
    });
  }, []);

  const onboardingSlides = [
    {
      badge: "LIVE BATTLE",
      subBadge: "HIGH TRAFFIC POLL #482",
      title: "What's your favorite frontend framework?",
      desc: "Watch votes update in real-time with zero latency as participants submit choices.",
      renderAnim: () => <LiveSocketsAnim />,
      color: '#09090b',
    },
    {
      badge: "SECURITY GATE",
      subBadge: "IP & AUTH GUARDS",
      title: "Anti-Spam Shield Protection",
      desc: "Prevent double-voting using strict IP gating and Clerk authentication controls.",
      renderAnim: () => <SpamShieldAnim />,
      color: '#09090b',
    },
    {
      badge: "ANALYTICS",
      subBadge: "REALTIME FEED",
      title: "Live Dashboard Metrics",
      desc: "Premium charts and voter metrics visualised instantly as voting progress unfolds.",
      renderAnim: () => <AnalyticsChartAnim />,
      color: '#09090b',
    },
    {
      badge: "VERSATILITY",
      subBadge: "CONFIG OPTIONS",
      title: "Flexible Access Gating",
      desc: "Configure completely anonymous public rooms or Clerk-authenticated secure polls.",
      renderAnim: () => <ResponseModesAnim />,
      color: '#09090b',
    },
    {
      badge: "CREATOR WIZARD",
      subBadge: "FAST PUBLISH",
      title: "Design & Publish in 60s",
      desc: "Draft options, customize settings, and launch live campaigns in a single click.",
      renderAnim: () => <CampaignWizardAnim />,
      color: '#09090b',
    },
    {
      badge: "FINAL VERDICT",
      subBadge: "WINNER PROJECTIONS",
      title: "Auto Winner & Trends",
      desc: "Capture crowd favorites, final trends, and projection outcomes automatically.",
      renderAnim: () => <TrophyInsightsAnim />,
      color: '#09090b',
    },
  ];

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verification state for signup
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  // Safely extract a human-readable message from any Clerk error
  const parseClerkError = (err: any, fallback: string): string => {
    try {
      if (err?.errors && Array.isArray(err.errors) && err.errors.length > 0) {
        return err.errors[0]?.longMessage || err.errors[0]?.message || fallback;
      }
      if (typeof err?.message === 'string') return err.message;
    } catch {
      // ignore parse errors
    }
    return fallback;
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace('/(tabs)');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { createdSessionId, setActive: setOAuthActive } = await startOAuthFlow();
      if (createdSessionId && setOAuthActive) {
        await setOAuthActive({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      const errMessage = (err?.message || parseClerkError(err, '')).toLowerCase();
      if (errMessage.includes('already signed in') || err?.errors?.[0]?.code === 'session_exists') {
        router.replace('/(tabs)');
        return;
      }
      setError(parseClerkError(err, 'Failed to sign in with Google'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    if (!isLoaded) return;
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });

      await setActive({ session: completeSignIn.createdSessionId });
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(parseClerkError(err, 'Invalid email or password'));
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!isLoaded) return;
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(parseClerkError(err, 'Failed to sign up'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded || !pendingVerification) return;
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError('Verification status incomplete. Please try again.');
      }
    } catch (err: any) {
      setError(parseClerkError(err, 'Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      setForgotPasswordStep(2);
    } catch (err: any) {
      setError(parseClerkError(err, 'Could not send verification code.'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordReset = async () => {
    if (!resetCode || !newPassword) {
      setError('Please fill in all fields');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: resetCode,
        password: newPassword,
      });

      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        router.replace('/(tabs)');
      } else {
        setError('Failed to complete reset. Try again.');
      }
    } catch (err: any) {
      setError(parseClerkError(err, 'Failed to reset password.'));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    setAuthToken(null);
    router.replace('/(tabs)');
  };

  // Still loading stored onboarding preference
  if (showOnboarding === null) {
    return null;
  }

  if (showOnboarding) {
    const slide = onboardingSlides[currentSlide];
    return (
      <SafeAreaView style={[styles.onboardingContainer, { backgroundColor: colors.background }]} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.onboardingWrapper}>
          {/* Header Row with Logo and Skip button at top-right */}
          <View style={styles.onboardingHeaderRow}>
            <View style={styles.onboardingHeaderLeft}>
              <View style={styles.miniLogoRow}>
                <Image 
                  source={require('../assets/images/image.png')} 
                  style={styles.miniLogoImage} 
                  resizeMode="contain"
                />
                <Text style={[styles.logoMiniText, { color: colors.foreground }]}>PollSphere</Text>
              </View>
              <Text style={styles.subtitleMini}>Real-time polling</Text>
            </View>
            <Pressable 
              onPress={() => {
                SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
                setShowOnboarding(false);
              }} 
              style={[styles.topSkipBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            >
              <Text style={[styles.topSkipText, { color: colors.foreground }]}>Skip</Text>
            </Pressable>
          </View>

          {/* Neo-brutalist Onboarding Card Container */}
          <View style={styles.brutalCardContainer}>
            {/* Solid offset shadow layer */}
            <View style={[styles.brutalCardShadow, { backgroundColor: colors.border, borderColor: colors.border }]} />
            
            {/* Main Card Body */}
            <View style={[styles.brutalCardBody, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {/* Card Header Row matching the user's image */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.liveBadge}>
                  <Text style={styles.liveBadgeText}>{slide.badge}</Text>
                </View>
                <Text style={styles.trafficText}>{slide.subBadge}</Text>
              </View>

              {/* Card Title */}
              <Text style={[styles.slideHeaderTitle, { color: colors.foreground }]}>{slide.title}</Text>

              {/* Render animated custom visualizer */}
              {slide.renderAnim()}

              {/* Progress Line indicators inside the card matching user's image */}
              <View style={styles.indicatorTrack}>
                {onboardingSlides.map((_, idx) => (
                  <View 
                    key={idx} 
                    style={[
                      styles.indicatorBar, 
                      idx === currentSlide ? styles.indicatorBarActive : styles.indicatorBarInactive
                    ]} 
                  />
                ))}
              </View>
            </View>
          </View>

          {/* Description sub-card */}
          <View style={[styles.descCard, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Text style={[styles.slideDescText, { color: colors.foreground }]}>{slide.desc}</Text>
          </View>

          {/* Controls with stacked Back and Next buttons */}
          <View style={styles.onboardingControlsStacked}>
            <BrutalButton
              title={currentSlide === 5 ? "Get Started 🚀" : "Next Slide →"}
              variant="primary"
              onPress={() => {
                if (currentSlide < 5) {
                  setCurrentSlide(currentSlide + 1);
                } else {
                  SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
                  setShowOnboarding(false);
                }
              }}
              style={styles.fullNextBtn}
            />

            {currentSlide > 0 ? (
              <Pressable 
                onPress={() => {
                  setCurrentSlide(currentSlide - 1);
                }} 
                style={styles.backLinkBtn}
              >
                <Text style={styles.backLinkText}>← Go to Previous Slide</Text>
              </Pressable>
            ) : (
              <View style={styles.backLinkPlaceholder} />
            )}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.loginPageContainer}
    >
      <ScrollView contentContainerStyle={styles.loginScrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Logo Header */}
        <View style={styles.topLogoHeaderContainer}>
          <View style={styles.appIconBadgeCircle}>
            <BarChartIcon size={26} color="#00E5CC" strokeWidth={2.5} />
          </View>
          <Text style={styles.appTitleText}>PollSphere</Text>
          <Text style={styles.appSubtitleText}>Real-time feedback & polling platform</Text>
        </View>

        {/* Main Glowing Card Container */}
        <View style={styles.mainGlowingCard}>
          {/* Card Header Row */}
          <View style={styles.cardHeaderRowCustom}>
            <View style={styles.userCircleBadge}>
              <UserIcon size={20} color="#00E5CC" strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.welcomeBackTitle}>
                {isForgotPasswordMode 
                  ? 'RESET PASSWORD' 
                  : pendingVerification 
                    ? 'VERIFY EMAIL' 
                    : isSignUpMode ? 'CREATE ACCOUNT' : 'WELCOME BACK'}
              </Text>
              <Text style={styles.welcomeBackSub}>
                {isSignUpMode ? 'Sign up for a new account' : 'Sign in to continue to your account'}
              </Text>
            </View>
          </View>

          {error ? <Text style={styles.errorTextCustom}>{error}</Text> : null}

          {isForgotPasswordMode ? (
            forgotPasswordStep === 1 ? (
              <View style={styles.formFieldsGap}>
                <Text style={styles.infoTextCustom}>
                  Enter your email address to receive a password reset verification code.
                </Text>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabelText}>EMAIL ADDRESS</Text>
                  <View style={styles.inputContainerRow}>
                    <MailIcon size={18} color="#00E5CC" style={styles.inputLeftIcon} />
                    <TextInput
                      placeholder="yourname@example.com"
                      placeholderTextColor="#6B7280"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      style={styles.textInputStyle}
                    />
                  </View>
                </View>
                {loading ? (
                  <ActivityIndicator size="small" color="#00E5CC" style={{ marginVertical: 15 }} />
                ) : (
                  <Pressable onPress={handleForgotPasswordRequest} style={styles.signInSolidCyanBtn}>
                    <Text style={styles.signInBtnText}>SEND RESET CODE</Text>
                  </Pressable>
                )}
                <Pressable 
                  onPress={() => {
                    setIsForgotPasswordMode(false);
                    setError('');
                  }}
                  style={styles.toggleModeCenter}
                >
                  <Text style={styles.signUpYellowText}>Back to Sign In</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.formFieldsGap}>
                <Text style={styles.infoTextCustom}>
                  Enter the code sent to your email and select your new password.
                </Text>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabelText}>RESET CODE</Text>
                  <View style={styles.inputContainerRow}>
                    <TextInput
                      placeholder="123456"
                      placeholderTextColor="#6B7280"
                      value={resetCode}
                      onChangeText={setResetCode}
                      keyboardType="number-pad"
                      style={styles.textInputStyle}
                    />
                  </View>
                </View>
                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabelText}>NEW PASSWORD</Text>
                  <View style={styles.inputContainerRow}>
                    <LockIcon size={18} color="#00E5CC" style={styles.inputLeftIcon} />
                    <TextInput
                      placeholder="••••••••"
                      placeholderTextColor="#6B7280"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry={!showPassword}
                      style={styles.textInputStyle}
                    />
                    <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeToggleBtn}>
                      {showPassword ? <EyeOffIcon size={18} color="#A1A1AA" /> : <EyeIcon size={18} color="#A1A1AA" />}
                    </Pressable>
                  </View>
                </View>
                {loading ? (
                  <ActivityIndicator size="small" color="#00E5CC" style={{ marginVertical: 15 }} />
                ) : (
                  <Pressable onPress={handleForgotPasswordReset} style={styles.signInSolidCyanBtn}>
                    <Text style={styles.signInBtnText}>RESET PASSWORD</Text>
                  </Pressable>
                )}
                <Pressable 
                  onPress={() => {
                    setForgotPasswordStep(1);
                    setError('');
                  }}
                  style={styles.toggleModeCenter}
                >
                  <Text style={styles.signUpYellowText}>Back to Email Entry</Text>
                </Pressable>
              </View>
            )
          ) : pendingVerification ? (
            <View style={styles.formFieldsGap}>
              <Text style={styles.infoTextCustom}>
                We sent a verification code to your email. Enter it below.
              </Text>
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabelText}>VERIFICATION CODE</Text>
                <View style={styles.inputContainerRow}>
                  <TextInput
                    placeholder="123456"
                    placeholderTextColor="#6B7280"
                    value={verificationCode}
                    onChangeText={setVerificationCode}
                    keyboardType="number-pad"
                    style={styles.textInputStyle}
                  />
                </View>
              </View>
              <Pressable onPress={handleVerify} disabled={loading} style={styles.signInSolidCyanBtn}>
                {loading ? <ActivityIndicator size="small" color="#000000" /> : <Text style={styles.signInBtnText}>VERIFY CODE</Text>}
              </Pressable>
              <Pressable onPress={() => setPendingVerification(false)} style={styles.guestOutlineBtn}>
                <Text style={styles.guestBtnText}>BACK TO SIGN UP</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.formFieldsGap}>
              {/* EMAIL ADDRESS */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabelText}>EMAIL ADDRESS</Text>
                <View style={styles.inputContainerRow}>
                  <MailIcon size={18} color="#00E5CC" style={styles.inputLeftIcon} />
                  <TextInput
                    placeholder="yourname@example.com"
                    placeholderTextColor="#6B7280"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.textInputStyle}
                  />
                </View>
              </View>

              {/* PASSWORD */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabelText}>PASSWORD</Text>
                <View style={styles.inputContainerRow}>
                  <LockIcon size={18} color="#00E5CC" style={styles.inputLeftIcon} />
                  <TextInput
                    placeholder="••••••••"
                    placeholderTextColor="#6B7280"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={styles.textInputStyle}
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeToggleBtn}>
                    {showPassword ? (
                      <EyeOffIcon size={18} color="#A1A1AA" />
                    ) : (
                      <EyeIcon size={18} color="#A1A1AA" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* FORGOT PASSWORD LINK */}
              {!isSignUpMode && (
                <Pressable
                  onPress={() => {
                    setIsForgotPasswordMode(true);
                    setForgotPasswordStep(1);
                    setError('');
                  }}
                  style={styles.forgotPasswordAlignRight}
                >
                  <Text style={styles.forgotPasswordCyanText}>Forgot Password?</Text>
                </Pressable>
              )}

              {/* SIGN IN BUTTON (Solid Cyan) */}
              <Pressable
                onPress={isSignUpMode ? handleSignUp : handleSignIn}
                disabled={loading}
                style={styles.signInSolidCyanBtn}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <Text style={styles.signInBtnText}>{isSignUpMode ? 'SIGN UP' : 'SIGN IN'}</Text>
                )}
              </Pressable>

              {/* CONTINUE WITH GOOGLE BUTTON (Solid Golden Yellow) */}
              <Pressable
                onPress={handleGoogleSignIn}
                disabled={loading}
                style={styles.googleYellowBtn}
              >
                <View style={styles.googleGLogoCircle}>
                  <Text style={styles.googleGLogoText}>G</Text>
                </View>
                <Text style={styles.googleBtnText}>CONTINUE WITH GOOGLE</Text>
              </Pressable>

              {/* DIVIDER */}
              <View style={styles.orDividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.orDividerText}>— OR —</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* CONTINUE AS GUEST BUTTON (Golden Yellow Outline) */}
              <Pressable
                onPress={handleGuestMode}
                style={styles.guestOutlineBtn}
              >
                <UserIcon size={18} color="#FFCC00" />
                <Text style={styles.guestBtnText}>CONTINUE AS GUEST</Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Footer Links & Anonymous Notice */}
        <View style={styles.footerContainerCustom}>
          <Pressable
            onPress={() => {
              setIsSignUpMode(!isSignUpMode);
              setError('');
            }}
            style={styles.signUpToggleRowCustom}
          >
            <Text style={styles.dontHaveAccountText}>
              {isSignUpMode ? 'Already have an account?' : "Don't have an account?"}{' '}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.signUpYellowText}>
                {isSignUpMode ? 'Sign In' : 'Sign Up'}
              </Text>
              <ChevronRightIcon size={16} color="#FFCC00" style={{ marginLeft: 2 }} />
            </View>
          </Pressable>

          <View style={styles.anonymousShieldNoticeRow}>
            <ShieldCheckIcon size={18} color="#00E5CC" />
            <Text style={styles.shieldNoticeText}>
              You can vote anonymously, but won't be able to create new polls.
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.mutedForeground,
    textTransform: 'uppercase',
    marginTop: 4,
    letterSpacing: 1.5,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
  featuresContainer: {
    marginBottom: 24,
    gap: 12,
  },
  miniFeatureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  featureTextWrapper: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  featureDesc: {
    color: '#e4e4e7',
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  card: {
    marginVertical: 0,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 1.5,
  },
  errorText: {
    color: Colors.destructive,
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'SpaceMono',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  infoText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'SpaceMono',
    marginBottom: 16,
    lineHeight: 18,
  },
  toggleMode: {
    alignItems: 'center',
    marginTop: 16,
  },
  toggleText: {
    color: Colors.primary,
    fontFamily: 'SpaceMono',
    fontWeight: '900',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  backButton: {
    borderColor: '#27272a',
    backgroundColor: '#18181b',
  },
  guestWrapper: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  orText: {
    color: '#a1a1aa',
    fontFamily: 'SpaceMono',
    fontWeight: '900',
    fontSize: 14,
    marginBottom: 12,
  },
  guestInfo: {
    color: '#a1a1aa',
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#a1a1aa',
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  onboardingWrapper: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  onboardingCard: {
    padding: 24,
    minHeight: 320,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  slideTitle: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 12,
  },
  slideDesc: {
    color: '#f4f4f5',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontWeight: '600',
  },
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: '#ffffff',
  },
  dotInactive: {
    width: 8,
    backgroundColor: '#3f3f46',
  },
  onboardingControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  skipBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  skipText: {
    color: '#a1a1aa',
    fontFamily: 'SpaceMono',
    fontWeight: '900',
    fontSize: 16,
    textTransform: 'uppercase',
    textDecorationLine: 'underline',
  },
  nextBtn: {
    minWidth: 140,
  },
  brutalCardContainer: {
    position: 'relative',
    width: '100%',
    marginVertical: 16,
  },
  brutalCardShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 24,
  },
  brutalCardBody: {
    backgroundColor: '#0c0c0e',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 24,
    padding: 20,
    minHeight: 330,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  liveBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  liveBadgeText: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  trafficText: {
    color: '#71717a',
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  slideHeaderTitle: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 14,
  },
  indicatorTrack: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginTop: 14,
    alignItems: 'center',
  },
  indicatorBar: {
    height: 4,
    borderRadius: 2,
  },
  indicatorBarActive: {
    width: 24,
    backgroundColor: '#2dd4bf',
  },
  indicatorBarInactive: {
    width: 12,
    backgroundColor: '#27272a',
  },
  descCard: {
    backgroundColor: '#18181b',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  slideDescText: {
    color: '#e4e4e7',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
    fontWeight: '700',
  },
  onboardingHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 0 : 10,
  },
  onboardingHeaderLeft: {
    flex: 1,
  },
  logoMini: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    letterSpacing: -0.5,
  },
  subtitleMini: {
    fontSize: 9,
    fontWeight: '900',
    color: Colors.mutedForeground,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontFamily: 'SpaceMono',
  },
  topSkipBtn: {
    borderColor: '#ffffff',
    borderWidth: 2,
    backgroundColor: '#000000',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  topSkipText: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontWeight: '900',
    fontSize: 12,
    textTransform: 'uppercase',
  },
  onboardingControlsCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  fullNextBtn: {
    width: '100%',
  },
  miniLogoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  miniLogoImage: {
    width: 24,
    height: 24,
  },
  logoMiniText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    letterSpacing: -0.5,
  },
  mainLogoImage: {
    width: 72,
    height: 72,
    marginBottom: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '900',
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    letterSpacing: -1,
  },
  onboardingControlsStacked: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  backLinkBtn: {
    paddingVertical: 10,
    marginTop: 4,
  },
  backLinkText: {
    color: '#a1a1aa',
    fontFamily: 'SpaceMono',
    fontWeight: '900',
    fontSize: 12,
    textDecorationLine: 'underline',
    textTransform: 'uppercase',
  },
  backLinkPlaceholder: {
    height: 32,
  },

  // --- Screenshot Matching Custom Login Styles ---
  loginPageContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loginScrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 40,
    alignItems: 'center',
  },
  topLogoHeaderContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  appIconBadgeCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#09090b',
    borderWidth: 2,
    borderColor: '#00E5CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#00E5CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  appTitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  appSubtitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '700',
    color: '#A1A1AA',
    marginTop: 4,
    textAlign: 'center',
  },
  mainGlowingCard: {
    width: '100%',
    backgroundColor: '#09090b',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#00E5CC',
    padding: 20,
    shadowColor: '#00E5CC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  cardHeaderRowCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  userCircleBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#00E5CC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121214',
  },
  welcomeBackTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  welcomeBackSub: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    marginTop: 2,
  },
  errorTextCustom: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 12,
    textAlign: 'center',
    fontWeight: '900',
  },
  formFieldsGap: {
    gap: 14,
  },
  fieldGroup: {
    width: '100%',
  },
  fieldLabelText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  inputContainerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121214',
    borderWidth: 1.5,
    borderColor: '#27272A',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
  },
  inputLeftIcon: {
    marginRight: 10,
  },
  textInputStyle: {
    flex: 1,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: '#FFFFFF',
    height: '100%',
  },
  eyeToggleBtn: {
    padding: 6,
  },
  forgotPasswordAlignRight: {
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 4,
  },
  forgotPasswordCyanText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#00E5CC',
  },
  signInSolidCyanBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#00E5CC',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00E5CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  signInBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '900',
    color: '#09090b',
    letterSpacing: 1,
  },
  googleYellowBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFCC00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    shadowColor: '#FFCC00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  googleGLogoCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGLogoText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 13,
  },
  googleBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#09090b',
    letterSpacing: 0.5,
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#27272A',
  },
  orDividerText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
  },
  guestOutlineBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FFCC00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  guestBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  footerContainerCustom: {
    width: '100%',
    alignItems: 'center',
    marginTop: 24,
    gap: 16,
  },
  signUpToggleRowCustom: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dontHaveAccountText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  signUpYellowText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFCC00',
  },
  anonymousShieldNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  shieldNoticeText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#A1A1AA',
    flex: 1,
    fontWeight: '500',
  },
  toggleModeCenter: {
    alignSelf: 'center',
    paddingVertical: 6,
  },
  infoTextCustom: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#A1A1AA',
    marginBottom: 12,
    textAlign: 'center',
  },

});
