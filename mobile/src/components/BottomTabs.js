import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../theme/tokens';

export default function BottomTabs({ tab, setTab }) {
  return (
    <View style={styles.wrap}>
      <Pressable style={[styles.tab, tab === 'control' && styles.tabActive]} onPress={() => setTab('control')}>
        <Text style={styles.tabText}>Control</Text>
      </Pressable>
      <Pressable style={[styles.tab, tab === 'settings' && styles.tabActive]} onPress={() => setTab('settings')}>
        <Text style={styles.tabText}>Settings</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: '#0c0e13',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  tab: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1f2a',
  },
  tabActive: {
    backgroundColor: colors.accent,
  },
  tabText: {
    color: '#fff',
    fontWeight: '700',
  },
});
