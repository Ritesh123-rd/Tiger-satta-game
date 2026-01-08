import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import logo from '../assets/logo/logo.png';

export default function RegisterScreen({ navigation }) {
  const [phone, setPhone] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = () => {
    if (phone && username && password && confirmPassword) {
      if (password === confirmPassword) {
        navigation.replace('Home');
      } else {
        alert('Passwords do not match');
      }
    } else {
      alert('Please fill all fields');
    }
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
        <Text style={styles.title}>CREATE NEW ACCOUNT</Text>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="phone-portrait" size={24} color="#ca1835" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Phone"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            maxLength={10}
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        {/* Username Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="person" size={24} color="#ca1835" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
          />
        </View>

        {/* Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="lock-closed" size={24} color="#ca1835" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>

        {/* Confirm Password Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIcon}>
            <Ionicons name="lock-closed" size={24} color="#ca1835" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        {/* Register Button */}
        <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
          <Text style={styles.registerButtonText}>Register & Login</Text>
        </TouchableOpacity>

        {/* Back to Login */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5C542',
  },
  content: {
    flex: 1,
    backgroundColor: '#F5EDE0',
    marginTop: 100,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  iconCircle: {
    width: 100,
    height: 100,
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
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 25,
    textAlign: 'center',
    fontFamily: 'RaleighStdDemi',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    marginBottom: 15,
    paddingLeft: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    paddingRight: 15,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
  },
  registerButton: {
    width: '90%',
    backgroundColor: '#ca1835',
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi',
  },
  backText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
    fontFamily: 'RaleighStdDemi',
  },
});
