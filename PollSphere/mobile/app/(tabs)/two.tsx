import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Alert,
  SafeAreaView
} from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { BrutalCard, BrutalButton, BrutalInput } from '../../components/Brutal';
import { Colors } from '../../constants/Theme';
import { api, setAuthToken } from '../../utils/api';
import { Lock, Plus, Trash } from 'lucide-react-native';

export default function CreatePollScreen() {
  const { isLoaded, userId, getToken } = useAuth();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responseMode, setResponseMode] = useState<'anonymous' | 'authenticated'>('anonymous');
  const [expiryHours, setExpiryHours] = useState('24');

  // Single Question setup for wizard ease
  const [questionText, setQuestionText] = useState('');
  const [isMandatory, setIsMandatory] = useState(true);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [options, setOptions] = useState<string[]>(['', '']); // Default 2 options

  const [loading, setLoading] = useState(false);

  const handleOptionChange = (text: string, index: number) => {
    const updated = [...options];
    updated[index] = text;
    setOptions(updated);
  };

  const addOptionField = () => {
    setOptions([...options, '']);
  };

  const removeOptionField = (index: number) => {
    if (options.length <= 2) {
      Alert.alert('Error', 'A question must have at least 2 options');
      return;
    }
    setOptions(options.filter((_, idx) => idx !== index));
  };

  const handleCreatePoll = async () => {
    if (!userId) return;

    // Validations
    if (!title.trim() || title.length < 3) {
      Alert.alert('Validation Error', 'Poll Title must be at least 3 characters');
      return;
    }
    if (!questionText.trim() || questionText.length < 5) {
      Alert.alert('Validation Error', 'Question text must be at least 5 characters');
      return;
    }
    
    const validOptions = options.filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      Alert.alert('Validation Error', 'Please fill in at least 2 options for the question');
      return;
    }

    const hours = parseInt(expiryHours);
    if (isNaN(hours) || hours <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid number of hours for expiry');
      return;
    }

    setLoading(true);

    try {
      const token = await getToken();
      setAuthToken(token);

      // 1. Create Poll in draft mode
      const expiresAtDate = new Date();
      expiresAtDate.setHours(expiresAtDate.getHours() + hours);

      const pollRes = await api.post('/polls', {
        title: title.trim(),
        description: description.trim() || undefined,
        responseMode,
        expiresAt: expiresAtDate.toISOString()
      });

      if (!pollRes.data.success) {
        throw new Error(pollRes.data.error || 'Failed to create poll');
      }

      const createdPoll = pollRes.data.poll;

      // 2. Add the question to the poll
      const questRes = await api.post(`/polls/${createdPoll._id}/questions`, {
        text: questionText.trim(),
        isMandatory,
        allowMultiple,
        options: validOptions.map(opt => opt.trim())
      });

      if (!questRes.data.success) {
        // Cleanup if possible or notify
        throw new Error(questRes.data.error || 'Failed to add question');
      }

      // 3. Activate the poll to make it live
      await api.patch(`/polls/${createdPoll._id}`, {
        status: 'active'
      });

      Alert.alert('Success', 'Poll created and published successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setQuestionText('');
      setOptions(['', '']);
      
      router.push('/(tabs)');
    } catch (err: any) {
      console.error(err);
      Alert.alert('Error', err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.guestContainer}>
          <Lock size={64} color={Colors.destructive} />
          <Text style={styles.guestTextHeader}>Login Required</Text>
          <Text style={styles.guestTextSub}>
            Only authenticated creators can design and publish custom polls.
          </Text>
          <BrutalButton
            title="Go to Login"
            variant="accent"
            onPress={() => router.replace('/login')}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.headerTitle}>Create New Poll</Text>

          {/* Section 1: Poll General Metadata */}
          <BrutalCard variant="default">
            <Text style={styles.cardHeader}>1. General Info</Text>
            <BrutalInput
              label="Poll Campaign Title"
              placeholder="e.g., Team Feedback Session"
              value={title}
              onChangeText={setTitle}
            />
            <BrutalInput
              label="Description (Optional)"
              placeholder="Provide context for voters..."
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            {/* Mode selection buttons */}
            <Text style={styles.inputLabel}>Response Mode</Text>
            <View style={styles.toggleRow}>
              <BrutalButton
                title="Anonymous"
                variant={responseMode === 'anonymous' ? 'primary' : 'default'}
                onPress={() => setResponseMode('anonymous')}
                style={styles.toggleBtn}
                textStyle={styles.toggleBtnText}
              />
              <BrutalButton
                title="Authenticated"
                variant={responseMode === 'authenticated' ? 'primary' : 'default'}
                onPress={() => setResponseMode('authenticated')}
                style={styles.toggleBtn}
                textStyle={styles.toggleBtnText}
              />
            </View>

            <BrutalInput
              label="Expiry (Hours from now)"
              placeholder="24"
              value={expiryHours}
              onChangeText={setExpiryHours}
              keyboardType="number-pad"
            />
          </BrutalCard>

          {/* Section 2: Poll Question & Options */}
          <BrutalCard variant="primary">
            <Text style={styles.cardHeader}>2. Add Question</Text>
            <BrutalInput
              label="Question Text"
              placeholder="What would you like to ask?"
              value={questionText}
              onChangeText={setQuestionText}
            />

            {/* Option settings checkboxes */}
            <View style={styles.settingRow}>
              <BrutalButton
                title={isMandatory ? 'Mandatory ✓' : 'Optional'}
                variant={isMandatory ? 'accent' : 'default'}
                onPress={() => setIsMandatory(!isMandatory)}
                style={styles.settingBtn}
                textStyle={styles.settingBtnText}
              />
              <BrutalButton
                title={allowMultiple ? 'Multi-Select ✓' : 'Single Choice'}
                variant={allowMultiple ? 'accent' : 'default'}
                onPress={() => setAllowMultiple(!allowMultiple)}
                style={styles.settingBtn}
                textStyle={styles.settingBtnText}
              />
            </View>

            {/* Options list */}
            <Text style={styles.inputLabel}>Choices</Text>
            {options.map((opt, idx) => (
              <View key={idx} style={styles.optionInputRow}>
                <BrutalInput
                  placeholder={`Option ${idx + 1}`}
                  value={opt}
                  onChangeText={(text) => handleOptionChange(text, idx)}
                  style={styles.optionInput}
                />
                <BrutalButton
                  title="X"
                  variant="destructive"
                  onPress={() => removeOptionField(idx)}
                  style={styles.optionDeleteBtn}
                  textStyle={styles.optionDeleteBtnText}
                />
              </View>
            ))}

            <BrutalButton
              title="Add Option choice"
              variant="default"
              onPress={addOptionField}
              style={styles.addOptionBtn}
              textStyle={styles.addOptionBtnText}
            />
          </BrutalCard>

          {/* Creation Trigger */}
          {loading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 20 }} />
          ) : (
            <BrutalButton
              title="Publish Live Poll Now"
              variant="accent"
              onPress={handleCreatePoll}
              style={styles.submitBtn}
            />
          )}
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
    paddingBottom: 40,
  },
  headerTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  cardHeader: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    textTransform: 'uppercase',
    marginBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: '#ffffff',
    paddingBottom: 8,
  },
  inputLabel: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 12,
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  toggleBtn: {
    flex: 1,
    marginVertical: 4,
  },
  toggleBtnText: {
    fontSize: 12,
  },
  settingRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
    marginBottom: 10,
  },
  settingBtn: {
    flex: 1,
    marginVertical: 4,
  },
  settingBtnText: {
    fontSize: 10,
  },
  optionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  optionInput: {
    flex: 1,
    marginVertical: 4,
  },
  optionDeleteBtn: {
    marginVertical: 0,
    width: 44,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: 0,
  },
  optionDeleteBtnText: {
    fontSize: 14,
  },
  addOptionBtn: {
    marginTop: 12,
    borderColor: '#3f3f46',
    backgroundColor: '#18181b',
  },
  addOptionBtnText: {
    fontSize: 12,
  },
  submitBtn: {
    marginTop: 20,
    height: 56,
    justifyContent: 'center',
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 20,
  },
  guestTextHeader: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  guestTextSub: {
    color: Colors.mutedForeground,
    textAlign: 'center',
    fontFamily: 'SpaceMono',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
  },
});
