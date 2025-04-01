import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Input, Button, Text, Icon } from 'react-native-elements';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { router } from 'expo-router';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const handleSignup = async () => {
    if (!email || !password || !username) {
      setError('Please fill in all fields');
      return;
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created with ID:', userCredential.user.uid);
      
      // Explicitly create users collection and document
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userData = {
        email: userCredential.user.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        displayName: username,
        username: username.toLowerCase() // for searching
      };

      await setDoc(userDocRef, userData);
      console.log('User document created in users collection:', userData);
      
      router.replace('/');
    } catch (err) {
      console.error('Signup error:', err);
      setError(
        (err as { code?: string }).code === 'auth/email-already-in-use'
          ? 'Email already in use'
          : 'An error occurred during signup'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Icon
            name="chat-bubble-outline"
            type="material"
            color="#6200EE"
            size={60}
            containerStyle={styles.iconContainer}
          />
          <Text h2 style={styles.appTitle}>ChatApp</Text>
          <Text style={styles.tagline}>Join our community</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text h3 style={styles.header}>Create Account</Text>
          
          <Input
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            leftIcon={
              <Icon name="person" type="material" size={24} color="#6200EE" />
            }
            inputContainerStyle={styles.inputContainer}
            containerStyle={styles.inputWrapper}
            placeholderTextColor="#888"
          />
          
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            leftIcon={
              <Icon name="email" type="material" size={24} color="#6200EE" />
            }
            inputContainerStyle={styles.inputContainer}
            containerStyle={styles.inputWrapper}
            placeholderTextColor="#888"
          />
          
          <Input
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secureTextEntry}
            leftIcon={
              <Icon name="lock" type="material" size={24} color="#6200EE" />
            }
            rightIcon={
              <TouchableOpacity onPress={toggleSecureEntry}>
                <Icon
                  name={secureTextEntry ? 'visibility-off' : 'visibility'}
                  type="material"
                  size={24}
                  color="#6200EE"
                />
              </TouchableOpacity>
            }
            inputContainerStyle={styles.inputContainer}
            containerStyle={styles.inputWrapper}
            placeholderTextColor="#888"
          />
          
          {error ? (
            <Text style={styles.error}>
              <Icon name="error" type="material" size={16} color="#FF3B30" /> {error}
            </Text>
          ) : null}
          
          <Button 
            title="SIGN UP"
            onPress={handleSignup}
            loading={loading}
            disabled={loading}
            buttonStyle={styles.signupButton}
            titleStyle={styles.buttonText}
            loadingProps={{ color: 'white' }}
            containerStyle={styles.buttonContainer}
          />
          
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  iconContainer: {
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    borderRadius: 50,
    width: 100,
    height: 100,
    justifyContent: 'center',
    marginBottom: 15,
  },
  appTitle: {
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  tagline: {
    color: '#666666',
    fontSize: 16,
  },
  formContainer: {
    borderRadius: 15,
    padding: 20,
  },
  header: {
    marginBottom: 25,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  inputWrapper: {
    marginBottom: 15,
    paddingHorizontal: 0,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 55,
    backgroundColor: '#F5F5F5',
  },
  error: {
    color: '#FF3B30',
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 14,
    alignItems: 'center',
    flexDirection: 'row',
  },
  buttonContainer: {
    marginBottom: 20,
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
  },
  signupButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 3,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginText: {
    color: '#757575',
    fontSize: 14,
  },
  loginLink: {
    color: '#6200EE',
    fontWeight: 'bold',
    fontSize: 14,
  },
});