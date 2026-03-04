import React, { useEffect, useMemo, useState } from 'react'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { colors, spacing } from '../theme/tokens'

export default function AccessCodeGateScreen({ onSubmit, loading, serverError = '' }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')

  const disabled = useMemo(
    () => loading || value.trim().length === 0,
    [loading, value],
  )

  useEffect(() => {
    if (serverError) setError(serverError)
  }, [serverError])

  const handleSubmit = async () => {
    const normalized = value.trim()
    if (!normalized) return
    const ok = await Promise.resolve(onSubmit(normalized))
    if (!ok) {
      if (!serverError) setError('Неверный код')
      return
    }
    setError('')
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Введите код доступа</Text>
        <TextInput
          value={value}
          onChangeText={(next) => {
            setValue(next)
            if (error) setError('')
          }}
          placeholderTextColor="#7f8697"
          style={styles.input}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
          onSubmitEditing={handleSubmit}
        />
        <Pressable
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={disabled}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Проверка...' : 'Войти'}
          </Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000',
    padding: spacing.md,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#131722',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#25304a',
    padding: spacing.md,
    gap: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2e3955',
    backgroundColor: '#0b1120',
    color: '#fff',
    paddingHorizontal: 12,
    fontSize: 16,
  },
  button: {
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#3f84ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  error: {
    color: '#ff6d7b',
    fontSize: 13,
    fontWeight: '700',
  },
})
