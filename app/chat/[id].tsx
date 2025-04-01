import { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, FlatList, Dimensions, SafeAreaView } from 'react-native';
import { Text, Button, Input, Icon } from 'react-native-elements';
import { useLocalSearchParams, router } from 'expo-router';
import { auth, db } from '../../config/firebase';
import { collection, addDoc, query, orderBy, onSnapshot, setDoc, doc } from 'firebase/firestore';

const { width } = Dimensions.get('window');

interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: any;
}

export default function ChatScreen() {
  const { id, email } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!id || !auth.currentUser) return;

    const chatId = [auth.currentUser.uid, id].sort().join('_');
    
    // Mark chat as read immediately
    const markAsRead = async () => {
      try {
        await setDoc(doc(db, 'chats', chatId), {
          lastRead: {
            [auth.currentUser?.uid || 'unknown']: new Date()
          },
          unreadCount: 0
        }, { merge: true });

        // Update the chat document to trigger the listener in index.tsx
        await setDoc(doc(db, 'chats', chatId), {
          lastUpdated: new Date()
        }, { merge: true });
      } catch (error) {
        console.error('Error marking chat as read:', error);
      }
    };

    markAsRead();

    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messageList: Message[] = [];
      snapshot.forEach((doc) => {
        messageList.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(messageList);
    });

    return unsubscribe;
  }, [id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !auth.currentUser) return;

    setLoading(true);
    const chatId = [auth.currentUser.uid, id].sort().join('_');
    
    try {
      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: newMessage,
        senderId: auth.currentUser.uid,
        timestamp: new Date(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" type="material" size={24} color="#6200EE" />
        </TouchableOpacity>
        <Text h4 style={styles.headerText}>{email}</Text>
      </View>
      
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesContainer}
        renderItem={({ item }) => {
          const isSender = item.senderId === auth.currentUser?.uid;
          return (
            <View style={[
              styles.messageWrapper,
              isSender ? styles.sentMessageWrapper : styles.receivedMessageWrapper
            ]}>
              <View style={[
                styles.messageBubble,
                isSender ? styles.sentMessageBubble : styles.receivedMessageBubble
              ]}>
                <Text style={[
                  styles.messageText,
                  isSender ? styles.sentMessageText : styles.receivedMessageText
                ]}>
                  {item.text}
                </Text>
                <Text style={[
                  styles.timestampText,
                  isSender ? styles.sentTimestampText : styles.receivedTimestampText
                ]}>
                  {formatTime(item.timestamp)}
                </Text>
              </View>
            </View>
          );
        }}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChangeText={setNewMessage}
              inputContainerStyle={styles.inputField}
              containerStyle={styles.inputInnerWrapper}
              placeholderTextColor="#888"
              inputStyle={styles.inputText}
              multiline
              leftIcon={
                <Icon name="emoji-emotions" type="material" size={22} color="#6200EE" />
              }
            />
          </View>
          
          <TouchableOpacity 
            style={styles.sendButton} 
            onPress={sendMessage}
            disabled={!newMessage.trim() || loading}
          >
            <Icon
              name="send"
              type="material"
              color="#FFFFFF"
              size={22}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  messagesContainer: {
    padding: 15,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginVertical: 5,
    maxWidth: '80%',
  },
  sentMessageWrapper: {
    alignSelf: 'flex-end',
  },
  receivedMessageWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sentMessageBubble: {
    backgroundColor: '#6200EE',
    borderTopRightRadius: 4,
  },
  receivedMessageBubble: {
    backgroundColor: '#F5F5F5',
    borderTopLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
  },
  sentMessageText: {
    color: '#FFFFFF',
  },
  receivedMessageText: {
    color: '#333333',
  },
  timestampText: {
    fontSize: 10,
    alignSelf: 'flex-end',
  },
  sentTimestampText: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  receivedTimestampText: {
    color: '#888888',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  inputWrapper: {
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderRadius: 25,
  },
  inputInnerWrapper: {
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  inputField: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 25,
    paddingHorizontal: 12,
    backgroundColor: '#F9F9F9',
    minHeight: 48,
    maxHeight: 120,
  },
  inputText: {
    fontSize: 16,
    color: '#333333',
  },
  sendButton: {
    backgroundColor: '#6200EE',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    shadowColor: '#6200EE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});