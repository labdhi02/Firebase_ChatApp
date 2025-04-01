import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Alert, FlatList, TouchableOpacity, SafeAreaView, StatusBar, ActivityIndicator } from 'react-native';
import { Icon, Avatar } from 'react-native-elements';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where, onSnapshot, orderBy, limit, setDoc, doc } from 'firebase/firestore';
import { router } from 'expo-router';
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

interface User {
  id: string;
  email: string | null;
  displayName?: string;
  username?: string;
  lastMessage?: {
    text?: string;
    timestamp?: any;
    unread: boolean;
  };
}

export default function ChatsList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace('/login');
      return;
    }
    fetchUsers();
    const unsubscribe = subscribeToNewMessages();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const fetchUsers = async () => {
    setRefreshing(true);
    try {
      if (!auth.currentUser) {
        console.log('No authenticated user');
        return;
      }

      console.log('Current user:', auth.currentUser.email);
      const querySnapshot = await getDocs(collection(db, 'users'));
      
      const usersList: User[] = [];
      querySnapshot.forEach(doc => {
        const userData = doc.data() as Omit<User, 'id'>;
        if (userData.email && userData.email !== auth.currentUser?.email) {
          usersList.push({
            id: doc.id,
            ...userData
          });
        }
      });

      console.log('Users found:', usersList);
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const subscribeToNewMessages = () => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(collection(db, 'chats'), (snapshot) => {
      snapshot.docChanges().forEach(async change => {
        const chatId = change.doc.id;
        if (auth.currentUser && chatId.includes(auth.currentUser.uid)) {
          const otherUserId = chatId.replace(auth.currentUser.uid, '').replace('_', '');
          
          const messagesRef = collection(db, 'chats', chatId, 'messages');
          const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
          const messageSnap = await getDocs(q);
          
          if (!messageSnap.empty) {
            const lastMessage = messageSnap.docs[0].data();
            setUsers(prevUsers =>
              prevUsers.map(user => {
                if (user.id === otherUserId) {
                  return {
                    ...user,
                    lastMessage: {
                      text: lastMessage.text,
                      timestamp: lastMessage.timestamp,
                      unread: auth.currentUser ? lastMessage.senderId !== auth.currentUser.uid : false
                    }
                  };
                }
                return user;
              })
            );
          }
        }
      });
    });

    return unsubscribe;
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (error) {
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  const handleChatOpen = async (userId: string, email: string) => {
    if (!auth.currentUser) return;

    const chatId = [auth.currentUser.uid, userId].sort().join('_');

    // Clear unread status in Firestore
    await setDoc(doc(db, 'chats', chatId), {
      lastRead: {
        [auth.currentUser.uid]: new Date()
      },
      unreadCount: 0
    }, { merge: true });

    // Update local state
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId 
          ? { ...user, lastMessage: { ...user.lastMessage, unread: false } }
          : user
      )
    );
    
    router.push(`/chat/${userId}?email=${email}`);
  };

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };

  const getRandomColor = (name: string) => {
    const colors = ['#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688'];
    const charCode = name.charCodeAt(0);
    return colors[charCode % colors.length];
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#6200EE" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ChatApp</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Icon name="logout" type="material" size={22} color="#6200EE" />
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>All Conversations</Text>

      {users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="chat-bubble-outline" type="material" size={70} color="#E0E0E0" />
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>Start chatting with other users</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          refreshing={refreshing}
          onRefresh={fetchUsers}
          contentContainerStyle={styles.listContentContainer}
          renderItem={({ item }) => {
            const displayName = item.username || item.displayName || item.email?.split('@')[0] || 'User';
            
            return (
              <TouchableOpacity 
                style={styles.userItem}
                onPress={() => item.email && handleChatOpen(item.id, item.email)}
                activeOpacity={0.7}
              >
                <Avatar
                  rounded
                  size={50}
                  title={getInitials(displayName)}
                  containerStyle={[styles.avatar, { backgroundColor: getRandomColor(displayName) }]}
                />
                
                <View style={styles.userInfo}>
                  <View style={styles.nameTimeRow}>
                    <Text style={styles.userName}>{displayName}</Text>
                    {item.lastMessage?.timestamp && (
                      <Text style={styles.timeText}>
                        {formatTime(item.lastMessage.timestamp)}
                      </Text>
                    )}
                  </View>
                  
                  <View style={styles.messageRow}>
                    {item.lastMessage ? (
                      <Text 
                        style={[
                          styles.lastMessage,
                          item.lastMessage.unread && styles.unreadMessage
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {item.lastMessage.text}
                      </Text>
                    ) : (
                      <Text style={styles.noMessage}>Start a conversation</Text>
                    )}
                    
                    {item.lastMessage?.unread && (
                      <View style={styles.unreadIndicator} />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity 
        style={styles.floatingButton} 
        onPress={fetchUsers}
      >
        <Icon
          name="refresh"
          type="material"
          color="#FFFFFF"
          size={26}
        />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
  },
  logoutBtn: {
    padding: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  nameTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
  },
  timeText: {
    fontSize: 12,
    color: '#888888',
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    color: '#666666',
    fontSize: 14,
    flex: 1,
  },
  unreadMessage: {
    color: '#333333',
    fontWeight: '600',
  },
  noMessage: {
    color: '#888888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#6200EE',
    marginLeft: 8,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#6200EE',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6200EE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
  },
});