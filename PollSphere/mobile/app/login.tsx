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
  TextInput,
  PanResponder
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
import Svg, { Path } from 'react-native-svg';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const ONBOARDING_KEY = 'pollsphere_onboarding_done';

const GoogleLogoIcon = ({ size = 20 }: { size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </Svg>
);

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

const CreatePollMockupAnim = () => {
  return (
    <View style={mockupStyles.mockupContainer}>
      {/* Central Phone Mockup Card */}
      <View style={mockupStyles.phoneFrame}>
        {/* Phone Header */}
        <View style={mockupStyles.phoneHeaderRow}>
          <Text style={mockupStyles.phoneBackArrow}>←</Text>
          <Text style={mockupStyles.phoneTitleText}>New Poll</Text>
          <Text style={mockupStyles.phonePreviewText}>Preview</Text>
        </View>

        {/* Question Box */}
        <View style={mockupStyles.mockSection}>
          <Text style={mockupStyles.mockSectionLabel}>QUESTION</Text>
          <View style={mockupStyles.mockQuestionBox}>
            <Text style={mockupStyles.mockQuestionText}>
              What's your favorite frontend framework?
            </Text>
          </View>
        </View>

        {/* Options Box */}
        <View style={mockupStyles.mockSection}>
          <Text style={mockupStyles.mockSectionLabel}>OPTIONS</Text>
          <View style={mockupStyles.mockOptionRow}>
            <View style={mockupStyles.mockCircleRadio} />
            <Text style={mockupStyles.mockOptionText}>React</Text>
            <Text style={mockupStyles.dragHandle}>≡</Text>
          </View>
          <View style={mockupStyles.mockOptionRow}>
            <View style={mockupStyles.mockCircleRadio} />
            <Text style={mockupStyles.mockOptionText}>Next.js</Text>
            <Text style={mockupStyles.dragHandle}>≡</Text>
          </View>
          <View style={mockupStyles.mockOptionRow}>
            <View style={mockupStyles.mockCircleRadio} />
            <Text style={mockupStyles.mockOptionText}>Vue.js</Text>
            <Text style={mockupStyles.dragHandle}>≡</Text>
          </View>

          <View style={mockupStyles.addOptionBtnPill}>
            <Text style={mockupStyles.addOptionText}>+ Add Option</Text>
          </View>
        </View>

        {/* Settings Box */}
        <View style={mockupStyles.mockSection}>
          <Text style={mockupStyles.mockSectionLabel}>SETTINGS</Text>
          <View style={mockupStyles.settingRow}>
            <View style={mockupStyles.settingIconTextGroup}>
              <Text style={{ fontSize: 11 }}>🕶️</Text>
              <Text style={mockupStyles.settingLabelText}>Anonymous Voting</Text>
            </View>
            <View style={mockupStyles.toggleOnSwitch} />
          </View>
          <View style={mockupStyles.settingRow}>
            <View style={mockupStyles.settingIconTextGroup}>
              <Text style={{ fontSize: 11 }}>📅</Text>
              <View>
                <Text style={mockupStyles.settingLabelText}>Expiry Date & Time</Text>
                <Text style={mockupStyles.settingSubValueText}>25 May 2025, 11:00 AM</Text>
              </View>
            </View>
            <Text style={mockupStyles.arrowChevron}>›</Text>
          </View>
          <View style={mockupStyles.settingRowCyan}>
            <View style={mockupStyles.settingIconTextGroup}>
              <Text style={{ fontSize: 11 }}>🔗</Text>
              <Text style={mockupStyles.settingCyanText}>Share Poll Link</Text>
            </View>
            <Text style={mockupStyles.arrowChevronCyan}>›</Text>
          </View>
        </View>
      </View>

      {/* Floating Callout Badges */}
      <View style={mockupStyles.calloutBadgeTopLeft}>
        <View style={mockupStyles.badgeIconYellow}>
          <Text style={{ fontSize: 10 }}>✏️</Text>
        </View>
        <Text style={mockupStyles.badgeTitleYellow}>Add Question</Text>
        <Text style={mockupStyles.badgeSubText}>Ask anything that matters</Text>
      </View>

      <View style={mockupStyles.calloutBadgeTopRight}>
        <View style={mockupStyles.badgeIconCyan}>
          <Text style={{ fontSize: 10 }}>☰</Text>
        </View>
        <Text style={mockupStyles.badgeTitleCyan}>Add Options</Text>
        <Text style={mockupStyles.badgeSubText}>Unlimited options, easy to manage</Text>
      </View>

      <View style={mockupStyles.calloutBadgeMidLeft}>
        <View style={mockupStyles.badgeIconCyan}>
          <Text style={{ fontSize: 10 }}>🕶️</Text>
        </View>
        <Text style={mockupStyles.badgeTitleCyan}>Anonymous Voting</Text>
        <Text style={mockupStyles.badgeSubText}>Keep responses private</Text>
      </View>

      <View style={mockupStyles.calloutBadgeMidRight}>
        <View style={mockupStyles.badgeIconYellow}>
          <Text style={{ fontSize: 10 }}>📅</Text>
        </View>
        <Text style={mockupStyles.badgeTitleYellow}>Smart Expiry</Text>
        <Text style={mockupStyles.badgeSubText}>Set date & time automatically</Text>
      </View>

      <View style={mockupStyles.calloutBadgeBottomCenter}>
        <View style={mockupStyles.badgeIconCyan}>
          <Text style={{ fontSize: 10 }}>🔗</Text>
        </View>
        <Text style={mockupStyles.badgeTitleCyan}>Share Instantly</Text>
        <Text style={mockupStyles.badgeSubText}>Share via link in one click</Text>
      </View>
    </View>
  );
};

const TrackResultsMockupAnim = () => {
  return (
    <View style={trackStyles.cardWrapper}>
      {/* Top Header Row inside Dashboard Card */}
      <View style={trackStyles.cardHeaderRow}>
        <View style={trackStyles.titleLiveGroup}>
          <Text style={trackStyles.cardTitle}>Poll Results</Text>
          <Text style={trackStyles.liveDotText}>• Live</Text>
        </View>
        <View style={trackStyles.rightHeaderGroup}>
          <Text style={trackStyles.voterCountText}>👥 124</Text>
          <View style={trackStyles.shareResultsBtn}>
            <Text style={trackStyles.shareResultsText}>Share Results ∝</Text>
          </View>
        </View>
      </View>

      {/* 2x2 Grid Layout */}
      <View style={trackStyles.gridRow}>
        {/* Widget 1: Total Responses */}
        <View style={trackStyles.widgetBox}>
          <Text style={trackStyles.widgetLabel}>Total Responses</Text>
          <View style={trackStyles.valueBadgeRow}>
            <Text style={trackStyles.bigValueText}>124</Text>
            <View style={trackStyles.statBadgeCyan}>
              <Text style={trackStyles.statBadgeText}>+24% ↗ vs last poll</Text>
            </View>
          </View>
          <View style={trackStyles.sparklineTrack}>
            <View style={trackStyles.sparklineBarActive} />
          </View>
        </View>

        {/* Widget 2: Top Choice */}
        <View style={trackStyles.widgetBox}>
          <Text style={trackStyles.widgetLabel}>Top Choice</Text>
          <View style={trackStyles.topChoiceRow}>
            <Text style={trackStyles.choiceNameText}>React</Text>
            <Text style={{ fontSize: 14 }}>⚛️</Text>
          </View>
          <View style={trackStyles.progressRow}>
            <View style={trackStyles.progressBarCyan}>
              <View style={{ width: '43%', height: '100%', backgroundColor: '#00E5CC', borderRadius: 2 }} />
            </View>
            <Text style={trackStyles.progressPercentText}>43% 🔥</Text>
          </View>
        </View>
      </View>

      <View style={trackStyles.gridRow}>
        {/* Widget 3: Responses Over Time Graph */}
        <View style={trackStyles.widgetBox}>
          <Text style={trackStyles.widgetLabel}>Responses Over Time</Text>
          <View style={trackStyles.graphBox}>
            <View style={trackStyles.graphYAxis}>
              <Text style={trackStyles.axisText}>160</Text>
              <Text style={trackStyles.axisText}>120</Text>
              <Text style={trackStyles.axisText}>80</Text>
              <Text style={trackStyles.axisText}>40</Text>
              <Text style={trackStyles.axisText}>0</Text>
            </View>
            <View style={trackStyles.graphCanvas}>
              <View style={trackStyles.graphLineCyan} />
              <View style={trackStyles.graphDotPoint} />
            </View>
          </View>
          <View style={trackStyles.graphXAxis}>
            <Text style={trackStyles.axisText}>10 AM</Text>
            <Text style={trackStyles.axisText}>11 AM</Text>
            <Text style={trackStyles.axisText}>12 PM</Text>
            <Text style={trackStyles.axisText}>1 PM</Text>
            <Text style={trackStyles.axisText}>2 PM</Text>
            <Text style={trackStyles.axisText}>Now</Text>
          </View>
        </View>

        {/* Widget 4: Choices Breakdown */}
        <View style={trackStyles.widgetBox}>
          <Text style={trackStyles.widgetLabel}>Choices Breakdown</Text>
          
          <View style={trackStyles.breakdownRow}>
            <Text style={trackStyles.breakdownLabel}>React</Text>
            <View style={trackStyles.breakdownBarTrack}>
              <View style={[trackStyles.breakdownBarFill, { width: '43%', backgroundColor: '#00E5CC' }]} />
            </View>
            <Text style={[trackStyles.breakdownPercent, { color: '#00E5CC' }]}>43%</Text>
          </View>

          <View style={trackStyles.breakdownRow}>
            <Text style={trackStyles.breakdownLabel}>Next.js</Text>
            <View style={trackStyles.breakdownBarTrack}>
              <View style={[trackStyles.breakdownBarFill, { width: '31%', backgroundColor: '#FFCC00' }]} />
            </View>
            <Text style={[trackStyles.breakdownPercent, { color: '#FFCC00' }]}>31%</Text>
          </View>

          <View style={trackStyles.breakdownRow}>
            <Text style={trackStyles.breakdownLabel}>Vue.js</Text>
            <View style={trackStyles.breakdownBarTrack}>
              <View style={[trackStyles.breakdownBarFill, { width: '15%', backgroundColor: '#A855F7' }]} />
            </View>
            <Text style={[trackStyles.breakdownPercent, { color: '#A855F7' }]}>15%</Text>
          </View>

          <View style={trackStyles.breakdownRow}>
            <Text style={trackStyles.breakdownLabel}>Svelte</Text>
            <View style={trackStyles.breakdownBarTrack}>
              <View style={[trackStyles.breakdownBarFill, { width: '8%', backgroundColor: '#EF4444' }]} />
            </View>
            <Text style={[trackStyles.breakdownPercent, { color: '#EF4444' }]}>8%</Text>
          </View>
        </View>
      </View>

      {/* Bottom Publish Banner */}
      <View style={trackStyles.publishBannerRow}>
        <View style={trackStyles.megaphoneBadge}>
          <Text style={{ fontSize: 12 }}>📢</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={trackStyles.publishTitleText}>Publish Results</Text>
          <Text style={trackStyles.publishSubText}>Share results publicly with your audience.</Text>
        </View>
        <View style={trackStyles.publishNowPillBtn}>
          <Text style={trackStyles.publishNowBtnText}>Publish Now →</Text>
        </View>
      </View>
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

const mockupStyles = StyleSheet.create({
  mockupContainer: {
    width: '100%',
    minHeight: 380,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  phoneFrame: {
    width: 220,
    backgroundColor: '#09090b',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#00E5CC',
    padding: 12,
    shadowColor: '#00E5CC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  phoneHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  phoneBackArrow: {
    color: '#00E5CC',
    fontSize: 14,
    fontWeight: '900',
  },
  phoneTitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  phonePreviewText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
    color: '#00E5CC',
  },
  mockSection: {
    marginBottom: 8,
  },
  mockSectionLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    fontWeight: '900',
    color: '#71717A',
    marginBottom: 4,
  },
  mockQuestionBox: {
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 10,
    padding: 8,
  },
  mockQuestionText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 14,
  },
  mockOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 4,
  },
  mockCircleRadio: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#00E5CC',
    marginRight: 6,
  },
  mockOptionText: {
    flex: 1,
    fontFamily: 'SpaceMono',
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  dragHandle: {
    color: '#71717A',
    fontSize: 12,
  },
  addOptionBtnPill: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#00E5CC',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: 2,
  },
  addOptionText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    color: '#00E5CC',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#27272A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 4,
  },
  settingRowCyan: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#064E46',
    borderWidth: 1,
    borderColor: '#00E5CC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  settingIconTextGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  settingLabelText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  settingSubValueText: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    color: '#A1A1AA',
  },
  settingCyanText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    color: '#00E5CC',
  },
  toggleOnSwitch: {
    width: 22,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00E5CC',
  },
  arrowChevron: {
    color: '#71717A',
    fontSize: 14,
  },
  arrowChevronCyan: {
    color: '#00E5CC',
    fontSize: 14,
    fontWeight: '900',
  },

  // Floating Badges
  calloutBadgeTopLeft: {
    position: 'absolute',
    top: 10,
    left: 0,
    backgroundColor: '#09090b',
    borderWidth: 1.5,
    borderColor: '#FFCC00',
    borderRadius: 12,
    padding: 8,
    width: 105,
  },
  badgeIconYellow: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#3F3500',
    borderWidth: 1,
    borderColor: '#FFCC00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badgeTitleYellow: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    color: '#FFCC00',
  },
  calloutBadgeTopRight: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: '#09090b',
    borderWidth: 1.5,
    borderColor: '#00E5CC',
    borderRadius: 12,
    padding: 8,
    width: 110,
  },
  badgeIconCyan: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#064E46',
    borderWidth: 1,
    borderColor: '#00E5CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  badgeTitleCyan: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    color: '#00E5CC',
  },
  badgeSubText: {
    fontFamily: 'SpaceMono',
    fontSize: 7,
    color: '#A1A1AA',
    marginTop: 2,
    lineHeight: 10,
  },
  calloutBadgeMidLeft: {
    position: 'absolute',
    top: 180,
    left: -5,
    backgroundColor: '#09090b',
    borderWidth: 1.5,
    borderColor: '#00E5CC',
    borderRadius: 12,
    padding: 8,
    width: 105,
  },
  calloutBadgeMidRight: {
    position: 'absolute',
    top: 190,
    right: -5,
    backgroundColor: '#09090b',
    borderWidth: 1.5,
    borderColor: '#FFCC00',
    borderRadius: 12,
    padding: 8,
    width: 105,
  },
  calloutBadgeBottomCenter: {
    position: 'absolute',
    bottom: -15,
    backgroundColor: '#09090b',
    borderWidth: 1.5,
    borderColor: '#00E5CC',
    borderRadius: 12,
    padding: 8,
    width: 130,
    alignItems: 'center',
  },
});

const trackStyles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    backgroundColor: '#09090b',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#00E5CC',
    padding: 14,
    gap: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  titleLiveGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  liveDotText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#00E5CC',
  },
  rightHeaderGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  voterCountText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    color: '#A1A1AA',
  },
  shareResultsBtn: {
    borderWidth: 1,
    borderColor: '#00E5CC',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: '#064E46',
  },
  shareResultsText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    color: '#00E5CC',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 10,
  },
  widgetBox: {
    flex: 1,
    backgroundColor: '#121214',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 10,
  },
  widgetLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    fontWeight: '900',
    color: '#71717A',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  valueBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  bigValueText: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  statBadgeCyan: {
    backgroundColor: '#064E46',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  statBadgeText: {
    fontFamily: 'SpaceMono',
    fontSize: 7,
    fontWeight: '900',
    color: '#00E5CC',
  },
  sparklineTrack: {
    width: '100%',
    height: 3,
    backgroundColor: '#27272A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sparklineBarActive: {
    width: '65%',
    height: '100%',
    backgroundColor: '#00E5CC',
  },
  topChoiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  choiceNameText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressBarCyan: {
    flex: 1,
    height: 6,
    backgroundColor: '#27272A',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressPercentText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    color: '#00E5CC',
  },
  graphBox: {
    flexDirection: 'row',
    height: 45,
    alignItems: 'flex-end',
  },
  graphYAxis: {
    justifyContent: 'space-between',
    height: '100%',
    paddingRight: 4,
  },
  axisText: {
    fontFamily: 'SpaceMono',
    fontSize: 6,
    color: '#71717A',
  },
  graphCanvas: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  graphLineCyan: {
    width: '100%',
    height: 2,
    backgroundColor: '#00E5CC',
    transform: [{ rotate: '-12deg' }],
  },
  graphDotPoint: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00E5CC',
    position: 'absolute',
    right: 2,
    top: 6,
  },
  graphXAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 3,
  },
  breakdownLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    color: '#A1A1AA',
    width: 38,
  },
  breakdownBarTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#27272A',
    borderRadius: 2,
    overflow: 'hidden',
  },
  breakdownBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  breakdownPercent: {
    fontFamily: 'SpaceMono',
    fontSize: 7,
    fontWeight: '900',
    width: 22,
    textAlign: 'right',
  },
  publishBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#121214',
    borderWidth: 1,
    borderColor: '#064E46',
    borderRadius: 12,
    padding: 8,
    gap: 8,
    marginTop: 4,
  },
  megaphoneBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#064E46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publishTitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  publishSubText: {
    fontFamily: 'SpaceMono',
    fontSize: 7,
    color: '#A1A1AA',
  },
  publishNowPillBtn: {
    backgroundColor: '#00E5CC',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  publishNowBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    color: '#09090b',
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
      subTitle: "Real-time updates, zero delay",
      desc: "Watch votes update in real-time with zero latency as participants submit choices.",
      renderAnim: () => <LiveSocketsAnim />,
      color: '#09090b',
    },
    {
      badge: "CREATE POLLS",
      subBadge: "FAST & POWERFUL",
      title: "Create Powerful Polls",
      subTitle: "Build interactive polls in less than a minute.",
      desc: "Customize questions, options, expiry dates, and privacy controls in seconds.",
      renderAnim: () => <CreatePollMockupAnim />,
      color: '#09090b',
      features: [
        { icon: '🕶️', title: 'Anonymous Voting', desc: 'Protect participant privacy.', color: '#FFCC00' },
        { icon: '📅', title: 'Smart Expiry', desc: 'Poll closes automatically.', color: '#00E5CC' },
        { icon: '🔗', title: 'One-Click Share', desc: 'Share via link instantly.', color: '#00E5CC' },
      ],
      buttonText: 'CREATE POLLS  →',
    },
    {
      badge: "ANALYTICS",
      subBadge: "REALTIME FEED",
      title: "Track Results. Make Impact.",
      subTitle: "Get real-time insights and publish results with ease.",
      desc: "Live stats and trends as votes come in with powerful chart breakdowns.",
      renderAnim: () => <TrackResultsMockupAnim />,
      color: '#09090b',
      features: [
        { icon: '📈', title: 'Real-time Insights', desc: 'Live stats and trends as votes come in.', color: '#00E5CC' },
        { icon: '🍰', title: 'Smart Analytics', desc: 'Understand responses with powerful charts.', color: '#FFCC00' },
        { icon: '🔗', title: 'Share & Publish', desc: 'Share results or make them public instantly.', color: '#A855F7' },
      ],
      buttonText: 'GET STARTED  →',
      bottomCaption: 'Create your first poll and engage your audience today!',
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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 20 && Math.abs(gestureState.dy) < 40;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -35) {
          // Swiped left -> Next slide
          setCurrentSlide((prev) => Math.min(prev + 1, onboardingSlides.length - 1));
        } else if (gestureState.dx > 35) {
          // Swiped right -> Previous slide
          setCurrentSlide((prev) => Math.max(prev - 1, 0));
        }
      },
    })
  ).current;

  // Still loading stored onboarding preference
  if (showOnboarding === null) {
    return null;
  }

  if (showOnboarding) {
    const slide = onboardingSlides[currentSlide];
    return (
      <SafeAreaView style={styles.onboardingPageContainer} edges={['top', 'bottom', 'left', 'right']} {...panResponder.panHandlers}>
        <ScrollView contentContainerStyle={styles.onboardingScrollContent} showsVerticalScrollIndicator={false}>
          {/* Header Row */}
          <View style={styles.onboardingTopHeaderRow}>
            <View style={styles.brandTitleGroup}>
              <View style={styles.onboardingAppIconSquare}>
                <BarChartIcon size={22} color="#00E5CC" strokeWidth={2.5} />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.brandTitleWhite}>Poll</Text>
                  <Text style={styles.brandTitleCyan}>Sphere</Text>
                </View>
                <Text style={styles.brandSubText}>REAL-TIME POLLING</Text>
              </View>
            </View>

            <Pressable
              onPress={() => {
                SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
                setShowOnboarding(false);
              }}
              style={styles.onboardingSkipBtnPill}
            >
              <Text style={styles.onboardingSkipText}>SKIP</Text>
            </Pressable>
          </View>

          {/* Main Card Container */}
          <View style={styles.onboardingMainCardGlowing}>
            {/* Card Header Row */}
            <View style={styles.cardHeaderRowCustom}>
              <View style={styles.liveBattleBadge}>
                <Text style={styles.liveBattleBadgeText}>{slide.badge}</Text>
              </View>
              <View style={styles.trafficRow}>
                <ZapIcon size={12} color="#00E5CC" />
                <Text style={styles.trafficText}>{slide.subBadge}</Text>
              </View>
            </View>

            {/* Slide Title */}
            <Text style={styles.slideHeaderTitleFormatted}>
              {slide.title}
            </Text>

            {/* Render Animated Interactive Visualizer */}
            <View style={styles.animContainerBox}>
              {slide.renderAnim()}
            </View>

            {/* Progress Line indicators */}
            <View style={styles.onboardingIndicatorTrack}>
              {onboardingSlides.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.indicatorBar,
                    idx === currentSlide ? styles.indicatorBarActiveCyan : styles.indicatorBarInactiveMuted
                  ]}
                />
              ))}
            </View>
          </View>

          {/* Description Sub-Card */}
          <View style={styles.onboardingDescSubCard}>
            <View style={styles.descIconCircleBadge}>
              <BarChartIcon size={20} color="#00E5CC" strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.descSubCardTitle}>{slide.subTitle || 'Real-time updates, zero delay'}</Text>
              <Text style={styles.descSubCardText}>{slide.desc}</Text>
            </View>
          </View>

          {/* Solid Cyan Action Button */}
          <Pressable
            onPress={() => {
              if (currentSlide < onboardingSlides.length - 1) {
                setCurrentSlide(currentSlide + 1);
              } else {
                SecureStore.setItemAsync(ONBOARDING_KEY, 'true');
                setShowOnboarding(false);
              }
            }}
            style={styles.onboardingNextPillBtn}
          >
            <Text style={styles.onboardingNextBtnText}>
              {(slide as any).buttonText || (currentSlide === onboardingSlides.length - 1 ? "GET STARTED 🚀" : "NEXT SLIDE  →")}
            </Text>
          </Pressable>

          {(slide as any).bottomCaption ? (
            <Text style={styles.onboardingBottomCaptionText}>{(slide as any).bottomCaption}</Text>
          ) : null}

          {/* Bottom 3-Column Features */}
          <View style={styles.bottomFeaturesRow}>
            {(slide as any).features ? (
              (slide as any).features.map((feat: any, idx: number) => (
                <View key={idx} style={styles.featureColCardCustom}>
                  <Text style={{ fontSize: 18, marginBottom: 4 }}>{feat.icon}</Text>
                  <Text style={[styles.featureColTitleText, { color: feat.color || '#00E5CC' }]}>{feat.title}</Text>
                  <Text style={styles.featureColSubText}>{feat.desc}</Text>
                </View>
              ))
            ) : (
              <>
                <View style={styles.featureCol}>
                  <UsersIcon size={20} color="#00E5CC" />
                  <Text style={styles.featureColText}>Engage your audience</Text>
                </View>
                <View style={styles.featureCol}>
                  <ZapIcon size={20} color="#FFCC00" />
                  <Text style={styles.featureColText}>Get instant feedback</Text>
                </View>
                <View style={styles.featureCol}>
                  <ShieldIcon size={20} color="#A855F7" />
                  <Text style={styles.featureColText}>Secure & anonymous</Text>
                </View>
              </>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top', 'bottom', 'left', 'right']}>
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
                <GoogleLogoIcon size={20} />
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
    </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  topLogoHeaderContainer: {
    alignItems: 'center',
    marginTop: 10,
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

  // --- Onboarding Screenshot Matching Styles ---
  onboardingPageContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  onboardingScrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 30,
  },
  onboardingTopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  brandTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  onboardingAppIconSquare: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#09090b',
    borderWidth: 2,
    borderColor: '#00E5CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitleWhite: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  brandTitleCyan: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    fontWeight: '900',
    color: '#00E5CC',
  },
  brandSubText: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    fontWeight: '900',
    color: '#71717A',
    letterSpacing: 1,
    marginTop: -2,
  },
  onboardingSkipBtnPill: {
    borderWidth: 1.5,
    borderColor: '#3F3F46',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#09090b',
  },
  onboardingSkipText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  onboardingMainCardGlowing: {
    width: '100%',
    backgroundColor: '#09090b',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#00E5CC',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#00E5CC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  liveBattleBadge: {
    backgroundColor: '#064E46',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00E5CC',
  },
  liveBattleBadgeText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    color: '#00E5CC',
    letterSpacing: 0.5,
  },
  trafficRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slideHeaderTitleFormatted: {
    fontFamily: 'SpaceMono',
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 14,
    lineHeight: 24,
  },
  animContainerBox: {
    width: '100%',
    marginVertical: 10,
  },
  onboardingIndicatorTrack: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  indicatorBarActiveCyan: {
    width: 24,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#00E5CC',
  },
  indicatorBarInactiveMuted: {
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#27272A',
  },
  onboardingDescSubCard: {
    width: '100%',
    backgroundColor: '#09090b',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#27272A',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  descIconCircleBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#064E46',
    borderWidth: 1.5,
    borderColor: '#00E5CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  descSubCardTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  descSubCardText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '500',
    color: '#A1A1AA',
    lineHeight: 14,
  },
  onboardingNextPillBtn: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00E5CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#00E5CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 8,
  },
  onboardingNextBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
    color: '#09090b',
    letterSpacing: 1,
  },
  bottomFeaturesRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 8,
  },
  featureCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  featureColText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '700',
    color: '#A1A1AA',
    textAlign: 'center',
  },
  featureColCardCustom: {
    flex: 1,
    backgroundColor: '#09090b',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#27272A',
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 3,
  },
  featureColTitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 2,
  },
  featureColSubText: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 11,
  },
  onboardingBottomCaptionText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
    color: '#71717A',
    textAlign: 'center',
    marginTop: -14,
    marginBottom: 20,
  },

});
