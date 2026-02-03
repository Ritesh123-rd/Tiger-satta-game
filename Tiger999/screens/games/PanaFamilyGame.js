import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getWalletBalance } from '../../api/auth';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Alert, Modal, Dimensions, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

const MarqueeText = ({ text, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const containerWidth = SCREEN_WIDTH - 140;
  useEffect(() => {
    if (textWidth > 0) {
      animatedValue.setValue(containerWidth);
      Animated.loop(Animated.timing(animatedValue, { toValue: -textWidth, duration: 8000, easing: Easing.linear, useNativeDriver: true })).start();
    }
  }, [textWidth, containerWidth]);
  return (
    <View style={{ width: containerWidth, overflow: 'hidden', alignItems: 'center' }}>
      <Animated.Text onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)} style={[style, { transform: [{ translateX: animatedValue }] }]} numberOfLines={1}>
        {text}   {text}   {text}
      </Animated.Text>
    </View>
  );
};

export default function PanaFamilyGame({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(0.0);

  const fetchBalance = async () => {
    try {
      const mobile = await AsyncStorage.getItem('userMobile');
      const userId = await AsyncStorage.getItem('userId');
      if (mobile && userId) {
        const response = await getWalletBalance(mobile, userId);
        if (response && (response.status === true || response.status === 'true')) {
          setBalance(parseFloat(response.balance));
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, [])
  );


  const { gameName } = route.params || { gameName: 'PANA FAMILY' };
  const [selectedGameType, setSelectedGameType] = useState('OPEN');
  const [showDropdown, setShowDropdown] = useState(false);
  const [digit, setDigit] = useState('');
  const [points, setPoints] = useState('');
  const [bids, setBids] = useState([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const getCurrentDate = () => {
    const date = new Date();
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  const addBid = () => {
    if (!digit || digit.length !== 3) { Alert.alert('Error', 'Please enter valid 3-digit pana'); return; }
    if (!points || parseInt(points) <= 0) { Alert.alert('Error', 'Please enter valid points'); return; }
    if (parseInt(points) < 10) { Alert.alert('Error', 'Minimum points should be 10'); return; }

    const digitCuts = { '1': '6', '2': '7', '3': '8', '4': '9', '5': '0', '6': '1', '7': '2', '8': '3', '9': '4', '0': '5' };
    const getFamily = (p) => {
      const d = p.split('');
      const cuts = d.map(x => digitCuts[x]);
      const options = d.map((x, i) => [x, cuts[i]]);
      const family = new Set();
      for (let i of options[0]) {
        for (let j of options[1]) {
          for (let k of options[2]) {
            const res = [i, j, k].sort().join('');
            family.add(res);
          }
        }
      }
      return Array.from(family).sort();
    };

    const familyPanas = getFamily(digit);
    const newBids = familyPanas.map(p => ({
      digit: p,
      points,
      type: selectedGameType,
      id: Math.random().toString(36).substr(2, 9)
    }));

    setBids([...bids, ...newBids]);
    setDigit('');
    setPoints('');
  };

  const deleteBid = (id) => {
    setBids(bids.filter(bid => bid.id !== id));
  };

  const finalSubmit = () => {
    // Implement final submission logic here
    Alert.alert('Success', 'All bids submitted successfully!', [{
      text: 'OK',
      onPress: () => {
        setBids([]);
        setShowSubmitModal(false);
      }
    }]);
  };

  const totalPoints = bids.reduce((sum, bid) => sum + parseInt(bid.points), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <MarqueeText text={`${gameName} - PANA FAMILY`} style={styles.headerTitle} />
        <View style={styles.balanceChip}>
          <Ionicons name="wallet-outline" size={14} color="#fff" />
          <Text style={styles.balanceText}>{balance.toFixed(1)}</Text>
        </View>
      </View>

      <View style={styles.fixedTopSection}>
        <View style={styles.topRow}>
          <View style={styles.datePickerBtn}>
            <Ionicons name="calendar-outline" size={16} color="#C36578" />
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
          </View>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)}>
            <Text style={styles.dropdownText}>{selectedGameType}</Text>
            <Ionicons name="chevron-down" size={18} color="#B8860B" />
          </TouchableOpacity>
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Enter Digit:</Text>
          <TextInput style={styles.textInput} placeholder="0" placeholderTextColor="#999" keyboardType="numeric" maxLength={3} value={digit} onChangeText={setDigit} />
        </View>

        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Enter Points:</Text>
          <TextInput style={styles.textInput} placeholder="Points" placeholderTextColor="#999" keyboardType="numeric" value={points} onChangeText={setPoints} />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addBid}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>

        {bids.length > 0 && (
          <View style={styles.bidHeaderContainer}>
            <View style={styles.bidHeader}>
              <Text style={styles.bidHeaderText}>Pana</Text>
              <Text style={styles.bidHeaderText}>Point</Text>
              <Text style={styles.bidHeaderText}>Type</Text>
              <Text style={[styles.bidHeaderText, { flex: 0.8 }]}>Delete</Text>
            </View>
            <View style={styles.bidSeparator} />
          </View>
        )}
      </View>

      <View style={styles.scrollContainer}>
        {bids.length > 0 ? (
          <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
            <View style={styles.bidListContainer}>
              {bids.map((bid) => (
                <View key={bid.id} style={styles.bidItemCard}>
                  <Text style={styles.bidItemText}>{bid.digit}</Text>
                  <Text style={styles.bidItemText}>{bid.points}</Text>
                  <Text style={styles.bidItemText}>{bid.type.toLowerCase()}</Text>
                  <View style={{ flex: 0.8, alignItems: 'center' }}>
                    <TouchableOpacity onPress={() => deleteBid(bid.id)} style={styles.deleteCircle}>
                      <Ionicons name="trash" size={14} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={50} color="#D0D0D0" />
            <Text style={styles.emptyText}>No bids added yet</Text>
          </View>
        )}
      </View>

      {/* Sticky Footer */}
      <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 15), height: 70 + insets.bottom }]}>
        <View style={styles.footerInfo}>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Bids</Text>
            <Text style={styles.footerValue}>{bids.length}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerLabel}>Points</Text>
            <Text style={styles.footerValue}>{totalPoints}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.footerSubmitBtn, bids.length === 0 && { opacity: 0.6 }]}
          onPress={() => bids.length > 0 && setShowSubmitModal(true)}
          disabled={bids.length === 0}
        >
          <Text style={styles.footerSubmitText}>SUBMIT</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal visible={showSubmitModal} transparent={true} animationType="fade" onRequestClose={() => setShowSubmitModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmTitle}>Confirm Your Bids</Text>
            <View style={styles.confirmDetails}>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Total Bids:</Text>
                <Text style={styles.confirmValue}>{bids.length}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Total Points:</Text>
                <Text style={styles.confirmValue}>{totalPoints}</Text>
              </View>
              <View style={styles.confirmRow}>
                <Text style={styles.confirmLabel}>Wallet Balance:</Text>
                <Text style={styles.confirmValue}>{balance.toFixed(1)}</Text>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowSubmitModal(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={finalSubmit}>
                <Text style={styles.confirmBtnText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowDropdown(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDropdown(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Game Type</Text>
            {['OPEN', 'CLOSE'].map(type => (
              <TouchableOpacity key={type} style={[styles.modalOption, selectedGameType === type && styles.modalOptionSelected]} onPress={() => { setSelectedGameType(type); setShowDropdown(false); }}>
                <Text style={[styles.modalOptionText, selectedGameType === type && styles.modalOptionTextSelected]}>{type}</Text>
                {selectedGameType === type && <Ionicons name="checkmark-circle" size={22} color="#2E4A3E" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5EDE0' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, paddingTop: 45, backgroundColor: '#F5EDE0' },
  backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#D0D0D0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0E8Da' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#000', fontFamily: 'RaleighStdDemi', textTransform: 'uppercase' },
  balanceChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C36578', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, gap: 4 },
  balanceText: { color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
  fixedTopSection: { paddingHorizontal: 15, paddingTop: 10, paddingBottom: 15, backgroundColor: '#F5EDE0', zIndex: 1 },
  scrollContainer: { flex: 1, paddingHorizontal: 15 },
  content: { flex: 1 },
  topRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  datePickerBtn: { flex: 1.2, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: '#D0D0D0', gap: 6 },
  dateText: { fontSize: 13, color: '#000', fontWeight: '500' },
  dropdown: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25, borderWidth: 1, borderColor: '#D0D0D0' },
  dropdownText: { fontSize: 13, color: '#000', fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, gap: 10 },
  inputLabel: { flex: 1, fontSize: 15, color: '#333', fontWeight: '500' },
  textInput: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, fontSize: 15, color: '#000', borderWidth: 1, borderColor: '#D0D0D0', textAlign: 'center' },
  addButton: { backgroundColor: '#C36578', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 5, marginHorizontal: 40 },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  bidHeaderContainer: { marginTop: 20, paddingHorizontal: 0 },
  bidListContainer: { marginTop: 5, paddingBottom: 80 },
  bidHeader: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10 },
  bidHeaderText: { color: '#C36578', fontSize: 15, fontWeight: '600', flex: 1, textAlign: 'center' },
  bidSeparator: { height: 2, backgroundColor: '#C36578', opacity: 0.5, marginBottom: 10 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50, opacity: 0.5 },
  emptyText: { color: '#666', fontSize: 16, marginTop: 10, fontWeight: '500' },
  bidItemCard: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 15, marginBottom: 12, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3 },
  bidItemText: { fontSize: 15, color: '#333', flex: 1, textAlign: 'center', fontWeight: '500' },
  deleteCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#C36578', justifyContent: 'center', alignItems: 'center' },
  stickyFooter: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#F5EDE0', borderTopWidth: 1, borderTopColor: '#C36578', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20 },
  footerInfo: { flex: 1, flexDirection: 'row', gap: 40 },
  footerItem: { alignItems: 'center' },
  footerLabel: { fontSize: 13, color: '#666' },
  footerValue: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  footerSubmitBtn: { backgroundColor: '#C36578', paddingHorizontal: 35, paddingVertical: 12, borderRadius: 8 },
  footerSubmitText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 20, paddingHorizontal: 25, width: SCREEN_WIDTH * 0.8, maxWidth: 320, elevation: 10 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', fontFamily: 'RaleighStdDemi', textAlign: 'center', marginBottom: 20 },
  modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, marginBottom: 10, backgroundColor: '#F5EDE0', borderWidth: 2, borderColor: '#E8E8E8' },
  modalOptionSelected: { backgroundColor: '#E8F5E9', borderColor: '#2E4A3E' },
  modalOptionText: { fontSize: 16, fontWeight: '600', color: '#333', fontFamily: 'RaleighStdDemi' },
  modalOptionTextSelected: { color: '#2E4A3E' },
  confirmModalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 25, width: SCREEN_WIDTH * 0.85, maxWidth: 400, alignItems: 'center' },
  confirmTitle: { fontSize: 22, fontWeight: 'bold', color: '#C36578', marginBottom: 20, fontFamily: 'RaleighStdDemi' },
  confirmDetails: { width: '100%', backgroundColor: '#F9F9F9', padding: 15, borderRadius: 15, marginBottom: 25, gap: 12 },
  confirmRow: { flexDirection: 'row', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 8 },
  confirmLabel: { fontSize: 15, color: '#666', fontFamily: 'RaleighStdDemi' },
  confirmValue: { fontSize: 15, fontWeight: 'bold', color: '#000', fontFamily: 'RaleighStdDemi' },
  modalButtons: { flexDirection: 'row', gap: 15, width: '100%' },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#DDD', alignItems: 'center' },
  cancelBtnText: { color: '#666', fontSize: 16, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
  confirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#C36578', alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
});
