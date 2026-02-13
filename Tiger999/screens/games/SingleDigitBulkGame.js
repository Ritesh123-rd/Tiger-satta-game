import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator, StatusBar, Dimensions, Modal
} from 'react-native';
import CustomAlert from '../../components/CustomAlert';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { API_BASE_URL } from '../../api/config';
import { getWalletBalance } from '../../api/auth';

const SCREEN_WIDTH = Dimensions.get('window').width;

const SingleDigitBulkGame = ({ navigation, route }) => {
  const insets = useSafeAreaInsets();
  const { gameName, gameId, isOpenAvailable = true, isCloseAvailable = true } = route.params || {};

  // Filter game options based on availability
  const gameOptions = [
    ...(isOpenAvailable ? ['OPEN'] : []),
    ...(isCloseAvailable ? ['CLOSE'] : [])
  ];

  const [selectedGame, setSelectedGame] = useState(gameOptions[0] || 'OPEN');
  const [isGameTypeOpen, setIsGameTypeOpen] = useState(false);
  const [points, setPoints] = useState('');
  const [selectedDigits, setSelectedDigits] = useState({}); // Object
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    onClose: null
  });


  // Fetch Wallet Balance
  const fetchWalletBalance = async () => {
    try {
      const mobile = await AsyncStorage.getItem('userMobile');
      const userId = await AsyncStorage.getItem('userId');
      if (mobile && userId) {
        const data = await getWalletBalance(mobile, userId);
        if (data && (data.status === true || data.status === 'true')) {
          setBalance(parseFloat(data.balance));
        }
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchWalletBalance();
    }, [])
  );

  const handleDigitPress = (digit) => {
    if (!points || parseInt(points) <= 0) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Please enter valid points first',
        type: 'error'
      });
      return;
    }

    setSelectedDigits(prev => {
      const newSelections = { ...prev };
      const currentPoints = parseInt(points) || 0;
      const existingPoints = parseInt(newSelections[digit]) || 0;
      const newTotal = existingPoints + currentPoints;
      newSelections[digit] = newTotal;
      return newSelections;
    });
  };

  const calculateTotalPoints = () => {
    return Object.values(selectedDigits).reduce((sum, p) => sum + (parseInt(p) || 0), 0);
  };

  const handleSubmit = async () => {
    const digits = Object.keys(selectedDigits);
    if (digits.length === 0) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Please select at least one number',
        type: 'error'
      });
      return;
    }

    const totalPoints = calculateTotalPoints();
    if (totalPoints > balance) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Insufficient balance',
        type: 'error'
      });
      return;
    }

    // Show confirmation modal instead of direct submit
    setShowConfirmModal(true);
  };

  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('user_token');
      const digits = Object.keys(selectedDigits);
      const bids = digits.map(digit => ({
        game_id: gameId,
        game_type: selectedGame,
        digit: digit.toString(),
        points: selectedDigits[digit],
        type: 'single_digit'
      }));
      const response = await fetch(`${API_BASE_URL}/place-bid-bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bids })
      });
      const data = await response.json();
      if (data.status === 'success') {
        setShowConfirmModal(false); // Close modal
        setAlertConfig({
          visible: true,
          title: 'Success',
          message: 'Bids placed successfully!',
          type: 'success',
          onClose: () => {
            setSelectedDigits({});
            setPoints('');
            fetchWalletBalance();
            navigation.goBack();
          }
        });

      } else {
        setAlertConfig({
          visible: true,
          title: 'Error',
          message: data.message || 'Failed to place bids',
          type: 'error'
        });
      }

    } catch (error) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Network request failed or Endpoint not found',
        type: 'error'
      });
    } finally {

      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{gameName || 'RAJDHANI NIGHT'}</Text>
        </View>
        <View style={styles.walletContainer}>
          <Ionicons name="wallet-outline" size={20} color="#fff" />
          <Text style={styles.walletText}>{balance.toFixed(1)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Select Game Type:</Text>
          <TouchableOpacity
            style={styles.dropdownButton}
            onPress={() => setIsGameTypeOpen(!isGameTypeOpen)}
          >
            <Text style={styles.dropdownText}>{selectedGame}</Text>
            <Ionicons name={isGameTypeOpen ? "chevron-up" : "chevron-down"} size={20} color="#C36578" />
          </TouchableOpacity>
        </View>
        {isGameTypeOpen && (
          <View style={styles.dropdownList}>
            {gameOptions.map((type) => (
              <TouchableOpacity
                key={type}
                style={styles.dropdownItem}
                onPress={() => {
                  setSelectedGame(type);
                  setIsGameTypeOpen(false);
                }}
              >
                <Text style={[styles.dropdownItemText, selectedGame === type && styles.selectedDropdownText]}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enter Points:</Text>
          <TextInput
            style={styles.textInput}
            placeholder=""
            keyboardType="number-pad"
            value={points}
            onChangeText={setPoints}
          />
        </View>
        <View style={styles.keypadContainer}>
          <View style={styles.keypadRow}>
            {[1, 2, 3].map(num => (
              <KeypadButton
                key={num}
                number={num}
                val={selectedDigits[num]}
                selected={selectedDigits[num] !== undefined}
                onPress={() => handleDigitPress(num)}
              />
            ))}
          </View>
          <View style={styles.keypadRow}>
            {[4, 5, 6].map(num => (
              <KeypadButton
                key={num}
                number={num}
                val={selectedDigits[num]}
                selected={selectedDigits[num] !== undefined}
                onPress={() => handleDigitPress(num)}
              />
            ))}
          </View>
          <View style={styles.keypadRow}>
            {[7, 8, 9].map(num => (
              <KeypadButton
                key={num}
                number={num}
                val={selectedDigits[num]}
                selected={selectedDigits[num] !== undefined}
                onPress={() => handleDigitPress(num)}
              />
            ))}
          </View>
          <View style={styles.keypadRow}>
            <KeypadButton
              number={0}
              val={selectedDigits[0]}
              selected={selectedDigits[0] !== undefined}
              onPress={() => handleDigitPress(0)}
            />
          </View>
        </View>
      </ScrollView>
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 15), height: 75 + insets.bottom }]}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Bids</Text>
            <Text style={styles.summaryValue}>{Object.keys(selectedDigits).length}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Points</Text>
            <Text style={styles.summaryValue}>{calculateTotalPoints()}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Bids</Text>
            <View style={styles.modalListHeader}>
              <Text style={[styles.modalListHeaderText, { flex: 1 }]}>Digit</Text>
              <Text style={[styles.modalListHeaderText, { flex: 1 }]}>Points</Text>
              <Text style={[styles.modalListHeaderText, { flex: 1 }]}>Type</Text>
            </View>
            <ScrollView style={styles.modalList} contentContainerStyle={{ paddingBottom: 100 }}>
              {Object.keys(selectedDigits).map((digit) => (
                <View key={digit} style={styles.modalListItem}>
                  <Text style={[styles.modalListItemText, { flex: 1 }]}>{digit}</Text>
                  <Text style={[styles.modalListItemText, { flex: 1 }]}>{selectedDigits[digit]}</Text>
                  <Text style={[styles.modalListItemText, { flex: 1 }]}>{selectedGame}</Text>
                </View>
              ))}
            </ScrollView>
            <View style={styles.modalSummary}>
              <Text style={styles.modalSummaryText}>Total Bids: {Object.keys(selectedDigits).length}</Text>
              <Text style={styles.modalSummaryText}>Total Points: {calculateTotalPoints()}</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton, submitting && styles.disabledButton]}
                onPress={handleFinalSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.modalButtonText}>Final Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          if (alertConfig.onClose) alertConfig.onClose();
        }}
      />
    </View>
  );
};


// Helper Component for Keypad Button
const KeypadButton = ({ number, selected, val, onPress }) => (
  <TouchableOpacity
    style={[styles.keypadButton, selected && styles.keypadButtonSelected]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    {selected && (
      <Text style={styles.keypadPoints}>{val}</Text>
    )}
    <Text style={[styles.keypadText, selected && styles.keypadTextSelected]}>{number}</Text>
  </TouchableOpacity>
);

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
    paddingTop: 40,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 20
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textTransform: 'uppercase',
    fontFamily: 'RaleighStdDemi',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C36578',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5
  },
  walletText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    fontFamily: 'RaleighStdDemi'
  },
  dropdownButton: {
    flex: 1.5,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'RaleighStdDemi'
  },
  dropdownList: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginTop: -10,
    marginBottom: 15,
    marginLeft: '40%', // Align with the dropdown button
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee'
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'RaleighStdDemi'
  },
  selectedDropdownText: {
    color: '#C36578',
    fontWeight: 'bold'
  },
  textInput: {
    flex: 1.5,
    backgroundColor: '#fff',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'RaleighStdDemi'
  },
  keypadContainer: {
    marginTop: 20,
    alignItems: 'center',
    gap: 15
  },
  keypadRow: {
    flexDirection: 'row',
    gap: 15,
    justifyContent: 'center',
    width: '100%'
  },
  keypadButton: {
    width: 80,
    height: 80,
    backgroundColor: '#C36578',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    position: 'relative' // For absolute positioning of points
  },
  keypadButtonSelected: {
    backgroundColor: '#8B4250',
    borderWidth: 2,
    borderColor: '#F5C542'
  },
  keypadText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi'
  },
  keypadTextSelected: {
    color: '#F5C542'
  },
  keypadPoints: {
    position: 'absolute',
    top: 5,
    right: 5,
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#EBDCCB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#DCC3B0',
    justifyContent: 'space-between'
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 30
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryLabel: {
    fontSize: 12,
    color: '#555',
    fontFamily: 'RaleighStdDemi'
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'RaleighStdDemi'
  },
  submitButton: {
    backgroundColor: '#C36578',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 10,
    elevation: 2
  },
  disabledButton: {
    opacity: 0.7
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi'
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    maxHeight: '80%'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#C36578',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'RaleighStdDemi'
  },
  modalListHeader: {
    flexDirection: 'row',
    backgroundColor: '#F5EDE0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 5
  },
  modalListHeaderText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'RaleighStdDemi'
  },
  modalList: {
    maxHeight: 200
  },
  modalListItem: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  modalListItemText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    fontFamily: 'RaleighStdDemi'
  },
  modalSummary: {
    marginTop: 15,
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10
  },
  modalSummaryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    fontFamily: 'RaleighStdDemi'
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 15
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  cancelButton: {
    backgroundColor: '#999'
  },
  confirmButton: {
    backgroundColor: '#C36578'
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'RaleighStdDemi'
  }
});

export default SingleDigitBulkGame;
