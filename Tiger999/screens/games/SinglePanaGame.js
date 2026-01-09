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

export default function SinglePanaGame({ navigation, route }) {
  const { gameName } = route.params;
  const [mode, setMode] = useState('easy');
  const [selectedGame, setSelectedGame] = useState('CLOSE');
  const [showDropdown, setShowDropdown] = useState(false);
  const [pana, setPana] = useState('');
  const [points, setPoints] = useState('');
  const [bids, setBids] = useState([]);
  const [totalBids, setTotalBids] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  const addBid = () => {
    if (pana && points) {
      const newBid = {
        id: Date.now(),
        pana: pana,
        point: points,
        type: selectedGame,
      };
      setBids([...bids, newBid]);
      setTotalBids(totalBids + 1);
      setTotalPoints(totalPoints + parseInt(points));
      setPana('');
      setPoints('');
    }
  };

  const deleteBid = (id) => {
    const bidToDelete = bids.find(b => b.id === id);
    setBids(bids.filter(b => b.id !== id));
    setTotalBids(totalBids - 1);
    setTotalPoints(totalPoints - parseInt(bidToDelete.point));
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <MarqueeText text={`${gameName} - SINGLE PANA`} style={styles.headerTitle} />
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

        <View style={styles.row}>
          <Text style={styles.label}>Select Game Type:</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)}>
            <Text style={styles.dropdownText}>{selectedGame}</Text>
            <Ionicons name="chevron-down" size={20} color="#F5C542" />
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Enter Single Pana:</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Pana"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={3}
            value={pana}
            onChangeText={setPana}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Enter Points:</Text>
          <TextInput
            style={styles.inputField}
            placeholder="Point"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={points}
            onChangeText={setPoints}
          />
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addBid}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Pana</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Point</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Type</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Delete</Text>
        </View>

        {bids.map((bid) => (
          <View key={bid.id} style={styles.bidRow}>
            <Text style={[styles.bidText, { flex: 1 }]}>{bid.pana}</Text>
            <Text style={[styles.bidText, { flex: 1 }]}>{bid.point}</Text>
            <Text style={[styles.bidText, { flex: 1 }]}>{bid.type}</Text>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center' }}
              onPress={() => deleteBid(bid.id)}
            >
              <Ionicons name="trash" size={20} color="#D32F2F" />
            </TouchableOpacity>
          </View>
        ))}
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
        <TouchableOpacity style={styles.submitButton}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5EDE0' },
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
    backgroundColor: '#C36578',
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
  content: { flex: 1, padding: 15 },
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
    backgroundColor: '#C36578',
    borderColor: '#C36578',
  },
  modeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'RaleighStdDemi',
  },
  modeTextActive: { color: '#fff' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
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
  dropdownText: { fontSize: 14, color: '#000', fontFamily: 'RaleighStdDemi' },
  inputField: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 14,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
  },
  addButton: {
    backgroundColor: '#C36578',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'RaleighStdDemi',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#C36578',
  },
  tableHeaderText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C36578',
    textAlign: 'center',
    fontFamily: 'RaleighStdDemi',
  },
  bidRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  bidText: {
    fontSize: 14,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'RaleighStdDemi',
  },
  bottomBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    flex: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
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
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
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
