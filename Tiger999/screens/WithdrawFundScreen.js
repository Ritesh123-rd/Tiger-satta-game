import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Modal, ScrollView } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function WithdrawFundScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(true);

  // Demo user data - replace with actual user data
  const userName = 'tom';
  const userPhone = '9552115645';
  const availableBalance = 0.0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal  Fund</Text>
        <View style={styles.coinsBadge}>
          <MaterialCommunityIcons name="cash-multiple" size={16} color="#fff" />
          <Text style={styles.coinsText}>0.0</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.userInfoSection}>
            <Text style={styles.userName}>{userName}</Text>
            <Text style={styles.userPhone}>{userPhone}</Text>
          </View>
          <View style={styles.balanceSection}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Text style={styles.balanceAmount}>₹ {availableBalance.toFixed(1)}</Text>
          </View>
        </View>

        {/* Amount Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputIconContainer}>
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
      </View>

      {/* Send Request Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.sendButton}>
          <Text style={styles.sendButtonText}>Send Request</Text>
        </TouchableOpacity>
      </View>

      {/* Terms & Conditions Modal */}
      <Modal
        visible={showTermsModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Terms & Conditions</Text>
            </View>

            {/* Modal Content */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <Text style={styles.termText}>
                You cannot withdraw deposited money, you can only withdraw winning money.
              </Text>

              <Text style={styles.termText}>
                Minimum Withdraw is 1000/- Rs. Maximum Withdraw unlimited Per Day..
              </Text>

              <Text style={styles.termText}>
                ?Above 50 Lakh You Should Request Us Manually.
              </Text>

              <Text style={styles.termText}>
                ?Process Time Minimum 2 Hour Maximum 72 Hours. Depending On Bank Server.
              </Text>

              <Text style={styles.termText}>
                ?Withdraw Request 24 hrs
              </Text>

              <Text style={styles.termText}>
                ?Withdraw Is Available On All Days Of Week.
              </Text>

              <Text style={styles.termText}>
                ?Please Confirm That Bank Details You Have Entered Are Correct, If You Entered Wrong Bank Details Is Not Our Responsibility. After submitting the withdraw request, if there is no valid balance in your wallet, then the request will be automatically declined.
              </Text>
            </ScrollView>

            {/* Accept Button */}
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.acceptButtonText}>ACCEPT</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EDE0'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: 45,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'RaleighStdDemi'
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  userCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 25,
  },
  userInfoSection: {
    backgroundColor: '#C27183',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'RaleighStdDemi',
    marginBottom: 5,
  },
  userPhone: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'RaleighStdDemi',
    letterSpacing: 1,
  },
  balanceSection: {
    backgroundColor: '#F5C34B',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'RaleighStdDemi',
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
  },
  inputIconContainer: {
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
    paddingHorizontal: 15,
    fontFamily: 'RaleighStdDemi',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sendButton: {
    backgroundColor: '#C27183',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '100%',
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#C27183',
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalHeaderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi',
  },
  modalContent: {
    padding: 20,
  },
  termText: {
    fontSize: 15,
    color: '#333',
    marginBottom: 20,
    lineHeight: 22,
    fontFamily: 'RaleighStdDemi',
  },
  acceptButton: {
    backgroundColor: '#C27183',
    marginHorizontal: 50,
    marginBottom: 25,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi',
    letterSpacing: 1,
  },
});
