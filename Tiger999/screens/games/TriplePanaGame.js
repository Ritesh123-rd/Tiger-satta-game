import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Alert,
  Modal,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Triple Pana numbers (all same digits)
const TRIPLE_PANA_NUMBERS = ['000', '111', '222', '333', '444', '555', '666', '777', '888', '999'];

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

export default function TriplePanaGame({ navigation, route }) {
  const { gameName, gameType } = route.params || { gameName: 'TRIPLE PANA', gameType: 'open' };
  const [selectedGameType, setSelectedGameType] = useState('OPEN');
  const [showDropdown, setShowDropdown] = useState(false);
  const [panaInputs, setPanaInputs] = useState({});

  // Get current date in DD-MM-YYYY format
  const getCurrentDate = () => {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Handle input change for a pana
  const handleInputChange = (pana, value) => {
    setPanaInputs(prev => ({
      ...prev,
      [pana]: value,
    }));
  };

  // Handle Submit
  const handleSubmit = () => {
    const bids = [];
    Object.keys(panaInputs).forEach(pana => {
      const pointValue = panaInputs[pana];
      if (pointValue && parseInt(pointValue) > 0) {
        bids.push({
          pana: pana,
          points: pointValue,
          type: selectedGameType.toLowerCase(),
        });
      }
    });

    if (bids.length === 0) {
      Alert.alert('Error', 'Please enter points for at least one pana');
      return;
    }

    const totalPoints = bids.reduce((sum, bid) => sum + parseInt(bid.points), 0);

    Alert.alert(
      'Success',
      `${bids.length} bids submitted for ${totalPoints} points!`,
      [{
        text: 'OK', onPress: () => {
          setPanaInputs({});
        }
      }]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

      {/* Header with Marquee */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>

        <MarqueeText
          text={`${gameName} - TRIPLE PANA`}
          style={styles.headerTitle}
        />

        <View style={styles.balanceChip}>
          <Ionicons name="wallet-outline" size={14} color="#fff" />
          <Text style={styles.balanceText}>0.0</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date and Game Type Row */}
        <View style={styles.topRow}>
          <View style={styles.datePickerBtn}>
            <Ionicons name="calendar-outline" size={16} color="#C36578" />
            <Text style={styles.dateText}>{getCurrentDate()}</Text>
          </View>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowDropdown(true)}
          >
            <Text style={styles.dropdownText}>{selectedGameType}</Text>
            <Ionicons name="chevron-down" size={18} color="#B8860B" />
          </TouchableOpacity>
        </View>

        {/* Triple Pana Grid */}
        <View style={styles.panaGrid}>
          {TRIPLE_PANA_NUMBERS.map((pana, index) => (
            <View key={pana} style={styles.panaItem}>
              <View style={styles.panaNumberBox}>
                <Text style={styles.panaNumberText}>{pana}</Text>
              </View>
              <TextInput
                style={styles.panaInput}
                placeholder=""
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={panaInputs[pana] || ''}
                onChangeText={(value) => handleInputChange(pana, value)}
              />
            </View>
          ))}
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>

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
    paddingTop: 10,
  },
  topRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
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
    gap: 8,
  },
  dateText: {
    fontSize: 13,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
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
    borderColor: '#E8E8E8',
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    fontWeight: '500',
  },
  panaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  panaItem: {
    flexDirection: 'row',
    width: '48%',
    marginBottom: 12,
  },
  panaNumberBox: {
    backgroundColor: '#C36578',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    minWidth: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panaNumberText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi',
  },
  panaInput: {
    flex: 1,
    backgroundColor: '#E0E8EE',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    fontSize: 14,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#C36578',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 30,
  },
  submitButtonText: {
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
