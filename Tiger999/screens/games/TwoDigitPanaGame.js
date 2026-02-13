import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getWalletBalance } from '../../api/auth';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Alert, Modal, Dimensions, Animated, Easing, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomAlert from '../../components/CustomAlert';


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

export default function TwoDigitPanaGame({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const [balance, setBalance] = useState(0.0);
  const [bids, setBids] = useState([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'success',
    onClose: null
  });


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

  const { gameName, isOpenAvailable = true, isCloseAvailable = true } = route.params || { gameName: 'TWO DIGIT PANA' };

  // Filter game options based on availability
  const gameOptions = [
    ...(isOpenAvailable ? ['OPEN'] : []),
    ...(isCloseAvailable ? ['CLOSE'] : [])
  ];

  const [selectedGameType, setSelectedGameType] = useState(gameOptions[0] || 'OPEN');
  const [showDropdown, setShowDropdown] = useState(false);
  const [pana, setPana] = useState('');
  const [points, setPoints] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);

  const getCurrentDate = () => {
    const date = new Date();
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  // Generate suggestions based on input
  const handlePanaChange = (text) => {
    setPana(text);

    if (text.length === 1) {
      const digit = parseInt(text);
      if (!isNaN(digit)) {
        const suggestionsList = [];
        if (digit === 0) {
          // For 0, show 00-09
          for (let i = 0; i <= 9; i++) {
            suggestionsList.push(`0${i}`);
          }
        } else {
          // For 1-9, show X0 to X9
          for (let i = 0; i <= 9; i++) {
            suggestionsList.push(`${digit}${i}`);
          }
        }
        setSuggestions(suggestionsList);
        setShowSuggestions(true);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion) => {
    setPana(suggestion);
    setShowSuggestions(false);
  };

  const handlePointsChange = (text) => {
    setPoints(text);
    const pointValue = parseInt(text);
    if (text && !isNaN(pointValue) && pointValue < 5) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
    } else {
      setShowTooltip(false);
    }
  };

  const handleAdd = () => {
    if (!pana || pana.length !== 2) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Please enter valid 2-digit pana',
        type: 'error'
      });
      return;
    }


    if (!points || parseInt(points) < 5) {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 2000);
      return;
    }

    // Generate all 3-digit combinations containing the 2-digit pana
    const combinations = [];
    const digit1 = pana[0];
    const digit2 = pana[1];

    // Generate all combinations where the 2-digit pana appears
    // Pattern 1: X + pana (e.g., for "22": 022, 122, 222, ..., 922)
    for (let i = 0; i <= 9; i++) {
      combinations.push(`${i}${digit1}${digit2}`);
    }

    // Pattern 2: digit1 + X + digit2 (e.g., for "22": 202, 212, 222, ..., 292)
    for (let i = 0; i <= 9; i++) {
      const combo = `${digit1}${i}${digit2}`;
      if (!combinations.includes(combo)) {
        combinations.push(combo);
      }
    }

    // Pattern 3: pana + X (e.g., for "22": 220, 221, 222, ..., 229)
    for (let i = 0; i <= 9; i++) {
      const combo = `${digit1}${digit2}${i}`;
      if (!combinations.includes(combo)) {
        combinations.push(combo);
      }
    }

    // Create bids for all combinations
    const newBids = combinations.map((combo, index) => ({
      id: `${Date.now()}_${index}`,
      pana: combo,
      point: parseInt(points),
      type: selectedGameType.toLowerCase()
    }));

    setBids([...bids, ...newBids]);
    // Don't clear inputs after adding
  };


  const handleDelete = (id) => {
    setBids(bids.filter(bid => bid.id !== id));
  };

  const getTotalBids = () => bids.length;
  const getTotalPoints = () => bids.reduce((sum, bid) => sum + bid.point, 0);

  const handleSubmit = () => {
    if (bids.length === 0) {
      setAlertConfig({
        visible: true,
        title: 'Error',
        message: 'Please add at least one bid',
        type: 'error'
      });
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    setAlertConfig({
      visible: true,
      title: 'Success',
      message: `${bids.length} bids placed successfully!`,
      type: 'success',
      onClose: () => {
        setBids([]);
        setPana('');
        setPoints('');
      }
    });

  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <MarqueeText text={`${gameName} - TWO DIGIT PANA`} style={styles.headerTitle} />
        <View style={styles.balanceChip}>
          <Ionicons name="wallet-outline" size={14} color="#fff" />
          <Text style={styles.balanceText}>{balance.toFixed(1)}</Text>
        </View>
      </View>

      {/* Static Content */}
      <View style={styles.staticContent}>
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

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Enter Digit:</Text>
          <View style={styles.inputWithSuggestions}>
            <TextInput
              style={styles.textInput}
              placeholder="CP"
              placeholderTextColor="#999"
              keyboardType="numeric"
              maxLength={2}
              value={pana}
              onChangeText={handlePanaChange}
            />
            {showSuggestions && suggestions.length > 0 && (
              <View style={styles.suggestionsDropdown}>
                <ScrollView
                  showsVerticalScrollIndicator={true}
                  nestedScrollEnabled={true}
                  style={styles.suggestionsScrollView}
                >
                  {suggestions.map((suggestion) => (
                    <TouchableOpacity
                      key={suggestion}
                      style={styles.suggestionItem}
                      onPress={() => selectSuggestion(suggestion)}
                    >
                      <Text style={styles.suggestionText}>{suggestion}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Enter Points:</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder="Point"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={points}
              onChangeText={handlePointsChange}
            />
            {showTooltip && (
              <View style={styles.tooltip}>
                <View style={styles.tooltipBubble}>
                  <Ionicons name="information-circle" size={16} color="#000" style={styles.tooltipIcon} />
                  <Text style={styles.tooltipText}>min amount 5</Text>
                </View>
                <View style={styles.tooltipArrow} />
              </View>
            )}
            {showTooltip && (
              <Ionicons name="information-circle" size={18} color="red" style={styles.errorIcon} />
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>

        {/* Table Header - Static */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Pana</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Point</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Type</Text>
          <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Delete</Text>
        </View>
      </View>

      {/* Scrollable Table Content */}
      <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
        {bids.map((bid) => (
          <View key={bid.id} style={styles.tableRow}>
            <Text style={[styles.tableCell, { flex: 1.2 }]}>{bid.pana}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{bid.point}</Text>
            <Text style={[styles.tableCell, { flex: 1 }]}>{bid.type}</Text>
            <TouchableOpacity
              style={[styles.deleteCell, { flex: 0.8 }]}
              onPress={() => handleDelete(bid.id)}
            >
              <View style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={14} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 15), height: 75 + insets.bottom }]}>
        <View style={styles.totalSection}>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Bids</Text>
            <Text style={styles.totalValue}>{getTotalBids()}</Text>
          </View>
          <View style={styles.totalItem}>
            <Text style={styles.totalLabel}>Points</Text>
            <Text style={styles.totalValue}>{getTotalPoints()}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>SUBMIT</Text>
        </TouchableOpacity>
      </View>

      {/* Game Type Modal */}
      <Modal visible={showDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowDropdown(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDropdown(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Game Type</Text>
            {gameOptions.map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.modalOption, selectedGameType === type && styles.modalOptionSelected]}
                onPress={() => {
                  setSelectedGameType(type);
                  setShowDropdown(false);
                }}
              >
                <Text style={[styles.modalOptionText, selectedGameType === type && styles.modalOptionTextSelected]}>
                  {type}
                </Text>
                {selectedGameType === type && <Ionicons name="checkmark-circle" size={22} color="#2E4A3E" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Confirmation Modal */}
      <Modal visible={showConfirmModal} transparent={true} animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Confirm Your Bids</Text>

            <View style={styles.confirmTableHeader}>
              <Text style={[styles.confirmHeaderText, { flex: 1.2 }]}>Pana</Text>
              <Text style={[styles.confirmHeaderText, { flex: 1 }]}>Points</Text>
              <Text style={[styles.confirmHeaderText, { flex: 1 }]}>Type</Text>
            </View>

            <ScrollView
              style={styles.confirmScrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
            >
              {bids.map((bid, index) => (
                <View key={bid.id} style={[
                  styles.confirmTableRow,
                  index % 2 === 0 && styles.confirmTableRowEven
                ]}>
                  <Text style={[styles.confirmTableCell, { flex: 1.2 }]}>{bid.pana}</Text>
                  <Text style={[styles.confirmTableCell, { flex: 1 }]}>{bid.point}</Text>
                  <Text style={[styles.confirmTableCell, { flex: 1 }]}>{bid.type.toUpperCase()}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.confirmDivider} />

            <View style={styles.confirmSummary}>
              <Text style={styles.confirmSummaryText}>Total Bids: {getTotalBids()}</Text>
              <Text style={styles.confirmSummaryText}>Total Points: {getTotalPoints()}</Text>
            </View>

            <View style={styles.confirmButtonsContainer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.confirmSubmitButton}
                onPress={handleConfirmSubmit}
              >
                <Text style={styles.confirmSubmitButtonText}>Confirm Submit</Text>
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
}


const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5EDE0' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 45,
    backgroundColor: '#F5EDE0'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0E8Da'
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    textTransform: 'uppercase'
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C36578',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 4
  },
  balanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi'
  },
  staticContent: {
    backgroundColor: '#F5EDE0',
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  scrollableContent: {
    flex: 1,
    paddingHorizontal: 15,
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16
  },
  datePickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    gap: 8
  },
  dateText: {
    fontSize: 13,
    color: '#000',
    fontFamily: 'RaleighStdDemi'
  },
  dropdown: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E8E8E8'
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    fontWeight: '500'
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    marginBottom: 8
  },
  inputWithSuggestions: {
    position: 'relative',
  },
  textInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    fontSize: 15,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    textAlign: 'center'
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    maxHeight: 200,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  suggestionsScrollView: {
    maxHeight: 200,
  },
  suggestionItem: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  suggestionText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'RaleighStdDemi',
  },
  inputWrapper: {
    position: 'relative',
  },
  errorIcon: {
    position: 'absolute',
    right: 15,
    top: '50%',
    marginTop: -9,
  },
  tooltip: {
    position: 'absolute',
    top: -45,
    right: 0,
    zIndex: 1000,
    alignItems: 'flex-end',
  },
  tooltipBubble: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  tooltipIcon: {
    marginRight: 6,
  },
  tooltipText: {
    color: '#000',
    fontSize: 12,
    fontWeight: '600',
  },
  tooltipArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#fff',
    transform: [{ rotate: '180deg' }],
    marginRight: 15,
    marginTop: -1,
  },
  addButton: {
    backgroundColor: '#C36578',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi'
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#C36578',
    marginBottom: 10,
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C36578',
    textAlign: 'center'
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  tableCell: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    fontWeight: '500'
  },
  deleteCell: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  deleteButton: {
    backgroundColor: '#C36578',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center'
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#F5EDE0',
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderTopWidth: 2,
    borderTopColor: '#C36578',
    alignItems: 'center',
    gap: 15,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  totalSection: {
    flexDirection: 'row',
    flex: 1,
    gap: 20
  },
  totalItem: {
    alignItems: 'center',
    flex: 1
  },
  totalLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '500'
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000'
  },
  submitButton: {
    backgroundColor: '#C36578',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 25,
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 320,
    elevation: 10
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'RaleighStdDemi',
    textAlign: 'center',
    marginBottom: 20
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: '#F5EDE0',
    borderWidth: 2,
    borderColor: '#E8E8E8'
  },
  modalOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E4A3E'
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'RaleighStdDemi'
  },
  modalOptionTextSelected: {
    color: '#2E4A3E'
  },
  confirmModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: SCREEN_WIDTH * 0.85,
    maxHeight: '80%',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84
  },
  confirmModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    textAlign: 'center',
    marginBottom: 18
  },
  confirmTableHeader: {
    flexDirection: 'row',
    backgroundColor: '#C36578',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10
  },
  confirmHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'RaleighStdDemi',
    textAlign: 'center'
  },
  confirmScrollView: {
    maxHeight: 350,
    minHeight: 100,
    flexGrow: 0,
    marginBottom: 5
  },
  confirmTableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#FFFFFF'
  },
  confirmTableRowEven: {
    backgroundColor: '#F9F9F9'
  },
  confirmTableCell: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    textAlign: 'center'
  },
  confirmDivider: {
    height: 2,
    backgroundColor: '#C36578',
    marginVertical: 12
  },
  confirmSummary: {
    alignItems: 'center',
    marginBottom: 20
  },
  confirmSummaryText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    marginVertical: 3
  },
  confirmButtonsContainer: {
    flexDirection: 'row',
    gap: 10
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#999',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi'
  },
  confirmSubmitButton: {
    flex: 1,
    backgroundColor: '#C36578',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center'
  },
  confirmSubmitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi'
  },
});