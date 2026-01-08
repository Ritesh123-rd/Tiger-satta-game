import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddFundScreen({ navigation }) {
  const [amount, setAmount] = useState('');

  // Mock user data
  const userData = {
    name: 'tom',
    phone: '9552115645',
    balance: '0.0',
  };

  const quickAmounts = [500, 1000, 1500, 2000];

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleCall = () => {
    Linking.openURL('tel:+919999999999');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919999999999');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add  Fund</Text>

        <View style={styles.coinsBadge}>
          <MaterialCommunityIcons name="cash-multiple" size={16} color="#fff" />
          <Text style={styles.coinsText}>0.0</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* User Info Card */}
          <View style={styles.userCard}>
            {/* Pink Top Section */}
            <View style={styles.userCardTop}>
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userPhone}>{userData.phone}</Text>
            </View>

            {/* Yellow Bottom Section */}
            <View style={styles.userCardBottom}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>₹ {userData.balance}</Text>
            </View>
          </View>

          {/* Divider with Query Text */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
          </View>
          <Text style={styles.queryText}>For Fund Query's please Call Or Whatsapp</Text>

          {/* Call & WhatsApp Buttons */}
          <View style={styles.contactButtonsRow}>
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <Ionicons name="call" size={18} color="#000" />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
              <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
              <Text style={styles.contactButtonText}>Whatsapp</Text>
            </TouchableOpacity>
          </View>

          {/* Amount Input Field */}
          <View style={styles.inputContainer}>
            <View style={styles.inputIconCircle}>
              <MaterialCommunityIcons name="bank" size={22} color="#fff" />
            </View>
            <TextInput
              style={styles.amountInput}
              placeholder="Enter Amount"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          {/* Quick Amount Buttons */}
          <View style={styles.quickAmountContainer}>
            <View style={styles.quickAmountRow}>
              {quickAmounts.slice(0, 2).map((value) => (
                <TouchableOpacity
                  key={value}
                  style={styles.quickAmountButton}
                  onPress={() => handleQuickAmount(value)}
                >
                  <Text style={styles.quickAmountText}>{value}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.quickAmountRow}>
              {quickAmounts.slice(2, 4).map((value) => (
                <TouchableOpacity
                  key={value}
                  style={styles.quickAmountButton}
                  onPress={() => handleQuickAmount(value)}
                >
                  <Text style={styles.quickAmountText}>{value}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Pay Now Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.payButton}>
            <Text style={styles.payButtonText}>Pay Now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EDE0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: 45,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'RaleighStdDemi',
    color: '#000',
    fontWeight: 'bold',
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B8860B',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
  },
  coinsText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  userCardTop: {
    backgroundColor: '#C27183',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    color: '#fff',
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 26,
    color: '#fff',
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  userCardBottom: {
    backgroundColor: '#F5C34B',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 28,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
  },
  dividerContainer: {
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#D0C4B0',
  },
  queryText: {
    fontSize: 15,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  contactButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 25,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E0D5C5',
    gap: 8,
  },
  contactButtonText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 2,
    borderColor: '#C27183',
    marginBottom: 20,
  },
  inputIconCircle: {
    width: 45,
    height: 45,
    borderRadius: 25,
    backgroundColor: '#C27183',
    justifyContent: 'center',
    alignItems: 'center',
  },
  amountInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    paddingHorizontal: 15,
  },
  quickAmountContainer: {
    marginBottom: 20,
  },
  quickAmountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quickAmountButton: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#F5EDE0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#D0C4B0',
  },
  quickAmountText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
    paddingTop: 10,
  },
  payButton: {
    backgroundColor: '#C27183',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
  },
});
