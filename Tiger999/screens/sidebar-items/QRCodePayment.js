import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QrcodePayment } from '../../api/auth';
import CustomAlert from '../../components/CustomAlert';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const QR_SIZE = SCREEN_WIDTH - 40; // full width minus horizontal padding

const injectedCSS = `
  (function() {
    var style = document.createElement('style');
    style.innerHTML = 'body,html{margin:0;padding:0;background:#fff;} img{width:100%!important;height:auto!important;display:block;}';
    document.head.appendChild(style);
  })();
  true;
`;

export default function QRCodePayment({ navigation }) {
  const [amount, setAmount] = useState('');
  const [utrCode, setUtrCode] = useState('');
  const [qrLoading, setQrLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState('');
  const [username, setUsername] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    onPress: null,
  });

  React.useEffect(() => {
    const getUserData = async () => {
      try {
        const id = await AsyncStorage.getItem('userId');
        const name = await AsyncStorage.getItem('userName');
        if (id) setUserId(id);
        if (name) setUsername(name);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    getUserData();
  }, []);

  const handleSubmit = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setAlertConfig({
        visible: true,
        title: 'Invalid Amount',
        message: 'Please enter the amount you paid.',
        type: 'warning'
      });
      return;
    }
    if (utrCode.trim().length !== 12) {
      setAlertConfig({
        visible: true,
        title: 'Invalid UTR',
        message: 'UTR number must be exactly 12 digits.',
        type: 'warning'
      });
      return;
    }

    if (!userId || !username) {
      setAlertConfig({
        visible: true,
        title: 'Session Error',
        message: 'User information not found. Please log in again.',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await QrcodePayment(
        userId,
        username,
        amount,
        utrCode.trim()
      );

      if (response && response.status) {
        setAlertConfig({
          visible: true,
          title: 'Success!',
          message: response.message || 'Fund request submitted successfully.',
          type: 'success',
          onPress: () => navigation.goBack()
        });
        setAmount('');
        setUtrCode('');
      } else {
        setAlertConfig({
          visible: true,
          title: 'Request Failed',
          message: response.message || 'This UTR number has already been used.',
          type: 'error'
        });
      }
    } catch (error) {
      console.error('Submit Payment Error:', error);
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Something went wrong. Please try again later.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pay via QR</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* QR WebView — full width */}
        <View style={styles.qrCard}>
          <Text style={styles.qrLabel}>Scan QR to Pay</Text>
          <TouchableOpacity 
            style={styles.qrWrapper} 
            activeOpacity={0.9}
            onPress={() => setShowQrModal(true)}
          >
            {qrLoading && (
              <ActivityIndicator size="large" color="#C27183" style={styles.qrLoader} />
            )}
            <WebView
              source={{ uri: 'https://dhlmedia.online/GoldenMatka/admin/Qr-PaymentLinkIMG.php' }}
              style={[styles.qrWebView, qrLoading && { opacity: 0 }]}
              injectedJavaScript={injectedCSS}
              onLoad={() => setQrLoading(false)}
              onError={() => setQrLoading(false)}
              scrollEnabled={false}
              scalesPageToFit={false}
              javaScriptEnabled={true}
              pointerEvents="none" 
            />
            {/* Overlay to ensure click works over WebView */}
            <View style={styles.qrOverlay} />
          </TouchableOpacity>
          <Text style={styles.qrNote}>Tap QR to enlarge</Text>
        </View>

        {/* Amount Input */}
        <View style={styles.section}>
          <View style={styles.inputRow}>
            <View style={styles.inputIcon}>
              <MaterialCommunityIcons name="currency-inr" size={20} color="#fff" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter amount "
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        </View>

        {/* UTR Input */}
        <View style={styles.section}>
          <View style={styles.inputRow}>
            <View style={styles.inputIcon}>
              <Ionicons name="receipt-outline" size={20} color="#fff" />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter 12-digit UTR ID"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={12}
              value={utrCode}
              onChangeText={setUtrCode}
            />
          </View>
        </View>

      </ScrollView>

      {/* Fixed Submit Button at bottom */}
      <View style={styles.bottomBar}>
        <TouchableOpacity 
          style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Submit for Verification</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* QR Modal Popup */}
      <Modal
        visible={showQrModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => setShowQrModal(false)}
            >
              <Ionicons name="close-circle" size={32} color="#fff" />
            </TouchableOpacity>
            
            <View style={styles.largeQrWrapper}>
              <WebView
                source={{ uri: 'https://dhlmedia.online/GoldenMatka/admin/Qr-PaymentLinkIMG.php' }}
                style={styles.largeQrWebView}
                injectedJavaScript={injectedCSS}
                scrollEnabled={false}
                scalesPageToFit={false}
                javaScriptEnabled={true}
              />
            </View>
            <Text style={styles.modalNote}>Scan this QR code from any UPI app</Text>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          if (alertConfig.onPress) alertConfig.onPress();
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
    paddingTop: 45,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'Poppins_600SemiBold',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: '#F5EDE0',
    borderTopWidth: 1,
    borderTopColor: '#e0d5c8',
  },
  qrCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 0,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'Poppins_600SemiBold',
  },
  qrWrapper: {
    width: QR_SIZE,
    height: QR_SIZE + 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  qrOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  qrLoader: {
    position: 'absolute',
  },
  qrWebView: {
    width: QR_SIZE,
    height: QR_SIZE + 100,
    backgroundColor: '#fff',
  },
  qrNote: {
    marginTop: 12,
    fontSize: 13,
    color: '#777',
    textAlign: 'center',
    paddingHorizontal: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    fontFamily: 'Poppins_600SemiBold',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  inputIcon: {
    backgroundColor: '#C27183',
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#333',
    height: 50,
  },
  submitBtn: {
    backgroundColor: '#C27183',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#C27183',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins_600SemiBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: SCREEN_WIDTH - 50,
    backgroundColor: 'transparent',
    alignItems: 'center',
    // height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: -50,
    right: 0,
    zIndex: 10,
  },
  largeQrWrapper: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_WIDTH - 40 + 200,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
  },
  largeQrWebView: {
    flex: 1,
  },
  modalNote: {
    color: '#fff',
    marginTop: 20,
    fontSize: 16,
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
});
