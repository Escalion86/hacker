import React from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export default function Toggle({ label, value, onToggle }) {
  const progress = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(progress, {
      toValue: value ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [value, progress]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 23],
  });

  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ['#5b6473', colors.accent],
  });

  return (
    <Pressable style={styles.row} onPress={onToggle}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.switch, { backgroundColor: trackColor }]}>
        <Animated.View style={[styles.knob, { transform: [{ translateX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    color: colors.text,
    fontSize: 15,
    flex: 1,
    paddingRight: spacing.md,
  },
  switch: {
    width: 54,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  knob: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#fff',
  },
});
