import React, { useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Modal,
  Pressable,
  Share,
  Alert,
  Platform,
  Linking
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot, { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { X, Share2, Copy, QrCode, Check, MessageCircle } from 'lucide-react-native';
import { useTheme } from '../contexts/ThemeContext';
import * as Clipboard from 'expo-clipboard';

// Safely require react-native-share to avoid crash in Expo Go
let RNShare: any = null;
try {
  RNShare = require('react-native-share').default || require('react-native-share');
} catch (e) {
  // TurboModule not available in Expo Go app
}

const XIcon = X as any;
const Share2Icon = Share2 as any;
const CopyIcon = Copy as any;
const QrCodeIcon = QrCode as any;
const CheckIcon = Check as any;
const MessageCircleIcon = MessageCircle as any;

interface PollQRCodeModalProps {
  visible: boolean;
  onClose: () => void;
  pollId: string;
  pollTitle: string;
}

export function PollQRCodeModal({ visible, onClose, pollId, pollTitle }: PollQRCodeModalProps) {
  const { colors, isDark } = useTheme();
  const [copied, setCopied] = React.useState(false);
  const [sharing, setSharing] = React.useState(false);
  const qrViewRef = useRef<any>(null);

  const brandAccent = isDark ? '#FFCC00' : '#009689';
  const textColor = isDark ? '#FFFFFF' : '#09090b';
  const subTextColor = isDark ? '#A1A1AA' : '#52525B';
  const cardBg = isDark ? '#18181B' : '#FFFFFF';
  const cardBorder = isDark ? '#27272A' : '#09090b';

  // Always ensure https:// prefix
  const rawUrl = process.env.EXPO_PUBLIC_WEB_URL || 'https://pollsphere.netlify.app';
  const webUrl = rawUrl.startsWith('https://') ? rawUrl : `https://${rawUrl.replace(/^https?:\/\//, '')}`;
  // Slug matches frontend formula: title.toLowerCase().replace(/[^a-z0-9]+/g, '-')
  const slug = pollTitle ? pollTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'poll';
  const pollShareUrl = `${webUrl}/poll/${slug}/${pollId}`;

  const handleCopyLink = async () => {
    try {
      await Clipboard.setStringAsync(pollShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      Alert.alert('Error', 'Could not copy to clipboard.');
    }
  };

  const handleNativeShare = async () => {
    setSharing(true);
    const shareText = `🗳️ Vote on this Poll: "${pollTitle || 'Live Poll'}"\n🔗 ${pollShareUrl}`;
    try {
      // Capture clean QR code image as temporary PNG file
      const fileUri = await captureRef(qrViewRef, {
        format: 'png',
        quality: 1,
        result: 'tmpfile',
      });

      let sharedSuccess = false;

      // 1. If RNShare TurboModule is available in native build, use it for Flipkart-style image+caption intent
      if (RNShare && typeof RNShare.open === 'function') {
        try {
          const base64Uri = await captureRef(qrViewRef, {
            format: 'png',
            quality: 1,
            result: 'data-uri',
          });
          await RNShare.open({
            title: pollTitle || 'Vote on PollSphere',
            message: shareText,
            url: base64Uri,
            type: 'image/png',
            failOnCancel: false,
          });
          sharedSuccess = true;
        } catch (e) {
          console.log('RNShare error or cancelled:', e);
        }
      }

      // 2. Fallback for Expo Go (or if RNShare was unavailable)
      if (!sharedSuccess) {
        await Clipboard.setStringAsync(shareText);
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'image/png',
            dialogTitle: 'Share Poll QR Code Card',
            UTI: 'public.png',
          });
        } else {
          await Share.share({ message: shareText });
        }
      }
    } catch (err: any) {
      try {
        await Share.share({ message: shareText });
      } catch (e) {
        console.error('Share fallback error:', e);
      }
    } finally {
      setSharing(false);
    }
  };

  if (!visible || !pollId) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackdrop} onPress={onClose} />
        
        <View style={[styles.modalCard, { backgroundColor: cardBg, borderColor: brandAccent }]}>
          {/* Header */}
          <View style={styles.modalHeaderRow}>
            <View style={styles.headerTitleGroup}>
              <View style={[styles.qrBadgeCircle, { backgroundColor: brandAccent }]}>
                <QrCodeIcon size={18} color={isDark ? '#09090b' : '#FFFFFF'} strokeWidth={2.5} />
              </View>
              <View>
                <Text style={[styles.modalTitleText, { color: textColor }]}>POLL QR CODE</Text>
                <Text style={[styles.modalSubtitleText, { color: subTextColor }]}>Scan to enter voting room</Text>
              </View>
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <XIcon size={20} color={textColor} />
            </Pressable>
          </View>

          {/* Branded Share Card Banner (Captured as Image by ViewShot) */}
          <ViewShot ref={qrViewRef} options={{ format: 'png', quality: 1 }}>
            <View style={[styles.shareCardBanner, { backgroundColor: isDark ? '#09090b' : '#FFFFFF', borderColor: brandAccent }]}>
              {/* Brand Header */}
              <View style={[styles.shareCardHeader, { backgroundColor: brandAccent }]}>
                <Text style={[styles.shareCardBrandText, { color: isDark ? '#09090b' : '#FFFFFF' }]}>POLLSPHERE ⚡</Text>
                <Text style={[styles.shareCardSubText, { color: isDark ? '#09090b' : '#FFFFFF' }]}>LIVE VOTING ROOM</Text>
              </View>

              {/* QR Code Container */}
              <View style={styles.qrCanvasBadge}>
                <QRCode
                  value={pollShareUrl}
                  size={170}
                  color="#09090b"
                  backgroundColor="#FFFFFF"
                />
              </View>

              {/* Poll Title */}
              <Text style={[styles.pollTitleDisplay, { color: textColor }]} numberOfLines={2}>
                {pollTitle || 'Live Campaign Poll'}
              </Text>

              {/* Direct Web URL & Poll Code Box */}
              <View style={[styles.shareUrlBox, { backgroundColor: isDark ? '#18181B' : '#F4F4F5', borderColor: cardBorder }]}>
                <Text style={[styles.shareUrlText, { color: brandAccent }]} numberOfLines={1}>
                  🔗 {pollShareUrl}
                </Text>
                <Text style={[styles.shareCodeText, { color: subTextColor }]}>
                  POLL CODE: <Text style={{ color: textColor, fontWeight: '900' }}>{pollId}</Text>
                </Text>
              </View>
            </View>
          </ViewShot>

          {/* Action Buttons Row */}
          <View style={styles.actionButtonsRow}>
            <Pressable
              onPress={handleCopyLink}
              style={[
                styles.actionBtn,
                { backgroundColor: cardBg, borderColor: brandAccent }
              ]}
            >
              {copied ? (
                <CheckIcon size={16} color="#10B981" strokeWidth={3} />
              ) : (
                <CopyIcon size={16} color={brandAccent} />
              )}
              <Text style={[styles.copyBtnText, { color: brandAccent }]}>
                {copied ? 'COPIED!' : 'COPY LINK'}
              </Text>
            </Pressable>

            <Pressable onPress={handleNativeShare} disabled={sharing} style={[styles.actionBtn, styles.shareBtn, { backgroundColor: brandAccent, opacity: sharing ? 0.7 : 1 }]}>
              <Share2Icon size={16} color={isDark ? '#09090b' : '#FFFFFF'} strokeWidth={2.5} />
              <Text style={[styles.shareBtnText, { color: isDark ? '#09090b' : '#FFFFFF' }]}>{sharing ? 'SHARING...' : 'SHARE CARD'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    borderWidth: 3,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 0,
    elevation: 8,
  },
  modalHeaderRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qrBadgeCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#09090b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
  },
  modalSubtitleText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
  },
  closeBtn: {
    padding: 4,
  },
  qrContainerFrame: {
    alignItems: 'center',
    marginVertical: 8,
  },
  qrCanvasBadge: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#09090b',
    shadowColor: '#000000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  pollIdBadgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#09090b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: '#3F3F46',
  },
  pollIdBadgeLabel: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
    color: '#A1A1AA',
  },
  pollIdBadgeValue: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    color: '#FFCC00',
  },
  whatsappDirectBtn: {
    width: '100%',
    height: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#09090b',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 4,
  },
  whatsappDirectBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  shareCardBanner: {
    width: '100%',
    padding: 16,
    borderRadius: 20,
    borderWidth: 2.5,
    alignItems: 'center',
    marginBottom: 12,
  },
  shareCardHeader: {
    width: '100%',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  shareCardBrandText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  shareCardSubText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '700',
  },
  pollTitleDisplay: {
    fontFamily: 'SpaceMono',
    fontSize: 13,
    fontWeight: '900',
    textAlign: 'center',
    marginVertical: 12,
  },
  shareUrlBox: {
    width: '100%',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 4,
  },
  shareUrlText: {
    fontFamily: 'SpaceMono',
    fontSize: 10,
    fontWeight: '700',
  },
  shareCodeText: {
    fontFamily: 'SpaceMono',
    fontSize: 9,
    fontWeight: '700',
  },
  actionButtonsRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 0,
    elevation: 3,
  },
  copyBtn: {
    backgroundColor: '#F4F4F5',
    borderColor: '#09090b',
  },
  copyBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
  },
  shareBtn: {
    borderColor: '#09090b',
  },
  shareBtnText: {
    fontFamily: 'SpaceMono',
    fontSize: 11,
    fontWeight: '900',
  },
});
