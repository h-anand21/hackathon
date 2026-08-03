import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BrutalCard, BrutalButton, BrutalInput } from '../../components/Brutal';
import { Colors } from '../../constants/Theme';
import { CheckSquare } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';

const CheckSquareIcon = CheckSquare as any;

export default function VoteScreen() {
  const [pollId, setPollId] = useState('');
  const router = useRouter();
  const { colors } = useTheme();

  const extractPollId = (input: string): string => {
    const trimmed = input.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const parts = trimmed.split('/');
      return parts[parts.length - 1] || trimmed;
    }
    return trimmed;
  };

  const handleJoinRoom = () => {
    if (!pollId.trim()) {
      Alert.alert('Error', 'Please enter a valid Poll ID/Code or URL');
      return;
    }
    const cleanId = extractPollId(pollId);
    router.push(`/poll/${cleanId}`);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Direct Voting</Text>

          <BrutalCard variant="default" style={styles.card}>
            <View style={[styles.iconWrapper, { backgroundColor: colors.primary + '22', borderColor: colors.border }]}>
              <CheckSquareIcon size={48} color={colors.primary} />
            </View>
            
            <Text style={[styles.cardHeading, { color: colors.foreground }]}>Join A Campaign</Text>
            <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>
              Enter a live Poll ID or Code shared by the creator to enter the voting room and cast your feedback instantly.
            </Text>

            <BrutalInput
              label="Poll ID / Code"
              placeholder="e.g., 609c12345e..."
              value={pollId}
              onChangeText={setPollId}
              style={{ width: '100%' }}
            />

            <BrutalButton
              title="Connect & Enter Room"
              variant="primary"
              onPress={handleJoinRoom}
              style={styles.joinBtn}
            />
          </BrutalCard>
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
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textTransform: 'uppercase',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    padding: 24,
    alignItems: 'center',
  },
  iconWrapper: {
    borderWidth: 2,
    borderColor: '#09090b',
    borderRadius: 24,
    padding: 12,
    backgroundColor: Colors.accent,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  cardHeading: {
    fontFamily: 'SpaceMono',
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 20,
  },
  joinBtn: {
    width: '100%',
    marginTop: 10,
  },
});
