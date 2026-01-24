import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getWalletBalance } from '../../api/auth';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
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


export default function SPDPTPGame({ navigation, route }) {
  const { gameName } = route.params;
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


  const [selectedGame, setSelectedGame] = useState('CLOSE');
  const [date, setDate] = useState('30-12-2025');
  const [sp, setSp] = useState(true);
  const [dp, setDp] = useState(true);
  const [tp, setTp] = useState(true);
  const [digit, setDigit] = useState('');
  const [points, setPoints] = useState('');
  const [bids, setBids] = useState([]);
  const [totalBids, setTotalBids] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);

  const generatePanas = () => {
    if (!digit || !points) {
      alert('Please enter digit and points');
      return;
    }

    const newBids = [];
    const digitNum = parseInt(digit);

    // Generate SP (Single Pana - numbers with digit sum = digitNum)
    if (sp) {
      for (let i = 100; i <= 999; i++) {
        const str = i.toString();
        const sum = parseInt(str[0]) + parseInt(str[1]) + parseInt(str[2]);
        const digits = [parseInt(str[0]), parseInt(str[1]), parseInt(str[2])];
        const uniqueDigits = new Set(digits);

        if (sum % 10 === digitNum && uniqueDigits.size === 3) {
          newBids.push({
            id: Date.now() + i,
            pana: i.toString(),
            point: points,
            type: 'close',
          });
        }
      }
    }

    setBids(newBids);
    setTotalBids(newBids.length);
    setTotalPoints(newBids.length * parseInt(points));
  };

  const deleteBid = (id) => {
    const bidToDelete = bids.find(b => b.id === id);
    setBids(bids.filter(b => b.id !== id));
    setTotalBids(totalBids - 1);
    setTotalPoints(totalPoints - parseInt(bidToDelete.point));
  };

  const handleSubmit = () => {
    if (bids.length > 0) {
      alert(`${bids.length} bids submitted for ${totalPoints} points!`);
      setBids([]);
      setTotalBids(0);
      setTotalPoints(0);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <MarqueeText text={`${gameName} - SP DP TP`} style={styles.headerTitle} />
        <View style={styles.balanceChip}>
          <Ionicons name="wallet" size={16} color="#fff" />
          <Text style={styles.balanceText}>{balance.toFixed(1)}</Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.dateRow}>
          <View style={styles.dateBox}>
            <Ionicons name="calendar" size={20} color="#C36578" />
            <Text style={styles.dateText}>{date}</Text>
          </View>
          <View style={styles.dropdown}>
            <Text style={styles.dropdownText}>{selectedGame}</Text>
            <Ionicons name="chevron-down" size={20} color="#F5C542" />
          </View>
        </View>

        {/* Checkboxes */}
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            style={styles.checkboxItem}
            onPress={() => setSp(!sp)}
          >
            <View style={[styles.checkbox, sp && styles.checkboxChecked]}>
              {sp && <Ionicons name="checkmark" size={18} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>SP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxItem}
            onPress={() => setDp(!dp)}
          >
            <View style={[styles.checkbox, dp && styles.checkboxChecked]}>
              {dp && <Ionicons name="checkmark" size={18} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>DP</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.checkboxItem}
            onPress={() => setTp(!tp)}
          >
            <View style={[styles.checkbox, tp && styles.checkboxChecked]}>
              {tp && <Ionicons name="checkmark" size={18} color="#fff" />}
            </View>
            <Text style={styles.checkboxLabel}>TP</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Enter Digit:</Text>
          <TextInput
            style={styles.inputField}
            placeholder="1"
            placeholderTextColor="#999"
            keyboardType="numeric"
            maxLength={1}
            value={digit}
            onChangeText={setDigit}
          />
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Enter Points:</Text>
          <TextInput
            style={styles.inputField}
            placeholder="10"
            placeholderTextColor="#999"
            keyboardType="numeric"
            value={points}
            onChangeText={setPoints}
          />
        </View>

        <TouchableOpacity style={styles.generateButton} onPress={generatePanas}>
          <Text style={styles.generateButtonText}>Genrate</Text>
        </TouchableOpacity>

        <View style={styles.tableHeader}>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Pana</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Point</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Type</Text>
          <Text style={[styles.tableHeaderText, { flex: 1 }]}>Delete</Text>
        </View>

        {bids.slice(0, 10).map((bid) => (
          <View key={bid.id} style={styles.bidRow}>
            <Text style={[styles.bidText, { flex: 1 }]}>{bid.pana}</Text>
            <Text style={[styles.bidText, { flex: 1 }]}>{bid.point}</Text>
            <Text style={[styles.bidText, { flex: 1 }]}>{bid.type}</Text>
            <TouchableOpacity
              style={{ flex: 1, alignItems: 'center' }}
              onPress={() => deleteBid(bid.id)}
            >
              <Ionicons name="trash" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}

        {bids.length > 10 && (
          <Text style={styles.moreText}>+ {bids.length - 10} more bids...</Text>
        )}
      </ScrollView>

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
          <Text style={styles.submitButtonText}>SUBMIT</Text>
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
  dateText: { fontSize: 14, color: '#000', fontFamily: 'RaleighStdDemi' },
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
  checkboxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 30,
    height: 30,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#000',
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'RaleighStdDemi',
  },
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
  generateButton: {
    backgroundColor: '#C36578',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  generateButtonText: {
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
    backgroundColor: '#F5EDE0',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
    borderRadius: 8,
  },
  bidText: {
    fontSize: 13,
    color: '#000',
    textAlign: 'center',
    fontFamily: 'RaleighStdDemi',
  },
  moreText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666',
    marginTop: 10,
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
});
