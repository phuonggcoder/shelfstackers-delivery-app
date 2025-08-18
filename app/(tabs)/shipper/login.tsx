import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { shipperApi } from '@/lib/shipperApi';
import { useAuth } from '@/lib/auth';

export default function ShipperLogin() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const auth = useAuth();

  async function onLogin() {
    // development shortcut: skip server login and enter app
    setLoading(true);
    try {
      const fakeToken = 'dev-token';
      const fakeUser = { name: 'Dev Shipper', phone };
      shipperApi.setToken(fakeToken);
      await auth.signIn({ token: fakeToken, user: fakeUser });
      router.replace('./orders');
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Shipper sign in</ThemedText>
      <TextInput
        placeholder="Phone"
        value={phone}
        onChangeText={setPhone}
        style={styles.input}
        keyboardType="phone-pad"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <TouchableOpacity style={styles.button} onPress={onLogin} disabled={loading}>
        <ThemedText style={{ color: 'white' }}>{loading ? 'Signing...' : 'Sign in'}</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12 },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8 },
  button: { backgroundColor: '#2E7D32', padding: 14, borderRadius: 10, alignItems: 'center' },
});
