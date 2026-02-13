
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Switch,
  ActivityIndicator,
  Image,
  SafeAreaView
} from 'react-native';

import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getWalletBalance, starlinegetMarkets, getStarlineResults, gamerates } from '../../api/auth';

const PSStarlineScreen = ({ navigation }) => {
  const [balance, setBalance] = useState(0.0);
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [rates, setRates] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const mobile = await AsyncStorage.getItem('userMobile');
      const userId = await AsyncStorage.getItem('userId');

      if (mobile && userId) {
        // Fetch Balance
        const balanceRes = await getWalletBalance(mobile, userId);
        if (balanceRes && (balanceRes.status === true || balanceRes.status === 'true')) {
          setBalance(parseFloat(balanceRes.balance));
        }

        // Fetch Starline Markets
        const marketRes = await starlinegetMarkets();
        if (marketRes && marketRes.status === true && marketRes.data) {
          const marketsWithResults = await Promise.all(marketRes.data.map(async (market) => {
            try {
              const resultRes = await getStarlineResults(market.id);
              let resultStr = "*** - *";
              if (resultRes && resultRes.status === "success" && resultRes.data && resultRes.data.length > 0) {
                const latestResult = resultRes.data[0];
                if (latestResult.open_number !== "-" && latestResult.last_digit_open !== "-") {
                  resultStr = `${latestResult.open_number} - ${latestResult.last_digit_open}`;
                }
              }
              return { ...market, resultStr };
            } catch (e) {
              return { ...market, resultStr: "*** - *" };
            }
          }));
          setMarkets(marketsWithResults);
        }

        // Fetch Game Rates
        if (marketRes.data && marketRes.data.length > 0) {
          try {
            const ratesRes = await gamerates(marketRes.data[0].id);
            if (ratesRes) {
              // Handle nested data or direct object
              if (ratesRes.status === true && ratesRes.data) {
                setRates(Array.isArray(ratesRes.data) ? ratesRes.data[0] : ratesRes.data);
              } else {
                setRates(ratesRes);
              }
            }
          } catch (e) {
            console.error('Error fetching game rates:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching starline data:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  const toggleNotification = () => setIsNotificationEnabled(previousState => !previousState);

  const safeRate = (value, defaultMultiplier = 10, fallback = "0") => {
    const num = parseInt(value);
    if (isNaN(num)) return `10/${defaultMultiplier * 10}`;
    return `10/${num * 10}`;
  };

  const renderGameRateCard = (title, rate) => (
    <View style={styles.rateCard}>
      <Text style={styles.rateTitle}>{title}</Text>
      <Text style={styles.rateValue}>{rate}</Text>
    </View>
  );

  const isMarketOpen = (market) => {
    if (market.market_status !== "1") return false;

    try {
      const [hours, minutes] = market.end_time.split(':').map(Number);
      const now = new Date();
      const endTime = new Date();
      endTime.setHours(hours, minutes, 0, 0);

      // Calculate difference in minutes
      const diffInMinutes = (endTime.getTime() - now.getTime()) / (1000 * 60);

      // Close 15 minutes before the end_time
      if (diffInMinutes <= 15) {
        return false;
      }
      return true;
    } catch (e) {
      return market.market_status === "1";
    }
  };

  const renderMarketCard = (market) => {
    const isActuallyOpen = isMarketOpen(market);
    const statusText = isActuallyOpen ? "Running Now" : "Close for today";
    const statusColor = isActuallyOpen ? "#4CAF50" : "#D32F2F";
    const marketTime = market.end_time_12 || market.market_name;

    return (
      <View key={market.id} style={styles.marketCard}>
        <View style={styles.marketInfo}>
          <Text style={styles.marketTime}>{marketTime}</Text>
          <Text style={[styles.marketStatus, { color: statusColor }]}>{statusText}</Text>
        </View>

        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>{market.resultStr}</Text>
        </View>

        <TouchableOpacity
          style={[styles.playButton, !isActuallyOpen && styles.playButtonDisabled]}
          onPress={() => {
            if (isActuallyOpen) {
              console.log('PSStarlineScreen: Navigating to Detail with ID:', market.id, 'Name:', market.market_name, 'Time:', market.end_time_12);
              navigation.navigate('StarlineGameDetail', {
                gameName: market.market_name,
                gameId: market.id,
                gameCode: market.api_game_id,
                sessionTime: market.end_time_12
              });
            }
          }}
        >
          <Ionicons name="play-circle" size={24} color={isActuallyOpen ? "#C36578" : "#999"} />
          <Text style={[styles.playButtonText, { color: isActuallyOpen ? "#333" : "#999" }]}>Play Game</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>PS STARLINE DASHBOARD</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balanceIcon}>₹</Text>
          <Text style={styles.balanceText}>{balance.toFixed(1)}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.historyButton}>
            <MaterialIcons name="history" size={24} color="#333" />
            <Text style={styles.controlText}>History</Text>
          </TouchableOpacity>
          <View style={styles.notificationControl}>
            <Text style={styles.controlText}>Notification</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#2E5B3D" }}
              thumbColor={isNotificationEnabled ? "#fff" : "#f4f3f4"}
              onValueChange={toggleNotification}
              value={isNotificationEnabled}
              style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
            />
          </View>
        </View>

        <View style={styles.rateGrid}>
          <View style={styles.rateRow}>
            {renderGameRateCard("Single Digit", rates ? safeRate(rates.single_digit, 10) : "10/100")}
            {renderGameRateCard("Double Pana", rates ? safeRate(rates.double_panna, 300) : "10/3000")}
          </View>
          <View style={styles.rateRow}>
            {renderGameRateCard("Single Pana", rates ? safeRate(rates.single_panna, 150) : "10/1500")}
            {renderGameRateCard("Triple Pana", rates ? safeRate(rates.tripple_panna, 1000) : "10/10000")}
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#C36578" style={{ marginTop: 50 }} />
        ) : (
          markets.map(renderMarketCard)
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

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
    paddingTop: 45,
    paddingBottom: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    elevation: 2,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    color: '#000',
  },
  balancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C85C73',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 25,
    minWidth: 75,
    justifyContent: 'center',
  },
  balanceIcon: {
    color: '#fff',
    marginRight: 4,
    fontWeight: 'bold',
  },
  balanceText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginVertical: 10,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlText: {
    fontSize: 16,
    color: '#8D8D8D',
    marginLeft: 8,
  },
  rateGrid: {
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  rateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rateCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 12,
    margin: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rateTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  rateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#C85C73',
  },
  marketCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 12,
    borderRadius: 18,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  marketInfo: {
    flex: 1,
  },
  marketTime: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#000',
  },
  marketStatus: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
  },
  resultContainer: {
    backgroundColor: '#000',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 25,
    marginHorizontal: 8,
    minWidth: 90,
    alignItems: 'center',
  },
  resultText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#A0A0A0',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  playButtonDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#eee',
  },
  playButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  }
});

export default PSStarlineScreen;
