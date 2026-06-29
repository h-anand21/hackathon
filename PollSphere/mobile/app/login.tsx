import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator,
  Pressable
} from 'react-native';
import { useSignIn, useSignUp, useClerk, useAuth } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { BrutalCard, BrutalButton, BrutalInput } from '../components/Brutal';
import { Colors } from '../constants/Theme';
import { setAuthToken } from '../utils/api';
import { Zap, Shield, BarChart3 } from 'lucide-react-native';

const ZapIcon = Zap as any;
const ShieldIcon = Shield as any;
const BarChartIcon = BarChart3 as any;

export default function LoginScreen() {
  const clerk = useClerk();
  const { isLoaded } = useAuth();
  const { signIn } = useSignIn() as any;
  const { signUp } = useSignUp() as any;
  const router = useRouter();

  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

      await clerk.setActive({ session: completeSignIn.createdSessionId });
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
        await clerk.setActive({ session: completeSignUp.createdSessionId });
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

  const handleGuestMode = () => {
    setAuthToken(null);
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Onboarding Hero Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>📊 PollSphere</Text>
          <Text style={styles.subtitle}>Real-time feedback & polling platform</Text>
        </View>

        {/* Feature Cards mimicking Web Landing page */}
        <View style={styles.featuresContainer}>
          <View style={[styles.miniFeatureCard, { backgroundColor: '#115e59' }]}>
            <ZapIcon size={20} color="#2dd4bf" />
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Real-time Sockets</Text>
              <Text style={styles.featureDesc}>Live voting progress updates with zero latency.</Text>
            </View>
          </View>

          <View style={[styles.miniFeatureCard, { backgroundColor: '#78350f' }]}>
            <ShieldIcon size={20} color="#fbbf24" />
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Secure Voting</Text>
              <Text style={styles.featureDesc}>Prevent spam with strict IP and Clerk auth guards.</Text>
            </View>
          </View>

          <View style={[styles.miniFeatureCard, { backgroundColor: '#1e3a8a' }]}>
            <BarChartIcon size={20} color="#60a5fa" />
            <View style={styles.featureTextWrapper}>
              <Text style={styles.featureTitle}>Deep Analytics</Text>
              <Text style={styles.featureDesc}>Interactive dashboards and charts on-the-go.</Text>
            </View>
          </View>
        </View>

        {/* Interactive Login/Signup Card */}
        <BrutalCard variant="primary" style={styles.card}>
          <Text style={styles.cardTitle}>
            {pendingVerification 
              ? 'Verify Email' 
              : isSignUpMode ? 'Create Account' : 'Welcome Back'}
          </Text>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {pendingVerification ? (
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
});
