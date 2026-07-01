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
import { useTheme } from '../contexts/ThemeContext';

interface BrutalCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'primary' | 'accent';
}

export const BrutalCard: React.FC<BrutalCardProps> = ({ children, style, variant = 'default' }) => {
  const { colors } = useTheme();

  const getShadowColor = () => {
    if (variant === 'primary') return colors.primary;
    if (variant === 'accent') return colors.accent;
    return colors.shadow;
  };

  return (
    <View 
      style={[
        styles.card, 
        { 
          backgroundColor: colors.card,
          borderColor: colors.border,
          shadowColor: getShadowColor()
        },
        style
      ]}
    >
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
  const { colors, mode } = useTheme();
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
          bg: colors.primary,
          text: colors.primaryForeground,
          shadow: colors.primary,
        };
      case 'accent':
        return {
          bg: colors.accent,
          text: colors.accentForeground,
          shadow: colors.accent,
        };
      case 'destructive':
        return {
          bg: colors.destructive,
          text: mode === 'dark' ? '#09090b' : '#ffffff',
          shadow: colors.destructive,
        };
      default:
        return {
          bg: mode === 'dark' ? '#18181b' : '#ffffff',
          text: colors.foreground,
          shadow: colors.shadow,
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

  const containerStyles: any[] = [
    styles.buttonContainer, 
    { 
      shadowColor: vColors.shadow 
    }
  ];
  const bodyStyles: any[] = [
    styles.buttonBody, 
    { 
      backgroundColor: vColors.bg,
      borderColor: colors.border,
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
  const { colors, mode } = useTheme();
  const containerStyles: any[] = [styles.inputWrapper];
  const inputStyles: any[] = [
    styles.input,
    {
      backgroundColor: mode === 'dark' ? '#18181b' : '#ffffff',
      borderColor: colors.border,
      color: colors.foreground,
    }
  ];

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
      {label && <Text style={[styles.inputLabel, { color: colors.foreground }]}>{label}</Text>}
      <TextInput
        style={inputStyles}
        placeholderTextColor={colors.mutedForeground}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 16,
    padding: 20,
    marginVertical: 10,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
  },
  buttonContainer: {
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    borderRadius: 12,
    marginVertical: 10,
  },
  buttonBody: {
    borderWidth: 2,
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
    fontFamily: 'SpaceMono',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 6,
    letterSpacing: 1.2,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontFamily: 'SpaceMono',
    fontSize: 16,
  },
});
