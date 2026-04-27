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
  ActivityIndicator,
  AppState,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef } from 'react';
import { getWalletBalance, getFundRequestHistory, paymentGetWay, paymentStatus } from '../../api/auth';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import CustomAlert from '../../components/CustomAlert';


export default function AddFundScreen({ navigation }) {
  const [amount, setAmount] = useState('');

  const [balance, setBalance] = useState(0.0);
  const [userData, setUserData] = useState({ username: 'User', mobile: '', user_id: '' });
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [lastOrderId, setLastOrderId] = useState(null);
  const [lastSentAmount, setLastSentAmount] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [historyTab, setHistoryTab] = useState('accepted'); // 'accepted', 'approve', or 'processing'
  const appState = useRef(AppState.currentState);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    onPress: null,
  });

  // Check status on app resume and load stored order data
  useEffect(() => {
    const initVerification = async () => {
      try {
        const storedOrderId = await AsyncStorage.getItem('lastOrderId');
        const storedAmount = await AsyncStorage.getItem('lastSentAmount');
        if (storedOrderId) {
          setLastOrderId(storedOrderId);
          if (storedAmount) setLastSentAmount(storedAmount);
        }
      } catch (e) {
        console.error('Error loading pending order:', e);
      }
    };

    initVerification();

    const subscription = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        console.log('App returned to foreground, refreshing data...');
        handleReturnFromPayment();
        // Always refresh user data and balance when returning to foreground
        fetchUserData();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleReturnFromPayment = async () => {
    try {
      const storedOrderId = await AsyncStorage.getItem('lastOrderId');
      console.log('Checking for stored order ID on return:', storedOrderId);
      if (storedOrderId) {
        setAlertConfig({
          visible: true,
          title: 'Payment Status',
          message: 'Did you complete the payment? Click OK to verify your transaction.',
          type: 'info',
          onPress: () => checkVerification()
        });
      }
    } catch (error) {
      console.error('Error in handleReturnFromPayment:', error);
    }
  };

  const checkVerification = async () => {
    try {
      const storedOrderId = await AsyncStorage.getItem('lastOrderId');
      const storedAmount = await AsyncStorage.getItem('lastSentAmount');

      if (!storedOrderId && !lastOrderId) {
        fetchUserData();
        return;
      }

      const idToVerify = storedOrderId || lastOrderId;
      const amtToVerify = storedAmount || lastSentAmount;

      const name = await AsyncStorage.getItem('userName') || userData.username || 'User';
      const mobile = await AsyncStorage.getItem('userMobile') || userData.mobile || '';

      await handleVerifyAndRefresh(idToVerify, amtToVerify, name, mobile);
    } catch (error) {
      console.error('Error in checkVerification:', error);
    }
  };

  const handleVerifyAndRefresh = async (orderId, amountToVerify, username, mobile) => {
    try {
      setLoadingHistory(true);
      
      console.log('Verifying payment for order:', orderId);
      const response = await paymentStatus(orderId);
      console.log('Payment Status API Response:', response);

      // Clear stored data after verification attempt
      await AsyncStorage.removeItem('lastOrderId');
      await AsyncStorage.removeItem('lastSentAmount');
      setLastOrderId(null);
      setLastSentAmount(null);

      // Check for success in the nested data object or root status
      const isSuccess = response && (
        (response.status === true && response.data?.status === 'success') || 
        response.status === 'SUCCESS' || 
        response.data?.status === 'COMPLETED'
      );

      if (isSuccess) {
        console.log('PAYMENT SUCCESS for TXN_ID:', orderId);
        setAlertConfig({
          visible: true,
          title: 'PAYMENT DONE',
          message: response.data?.message || `Your payment of ₹${amountToVerify} has been successfully verified.`,
          type: 'success',
          onPress: () => fetchUserData()
        });
      } else {
        console.log('-----------------------------------');
        console.log('PAYMENT STATUS: NOT DONE / PENDING');
        console.log('TXN_ID checked:', orderId);
        console.log('API Response Status:', response.data?.status || 'N/A');
        console.log('API Message:', response.data?.message || 'N/A');
        console.log('-----------------------------------');
        
        const isError = response.data?.status === 'error' || response.data?.status === 'FAILED';
        
        setAlertConfig({
          visible: true,
          title: isError ? 'PAYMENT NOT DONE' : 'PAYMENT PENDING',
          message: response.data?.message || 'Your payment status is currently pending or could not be verified. If amount was deducted, it will reflect within 24 hours.',
          type: isError ? 'error' : 'warning',
          onPress: () => fetchUserData()
        });
      }
    } catch (err) {
      console.error('Verify error:', err);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Something went wrong while verifying your payment. Please check your history in a few minutes.',
        type: 'error',
        onPress: () => fetchUserData()
      });
    } finally {
      setLoadingHistory(false);
    }
  };


  const fetchUserData = useCallback(async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      const mobile = await AsyncStorage.getItem('userMobile');
      const userId = await AsyncStorage.getItem('userId');
      setUserData({
        username: name || 'User',
        mobile: mobile || '',
        user_id: userId || '',
      });

      if (mobile && userId) {
        const response = await getWalletBalance(mobile, userId);
        if (response && (response.status === true || response.status === 'true')) {
          const newBalance = parseFloat(response.balance);
          if (newBalance > balance && balance !== 0) {
            setAlertConfig({
              visible: true,
              title: 'Success!',
              message: `₹ ${newBalance - balance} successfully added to your wallet.`,
              type: 'success'
            });
          }
          setBalance(newBalance);
        }
      }

      if (userId) {
        setLoadingHistory(true);
        const histResponse = await getFundRequestHistory(userId);
        if (histResponse && (histResponse.status === true || histResponse.status === 'true')) {
          setHistory(histResponse.data || []);
        }
        setLoadingHistory(false);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoadingHistory(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [fetchUserData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserData();
    setRefreshing(false);
  }, [fetchUserData]);

  const quickAmounts = [100, 200, 500, 1000, 1500, 2000];

  const handleQuickAmount = (value) => {
    setAmount(value.toString());
  };

  const handleCall = () => {
    Linking.openURL('tel:+919999999999');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/919999999999');
  };

  const decodeBase64 = (str) => {
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
      let output = '';
      str = String(str).replace(/=+$/, '');
      if (str.length % 4 === 1) return null;
      for (
        let bc = 0, bs, buffer, idx = 0;
        (buffer = str.charAt(idx++));
        ~buffer && ((bs = bc % 4 ? bs * 64 + buffer : buffer), bc++ % 4)
          ? (output += String.fromCharCode(255 & (bs >> ((-2 * bc) & 6))))
          : 0
      ) {
        buffer = chars.indexOf(buffer);
      }
      return output;
    } catch (e) {
      return null;
    }
  };

  const handleAddFund = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Please enter a valid amount.',
        type: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      // console.log('Initiating payment for user:', userData.user_id, 'Amount:', amount);
      const response = await paymentGetWay(userData.user_id, userData.username, userData.mobile, amount);
      // console.log('Payment Gateway Response:', response);

      if (response) {
        const potentialFields = [
          response.payment_url,
          response.url,
          response.redirect_url,
          response.error,
          response.msg,
          response.upi,
          response.data?.url,
          response.data?.upi
        ];

        let targetUrl = null;
        for (const field of potentialFields) {
          if (!field || typeof field !== 'string') continue;

          if (field.startsWith('http') || field.startsWith('upi')) {
            targetUrl = field;
            break;
          }

          const decoded = decodeBase64(field);
          if (decoded && (decoded.startsWith('http') || decoded.startsWith('upi'))) {
            targetUrl = decoded;
            break;
          }
        }

        if (targetUrl) {
          const orderId = response.order_id || response.txnId || response.txn_id || response.id || null;

          if (orderId) {
            await AsyncStorage.setItem('lastOrderId', orderId.toString());
            await AsyncStorage.setItem('lastSentAmount', amount.toString());
            setLastOrderId(orderId);
            setLastSentAmount(amount);
          }

          console.log('Redirecting to target URL:', targetUrl);
          Linking.openURL(encodeURI(targetUrl)).catch(err => {
            console.error('Linking error:', err);
          });
          setAmount('');
        } else if (response.status === 200 || response.status === true || response.status === 'true' || response.status === 1 || response.status === 'success' || response.status === 'SUCCESS') {
          setAlertConfig({
            visible: true,
            title: 'Request Sent',
            message: response.msg || response.message || 'Payment request submitted successfully.',
            type: 'success',
            onPress: () => fetchUserData()
          });
          setAmount('');
        } else {
          setAlertConfig({
            visible: true,
            title: 'Payment Error',
            message: response.msg || response.message || 'Payment could not be processed. Please check your data.',
            type: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Payment Error:', error);
      setAlertConfig({
        visible: true,
        title: 'Network Error',
        message: 'Failed to connect to payment gateway.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
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

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={fetchUserData} style={styles.historyBtn}>
            <Ionicons name="refresh" size={24} color="#C27183" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AddFundHistory')} style={styles.historyBtn}>
            <Ionicons name="time" size={24} color="#C27183" />
          </TouchableOpacity>
          <View style={styles.coinsBadge}>

            <MaterialCommunityIcons name="cash-multiple" size={16} color="#fff" />
            <Text style={styles.coinsText}>{balance.toFixed(1)}</Text>
          </View>
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
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#C27183']} />
          }
        >
          {/* User Info Card */}
          <View style={styles.userCard}>
            {/* Pink Top Section */}
            <View style={styles.userCardTop}>
              <Text style={styles.userName}>{userData.username}</Text>
              <Text style={styles.usermobile}>{userData.mobile}</Text>
            </View>

            {/* Yellow Bottom Section */}
            <View style={styles.userCardBottom}>
              <Text style={styles.balanceLabel}>Available Balance</Text>
              <Text style={styles.balanceAmount}>₹ {balance.toFixed(1)}</Text>
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
            <View style={styles.quickAmountRow}>
              {quickAmounts.slice(4, 6).map((value) => (
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

          {/* History Section */}
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.historyTitle}>Recent Requests</Text>
              {loadingHistory && <ActivityIndicator size="small" color="#C27183" />}
            </View>

            {/* History Tabs */}
            <View style={styles.historyTabs}>
              <TouchableOpacity
                style={[styles.historyTab, historyTab === 'accepted' && styles.historyTabActive]}
                onPress={() => setHistoryTab('accepted')}
              >
                <Text style={[styles.historyTabText, historyTab === 'accepted' && styles.historyTabTextActive]}>Accepted</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.historyTab, historyTab === 'approve' && styles.historyTabActive]}
                onPress={() => setHistoryTab('approve')}
              >
                <Text style={[styles.historyTabText, historyTab === 'approve' && styles.historyTabTextActive]}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.historyTab, historyTab === 'processing' && styles.historyTabActive]}
                onPress={() => setHistoryTab('processing')}
              >
                <Text style={[styles.historyTabText, historyTab === 'processing' && styles.historyTabTextActive]}>Processing</Text>
              </TouchableOpacity>
            </View>

            {history.filter(item => {
              if (historyTab === 'accepted') return item.status === 'success' && item.balance_add === '1';
              if (historyTab === 'approve') return item.status === 'success' && item.balance_add === '0';
              return item.status === 'processing';
            }).length === 0 && !loadingHistory ? (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryText}>
                  No {historyTab} requests found.
                </Text>
              </View>
            ) : (
              history
                .filter(item => {
                  if (historyTab === 'accepted') return item.status === 'success' && item.balance_add === '1';
                  if (historyTab === 'approve') return item.status === 'success' && item.balance_add === '0';
                  return item.status === 'processing';
                })
                .map((item) => (
                  <View key={item.id} style={styles.historyCard}>
                    <View style={styles.historyCardLeft}>
                      <Text style={styles.historyAmount}>₹ {item.amount}</Text>
                      <Text style={styles.historyDate}>{item.created_at}</Text>
                    </View>
                    <View style={[
                      styles.statusPill,
                      { backgroundColor: item.status === 'success' ? '#E8F5E9' : '#FFF3E0' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: item.status === 'success' ? '#2E7D32' : '#EF6C00' }
                      ]}>
                        {item.status === 'success' ? (item.balance_add === '1' ? 'Accepted' : 'Approve') : 'Processing'}
                      </Text>
                    </View>
                  </View>
                ))
            )}
          </View>
        </ScrollView>

        {/* Pay Now Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.payButton, submitting && { opacity: 0.7 }]}
            onPress={handleAddFund}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>Pay Now</Text>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          if (alertConfig.onPress) {
            alertConfig.onPress();
          }
          setAlertConfig({ ...alertConfig, visible: false, onPress: null });
        }}
      />
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
    fontFamily: 'Poppins_600SemiBold',
    color: '#000',
    fontWeight: 'bold',
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
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  usermobile: {
    fontSize: 26,
    color: '#fff',
    fontFamily: 'Poppins_600SemiBold',
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
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: 'bold',
    marginBottom: 5,
  },
  balanceAmount: {
    fontSize: 28,
    color: '#000',
    fontFamily: 'Poppins_600SemiBold',
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
    fontFamily: 'Poppins_600SemiBold',
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
    fontFamily: 'Poppins_600SemiBold',
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
    fontFamily: 'Poppins_600SemiBold',
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
    fontFamily: 'Poppins_600SemiBold',
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
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: 'bold',
  },
  historySection: {
    marginTop: 10,
    marginBottom: 100, // Extra space for scroll
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
    fontFamily: 'Poppins_600SemiBold',
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
    fontFamily: 'Poppins_700Bold',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'Poppins_400Regular',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: 'bold',
  },
  emptyHistory: {
    padding: 20,
    alignItems: 'center',
  },
  emptyHistoryText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'Poppins_400Regular',
  },
  historyTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D0C4B0',
  },
  historyTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  historyTabActive: {
    backgroundColor: '#C27183',
    elevation: 2,
  },
  historyTabText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Poppins_600SemiBold',
  },
  historyTabTextActive: {
    color: '#fff',
  },
});
