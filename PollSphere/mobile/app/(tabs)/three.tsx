import React, { useState } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  Alert,
  Pressable,
  TextInput,
  Image,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckSquare, QrCode, ArrowRight, Sparkles, Check, Vote, Megaphone, X } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { CameraView, useCameraPermissions } from 'expo-camera';

const ArrowLeftIcon = ArrowLeft as any;
const CheckSquareIcon = CheckSquare as any;
const QrCodeIcon = QrCode as any;
const ArrowRightIcon = ArrowRight as any;
const SparklesIcon = Sparkles as any;
const CheckIcon = Check as any;
const XIcon = X as any;
const VoteIcon = Vote as any;
const MegaphoneIcon = Megaphone as any;

export default function VoteScreen() {
  const [pollId, setPollId] = useState('');
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const brandAccent = isDark ? '#FFCC00' : '#009689';
  const textColor = isDark ? '#FFFFFF' : '#09090b';
  const subTextColor = isDark ? '#A1A1AA' : '#52525B';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const cardBorder = isDark ? '#27272A' : '#09090b';
  const backBtnBg = isDark ? '#18181B' : '#FFFFFF';
  const backBtnIcon = isDark ? '#FFFFFF' : '#09090b';

  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

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

  const handleScanQR = async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert('Camera Permission Required', 'Please allow camera access to scan QR codes for live polling rooms.');
        return;
      }
    }
    setScanned(false);
    setShowScannerModal(true);
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setShowScannerModal(false);
    const cleanId = extractPollId(data);
    if (cleanId) {
      setPollId(cleanId);
      router.push(`/poll/${cleanId}`);
    } else {
      Alert.alert('Invalid QR Code', 'The scanned QR code is not a valid PollSphere poll link.');
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.topHeaderRow}>
            <Pressable onPress={() => router.back()} style={[styles.backBoxBtn, { backgroundColor: backBtnBg, borderColor: cardBorder }]}>
              <ArrowLeftIcon size={20} color={backBtnIcon} />
            </Pressable>

            {/* Top Right Ballot Box Illustration */}
            <View style={styles.headerIllustrationWrapper}>
              <View style={styles.ballotBoxGraphic}>
                {/* Ballot Paper inserting */}
                <View style={styles.ballotPaper}>
                  <View style={styles.paperCheckCircle}>
                    <CheckIcon size={12} color="#09090b" strokeWidth={3} />
                  </View>
                </View>
                {/* Box body */}
                <View style={[styles.boxBody, { backgroundColor: brandAccent }]}>
                  <View style={styles.boxSlot} />
                </View>
              </View>
            </View>
          </View>

          {/* Title Header */}
          <View style={styles.titleSection}>
            <View style={styles.titleRow}>
              <Text style={[styles.titleWhite, { color: textColor }]}>DIRECT </Text>
              <Text style={[styles.titleYellow, { color: brandAccent }]}>VOTING</Text>
            </View>
            {/* Curved Underline */}
            <View style={styles.underlineCurveContainer}>
              <Svg height="12" width="120" viewBox="0 0 120 12">
                <Path
                  d="M 5 6 Q 60 12 115 4"
                  stroke={brandAccent}
                  strokeWidth="3.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </Svg>
            </View>
            <Text style={[styles.subtitleText, { color: subTextColor }]}>
              Join a live poll campaign and cast your feedback instantly.
            </Text>
          </View>

          {/* Main Card "JOIN A CAMPAIGN" */}
          <View style={[styles.darkCard, { backgroundColor: cardBg, borderColor: cardBorder }]}>
            <View style={styles.darkCardTopContent}>
              {/* PollSphere Brand Logo Badge */}
              <View style={styles.badgeWrapper}>
                <View style={[styles.badgeDottedCircle, { borderColor: brandAccent }]}>
                  <View style={styles.badgeInnerLogoCircle}>
                    <Image 
                      source={require('../../assets/images/icon.png')} 
                      style={styles.pollSphereLogoImg} 
                      resizeMode="cover"
                    />
                  </View>
                </View>
              </View>

              {/* Card Title */}
              <View style={styles.cardTitleRow}>
                <Text style={[styles.cardTitleWhite, { color: textColor }]}>JOIN A </Text>
                <Text style={[styles.cardTitleYellow, { color: brandAccent }]}>CAMPAIGN</Text>
              </View>

              <Text style={[styles.cardDescText, { color: subTextColor }]}>
                Enter a live Poll ID or Code shared by the creator to enter the voting room and cast your feedback instantly.
              </Text>
            </View>

            {/* Wavy Accent Bottom Section */}
            <View style={styles.yellowSectionWrapper}>
              {/* Wavy Divider SVG */}
              <View style={styles.wavySvgWrapper}>
                <Svg height="24" width="100%" viewBox="0 0 1440 320" preserveAspectRatio="none">
                  <Path 
                    fill={brandAccent} 
                    d="M0,128L48,149.3C96,171,192,213,288,213.3C384,213,480,171,576,149.3C672,128,768,128,864,149.3C960,171,1056,213,1152,202.7C1248,192,1344,128,1392,96L1440,64L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                  />
                </Svg>
              </View>

              <View style={[styles.yellowBodyContent, { backgroundColor: brandAccent }]}>
                {/* Input Label with curved arrow */}
                <View style={styles.inputLabelRow}>
                  <Text style={[styles.inputLabelText, !isDark && { color: '#FFFFFF' }]}>POLL ID / CODE</Text>
                  <Svg height="14" width="24" viewBox="0 0 24 14" style={{ marginLeft: 6 }}>
                    <Path
                      d="M 2 2 Q 12 12 22 4 M 18 2 L 22 4 L 20 8"
                      stroke={isDark ? '#09090b' : '#FFFFFF'}
                      strokeWidth="2"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>

                {/* Input Box Row */}
                <View style={styles.inputBoxRow}>
                  <TextInput
                    placeholder="e.g., 609c12345e..."
                    placeholderTextColor="#9CA3AF"
                    value={pollId}
                    onChangeText={setPollId}
                    style={styles.pollInput}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />

                  <Pressable onPress={handleScanQR} style={styles.qrScanBtn}>
                    <QrCodeIcon size={20} color="#09090b" />
                  </Pressable>
                </View>

                {/* Main Action Button CONNECT & ENTER ROOM */}
                <Pressable onPress={handleJoinRoom} style={styles.connectPillBtn}>
                  <Text style={styles.connectBtnText}>CONNECT & ENTER ROOM</Text>
                  <View style={[styles.cyanArrowCircle, !isDark && { backgroundColor: '#FFCC00' }]}>
                    <ArrowRightIcon size={20} color="#09090b" strokeWidth={3} />
                  </View>
                </Pressable>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* QR Code Scanner Modal */}
      <Modal
        visible={showScannerModal}
        transparent={false}
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setShowScannerModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
          {/* Scanner Header */}
          <View style={styles.scannerHeader}>
            <Pressable onPress={() => setShowScannerModal(false)} style={styles.scannerCloseBtn}>
              <XIcon size={22} color="#FFFFFF" />
            </Pressable>
            <Text style={styles.scannerHeaderTitle}>SCAN POLL QR</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Camera View */}
          <CameraView
            style={{ flex: 1 }}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          >
            {/* Scan Frame Overlay */}
            <View style={styles.scanOverlay}>
              <View style={styles.scanFrameTop} />
              <View style={styles.scanFrameMiddleRow}>
                <View style={styles.scanFrameSide} />
                <View style={styles.scanFrame}>
                  {/* Corner marks */}
                  <View style={[styles.corner, styles.cornerTL]} />
                  <View style={[styles.corner, styles.cornerTR]} />
                  <View style={[styles.corner, styles.cornerBL]} />
                  <View style={[styles.corner, styles.cornerBR]} />
                  {/* Scan line */}
                  <View style={styles.scanLine} />
                </View>
                <View style={styles.scanFrameSide} />
              </View>
              <View style={styles.scanFrameBottom}>
                <Text style={styles.scanHintText}>Point camera at PollSphere QR Code</Text>
                {scanned && (
                  <Pressable onPress={() => setScanned(false)} style={styles.scanAgainBtn}>
                    <Text style={styles.scanAgainBtnText}>TAP TO SCAN AGAIN</Text>
                  </Pressable>
                )}
              </View>
            </View>
          </CameraView>
        </View>
      </Modal>
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
    paddingBottom: 110,
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
    backgroundColor: '#E4E4E7',
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
  underlineCurveContainer: {
    marginTop: -4,
    marginBottom: 8,
  },
  subtitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    color: '#A1A1AA',
    lineHeight: 18,
  },
  darkCard: {
    backgroundColor: '#18181B',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#27272A',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  darkCardTopContent: {
    padding: 24,
    paddingBottom: 16,
    alignItems: 'center',
  },
  badgeWrapper: {
    marginBottom: 16,
  },
  badgeDottedCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#3F3F46',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  badgeInnerLogoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFCC00',
    borderWidth: 2,
    borderColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pollSphereLogoImg: {
    width: '100%',
    height: '100%',
    borderRadius: 30,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitleWhite: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  cardTitleYellow: {
    fontFamily: 'SpaceMono',
    fontSize: 22,
    fontWeight: '900',
    color: '#FFCC00',
    textTransform: 'uppercase',
  },
  cardDescText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    color: '#A1A1AA',
    textAlign: 'center',
    lineHeight: 18,
  },
  yellowSectionWrapper: {
    marginTop: 0,
  },
  wavySvgWrapper: {
    marginBottom: -1,
  },
  yellowBodyContent: {
    backgroundColor: '#FFCC00',
    padding: 20,
    paddingTop: 4,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
  },
  inputLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputLabelText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#09090b',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  inputBoxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  pollInput: {
    flex: 1,
    height: 52,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 2.5,
    borderColor: '#09090b',
    paddingHorizontal: 16,
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
  qrScanBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    borderWidth: 2.5,
    borderColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectPillBtn: {
    height: 56,
    backgroundColor: '#09090b',
    borderRadius: 28,
    borderWidth: 2.5,
    borderColor: '#09090b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 22,
    paddingRight: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 5,
  },
  connectBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  cyanArrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#06B6D4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // QR Scanner Modal Styles
  scannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
    paddingBottom: 16,
    backgroundColor: '#000000',
  },
  scannerCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#18181B',
    borderWidth: 1.5,
    borderColor: '#3F3F46',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerHeaderTitle: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    color: '#FFCC00',
    letterSpacing: 1,
  },
  scanOverlay: {
    flex: 1,
  },
  scanFrameTop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scanFrameMiddleRow: {
    flexDirection: 'row',
    height: 260,
  },
  scanFrameSide: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  scanFrame: {
    width: 260,
    height: 260,
    position: 'relative',
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#FFCC00',
    borderWidth: 4,
  },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderRadius: 4 },
  scanLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2.5,
    backgroundColor: '#FFCC00',
    opacity: 0.85,
  },
  scanFrameBottom: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingTop: 24,
  },
  scanHintText: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.85,
  },
  scanAgainBtn: {
    backgroundColor: '#FFCC00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#09090b',
  },
  scanAgainBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#09090b',
  },
});

