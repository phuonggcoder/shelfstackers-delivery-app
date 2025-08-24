import { useAuth } from '@/lib/auth';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
const { useState } = React;

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const router = useRouter();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert(t('common.error'), t('auth.pleaseFillAllFields'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert(t('common.error'), t('auth.passwordsDoNotMatch'));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('https://server-shelf-stacker-w1ds.onrender.com/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: oldPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (res.ok && (data.success || data.message === 'Password changed successfully')) {
        Alert.alert(t('common.success'), t('messages.passwordChanged'));
        router.back();
      } else {
        Alert.alert(t('common.error'), data.message || t('auth.changePasswordFailed'));
      }
    } catch (err) {
      Alert.alert(t('common.error'), t('errors.networkError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('auth.changePassword')}</Text>
      <TextInput
        style={styles.input}
        placeholder={t('auth.oldPassword')}
        secureTextEntry
        value={oldPassword}
        onChangeText={setOldPassword}
      />
      <TextInput
        style={styles.input}
        placeholder={t('auth.newPassword')}
        secureTextEntry
        value={newPassword}
        onChangeText={setNewPassword}
      />
      <TextInput
        style={styles.input}
        placeholder={t('auth.confirmNewPassword')}
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleChangePassword} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? t('auth.changingPassword') : t('auth.changePassword')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
