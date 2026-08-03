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
  Pressable,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { BrutalButton } from '../../components/Brutal';
import { Colors } from '../../constants/Theme';
import { api, initTokenGetter } from '../../utils/api';
import { 
  ArrowLeft, 
  FileText, 
  Pencil, 
  EyeOff, 
  User, 
  Calendar, 
  Plus, 
  Trash, 
  Check, 
  Zap, 
  Lock,
  HelpCircle
} from 'lucide-react-native';
import { useTheme } from '../../contexts/ThemeContext';
import DateTimePicker from '@react-native-community/datetimepicker';

const ArrowLeftIcon = ArrowLeft as any;
const FileTextIcon = FileText as any;
const PencilIcon = Pencil as any;
const EyeOffIcon = EyeOff as any;
const UserIcon = User as any;
const CalendarIcon = Calendar as any;
const PlusIcon = Plus as any;
const TrashIcon = Trash as any;
const CheckIcon = Check as any;
const ZapIcon = Zap as any;
const LockIcon = Lock as any;
const HelpCircleIcon = HelpCircle as any;

export default function CreatePollScreen() {
  const { isLoaded, userId, getToken } = useAuth();
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    if (isLoaded && getToken) {
      initTokenGetter(getToken);
    }
  }, [isLoaded, getToken]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [responseMode, setResponseMode] = useState<'anonymous' | 'authenticated'>('anonymous');

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
    if (Platform.OS === 'android') setShowPicker(false);
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

  const formatMonthAbbr = (d: Date) => {
    return d.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  };

  const formatDateDay = (d: Date) => {
    return String(d.getDate()).padStart(2, '0');
  };

  interface QuestionDraft {
    id: string;
    text: string;
    isMandatory: boolean;
    allowMultiple: boolean;
    options: string[];
  }
  const [questionsList, setQuestionsList] = useState<QuestionDraft[]>([]);
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
    setQuestionText('');
    setIsMandatory(true);
    setAllowMultiple(false);
    setOptions([{ id: '1', text: '' }, { id: '2', text: '' }]);
  };

  const handleRemoveQuestionFromList = (id: string) => {
    setQuestionsList(prev => prev.filter(q => q.id !== id));
  };

  const handleEditQuestionInList = (id: string) => {
    const qToEdit = questionsList.find(q => q.id === id);
    if (!qToEdit) return;

    setQuestionText(qToEdit.text);
    setIsMandatory(qToEdit.isMandatory);
    setAllowMultiple(qToEdit.allowMultiple);
    setOptions(
      qToEdit.options.map((optText, index) => ({
        id: (index + 1).toString(),
        text: optText,
      }))
    );

    setQuestionsList(prev => prev.filter(q => q.id !== id));
    Alert.alert('Editing Question', 'Question loaded in form below! Make your changes and tap Save.');
  };

  const handleCreatePoll = async () => {
    if (!userId) return;
    if (!title.trim() || title.length < 3) {
      Alert.alert('Validation Error', 'Poll Title must be at least 3 characters');
      return;
    }
    if (expiryDate <= new Date()) {
      Alert.alert('Validation Error', 'Expiry date and time must be in the future');
      return;
    }
    let finalQuestions = [...questionsList];
    const validOptions = options.map(o => o.text).filter(opt => opt.trim().length > 0);
    if (questionText.trim().length >= 5 && validOptions.length >= 2) {
      finalQuestions.push({
        id: Math.random().toString(),
        text: questionText.trim(),
        isMandatory,
        allowMultiple,
        options: validOptions.map(opt => opt.trim())
      });
    }
    if (finalQuestions.length === 0) {
      Alert.alert('Validation Error', 'Please add at least 1 valid question with 2 options');
      return;
    }
    setLoading(true);
    try {
      const pollRes = await api.post('/polls', {
        title: title.trim(),
        description: description.trim() || undefined,
        responseMode,
        expiresAt: expiryDate.toISOString()
      });
      if (!pollRes.data.success) throw new Error(pollRes.data.error || 'Failed to create poll');
      const createdPoll = pollRes.data.poll;
      for (const q of finalQuestions) {
        await api.post(`/polls/${createdPoll._id}/questions`, {
          text: q.text,
          isMandatory: q.isMandatory,
          allowMultiple: q.allowMultiple,
          options: q.options
        });
      }
      await api.patch(`/polls/${createdPoll._id}`, { status: 'active' });
      Alert.alert('Success', 'Poll published successfully!');
      router.push('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.guestContainer}>
          <LockIcon size={64} color="#EF4444" />
          <Text style={styles.guestTitle}>Login Required</Text>
          <Text style={styles.guestSub}>
            Only authenticated creators can design and publish custom polls.
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
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.topHeaderRow}>
            <Pressable onPress={() => router.back()} style={styles.backBoxBtn}>
              <ArrowLeftIcon size={20} color="#FFFFFF" />
            </Pressable>
            <View style={styles.headerIllustrationWrapper}>
              <View style={styles.ballotBoxGraphic}>
                <View style={styles.ballotPaper}>
                  <View style={styles.paperCheckCircle}>
                    <CheckIcon size={12} color="#09090b" strokeWidth={3} />
                  </View>
                </View>
                <View style={styles.boxBody}>
                  <View style={styles.boxSlot} />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={styles.titleWhite}>CREATE NEW </Text>
              <Text style={styles.titleYellow}>POLL</Text>
            </View>
            <Text style={styles.subtitleText}>Build engaging polls in just a few simple steps.</Text>
          </View>

          <View style={styles.darkCard}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.headerYellowBadge}>
                <FileTextIcon size={18} color="#09090b" strokeWidth={2.5} />
              </View>
              <Text style={styles.cardHeaderText}>1. GENERAL INFO</Text>
            </View>
            <View style={styles.yellowHeaderUnderline} />

            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabelText}>POLL CAMPAIGN TITLE</Text>
                <View style={styles.yellowDot} />
              </View>
              <View style={styles.inputWithIconRow}>
                <TextInput
                  placeholder="e.g., Team Feedback Session"
                  placeholderTextColor="#6B7280"
                  value={title}
                  onChangeText={setTitle}
                  style={styles.textInputMain}
                  autoCorrect={false}
                />
                <View style={styles.rightInputIcon}>
                  <PencilIcon size={18} color="#FFCC00" />
                </View>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabelText}>DESCRIPTION (OPTIONAL)</Text>
                <View style={styles.yellowDot} />
              </View>
              <TextInput
                placeholder="Provide context for voters..."
                placeholderTextColor="#6B7280"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                style={styles.textInputMultiline}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabelText}>RESPONSE MODE</Text>
                <View style={styles.yellowDot} />
              </View>
              <View style={styles.toggleRow}>
                <Pressable
                  onPress={() => setResponseMode('anonymous')}
                  style={[styles.togglePillBtn, responseMode === 'anonymous' ? styles.togglePillActive : styles.togglePillInactive]}
                >
                  <EyeOffIcon size={18} color={responseMode === 'anonymous' ? '#FFFFFF' : '#09090b'} />
                  <Text style={[styles.togglePillText, responseMode === 'anonymous' ? styles.toggleTextActive : styles.toggleTextInactive]}>ANONYMOUS</Text>
                </Pressable>
                <Pressable
                  onPress={() => setResponseMode('authenticated')}
                  style={[styles.togglePillBtn, responseMode === 'authenticated' ? styles.togglePillActive : styles.togglePillInactive]}
                >
                  <UserIcon size={18} color={responseMode === 'authenticated' ? '#FFFFFF' : '#09090b'} />
                  <Text style={[styles.togglePillText, responseMode === 'authenticated' ? styles.toggleTextActive : styles.toggleTextInactive]}>AUTHENTICATED</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabelText}>EXPIRY DATE & TIME</Text>
                <View style={styles.yellowDot} />
              </View>
              <Pressable onPress={showDatePicker} style={styles.datePickerTriggerBox}>
                <View style={styles.calendarBadgeLeft}>
                  <Text style={styles.calendarMonthText}>{formatMonthAbbr(expiryDate)}</Text>
                  <Text style={styles.calendarDayText}>{formatDateDay(expiryDate)}</Text>
                </View>
                <Text style={styles.datePickerValueText}>{formatDateTime(expiryDate)}</Text>
                <CalendarIcon size={20} color="#FFCC00" />
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
              <View style={styles.quickOffsetRow}>
                <Pressable onPress={() => setExpiryFromOffset(1)} style={styles.offsetPill}><Text style={styles.offsetPillText}>+1 HR</Text></Pressable>
                <Pressable onPress={() => setExpiryFromOffset(24)} style={styles.offsetPill}><Text style={styles.offsetPillText}>+1 DAY</Text></Pressable>
                <Pressable onPress={() => setExpiryFromOffset(72)} style={styles.offsetPill}><Text style={styles.offsetPillText}>+3 DAYS</Text></Pressable>
                <Pressable onPress={() => setExpiryFromOffset(168)} style={styles.offsetPill}><Text style={styles.offsetPillText}>+7 DAYS</Text></Pressable>
              </View>
            </View>
          </View>

          <View style={[styles.darkCard, { marginTop: 16 }]}>
            <View style={styles.cardHeaderRow}>
              <View style={styles.headerYellowBadge}>
                <HelpCircleIcon size={18} color="#09090b" strokeWidth={2.5} />
              </View>
              <Text style={styles.cardHeaderText}>2. ADD QUESTIONS & OPTIONS</Text>
            </View>
            <View style={styles.yellowHeaderUnderline} />
            {questionsList.length > 0 ? (
              <View style={styles.addedQuestionsListWrapper}>
                <Text style={styles.addedCountText}>Saved Questions: {questionsList.length}</Text>
                {questionsList.map((q, idx) => (
                  <View key={q.id} style={styles.savedQRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.savedQTitle}>Q{idx + 1}: {q.text}</Text>
                      <Text style={styles.savedQSub}>{q.options.length} options • {q.isMandatory ? 'Mandatory' : 'Optional'}</Text>
                    </View>
                    <View style={styles.qActionBtnsRow}>
                      <Pressable onPress={() => handleEditQuestionInList(q.id)} style={styles.editQBtn}>
                        <PencilIcon size={14} color="#FFCC00" />
                        <Text style={styles.editQBtnText}>EDIT</Text>
                      </Pressable>
                      <Pressable onPress={() => handleRemoveQuestionFromList(q.id)} style={styles.deleteQBtn}>
                        <TrashIcon size={16} color="#EF4444" />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabelText}>QUESTION #{questionsList.length + 1}</Text>
                <View style={styles.yellowDot} />
              </View>
              <TextInput
                placeholder="e.g., What feature should we build next?"
                placeholderTextColor="#6B7280"
                value={questionText}
                onChangeText={setQuestionText}
                style={styles.textInputMain}
                autoCorrect={false}
              />
            </View>
            <View style={styles.fieldGroup}>
              <View style={styles.fieldLabelRow}>
                <Text style={styles.fieldLabelText}>ANSWER OPTIONS</Text>
                <View style={styles.yellowDot} />
              </View>
              {options.map((opt, index) => (
                <View key={opt.id} style={styles.optionInputRow}>
                  <TextInput
                    placeholder={`Option ${index + 1}`}
                    placeholderTextColor="#6B7280"
                    value={opt.text}
                    onChangeText={(txt) => handleOptionChange(txt, opt.id)}
                    style={styles.textInputMain}
                  />
                  {options.length > 2 ? (
                    <Pressable onPress={() => removeOptionField(opt.id)} style={styles.removeOptBtn}>
                      <TrashIcon size={16} color="#EF4444" />
                    </Pressable>
                  ) : null}
                </View>
              ))}
              <Pressable onPress={addOptionField} style={styles.addOptBtn}>
                <PlusIcon size={16} color="#FFCC00" />
                <Text style={styles.addOptBtnText}>+ ADD OPTION</Text>
              </Pressable>
            </View>
            <View style={styles.settingTogglesRow}>
              <Pressable onPress={() => setIsMandatory(!isMandatory)} style={[styles.settingPill, isMandatory && styles.settingPillActive]}>
                <Text style={[styles.settingPillText, isMandatory && styles.settingPillTextActive]}>{isMandatory ? '✓ MANDATORY' : 'OPTIONAL'}</Text>
              </Pressable>
              <Pressable onPress={() => setAllowMultiple(!allowMultiple)} style={[styles.settingPill, allowMultiple && styles.settingPillActive]}>
                <Text style={[styles.settingPillText, allowMultiple && styles.settingPillTextActive]}>{allowMultiple ? '✓ MULTI CHOICE' : 'SINGLE CHOICE'}</Text>
              </Pressable>
            </View>
            <Pressable onPress={handleAddNextQuestion} style={styles.saveNextQBtn}>
              <PlusIcon size={18} color="#FFCC00" />
              <Text style={styles.saveNextQBtnText}>SAVE & ADD ANOTHER QUESTION</Text>
            </Pressable>
          </View>

          <Pressable onPress={handleCreatePoll} disabled={loading} style={styles.publishPollBtn}>
            {loading ? (
              <ActivityIndicator color="#09090b" size="small" />
            ) : (
              <>
                <ZapIcon size={20} color="#09090b" fill="#09090b" />
                <Text style={styles.publishPollBtnText}>PUBLISH POLL CAMPAIGN</Text>
              </>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#000000',
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  guestContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  guestTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  guestSub: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    color: '#A1A1AA',
    textAlign: 'center',
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backBoxBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#18181B',
    borderWidth: 2,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIllustrationWrapper: {
    width: 100,
    height: 90,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  ballotBoxGraphic: {
    alignItems: 'center',
    position: 'relative',
  },
  ballotPaper: {
    width: 46,
    height: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -10,
    zIndex: 2,
    transform: [{ rotate: '-8deg' }],
  },
  paperCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFCC00',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#09090b',
  },
  boxBody: {
    width: 80,
    height: 60,
    backgroundColor: '#FFCC00',
    borderRadius: 12,
    borderWidth: 2.5,
    borderColor: '#09090b',
    alignItems: 'center',
    paddingTop: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  boxSlot: {
    width: 34,
    height: 5,
    backgroundColor: '#09090b',
    borderRadius: 3,
  },
  titleSection: {
    marginBottom: 20,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleWhite: {
    fontFamily: 'SpaceMono',
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  titleYellow: {
    fontFamily: 'SpaceMono',
    fontSize: 28,
    fontWeight: '900',
    color: '#FFCC00',
    textTransform: 'uppercase',
  },
  subtitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: '#A1A1AA',
    lineHeight: 18,
    marginTop: 4,
  },
  darkCard: {
    backgroundColor: '#18181B',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#27272A',
    padding: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  headerYellowBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFCC00',
    borderWidth: 2,
    borderColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHeaderText: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  yellowHeaderUnderline: {
    height: 2,
    backgroundColor: '#FFCC00',
    marginBottom: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  fieldLabelText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  yellowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFCC00',
  },
  inputWithIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  textInputMain: {
    flex: 1,
    height: 52,
    backgroundColor: '#09090b',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#27272A',
    paddingHorizontal: 16,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  rightInputIcon: {
    position: 'absolute',
    right: 14,
  },
  textInputMultiline: {
    minHeight: 90,
    backgroundColor: '#09090b',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#27272A',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlignVertical: 'top',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  togglePillBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
  },
  togglePillActive: {
    backgroundColor: '#009689',
    borderColor: '#09090b',
  },
  togglePillInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#09090b',
  },
  togglePillText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  toggleTextInactive: {
    color: '#09090b',
  },
  datePickerTriggerBox: {
    height: 56,
    backgroundColor: '#09090b',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#27272A',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarBadgeLeft: {
    width: 40,
    height: 38,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarMonthText: {
    fontFamily: 'SpaceMono',
    fontSize: 8,
    fontWeight: '900',
    color: '#EF4444',
  },
  calendarDayText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#09090b',
    marginTop: -2,
  },
  datePickerValueText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  quickOffsetRow: {
    flexDirection: 'row',
    gap: 8,
  },
  offsetPill: {
    flex: 1,
    height: 36,
    backgroundColor: '#18181B',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  offsetPillText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  addedQuestionsListWrapper: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#09090b',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#27272A',
  },
  addedCountText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFCC00',
    marginBottom: 8,
  },
  savedQRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  savedQTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  savedQSub: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    color: '#A1A1AA',
  },
  qActionBtnsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editQBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#18181B',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FFCC00',
  },
  editQBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '900',
    color: '#FFCC00',
  },
  deleteQBtn: {
    padding: 6,
  },
  optionInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  removeOptBtn: {
    padding: 10,
  },
  addOptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  addOptBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFCC00',
  },
  settingTogglesRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 14,
  },
  settingPill: {
    flex: 1,
    height: 40,
    backgroundColor: '#09090b',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#27272A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingPillActive: {
    borderColor: '#FFCC00',
    backgroundColor: '#18181B',
  },
  settingPillText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '900',
    color: '#A1A1AA',
  },
  settingPillTextActive: {
    color: '#FFCC00',
  },
  saveNextQBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    backgroundColor: '#09090b',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#FFCC00',
    gap: 8,
  },
  saveNextQBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFCC00',
  },
  publishPollBtn: {
    height: 56,
    backgroundColor: '#FFCC00',
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: '#09090b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 6,
  },
  publishPollBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 14,
    fontWeight: '900',
    color: '#09090b',
    letterSpacing: 0.5,
  },
});
