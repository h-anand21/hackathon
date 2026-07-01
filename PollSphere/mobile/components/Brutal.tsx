import React, { useRef } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  Pressable, 
  StyleSheet, 
  Animated, 
  ViewStyle, 
  TextStyle, 
  TextInputProps,
  PressableProps
} from 'react-native';
import { Colors, BrutalStyles } from '../constants/Theme';

interface BrutalCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'primary' | 'accent';
}

export const BrutalCard: React.FC<BrutalCardProps> = ({ children, style, variant = 'default' }) => {
  let shadowStyle = BrutalStyles.shadow;
  if (variant === 'primary') shadowStyle = BrutalStyles.shadowPrimary;
  if (variant === 'accent') shadowStyle = BrutalStyles.shadowAccent;

  return (
    <View style={[styles.card, shadowStyle, style]}>
      {children}
    </View>
  );
};

interface BrutalButtonProps extends PressableProps {
  title: string;
  onPress?: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  variant?: 'default' | 'primary' | 'accent' | 'destructive';
  disabled?: boolean;
}

export const BrutalButton: React.FC<BrutalButtonProps> = ({ 
  title, 
  onPress, 
  style, 
  textStyle,
  variant = 'default', 
  disabled,
  ...props 
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(animatedValue, {
      toValue: 0,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: Colors.primary,
          text: Colors.primaryForeground,
          shadow: Colors.primary,
        };
      case 'accent':
        return {
          bg: Colors.accent,
          text: Colors.accentForeground,
          shadow: Colors.accent,
        };
      case 'destructive':
        return {
          bg: Colors.destructive,
          text: '#09090b',
          shadow: Colors.destructive,
        };
      default:
        return {
          bg: '#18181b',
          text: '#ffffff',
          shadow: '#ffffff',
        };
    }
  };

  const vColors = getVariantStyles();

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 4],
  });

  const containerStyles: any[] = [styles.buttonContainer, { shadowColor: vColors.shadow }];
  const bodyStyles: any[] = [
    styles.buttonBody, 
    { 
      backgroundColor: vColors.bg,
      transform: [{ translateY }, { translateX }]
    }
  ];

  if (style) {
    const flatStyle = StyleSheet.flatten(style);
    const layoutKeys = [
      'flex', 'margin', 'marginVertical', 'marginHorizontal', 
      'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 
      'position', 'top', 'bottom', 'left', 'right', 'alignSelf'
    ];
    
    const containerLayout: any = {};
    const bodyStyleFiltered: any = {};

    Object.keys(flatStyle).forEach((key) => {
      if (layoutKeys.includes(key)) {
        containerLayout[key] = (flatStyle as any)[key];
      } else {
        bodyStyleFiltered[key] = (flatStyle as any)[key];
      }
    });

    containerStyles.push(containerLayout);
    bodyStyles.push(bodyStyleFiltered);
  }

  if (disabled) {
    bodyStyles.push(styles.disabled);
  }

  return (
    <Pressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      style={containerStyles}
      {...props}
    >
      <Animated.View style={bodyStyles}>
        <Text style={[styles.buttonText, { color: vColors.text }, textStyle]} numberOfLines={1}>
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

interface BrutalInputProps extends TextInputProps {
  label?: string;
  style?: any;
}

export const BrutalInput: React.FC<BrutalInputProps> = ({ label, style, ...props }) => {
  const containerStyles: any[] = [styles.inputWrapper];
  const inputStyles: any[] = [styles.input];

  if (style) {
    const flatStyle = StyleSheet.flatten(style);
    const layoutKeys = [
      'flex', 'margin', 'marginVertical', 'marginHorizontal', 
      'marginTop', 'marginBottom', 'marginLeft', 'marginRight', 
      'width', 'height', 'alignSelf', 'position', 'top', 'bottom', 'left', 'right'
    ];
    
    const containerLayout: any = {};
    const inputStyleFiltered: any = {};

    Object.keys(flatStyle).forEach((key) => {
      if (layoutKeys.includes(key)) {
        containerLayout[key] = (flatStyle as any)[key];
      } else {
        inputStyleFiltered[key] = (flatStyle as any)[key];
      }
    });

    containerStyles.push(containerLayout);
    inputStyles.push(inputStyleFiltered);
  }

  return (
    <View style={containerStyles}>
      {label && <Text style={styles.inputLabel}>{label}</Text>}
      <TextInput
        style={inputStyles}
        placeholderTextColor="#71717a"
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#09090b',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
  },
  buttonContainer: {
    shadowColor: '#ffffff',
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    borderRadius: 12,
    marginVertical: 10,
  },
  buttonBody: {
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
  },
  buttonText: {
    fontFamily: 'SpaceMono',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  disabled: {
    opacity: 0.5,
  },
  inputWrapper: {
    marginVertical: 10,
    width: '100%',
  },
  inputLabel: {
    color: '#ffffff',
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  input: {
    backgroundColor: '#18181b',
    borderWidth: 2,
    borderColor: '#ffffff',
    borderRadius: 12,
    color: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: 'SpaceMono',
    fontSize: 16,
  },
});
