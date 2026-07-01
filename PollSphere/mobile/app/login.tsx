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
  Easing
} from 'react-native';
import { useSignIn, useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { BrutalCard, BrutalButton, BrutalInput } from '../components/Brutal';
import { Colors } from '../constants/Theme';
import { setAuthToken } from '../utils/api';
import { Zap, Shield, BarChart3, Users, Trophy, ArrowRight, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ZapIcon = Zap as any;
const ShieldIcon = Shield as any;
const BarChartIcon = BarChart3 as any;
const UsersIcon = Users as any;
const TrophyIcon = Trophy as any;
const ArrowRightIcon = ArrowRight as any;
const PlusIcon = Plus as any;

// --- Animation Components for 6 Onboarding Screens ---
const LiveSocketsAnim = () => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.3, duration: 800, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={animStyles.center}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <ZapIcon size={48} color="#2dd4bf" />
      </Animated.View>
    </View>
  );
};

const SpamShieldAnim = () => {
  const opacity = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.4, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={animStyles.center}>
      <Animated.View style={{ opacity }}>
        <ShieldIcon size={48} color="#fbbf24" />
      </Animated.View>
    </View>
  );
};

const AnalyticsChartAnim = () => {
  const height1 = useRef(new Animated.Value(20)).current;
  const height2 = useRef(new Animated.Value(40)).current;
  const height3 = useRef(new Animated.Value(30)).current;
  useEffect(() => {
    const makeAnim = (val: Animated.Value, max: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(val, { toValue: max, duration: 1000, useNativeDriver: false }),
          Animated.timing(val, { toValue: 20, duration: 1000, useNativeDriver: false }),
        ])
      );
    };
    Animated.parallel([
      makeAnim(height1, 60),
      makeAnim(height2, 80),
      makeAnim(height3, 70),
    ]).start();
  }, []);
  return (
    <View style={[animStyles.center, { flexDirection: 'row', alignItems: 'flex-end', gap: 10 }]}>
      <Animated.View style={{ width: 12, height: height1, backgroundColor: '#60a5fa', borderRadius: 4 }} />
      <Animated.View style={{ width: 12, height: height2, backgroundColor: '#c084fc', borderRadius: 4 }} />
      <Animated.View style={{ width: 12, height: height3, backgroundColor: '#f43f5e', borderRadius: 4 }} />
    </View>
  );
};

const ResponseModesAnim = () => {
  const posX = useRef(new Animated.Value(-30)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(posX, { toValue: 30, duration: 1200, useNativeDriver: true }),
        Animated.timing(posX, { toValue: -30, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={animStyles.center}>
      <Animated.View style={{ transform: [{ translateX: posX }] }}>
        <UsersIcon size={48} color="#34d399" />
      </Animated.View>
    </View>
  );
};

const CampaignWizardAnim = () => {
  const rotate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotate, { toValue: 1, duration: 1000, useNativeDriver: true }),
        Animated.timing(rotate, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['-25deg', '25deg']
  });
  return (
    <View style={animStyles.center}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <PlusIcon size={48} color="#f472b6" />
      </Animated.View>
    </View>
  );
};

const TrophyInsightsAnim = () => {
  const posY = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(posY, { toValue: -15, duration: 600, useNativeDriver: true }),
        Animated.timing(posY, { toValue: 0, duration: 600, useNativeDriver: true }),
      ])
    ).start();
  }, []);
  return (
    <View style={animStyles.center}>
      <Animated.View style={{ transform: [{ translateY: posY }] }}>
        <TrophyIcon size={48} color="#fbbf24" />
      </Animated.View>
    </View>
  );
};

const animStyles = StyleSheet.create({
  center: {
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  }
});

export default function LoginScreen() {
  const { signIn, setActive, isLoaded } = useSignIn() as any;
  const { signUp } = useSignUp() as any;
  const router = useRouter();

  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const onboardingSlides = [
    {
      title: "Real-time Sockets",
      desc: "Live voting progress updates with zero latency. Watch options tick dynamically.",
      renderAnim: () => <LiveSocketsAnim />,
      color: '#115e59',
    },
    {
      title: "Secure Verification",
      desc: "Prevent spam voting using strict IP gating and Clerk authentication controls.",
      renderAnim: () => <SpamShieldAnim />,
      color: '#78350f',
    },
    {
      title: "Deep Analytics",
      desc: "Premium donut charts and distribution visualizers responsive on all phone screens.",
      renderAnim: () => <AnalyticsChartAnim />,
      color: '#1e3a8a',
    },
    {
      title: "Flexible Access",
      desc: "Run completely anonymous voting rooms or Clerk-authenticated secure polls.",
      renderAnim: () => <ResponseModesAnim />,
      color: '#064e3b',
    },
    {
      title: "Campaign Wizard",
      desc: "Draft campaigns, define questions, and publish customized choices in 60 seconds.",
      renderAnim: () => <CampaignWizardAnim />,
      color: '#831843',
    },
    {
      title: "Peak Insights",
      desc: "Live trends, total votes, and real-time winner highlights visualised cleanly.",
      renderAnim: () => <TrophyInsightsAnim />,
      color: '#701a75',
    },
  ];

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false);
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Verification state for signup
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

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
      console.error(err);
      setError(err.errors?.[0]?.longMessage || 'Invalid email or password');
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
      console.error(err);
      setError(err.errors?.[0]?.longMessage || 'Failed to sign up');
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
      console.error(err);
      setError(err.errors?.[0]?.longMessage || 'Verification failed');
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
      console.error(err);
      setError(err.errors?.[0]?.longMessage || 'Could not send verification code.');
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
      console.error(err);
      setError(err.errors?.[0]?.longMessage || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestMode = () => {
    setAuthToken(null);
    router.replace('/(tabs)');
  };

  if (showOnboarding) {
    const slide = onboardingSlides[currentSlide];
    return (
      <SafeAreaView style={styles.onboardingContainer}>
        <View style={styles.onboardingWrapper}>
          {/* Logo Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>📊 PollSphere</Text>
            <Text style={styles.subtitle}>Real-time feedback & polling platform</Text>
          </View>

          {/* Onboarding Slide Card */}
          <BrutalCard variant="default" style={StyleSheet.flatten([styles.onboardingCard, { backgroundColor: slide.color }])}>
            {slide.renderAnim()}
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideDesc}>{slide.desc}</Text>
          </BrutalCard>

          {/* Dot Indicators */}
          <View style={styles.dotRow}>
            {onboardingSlides.map((_, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.dot, 
                  idx === currentSlide ? styles.dotActive : styles.dotInactive
                ]} 
              />
            ))}
          </View>

          {/* Controls */}
          <View style={styles.onboardingControls}>
            <Pressable 
              onPress={() => setShowOnboarding(false)} 
              style={styles.skipBtn}
            >
              <Text style={styles.skipText}>Skip</Text>
            </Pressable>

            <BrutalButton
              title={currentSlide === 5 ? "Get Started" : "Next"}
              variant="primary"
              onPress={() => {
                if (currentSlide < 5) {
                  setCurrentSlide(currentSlide + 1);
                } else {
                  setShowOnboarding(false);
                }
              }}
              style={styles.nextBtn}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Logo Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>📊 PollSphere</Text>
          <Text style={styles.subtitle}>Real-time feedback & polling platform</Text>
        </View>

        {/* Interactive Login/Signup Card */}
        <BrutalCard variant="primary" style={styles.card}>
          <Text style={styles.cardTitle}>
            {isForgotPasswordMode 
              ? 'Reset Password' 
              : pendingVerification 
                ? 'Verify Email' 
                : isSignUpMode ? 'Create Account' : 'Welcome Back'}
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {isForgotPasswordMode ? (
            forgotPasswordStep === 1 ? (
              <View>
                <Text style={styles.infoText}>
                  Enter your email address to receive a password reset verification code.
                </Text>
                <BrutalInput
                  label="Email Address"
                  placeholder="yourname@example.com"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                {loading ? (
                  <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 15 }} />
                ) : (
                  <BrutalButton
                    title="Send Reset Code"
                    variant="accent"
                    onPress={handleForgotPasswordRequest}
                  />
                )}
                <Pressable 
                  onPress={() => {
                    setIsForgotPasswordMode(false);
                    setError('');
                  }}
                  style={styles.toggleMode}
                >
                  <Text style={styles.toggleText}>Back to Sign In</Text>
                </Pressable>
              </View>
            ) : (
              <View>
                <Text style={styles.infoText}>
                  Enter the code sent to your email and select your new password.
                </Text>
                <BrutalInput
                  label="Reset Code"
                  placeholder="123456"
                  value={resetCode}
                  onChangeText={setResetCode}
                  keyboardType="number-pad"
                />
                <BrutalInput
                  label="New Password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                {loading ? (
                  <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 15 }} />
                ) : (
                  <BrutalButton
                    title="Reset Password"
                    variant="accent"
                    onPress={handleForgotPasswordReset}
                  />
                )}
                <Pressable 
                  onPress={() => {
                    setForgotPasswordStep(1);
                    setError('');
                  }}
                  style={styles.toggleMode}
                >
                  <Text style={styles.toggleText}>Back to Email Entry</Text>
                </Pressable>
              </View>
            )
          ) : pendingVerification ? (
            <View>
              <Text style={styles.infoText}>
                We sent a verification code to your email. Enter it below.
              </Text>
              <BrutalInput
                label="Verification Code"
                placeholder="123456"
                value={verificationCode}
                onChangeText={setVerificationCode}
                keyboardType="number-pad"
              />
              <BrutalButton
                title={loading ? 'Verifying...' : 'Verify Code'}
                variant="accent"
                onPress={handleVerify}
                disabled={loading}
              />
              <BrutalButton
                title="Back to Sign Up"
                variant="default"
                onPress={() => setPendingVerification(false)}
                style={styles.backButton}
              />
            </View>
          ) : (
            <View>
              <BrutalInput
                label="Email Address"
                placeholder="yourname@example.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <BrutalInput
                label="Password"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {!isSignUpMode && (
                <Pressable 
                  onPress={() => {
                    setIsForgotPasswordMode(true);
                    setForgotPasswordStep(1);
                    setError('');
                  }}
                  style={styles.forgotPasswordLink}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </Pressable>
              )}

              {loading ? (
                <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 15 }} />
              ) : (
                <BrutalButton
                  title={isSignUpMode ? 'Sign Up' : 'Sign In'}
                  variant="primary"
                  onPress={isSignUpMode ? handleSignUp : handleSignIn}
                />
              )}

              <Pressable 
                onPress={() => {
                  setIsSignUpMode(!isSignUpMode);
                  setError('');
                }}
                style={styles.toggleMode}
              >
                <Text style={styles.toggleText}>
                  {isSignUpMode 
                    ? 'Already have an account? Sign In' 
                    : "Don't have an account? Sign Up"}
                </Text>
              </Pressable>
            </View>
          )}
        </BrutalCard>

        {/* Guest Mode action */}
        <View style={styles.guestWrapper}>
          <Text style={styles.orText}>— OR —</Text>
          <BrutalButton
            title="Continue as Guest"
            variant="accent"
            onPress={handleGuestMode}
          />
          <Text style={styles.guestInfo}>
            You can vote anonymously, but won't be able to create new polls.
          </Text>
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
    justifyContent: 'center',
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
});
