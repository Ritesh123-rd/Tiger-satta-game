import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Modal,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Custom Marquee Component
const MarqueeText = ({ text, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const containerWidth = SCREEN_WIDTH - 140;

  useEffect(() => {
    if (textWidth > 0) {
      animatedValue.setValue(containerWidth);
      Animated.loop(
        Animated.timing(animatedValue, {
          toValue: -textWidth,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        })
      ).start();
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

export default function SingleDigitBulkGame({ navigation, route }) {
  const { gameName } = route.params;
  const [mode, setMode] = useState('special');
  const [selectedGame, setSelectedGame] = useState('CLOSE');
  const [showDropdown, setShowDropdown] = useState(false);
  const [date, setDate] = useState('30-12-2025');
  const [selectedDigits, setSelectedDigits] = useState({});
  const [totalBids, setTotalBids] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  const digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  const handleDigitPress = (digit) => {
    setSelectedDigits(prev => ({
      ...prev,
      [digit]: prev[digit] ? null : ''
    }));
  };

  const handlePointChange = (digit, points) => {
    const newPoints = { ...selectedDigits };
    newPoints[digit] = points;
    setSelectedDigits(newPoints);

    // Calculate totals
    let bids = 0;
    let pts = 0;
    Object.values(newPoints).forEach(p => {
      if (p && p !== '') {
        bids++;
        pts += parseInt(p) || 0;
      }
    });
    setTotalBids(bids);
    setTotalPoints(pts);
  };

  const handleSubmit = () => {
    if (totalBids > 0) {
      alert(`${totalBids} bids submitted for ${totalPoints} points!`);
      setSelectedDigits({});
      setTotalBids(0);
      setTotalPoints(0);
    } else {
      alert('Please select at least one digit and enter points');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <MarqueeText text={`${gameName} - SINGLE DIGIT BULK`} style={styles.headerTitle} />
        <View style={styles.balanceChip}>
          <Ionicons name="wallet" size={16} color="#fff" />
          <Text style={styles.balanceText}>0.0</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.modeContainer}>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'easy' && styles.modeButtonActive]}
            onPress={() => setMode('easy')}
          >
            <Text style={[styles.modeText, mode === 'easy' && styles.modeTextActive]}>
              EASY MODE
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeButton, mode === 'special' && styles.modeButtonActive]}
            onPress={() => setMode('special')}
          >
            <Text style={[styles.modeText, mode === 'special' && styles.modeTextActive]}>
              SPECIAL MODE
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Ionicons name="calendar" size={20} color="#ca1835" />
            <Text style={styles.dateText}>{date}</Text>
          </View>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)}>
            <Text style={styles.dropdownText}>{selectedGame}</Text>
            <Ionicons name="chevron-down" size={20} color="#F5C542" />
          </TouchableOpacity>
        </View>

        {/* Number Grid */}
        <View style={styles.gridContainer}>
          {[0, 1, 2, 3, 4].map(row => (
            <View key={row} style={styles.gridRow}>
              {[0, 1].map(col => {
                const digit = row * 2 + col;
                const isSelected = selectedDigits[digit] !== undefined;
                return (
                  <View key={digit} style={styles.gridItem}>
                    <TouchableOpacity
                      style={[
                        styles.digitButton,
                        isSelected && styles.digitButtonSelected
                      ]}
                      onPress={() => handleDigitPress(digit)}
                    >
                      <Text style={[
                        styles.digitText,
                        isSelected && styles.digitTextSelected
                      ]}>
                        {digit}
                      </Text>
                    </TouchableOpacity>
                    {isSelected && (
                      <TextInput
                        style={styles.pointInput}
                        placeholder="Points"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={selectedDigits[digit]}
                        onChangeText={(val) => handlePointChange(digit, val)}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>

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
                selectedGame === 'OPEN' && styles.modalOptionSelected
              ]}
              onPress={() => {
                setSelectedGame('OPEN');
                setShowDropdown(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                selectedGame === 'OPEN' && styles.modalOptionTextSelected
              ]}>OPEN</Text>
              {selectedGame === 'OPEN' && (
                <Ionicons name="checkmark-circle" size={22} color="#2E4A3E" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalOption,
                selectedGame === 'CLOSE' && styles.modalOptionSelected
              ]}
              onPress={() => {
                setSelectedGame('CLOSE');
                setShowDropdown(false);
              }}
            >
              <Text style={[
                styles.modalOptionText,
                selectedGame === 'CLOSE' && styles.modalOptionTextSelected
              ]}>CLOSE</Text>
              {selectedGame === 'CLOSE' && (
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
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 10,
    fontFamily: 'RaleighStdDemi',
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ca1835',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  balanceText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 5,
    fontFamily: 'RaleighStdDemi',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  modeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  modeButtonActive: {
    backgroundColor: '#ca1835',
    borderColor: '#ca1835',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'RaleighStdDemi',
  },
  modeTextActive: {
    color: '#fff',
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  dateBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 10,
  },
  dateText: {
    fontSize: 14,
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
    borderRadius: 10,
  },
  dropdownText: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
  },
  gridContainer: {
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 15,
  },
  gridItem: {
    flex: 1,
  },
  digitButton: {
    backgroundColor: '#ca1835',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  digitButtonSelected: {
    backgroundColor: '#8B6174',
  },
  digitText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'RaleighStdDemi',
  },
  digitTextSelected: {
    color: '#F5C542',
  },
  pointInput: {
    backgroundColor: '#D4E3EB',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'RaleighStdDemi',
  },
  submitButton: {
    backgroundColor: '#ca1835',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
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
