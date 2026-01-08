import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  DeviceEventEmitter,
  ScrollView,
  StatusBar,
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
  const containerWidth = SCREEN_WIDTH - 120; // Approx width available in header

  useEffect(() => {
    if (textWidth > 0) {
      const startAnimation = () => {
        animatedValue.setValue(containerWidth);
        Animated.loop(
          Animated.timing(animatedValue, {
            toValue: -textWidth,
            duration: 8000, // Adjust speed here
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
        {text}   {text}   {text} {/* Repeat for smooth loop effect */}
      </Animated.Text>
    </View>
  );
};

export default function PSStarlineScreen({ navigation }) {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  // Mock Data mimicking the screenshot
  const games = [
    { id: 1, time: '03:00 PM', result: '228 - 2', status: 'Close for today', isOpen: false },
    { id: 2, time: '04:00 PM', result: '660 - 2', status: 'Close for today', isOpen: false },
    { id: 3, time: '05:00 PM', result: '330 - 6', status: 'Close for today', isOpen: false },
    { id: 4, time: '06:00 PM', result: '590 - 4', status: 'Close for today', isOpen: false },
    { id: 5, time: '07:00 PM', result: '*** _ *', status: 'Running Now', isOpen: true },
    { id: 6, time: '08:00 PM', result: '*** _ *', status: 'Running Now', isOpen: true },
    { id: 7, time: '09:00 PM', result: '*** _ *', status: 'Running Now', isOpen: true },
    { id: 8, time: '10:00 PM', result: '*** _ *', status: 'Running Now', isOpen: true },
    { id: 9, time: '11:00 PM', result: '*** _ *', status: 'Running Now', isOpen: true },
    { id: 10, time: '12:00 PM', result: '*** _ *', status: 'Running Now', isOpen: true },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

      {/* Fixed Header Section (Marquee + Top Controls + Rates) */}
      <View style={styles.fixedContent}>
        {/* Marquee Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <MarqueeText
            text="PS STARLINE DASHBOARD"
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
              trackColor={{ false: "#767577", true: "#1B5E20" }} // Dark green when on
              thumbColor={isEnabled ? "#4CAF50" : "#f4f3f4"}
              ios_backgroundColor="#3e3e3e"
              onValueChange={toggleSwitch}
              value={isEnabled}
              style={{ transform: [{ scaleX: .8 }, { scaleY: .8 }] }}
            />
          </View>
        </View>

        {/* Rate Buttons Grid */}
        <View style={styles.ratesGrid}>
          <View style={styles.rateRow}>
            <View style={styles.rateCard}>
              <Text style={styles.rateTitle}>Single Digit</Text>
              <Text style={styles.rateValue}>1-10</Text>
            </View>
            <View style={styles.rateCard}>
              <Text style={styles.rateTitle}>Double Pana</Text>
              <Text style={styles.rateValue}>1-300</Text>
            </View>
          </View>
          <View style={styles.rateRow}>
            <View style={styles.rateCard}>
              <Text style={styles.rateTitle}>Single Pana</Text>
              <Text style={styles.rateValue}>1-150</Text>
            </View>
            <View style={styles.rateCard}>
              <Text style={styles.rateTitle}>Triple Pana</Text>
              <Text style={styles.rateValue}>1-600</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Scrollable Game List */}
      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.gamesParams}>
          {games.map((game, index) => (
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
                  <Ionicons name="play" size={14} color="#fff" />
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
    backgroundColor: '#F5EDE0', // Beige background
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
    paddingTop: 50, // More top padding for status bar
    backgroundColor: '#F5EDE0',
  },
  backButton: {
    padding: 0,
    borderWidth: 1,
    borderColor: '#D3D3D3',
    borderRadius: 25, // Rounder
    width: 45, // Slightly larger
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0E6D8',
  },
  headerTitle: {
    fontSize: 20, // Larger title
    fontFamily: 'RaleighStdDemi',
    color: '#000',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C85C73', // Matches the maroon/pinkish color in image
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
  scrollContent: {
    flex: 1,
    paddingHorizontal: 15,
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
    color: '#8D8D8D', // Lighter grey
    marginLeft: 8,
    fontFamily: 'RaleighStdDemi',
  },
  notificationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationText: {
    fontSize: 16,
    color: '#8D8D8D', // Lighter grey
    marginRight: 10,
    fontFamily: 'RaleighStdDemi',
  },
  ratesGrid: {
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  rateCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15, // Taller cards
    paddingHorizontal: 15,
    borderRadius: 15,
    marginHorizontal: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  rateTitle: {
    fontSize: 15,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
    fontWeight: '600',
  },
  rateValue: {
    fontSize: 15,
    color: '#D84B65', // Pinkish Red match
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
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
    paddingVertical: 18, // More padding
    paddingHorizontal: 15,
    marginBottom: 15,
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
    fontSize: 20, // Bigger time
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
    minWidth: 100, // Wider pill
    alignItems: 'center',
  },
  resultText: {
    color: '#fff',
    fontSize: 20, // Bigger result text
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
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#C85C73', // Match theme
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  playButtonText: {
    color: '#333',
    fontSize: 14,
    fontFamily: 'RaleighStdDemi',
    fontWeight: '600',
  },
});
