import { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert, Dimensions } from 'react-native';
import { Input, Button, Text, Icon } from 'react-native-elements';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../config/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [secureTextEntry, setSecureTextEntry] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Oops!', 'Please fill in all fields to continue');
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful:', userCredential.user.uid);
      
      if (userCredential.user) {
        // Create or update user document
        const userDoc = {
          email: userCredential.user.email,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          displayName: userCredential.user.displayName || email.split('@')[0],
        };
        
        await setDoc(doc(db, 'users', userCredential.user.uid), userDoc, { merge: true });
        console.log('User document updated in Firestore');
        router.replace('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      Alert.alert('Authentication Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <View style={styles.logoBackground}>
            <Icon
              name="chat-bubble-outline"
              type="material"
              color="#FFFFFF"
              size={60}
            />
          </View>
          <Text h2 style={styles.appTitle}>ChatApp</Text>
          <Text style={styles.tagline}>Connect with friends instantly</Text>
        </View>
        
        <View style={styles.formContainer}>
          <Text h3 style={styles.header}>Welcome Back</Text>
          
          <View style={styles.inputOuterWrapper}>
            <Input
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              leftIcon={
                <Icon name="email" type="material" size={22} color="#6200EE" />
              }
              inputContainerStyle={styles.inputContainer}
              containerStyle={styles.inputWrapper}
              placeholderTextColor="#888"
              inputStyle={styles.inputText}
            />
          </View>
          
          <View style={styles.inputOuterWrapper}>
            <Input
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secureTextEntry}
              leftIcon={
                <Icon name="lock" type="material" size={22} color="#6200EE" />
              }
              rightIcon={
                <TouchableOpacity onPress={toggleSecureEntry} style={styles.visibilityIcon}>
                  <Icon
                    name={secureTextEntry ? 'visibility-off' : 'visibility'}
                    type="material"
                    size={22}
                    color="#6200EE"
                  />
                </TouchableOpacity>
              }
              inputContainerStyle={styles.inputContainer}
              containerStyle={styles.inputWrapper}
              placeholderTextColor="#888"
              inputStyle={styles.inputText}
            />
          </View>
          
          <TouchableOpacity style={styles.forgotPassword}>
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>
          
          <Button 
            title="Login"
            onPress={handleLogin} 
            loading={loading}
            disabled={loading}
            buttonStyle={styles.loginButton}
            titleStyle={styles.buttonText}
            loadingProps={{ color: 'white' }}
            containerStyle={styles.buttonContainer}
          />
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/signup')}>
              <Text style={styles.signupLink}>Create Account</Text>
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
    marginBottom: 40,
  },
  logoBackground: {
    backgroundColor: '#6200EE',
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6200EE',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
    marginBottom: 20,
  },
  appTitle: {
    color: '#333333',
    fontWeight: 'bold',
    marginBottom: 8,
    fontSize: 30,
  },
  tagline: {
    color: '#666666',
    fontSize: 16,
  },
  formContainer: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  header: {
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
    fontSize: 26,
  },
  inputOuterWrapper: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderRadius: 12,
  },
  inputWrapper: {
    marginBottom: 0,
    paddingHorizontal: 0,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 58,
    backgroundColor: '#F9F9F9',
  },
  inputText: {
    fontSize: 16,
    color: '#333333',
  },
  visibilityIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
    marginTop: 5,
  },
  forgotPasswordText: {
    color: '#6200EE',
    fontSize: 14,
    fontWeight: '500',
  },
  buttonContainer: {
    marginBottom: 25,
    width: width - 80,
    alignSelf: 'center',
    borderRadius: 15,
    overflow: 'hidden',
  },
  loginButton: {
    backgroundColor: '#6200EE',
    paddingVertical: 15,
    borderRadius: 15,
    elevation: 5,
    shadowColor: '#6200EE',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  buttonText: {
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signupText: {
    color: '#757575',
    fontSize: 15,
  },
  signupLink: {
    color: '#6200EE',
    fontWeight: 'bold',
    fontSize: 15,
  },
});