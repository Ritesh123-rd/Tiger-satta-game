import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Switch,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Custom Marquee Component
const MarqueeText = ({ text, style }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [textWidth, setTextWidth] = useState(0);
  const containerWidth = SCREEN_WIDTH - 120;

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

export default function PSJackpotScreen({ navigation }) {
  const [isEnabled, setIsEnabled] = useState(true);
  const [selectedTab, setSelectedTab] = useState('Jodi');
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  // Mock Data matching the screenshot
  const games = [
    { id: 1, time: '10:30 AM', result: '28', status: 'Close for today', isOpen: false },
    { id: 2, time: '11:30 AM', result: '73', status: 'Close for today', isOpen: false },
    { id: 3, time: '12:30 PM', result: '**', status: 'Running Now', isOpen: true },
    { id: 4, time: '01:30 PM', result: '**', status: 'Running Now', isOpen: true },
    { id: 5, time: '02:30 PM', result: '**', status: 'Running Now', isOpen: true },
    { id: 6, time: '03:30 PM', result: '**', status: 'Running Now', isOpen: true },
    { id: 7, time: '04:30 PM', result: '**', status: 'Running Now', isOpen: true },
    { id: 8, time: '05:30 PM', result: '**', status: 'Running Now', isOpen: true },
    { id: 9, time: '06:30 PM', result: '**', status: 'Running Now', isOpen: true },
    { id: 10, time: '07:30 PM', result: '**', status: 'Running Now', isOpen: true },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

      {/* Fixed Header Section */}
      <View style={styles.fixedContent}>
        {/* Header with Back Button, Title, Balance */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <MarqueeText
            text="PS JACKPOT DASHBOARD"
            style={styles.headerTitle}
          />

          <View style={styles.balanceChip}>
            <Ionicons name="wallet-outline" size={16} color="#fff" />
            <Text style={styles.balanceText}>0.0</Text>
          </View>
        </View>

        {/* History & Notification Row */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.historyButton}>
            <Ionicons name="time-outline" size={24} color="#333" />
            <Text style={styles.historyText}>History</Text>
          </TouchableOpacity>

          <View style={styles.notificationContainer}>
            <Text style={styles.notificationText}>Notification</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#1B5E20" }}
              thumbColor={isEnabled ? "#4CAF50" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
              style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
            />
          </View>
        </View>

        {/* Tab Buttons - Jodi / 1-100 */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === 'Jodi' && styles.tabButtonActive
            ]}
            onPress={() => setSelectedTab('Jodi')}
          >
            <Text style={[
              styles.tabButtonText,
              selectedTab === 'Jodi' && styles.tabButtonTextActive
            ]}>Jodi</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === '1-100' && styles.tabButtonActive
            ]}
            onPress={() => setSelectedTab('1-100')}
          >
            <Text style={[
              styles.tabButtonText,
              selectedTab === '1-100' && styles.tabButtonTextActive
            ]}>1-100</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable Game List */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gamesParams}>
          {games.map((game) => (
            <View key={game.id} style={styles.gameCard}>
              {/* Left: Time & Status */}
              <View style={styles.gameInfoLeft}>
                <Text style={styles.gameTime}>{game.time}</Text>
                <Text style={[
                  styles.gameStatus,
                  { color: game.isOpen ? '#4CAF50' : '#D32F2F' }
                ]}>
                  {game.status}
                </Text>
              </View>

              {/* Center: Result Pill */}
              <View style={styles.resultPill}>
                <Text style={styles.resultText}>{game.result}</Text>
              </View>

              {/* Right: Play Button */}
              <TouchableOpacity style={styles.playButton}>
                <View style={styles.playIconCircle}>
                  <Ionicons name="play" size={12} color="#fff" />
                </View>
                <Text style={styles.playButtonText}>Play Game</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Bottom padding for scroll */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EDE0',
  },
  fixedContent: {
    backgroundColor: '#F5EDE0',
    paddingBottom: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
    paddingTop: 50,
    backgroundColor: '#F5EDE0',
  },
  backButton: {
    padding: 0,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 25,
    width: 45,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0E6D8',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'RaleighStdDemi',
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C85C73',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
  },
  balanceText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyText: {
    fontSize: 16,
    color: '#8D8D8D',
    marginLeft: 8,
    fontFamily: 'RaleighStdDemi',
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 16,
    color: '#8D8D8D',
    marginRight: 10,
    fontFamily: 'RaleighStdDemi',
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 15,
  },
  tabButton: {
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 25,
    backgroundColor: '#fff',
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabButtonActive: {
    borderColor: '#C85C73',
  },
  tabButtonText: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'RaleighStdDemi',
    fontWeight: '500',
  },
  tabButtonTextActive: {
    color: '#C85C73',
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
    paddingHorizontal: 15,
  },
  gamesParams: {
    marginTop: 5,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  gameInfoLeft: {
    flex: 1,
  },
  gameTime: {
    fontSize: 20,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
  },
  gameStatus: {
    fontSize: 14,
    marginTop: 4,
    fontFamily: 'RaleighStdDemi',
    fontWeight: '500',
  },
  resultPill: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 10,
    minWidth: 70,
    alignItems: 'center',
  },
  resultText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#A0A0A0',
    borderRadius: 25,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  playIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#C85C73',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  playButtonText: {
    color: '#333',
    fontSize: 13,
    fontFamily: 'RaleighStdDemi',
    fontWeight: '600',
  },
});
