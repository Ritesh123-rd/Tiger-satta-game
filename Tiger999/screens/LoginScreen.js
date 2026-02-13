import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../components/CustomAlert';


import logo from '../assets/logo/logo.png';
import { loginUser } from '../api/auth';

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState(''); // Added password state

  const [isLoading, setIsLoading] = useState(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });


  const handleLogin = async () => {
    if (phoneNumber.length === 10 && password.length > 0) {
      setIsLoading(true);
      try {
        // Try API Login first
        const response = await loginUser(phoneNumber, password);
        console.log('Login API Response:', response);

        if (response && (response.status === true || response.status === 'true')) {
          setAlertConfig({
            visible: true,
            title: 'Login Successful',
            message: 'Welcome back!',
            type: 'success'
          });


          // Save user info from response
          await AsyncStorage.setItem('userMobile', phoneNumber);
          await AsyncStorage.setItem('userPassword', password);
          if (response.username) await AsyncStorage.setItem('userName', response.username);
          if (response.user_id) await AsyncStorage.setItem('userId', String(response.user_id));
          if (response.created_at) {
            const date = new Date(response.created_at);
            await AsyncStorage.setItem('userDate', date.toLocaleDateString('en-GB'));
          }

          navigation.replace('Home');
        } else {
          // Fallback to Local Auth if API fails but user is registered locally
          const storedMobile = await AsyncStorage.getItem('userMobile');
          const storedPassword = await AsyncStorage.getItem('userPassword');

          if (storedMobile === phoneNumber && storedPassword === password) {
            setAlertConfig({
              visible: true,
              title: 'Login Successful',
              message: 'Logged in using local credentials.',
              type: 'success'
            });
            navigation.replace('Home');
          } else {
            setAlertConfig({
              visible: true,
              title: 'Login Failed',
              message: response.message || 'Invalid Mobile or Password',
              type: 'error'
            });
          }

        }
      } catch (error) {
        console.error('Login Error:', error);
        // Fallback to Local Auth on network error
        const storedMobile = await AsyncStorage.getItem('userMobile');
        const storedPassword = await AsyncStorage.getItem('userPassword');
        if (storedMobile === phoneNumber && storedPassword === password) {
          setAlertConfig({
            visible: true,
            title: 'Login Successful',
            message: 'Logged in offline.',
            type: 'success'
          });
          navigation.replace('Home');
        } else {
          setAlertConfig({
            visible: true,
            title: 'Error',
            message: 'Login Error: ' + error.message,
            type: 'error'
          });
        }

      } finally {
        setIsLoading(false);
      }
    } else {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Please enter a valid 10-digit phone number and password',
        type: 'error'
      });
    }

  };

  const makeCall = () => {
    Linking.openURL('tel:8149182874');
  };

  const openWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=8149182874');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5C542" />

      <View style={styles.content}>
        {/* Icon/Logo Area */}
        <View style={styles.iconContainer}>
          <Image
            source={logo}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>ENTER YOUR MOBILE NUMBER</Text>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <View style={styles.phoneIcon}>
            <Ionicons name="phone-portrait" size={28} color="#fff" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={10}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.phoneIcon}>
            <Ionicons name="lock-closed" size={28} color="#fff" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Login Button */}
        <TouchableOpacity
          style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          <Text style={styles.loginButtonText}>
            {isLoading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>

        {/* Contact Buttons */}
        <View style={styles.contactContainer}>
          <TouchableOpacity style={styles.contactButton} onPress={makeCall}>
            <Ionicons name="call" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.contactButton} onPress={openWhatsApp}>
            <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
          </TouchableOpacity>
        </View>

        {/* Sign Up Link */}
        <View style={styles.signupContainer}>
          <Text style={styles.signupText}>Don't have account  </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.signupLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          // If login was successful, we might want to navigate after alert closes
          if (alertConfig.title === 'Login Successful') {
            navigation.replace('Home');
          }
        }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5C542',
  },

  logo: {
    width: 120,
    height: 120,
  },

  content: {
    flex: 1,
    backgroundColor: '#F5EDE0',
    marginTop: 100,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 60,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 40,
  },
  iconCircle: {
    width: 120,
    height: 120,
    backgroundColor: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 3,
    borderColor: '#E5B83E',
  },
  checkCircle: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5C542',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: 'RaleighStdDemi',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 15,
    width: '100%',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  phoneIcon: {
    width: 60,
    height: 60,
    backgroundColor: '#C36578',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 18,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
  },
  loginButton: {
    width: '80%',
    backgroundColor: '#C36578',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi',
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 40,
  },
  contactButton: {
    width: 60,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  signupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signupText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
  },
  signupLink: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi',
  },
});
