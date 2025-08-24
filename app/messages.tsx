import { useRouter } from 'expo-router';
import * as React from 'react';
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function MessagesScreen() {
  const router = useRouter();
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<any[]>([
    { id: 'm1', text: 'Chào bạn, mình đến lấy hàng nhé', sender: 'them', avatar: 'https://i.pravatar.cc/60?img=5' },
    { id: 'm2', text: 'Ok anh, mặt trước nhà có biển số', sender: 'me', avatar: 'https://i.pravatar.cc/60?img=12' },
  ]);

  // FlatList inverted: newest message is at top of data array, so we unshift on send
  const flatRef = React.useRef<FlatList>(null);

  function sendMessage() {
    if (!input.trim()) return;
    const newMsg = { id: String(Date.now()), text: input.trim(), sender: 'me', avatar: 'https://i.pravatar.cc/60?img=12' };
    setMessages((prev) => [newMsg, ...prev]);
    setInput('');
    // small delay then scroll to top (since inverted)
    setTimeout(() => flatRef.current?.scrollToOffset({ offset: 0, animated: true }), 50);
  }

  return (
    <SafeAreaView style={styles.screen}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backChevron}>{'<'}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lộc</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Messages list (inverted) */}
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(i) => i.id}
          inverted
          contentContainerStyle={styles.messagesList}
          renderItem={({ item }) => (
            <View style={[styles.messageRow, item.sender === 'me' ? styles.rowRight : styles.rowLeft]}>
              {item.sender === 'them' && <Image source={{ uri: item.avatar }} style={styles.avatar} />}
              <View style={[styles.bubble, item.sender === 'me' ? styles.bubbleRight : styles.bubbleLeft]}>
                <Text style={[styles.bubbleText, item.sender === 'me' ? styles.bubbleTextRight : styles.bubbleTextLeft]}>{item.text}</Text>
              </View>
              {item.sender === 'me' && <Image source={{ uri: item.avatar }} style={styles.avatar} />}
            </View>
          )}
        />

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Nhập tin nhắn"
            placeholderTextColor="#999"
            value={input}
            onChangeText={setInput}
            style={styles.input}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendBtn} activeOpacity={0.8}>
            <Text style={styles.sendIcon}>✈︎</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  header: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: 1, borderColor: '#eee' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backChevron: { fontSize: 20, color: '#222' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  messagesList: { padding: 16, paddingBottom: Platform.OS === 'android' ? 120 : 100 },
  messageRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 12 },
  rowLeft: { justifyContent: 'flex-start' },
  rowRight: { justifyContent: 'flex-end' },
  avatar: { width: 36, height: 36, borderRadius: 18, marginHorizontal: 8 },
  bubble: { maxWidth: '72%', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  bubbleLeft: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee' },
  bubbleRight: { backgroundColor: '#2E86DE' },
  bubbleText: { fontSize: 14 },
  bubbleTextLeft: { color: '#333' },
  bubbleTextRight: { color: '#fff' },
  inputRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderTopWidth: 1, borderColor: '#eee', backgroundColor: '#fff' },
  input: { flex: 1, height: 44, backgroundColor: '#F6F6F6', borderRadius: 10, paddingHorizontal: 12, fontSize: 14, color: '#222' },
  sendBtn: { marginLeft: 8, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: 'transparent' },
  sendIcon: { color: '#2E86DE', fontSize: 20 },
});

