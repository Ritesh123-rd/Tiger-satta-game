import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  Alert,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Double Pana numbers organized by their sum (add-ank)
const DOUBLE_PANA_NUMBERS = {
  0: ['550', '668', '244', '299', '226', '488', '677', '118', '334'],
  1: ['100', '119', '155', '227', '335', '344', '399', '588', '669'],
  2: ['200', '110', '228', '255', '336', '499', '660', '688', '778'],
  3: ['300', '166', '229', '337', '355', '445', '599', '779', '788'],
  4: ['400', '112', '220', '266', '338', '446', '455', '699', '770'],
  5: ['500', '113', '122', '177', '339', '366', '447', '556', '889'],
  6: ['600', '114', '277', '330', '448', '466', '556', '880', '899'],
  7: ['700', '115', '133', '188', '223', '377', '449', '557', '566'],
  8: ['800', '116', '224', '233', '288', '440', '477', '558', '990'],
  9: ['900', '117', '144', '199', '225', '667', '388', '559', '577'],
};

// Custom Marquee Component
const MarqueeText = ({ text, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const containerWidth = SCREEN_WIDTH - 140;

  useEffect(() => {
    if (textWidth > 0) {
      const startAnimation = () => {
        animatedValue.setValue(containerWidth);
        Animated.loop(
          Animated.timing(animatedValue, {
            toValue: -textWidth,
            duration: 8000,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();
      };
      startAnimation();
    }
  }, [textWidth, containerWidth]);

  return (
    <View style={{ width: containerWidth, overflow: 'hidden', alignItems: 'center' }}>
      <Animated.Text
        onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)}
        style={[style, { transform: [{ translateX: animatedValue }] }]}
        numberOfLines={1}
      >
        {text}   {text}   {text}
      </Animated.Text>
    </View>
  );
};

export default function DoublePanaBulkGame({ navigation, route }) {
  const { gameName, gameType } = route.params;
  const [selectedGameType, setSelectedGameType] = useState('OPEN');
  const [showDropdown, setShowDropdown] = useState(false);
  const [points, setPoints] = useState('');
  const [bids, setBids] = useState([]);
  const [totalBids, setTotalBids] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  // Calculate totals when bids change
  useEffect(() => {
    let bidCount = bids.length;
    let pointSum = bids.reduce((sum, bid) => sum + parseInt(bid.points || 0), 0);
    setTotalBids(bidCount);
    setTotalPoints(pointSum);
  }, [bids]);

  const handleNumberPress = (num) => {
    if (!points || points === '' || parseInt(points) <= 0) {
      Alert.alert('Error', 'Please enter points first');
      return;
    }

    // Get all double pana numbers for this digit
    const panaNumbers = DOUBLE_PANA_NUMBERS[num];
    if (panaNumbers) {
      const newBids = panaNumbers.map(pana => ({
        id: `${pana}-${Date.now()}-${Math.random()}`,
        pana: pana,
        points: points,
        type: selectedGameType.toLowerCase(),
      }));

      setBids(prev => [...prev, ...newBids]);
    }
  };

  const handleDeleteBid = (bidId) => {
    setBids(prev => prev.filter(bid => bid.id !== bidId));
  };

  const handleSubmit = () => {
    if (bids.length === 0) {
      Alert.alert('Error', 'Please add at least one bid');
      return;
    }
    Alert.alert(
      'Success',
      `${totalBids} bids submitted for ${totalPoints} points!`,
      [{
        text: 'OK', onPress: () => {
          setBids([]);
          setPoints('');
        }
      }]
    );
  };

  const renderBidItem = ({ item }) => (
    <View style={styles.bidRow}>
      <Text style={styles.bidCell}>{item.pana}</Text>
      <Text style={styles.bidCell}>{item.points}</Text>
      <Text style={styles.bidCell}>{item.type}</Text>
      <TouchableOpacity onPress={() => handleDeleteBid(item.id)} style={styles.deleteBtn}>
        <View style={styles.deleteIconContainer}>
          <Ionicons name="close" size={12} color="#C36578" />
        </View>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

      {/* Header with Marquee */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        <MarqueeText
          text={`${gameName} - DOUBLE PANA`}
          style={styles.headerTitle}
        />

        <View style={styles.balanceChip}>
          <Ionicons name="wallet-outline" size={14} color="#fff" />
          <Text style={styles.balanceText}>0.0</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Game Type Dropdown */}
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Select Game Type:</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDropdown(true)}
          >
            <Text style={styles.dropdownText}>{selectedGameType}</Text>
            <Ionicons name="chevron-down" size={20} color="#B8860B" />
          </TouchableOpacity>
        </View>

        {/* Points Input */}
        <View style={styles.inputRow}>
          <Text style={styles.inputLabel}>Enter Points:</Text>
          <TextInput
            style={styles.pointsInput}
            placeholder=""
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={points}
            onChangeText={setPoints}
          />
        </View>

        {/* Number Pad */}
        <View style={styles.numberPad}>
          <View style={styles.numberRow}>
            {[1, 2, 3, 4, 5].map(num => (
              <TouchableOpacity
                key={num}
                style={styles.numberButton}
                onPress={() => handleNumberPress(num)}
              >
                <Text style={styles.numberText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.numberRow}>
            {[6, 7, 8, 9, 0].map(num => (
              <TouchableOpacity
                key={num}
                style={styles.numberButton}
                onPress={() => handleNumberPress(num)}
              >
                <Text style={styles.numberText}>{num}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { color: '#C36578' }]}>Pana</Text>
          <Text style={[styles.tableHeaderText, { color: '#C36578' }]}>Point</Text>
          <Text style={[styles.tableHeaderText, { color: '#C36578' }]}>Type</Text>
          <Text style={[styles.tableHeaderText, { color: '#C36578' }]}>Delete</Text>
        </View>

        {/* Bids List */}
        <FlatList
          data={bids}
          renderItem={renderBidItem}
          keyExtractor={item => item.id}
          style={styles.bidsList}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyList}>
              <Text style={styles.emptyText}>No bids added yet</Text>
            </View>
          }
        />
      </View>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Bids</Text>
            <Text style={styles.statValue}>{totalBids}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Points</Text>
            <Text style={styles.statValue}>{totalPoints}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      {/* Game Type Selection Modal */}
      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowDropdown(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Game Type</Text>
            <TouchableOpacity
              style={[
                styles.modalOption,
                selectedGameType === 'OPEN' && styles.modalOptionSelected
              ]}
              onPress={() => {
                setSelectedGameType('OPEN');
                setShowDropdown(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                selectedGameType === 'OPEN' && styles.modalOptionTextSelected
              ]}>OPEN</Text>
              {selectedGameType === 'OPEN' && (
                <Ionicons name="checkmark-circle" size={22} color="#2E4A3E" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalOption,
                selectedGameType === 'CLOSE' && styles.modalOptionSelected
              ]}
              onPress={() => {
                setSelectedGameType('CLOSE');
                setShowDropdown(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                selectedGameType === 'CLOSE' && styles.modalOptionTextSelected
              ]}>CLOSE</Text>
              {selectedGameType === 'CLOSE' && (
                <Ionicons name="checkmark-circle" size={22} color="#2E4A3E" />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 45,
    backgroundColor: '#F5EDE0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0E8Da',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C36578',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    gap: 4,
  },
  balanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi',
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  inputLabel: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    flex: 1,
  },
  dropdown: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    fontWeight: '500',
  },
  pointsInput: {
    flex: 1.5,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 25,
    fontSize: 14,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    textAlign: 'center',
  },
  numberPad: {
    marginVertical: 12,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  numberButton: {
    width: (SCREEN_WIDTH - 70) / 5,
    height: 48,
    backgroundColor: '#C36578',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi',
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  tableHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'RaleighStdDemi',
  },
  bidsList: {
    flex: 1,
  },
  bidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 6,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  bidCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
    fontFamily: 'RaleighStdDemi',
  },
  deleteBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#C36578',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  emptyList: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    fontFamily: 'RaleighStdDemi',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    paddingBottom: 25,
    backgroundColor: '#F5EDE0',
    borderTopWidth: 2,
    borderTopColor: '#C36578',
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'RaleighStdDemi',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'RaleighStdDemi',
  },
  submitButton: {
    backgroundColor: '#C36578',
    paddingHorizontal: 45,
    paddingVertical: 14,
    borderRadius: 8,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 25,
    width: SCREEN_WIDTH * 0.8,
    maxWidth: 320,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'RaleighStdDemi',
    textAlign: 'center',
    marginBottom: 20,
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
    borderColor: '#E8E8E8',
  },
  modalOptionSelected: {
    backgroundColor: '#E8F5E9',
    borderColor: '#2E4A3E',
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'RaleighStdDemi',
  },
  modalOptionTextSelected: {
    color: '#2E4A3E',
  },
});
