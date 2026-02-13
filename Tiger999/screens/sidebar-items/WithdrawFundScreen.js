import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, TextInput, Modal, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getWalletBalance, getWithdrawRequestHistory, withdrawfund } from '../../api/auth';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomAlert from '../../components/CustomAlert';


export default function WithdrawFundScreen({ navigation }) {
  const [amount, setAmount] = useState('');
  const [showTermsModal, setShowTermsModal] = useState(true);

  const [balance, setBalance] = useState(0.0);
  const [userData, setUserData] = useState({ name: '', phone: '', id: '' });
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('phone_pay'); // Default method
  const [showPaymentModal, setShowPaymentModal] = useState(false);


  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });


  const fetchUserData = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const phone = await AsyncStorage.getItem('userMobile');
      const userId = await AsyncStorage.getItem('userId');
      setUserData({
        name: name || 'User',
        phone: phone || '',
        id: userId || '',
      });
      if (phone && userId) {
        const response = await getWalletBalance(phone, userId);
        if (response && (response.status === true || response.status === 'true')) {
          setBalance(parseFloat(response.balance));
        }
      }
      if (userId) {
        setLoadingHistory(true);
        const histResponse = await getWithdrawRequestHistory(userId);
        if (histResponse && (histResponse.status === true || histResponse.status === 'true')) {
          setHistory(histResponse.data || []);
        }
        setLoadingHistory(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoadingHistory(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [])
  );

  const handleWithdrawRequest = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Please enter a valid amount.',
        type: 'error'
      });
      return;
    }

    const withdrawAmt = parseFloat(amount);
    if (withdrawAmt < 1000) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Minimum withdrawal amount is ₹ 1000.',
        type: 'error'
      });
      return;
    }

    if (withdrawAmt > balance) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Insufficient balance for withdrawal.',
        type: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await withdrawfund(userData.id, userData.name, amount, selectedMethod);


      const isSuccess = response && (
        response.status === true ||
        response.status === 'true' ||
        response.status === 'success' ||
        response.status === 1 ||
        response.status === '1' ||
        (response.message && response.message.toLowerCase().includes('success'))
      );

      if (isSuccess) {
        setAlertConfig({
          visible: true,
          title: 'Success',
          message: response.message || 'Withdrawal request submitted successfully!',
          type: 'success'
        });
        setAmount('');
        fetchUserData(); // Refresh balance and history
      } else {
        setAlertConfig({
          visible: true,
          title: 'Error',
          message: response.message || 'Failed to submit withdrawal request. Please try again.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Withdraw Fund Error:', error);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Something went wrong. Please check your connection.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal  Fund</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.navigate('WithdrawFundHistory')} style={styles.historyBtn}>
            <Ionicons name="time" size={24} color="#C27183" />
          </TouchableOpacity>
          <View style={styles.coinsBadge}>
            <MaterialCommunityIcons name="cash-multiple" size={16} color="#fff" />
            <Text style={styles.coinsText}>{balance.toFixed(1)}</Text>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* User Info Card */}
          <View style={styles.userCard}>
            <View style={styles.userInfoSection}>
              <Text style={styles.userName}>{userData.name}</Text>
              <Text style={styles.userPhone}>{userData.phone}</Text>
            </View>
            <View style={styles.balanceSection}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>₹ {balance.toFixed(1)}</Text>
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

          {/* Payment Method Selector */}
          <Text style={styles.sectionLabel}>Select Payout Method</Text>
          <TouchableOpacity
            style={styles.methodSelector}
            onPress={() => setShowPaymentModal(true)}
          >
            <View style={styles.methodInfo}>
              {selectedMethod === 'phone_pay' && <Ionicons name="phone-portrait-outline" size={24} color="#C27183" />}
              {selectedMethod === 'paytm' && <MaterialCommunityIcons name="wallet-outline" size={24} color="#C27183" />}
              {selectedMethod === 'google_pay' && <Ionicons name="logo-google" size={24} color="#C27183" />}
              {selectedMethod === 'upi' && <MaterialCommunityIcons name="integrated-circuit-chip" size={24} color="#C27183" />}
              <Text style={styles.methodText}>
                {selectedMethod === 'phone_pay' && 'PhonePe'}
                {selectedMethod === 'paytm' && 'Paytm'}
                {selectedMethod === 'google_pay' && 'Google Pay'}
                {selectedMethod === 'upi' && 'Other UPI'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>


          {/* History Section */}
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Recent Withdrawals</Text>
              {loadingHistory && <ActivityIndicator size="small" color="#C27183" />}
            </View>

            {history.length === 0 && !loadingHistory ? (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryText}>No recent withdrawal requests found.</Text>
              </View>
            ) : (
              history.map((item) => (
                <View key={item.id} style={styles.historyCard}>
                  <View style={styles.historyCardLeft}>
                    <Text style={styles.historyAmount}>₹ {item.request_amount}</Text>
                    <Text style={styles.historyDate}>{item.datee} | {item.timee}</Text>
                  </View>
                  <View style={[
                    styles.statusPill,
                    { backgroundColor: item.request_accecept === 'ACCECEPT' ? '#E8F5E9' : '#FFF3E0' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: item.request_accecept === 'ACCECEPT' ? '#2E7D32' : '#EF6C00' }
                    ]}>
                      {item.request_accecept}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Send Request Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.sendButton, submitting && { opacity: 0.7 }]}
          onPress={handleWithdrawRequest}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send Request</Text>
          )}
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

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
      />

      {/* Payment Method Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPaymentModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPaymentModal(false)}
        >
          <View style={styles.bottomModalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>Choose Payment Method</Text>
              <TouchableOpacity onPress={() => setShowPaymentModal(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              {[
                { id: 'phone_pay', label: 'PhonePe', icon: 'phone-portrait-outline', type: 'Ionicons' },
                { id: 'paytm', label: 'Paytm', icon: 'wallet-outline', type: 'MaterialCommunityIcons' },
                { id: 'google_pay', label: 'Google Pay', icon: 'logo-google', type: 'Ionicons' },
                { id: 'upi', label: 'Other UPI', icon: 'integrated-circuit-chip', type: 'MaterialCommunityIcons' },
              ].map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodOption,
                    selectedMethod === method.id && styles.selectedOption
                  ]}
                  onPress={() => {
                    setSelectedMethod(method.id);
                    setShowPaymentModal(false);
                  }}
                >
                  <View style={styles.optionLeft}>
                    {method.type === 'Ionicons' ? (
                      <Ionicons name={method.icon} size={24} color={selectedMethod === method.id ? '#C27183' : '#666'} />
                    ) : (
                      <MaterialCommunityIcons name={method.icon} size={24} color={selectedMethod === method.id ? '#C27183' : '#666'} />
                    )}
                    <Text style={[
                      styles.optionText,
                      selectedMethod === method.id && styles.selectedOptionText
                    ]}>
                      {method.label}
                    </Text>
                  </View>
                  {selectedMethod === method.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#C27183" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
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
  historyBtn: {
    padding: 5,
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
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    fontFamily: 'RaleighStdDemi',
  },
  methodSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 15,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#E0D5C5',
    marginBottom: 10,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    fontWeight: '600',
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
  scrollContent: {
    flex: 1,
  },
  historySection: {
    marginTop: 25,
    marginBottom: 20,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#D0C4B0',
    paddingBottom: 5,
  },
  historyTitle: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyCardLeft: {
    flex: 1,
  },
  historyAmount: {
    fontSize: 18,
    color: '#C27183',
    fontWeight: 'bold',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  emptyHistory: {
    padding: 20,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#999',
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
  bottomModalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: '100%',
    position: 'absolute',
    bottom: 0,
    paddingBottom: 40,
  },
  methodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedOption: {
    backgroundColor: '#fff5f7',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'RaleighStdDemi',
  },
  selectedOptionText: {
    color: '#C27183',
    fontWeight: 'bold',
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
