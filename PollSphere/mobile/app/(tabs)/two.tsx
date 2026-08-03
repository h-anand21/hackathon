import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform, 
  ActivityIndicator, 
  Alert,
  Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { BrutalCard, BrutalButton, BrutalInput } from '../../components/Brutal';
import { Colors } from '../../constants/Theme';
import { api, initTokenGetter } from '../../utils/api';
import { Lock, Plus, Trash } from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function CreatePollScreen() {
  const { isLoaded, userId, getToken } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  // Register Clerk's token getter with the axios interceptor
  useEffect(() => {
    if (isLoaded && getToken) {
      initTokenGetter(getToken);
    }
  }, [isLoaded, getToken]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responseMode, setResponseMode] = useState<'anonymous' | 'authenticated'>('anonymous');

  // Expiry states using native Date object
  const [expiryDate, setExpiryDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(d.getHours() + 24);
    return d;
  });
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const onPickerChange = (event: any, selectedDate?: Date) => {
    if (event.type === 'dismissed') {
      setShowPicker(false);
      return;
    }

    const currentDate = selectedDate || expiryDate;

    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    setExpiryDate(currentDate);

    if (pickerMode === 'date') {
      setPickerMode('time');
      if (Platform.OS === 'android') {
        setTimeout(() => setShowPicker(true), 150);
      }
    }
  };

  const showDatePicker = () => {
    setPickerMode('date');
    setShowPicker(true);
  };

  const setExpiryFromOffset = (hoursOffset: number) => {
    const d = new Date();
    d.setHours(d.getHours() + hoursOffset);
    setExpiryDate(d);
  };

  const formatDateTime = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  };

  // Questions List for Multi-Question Polls
  interface QuestionDraft {
    id: string;
    text: string;
    isMandatory: boolean;
    allowMultiple: boolean;
    options: string[];
  }
  const [questionsList, setQuestionsList] = useState<QuestionDraft[]>([]);

  // Current Question form setup
  const [questionText, setQuestionText] = useState('');
  const [isMandatory, setIsMandatory] = useState(true);
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [options, setOptions] = useState<{ id: string; text: string }[]>([
    { id: '1', text: '' },
    { id: '2', text: '' }
  ]);

  const [loading, setLoading] = useState(false);

  const handleOptionChange = (text: string, id: string) => {
    setOptions(options.map(opt => opt.id === id ? { ...opt, text } : opt));
  };

  const addOptionField = () => {
    setOptions([...options, { id: Math.random().toString(), text: '' }]);
  };

  const removeOptionField = (id: string) => {
    if (options.length <= 2) {
      Alert.alert('Error', 'A question must have at least 2 options');
      return;
    }
    setOptions(options.filter(opt => opt.id !== id));
  };

  const handleAddNextQuestion = () => {
    if (!questionText.trim() || questionText.length < 5) {
      Alert.alert('Validation Error', 'Question text must be at least 5 characters');
      return;
    }
    const validOptions = options.map(o => o.text).filter(opt => opt.trim().length > 0);
    if (validOptions.length < 2) {
      Alert.alert('Validation Error', 'Please fill in at least 2 options for the question');
      return;
    }

    const newQ: QuestionDraft = {
      id: Math.random().toString(),
      text: questionText.trim(),
      isMandatory,
      allowMultiple,
      options: validOptions.map(opt => opt.trim())
    };

    setQuestionsList(prev => [...prev, newQ]);

    // Reset current question inputs
    setQuestionText('');
    setIsMandatory(true);
    setAllowMultiple(false);
    setOptions([
      { id: '1', text: '' },
      { id: '2', text: '' }
    ]);

    Alert.alert('Question Saved', `Question #${questionsList.length + 1} added! Fill below to add another question, or tap "Publish Live Poll Now" when finished.`);
  };

  const handleRemoveQuestionFromList = (id: string) => {
    setQuestionsList(prev => prev.filter(q => q.id !== id));
  };

  const handleCreatePoll = async () => {
    if (!userId) return;

    // Validations
    if (!title.trim() || title.length < 3) {
      Alert.alert('Validation Error', 'Poll Title must be at least 3 characters');
      return;
    }

    if (expiryDate <= new Date()) {
      Alert.alert('Validation Error', 'Expiry date and time must be in the future');
      return;
    }

    // Prepare all questions to be created
    let finalQuestions = [...questionsList];
    const validOptions = options.map(o => o.text).filter(opt => opt.trim().length > 0);

    if (questionText.trim().length >= 5 && validOptions.length >= 2) {
      // Include current question form if valid
      finalQuestions.push({
        id: Math.random().toString(),
        text: questionText.trim(),
        isMandatory,
        allowMultiple,
        options: validOptions.map(opt => opt.trim())
      });
    }

    if (finalQuestions.length === 0) {
      Alert.alert('Validation Error', 'Please add at least 1 valid question with 2 options to your poll');
      return;
    }

    setLoading(true);

    try {
      // 1. Create Poll Container
      const pollRes = await api.post('/polls', {
        title: title.trim(),
        description: description.trim() || undefined,
        responseMode,
        expiresAt: expiryDate.toISOString()
      });

      if (!pollRes.data.success) {
        throw new Error(pollRes.data.error || 'Failed to create poll');
      }

      const createdPoll = pollRes.data.poll;

      // 2. Add all questions sequentially
      for (const q of finalQuestions) {
        const questRes = await api.post(`/polls/${createdPoll._id}/questions`, {
          text: q.text,
          isMandatory: q.isMandatory,
          allowMultiple: q.allowMultiple,
          options: q.options
        });

        if (!questRes.data.success) {
          throw new Error(questRes.data.error || 'Failed to add question');
        }
      }

      // 3. Activate the poll to make it live
      await api.patch(`/polls/${createdPoll._id}`, {
        status: 'active'
      });

      Alert.alert('Success', `Poll created with ${finalQuestions.length} question(s) and published successfully!`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setQuestionText('');
      setQuestionsList([]);
      setExpiryDate(() => {
        const d = new Date();
        d.setHours(d.getHours() + 24);
        return d;
      });
      setOptions([
        { id: '1', text: '' },
        { id: '2', text: '' }
      ]);
      
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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.guestContainer}>
          <Lock size={64} color={colors.destructive} />
          <Text style={[styles.guestTextHeader, { color: colors.foreground }]}>Login Required</Text>
          <Text style={[styles.guestTextSub, { color: colors.mutedForeground }]}>
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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Create New Poll</Text>

          {/* Section 1: Poll General Metadata */}
          <BrutalCard variant="default">
            <Text style={[styles.cardHeader, { color: colors.foreground, borderBottomColor: colors.border }]}>1. General Info</Text>
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
            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Response Mode</Text>
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

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Expiry Date & Time</Text>
            
            {/* Native Date Picker Trigger Button */}
            <Pressable 
              onPress={showDatePicker}
              style={[
                styles.pickerTrigger, 
                { 
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                }
              ]}
            >
              <Text style={[styles.pickerTriggerText, { color: colors.foreground }]}>
                📅 {formatDateTime(expiryDate)}
              </Text>
            </Pressable>

            {showPicker && (
              <DateTimePicker
                value={expiryDate}
                mode={pickerMode}
                display="default"
                minimumDate={new Date()}
                onChange={onPickerChange}
              />
            )}

            {/* Quick offset buttons */}
            <View style={styles.quickOffsetRow}>
              <BrutalButton
                title="+1 Hr"
                variant="default"
                onPress={() => setExpiryFromOffset(1)}
                style={styles.quickOffsetBtn}
                textStyle={styles.quickOffsetBtnText}
              />
              <BrutalButton
                title="+1 Day"
                variant="default"
                onPress={() => setExpiryFromOffset(24)}
                style={styles.quickOffsetBtn}
                textStyle={styles.quickOffsetBtnText}
              />
              <BrutalButton
                title="+3 Days"
                variant="default"
                onPress={() => setExpiryFromOffset(72)}
                style={styles.quickOffsetBtn}
                textStyle={styles.quickOffsetBtnText}
              />
              <BrutalButton
                title="+7 Days"
                variant="default"
                onPress={() => setExpiryFromOffset(168)}
                style={styles.quickOffsetBtn}
                textStyle={styles.quickOffsetBtnText}
              />
            </View>
          </BrutalCard>

          {/* Added Questions List Card */}
          {questionsList.length > 0 && (
            <BrutalCard variant="default">
              <Text style={[styles.cardHeader, { color: colors.foreground, borderBottomColor: colors.border }]}>
                Added Questions ({questionsList.length})
              </Text>
              {questionsList.map((q, qIdx) => (
                <View key={q.id} style={[styles.addedQuestionItem, { borderBottomColor: colors.border }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.addedQuestionText, { color: colors.foreground }]}>
                      Q{qIdx + 1}: {q.text}
                    </Text>
                    <Text style={[styles.addedQuestionMeta, { color: colors.mutedForeground }]}>
                      {q.options.length} options • {q.isMandatory ? 'Mandatory' : 'Optional'} • {q.allowMultiple ? 'Multi Choice' : 'Single Choice'}
                    </Text>
                  </View>
                  <BrutalButton
                    title="Remove"
                    variant="destructive"
                    onPress={() => handleRemoveQuestionFromList(q.id)}
                    style={styles.removeQuestionBtn}
                    textStyle={styles.removeQuestionBtnText}
                  />
                </View>
              ))}
            </BrutalCard>
          )}

          {/* Section 2: Poll Question & Options */}
          <BrutalCard variant="primary">
            <Text style={[styles.cardHeader, { color: colors.foreground, borderBottomColor: colors.border }]}>
              {questionsList.length > 0 ? `Add Question #${questionsList.length + 1}` : '2. Add Question'}
            </Text>
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

            <Text style={[styles.inputLabel, { color: colors.foreground }]}>Choices</Text>
            {options.map((opt, idx) => (
              <View key={opt.id} style={styles.optionInputRow}>
                <BrutalInput
                  placeholder={`Option ${idx + 1}`}
                  value={opt.text}
                  onChangeText={(text) => handleOptionChange(text, opt.id)}
                  style={styles.optionInput}
                />
                <BrutalButton
                  title="X"
                  variant="destructive"
                  onPress={() => removeOptionField(opt.id)}
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

            <BrutalButton
              title="+ Save & Add Next Question"
              variant="primary"
              onPress={handleAddNextQuestion}
              style={styles.addNextQuestionBtn}
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
  quickOffsetRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  quickOffsetBtn: {
    flex: 1,
    marginVertical: 4,
    paddingVertical: 4,
  },
  quickOffsetBtnText: {
    fontSize: 9,
    fontFamily: 'SpaceMono',
    fontWeight: '900',
  },
  pickerTrigger: {
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  pickerTriggerText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
  },
  addedQuestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 10,
  },
  addedQuestionText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '900',
  },
  addedQuestionMeta: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    marginTop: 2,
  },
  removeQuestionBtn: {
    marginVertical: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeQuestionBtnText: {
    fontSize: 10,
  },
  addNextQuestionBtn: {
    marginTop: 16,
  },
});
