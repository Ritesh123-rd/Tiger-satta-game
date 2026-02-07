import React, { useState, useRef, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getWalletBalance, getDateTime, getMarkets } from '../api/auth';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  StatusBar,
  Linking,
  Animated,
  Dimensions,
  Easing,
  SafeAreaView,
  Share,
  Image
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8; // 80% screen width
//home
export default function HomeScreen({ navigation }) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [balance, setBalance] = useState(0.0);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [serverTime, setServerTime] = useState({
    date: '',
    time: '',
    day: ''
  });
  const [userData, setUserData] = useState({
    name: '',
    phone: '',
    date: ''
  });

  const [gamesList, setGamesList] = useState([]);

  const fetchBalance = async () => {
    console.log('HomeScreen: fetchBalance started');
    try {
      // Fetch Server Time
      console.log('HomeScreen: Fetching server time...');
      const timeData = await getDateTime();
      console.log('HomeScreen: Server time response:', timeData);
      if (timeData && timeData.status === true) {
        setServerTime({
          date: timeData.date,
          time: timeData.time_12,
          day: timeData.day
        });
      }

      const mobile = await AsyncStorage.getItem('userMobile');
      const name = await AsyncStorage.getItem('userName');
      const date = await AsyncStorage.getItem('userDate');
      const userId = await AsyncStorage.getItem('userId');

      setUserData(prev => ({
        ...prev,
        name: name || 'User',
        phone: mobile || '',
        date: date || '03/01/2026'
      }));

      console.log('HomeScreen: Stored mobile:', mobile, 'userId:', userId);
      if (mobile && userId) {
        const response = await getWalletBalance(mobile, userId);
        console.log('HomeScreen: Balance response:', response);
        if (response && (response.status === true || response.status === 'true')) {
          const newBalance = parseFloat(response.balance);
          console.log('HomeScreen: Setting balance to:', newBalance);
          setBalance(newBalance);
        } else {
          console.log('HomeScreen: Balance status not true');
        }
      } else {
        console.log('HomeScreen: No mobile number or user ID found');
      }

      // Fetch Markets
      console.log('HomeScreen: Fetching markets...');
      const marketResponse = await getMarkets();
      console.log('HomeScreen: Market response count:', marketResponse?.data?.length);

      if (marketResponse && marketResponse.status === true && marketResponse.data) {
        const currentTime = new Date();
        const serverDateStr = timeData?.date || currentTime.toISOString().split('T')[0];

        const transformedMarkets = marketResponse.data.map(market => {
          // Logic for isOpen: end_time - 30 minutes
          // end_time is in "HH:mm" format (e.g., "22:30")
          const [endH, endM] = market.end_time.split(':').map(Number);
          const marketEndDate = new Date(serverDateStr);
          marketEndDate.setHours(endH, endM, 0);

          const closeDate = new Date(marketEndDate.getTime() - 30 * 60000); // 30 mins before

          const isCurrentlyOpen = currentTime < closeDate && market.market_status === "1";

          return {
            id: market.id,
            name: market.market_name,
            code: '***-**-***', // Placeholder as per user request to keep details same as before
            time: `${market.start_time_12} - ${market.end_time_12}`,
            status: isCurrentlyOpen ? 'Market is Running' : 'Closed for today',
            isOpen: isCurrentlyOpen,
            initials: market.market_name.substring(0, 2).toUpperCase()
          };
        });

        // Sort: Play Now (Open) first, then Closed
        const sortedMarkets = transformedMarkets.sort((a, b) => {
          if (a.isOpen === b.isOpen) return 0;
          return a.isOpen ? -1 : 1;
        });

        setGamesList(sortedMarkets);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBalance();
    }, [])
  );


  // Animation value for the drawer slide (starts off-screen to the left)
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const makeCall = () => {
    Linking.openURL('tel:919922222222');
  };

  const openWhatsApp = () => {
    Linking.openURL('whatsapp://send?phone=919922222222');
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Download TIGER 999 App - Best Satta Matka App! Download now: https://play.google.com/store/apps/details?id=com.tiger999',
        title: 'TIGER 999',
      });
    } catch (error) {
      console.log('Error sharing:', error);
    }
  };

  const openDrawer = () => {
    setDrawerVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeDrawer = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 250,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setDrawerVisible(false);
    });
  };

  const MenuIcon = ({ name, type = 'Ionicons' }) => {
    const iconStyle = { marginRight: 0 };
    if (type === 'MaterialCommunityIcons') return <MaterialCommunityIcons name={name} size={22} color="#fff" style={iconStyle} />;
    if (type === 'FontAwesome5') return <FontAwesome5 name={name} size={18} color="#fff" style={iconStyle} />;
    if (type === 'MaterialIcons') return <MaterialIcons name={name} size={22} color="#fff" style={iconStyle} />;
    return <Ionicons name={name} size={22} color="#fff" style={iconStyle} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#fff" />
          <Text style={styles.headerTitle}>TIGER 999</Text>
        </TouchableOpacity>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => navigation.navigate('AddFund')} style={styles.balanceChip}>
            <Text style={styles.rupeeSymbol}>₹</Text>
            <Text style={styles.balanceText}>{balance.toFixed(1)}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
            <Ionicons name="notifications" size={24} color="#C36578" style={styles.notificationIcon} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Game Buttons */}
      <View style={styles.gameButtonsContainer}>
        <TouchableOpacity
          style={styles.gameButton}
          onPress={() => navigation.navigate('PSStarline')}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons name="play-arrow" size={26} color="#000" />
          </View>
          <Text style={styles.gameButtonText}>PS Starline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gameButton}
          onPress={() => navigation.navigate('PSJackpot')}
        >
          <View style={styles.iconCircle}>
            <MaterialIcons name="play-arrow" size={26} color="#000" />
          </View>
          <Text style={styles.gameButtonText}>PS Jackpot</Text>
        </TouchableOpacity>
      </View>

      {/* Action Wrapper Container */}
      <View style={styles.actionWrapper}>
        {/* Contact Buttons */}
        <View style={styles.contactContainer}>
          <TouchableOpacity style={styles.contactButton} onPress={makeCall}>
            <Image source={require('../assets/Home-Banner/call.png')} style={styles.contactIcon} />
            <Text style={styles.contactText}>1234567890</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButtonWhatsapp} onPress={openWhatsApp}>
            <Image source={require('../assets/Home-Banner/iwp.png')} style={styles.contactIcon} />
            <Text style={styles.contactText}>1234567890</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.addMoneyButton}
            onPress={() => navigation.navigate('AddFund')}
          >
            <View style={styles.actionIconCircle}>
              <FontAwesome5 name="rupee-sign" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.actionButtonText}>ADD MONEY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => navigation.navigate('WithdrawFund')}
          >
            <View style={styles.actionIconCircle}>
              <Ionicons name="cash-outline" size={22} color="#D32F2F" />
            </View>
            <Text style={styles.actionButtonText}>WITHDRAW</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Games List */}
      <ScrollView style={styles.gamesList}>
        {gamesList.map((game) => (
          <TouchableOpacity
            key={game.id}
            style={styles.gameCard}
            onPress={() => {
              if (game.isOpen) {
                navigation.navigate('GameDetail', {
                  gameName: game.name,
                  gameCode: game.code
                });
              }
            }}
            activeOpacity={game.isOpen ? 0.7 : 1}
          >
            <View style={styles.gameIcon}>
              <Text style={styles.gameIconText}>{game.name.substring(0, 2)}</Text>
            </View>

            <View style={styles.gameInfo}>
              <Text style={styles.gameName} numberOfLines={1} adjustsFontSizeToFit>{game.name}</Text>
              <Text style={styles.gameCode}>{game.code}</Text>
              <Text style={[styles.gameStatus, { color: game.isOpen ? '#4CAF50' : '#D32F2F' }]}>
                {game.status}
              </Text>
              <Text style={styles.gameTime}>Timing: {game.time}</Text>
            </View>

            <View style={styles.gameActions}>
              {game.isOpen ? (
                <View style={styles.playNowBadge}>
                  <Text style={styles.playNowText}>Play Now</Text>
                </View>
              ) : (
                <View style={styles.closedBadge}>
                  <Text style={styles.closedBadgeText}>Closed</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.infoButton}
                onPress={() => {
                  setSelectedGame(game);
                  setInfoModalVisible(true);
                }}
              >
                <Ionicons name="information-circle" size={24} color="#FFC107" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('MyBids')}
        >
          <Image source={require('../assets/footer-icons/bids_new.png')} style={[styles.navIcon, { tintColor: '#000' }]} />
          <Text style={styles.navText}>My Bids</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Passbook')}
        >
          <Image source={require('../assets/footer-icons/passbook.png')} style={[styles.navIcon, { tintColor: '#000' }]} />
          <Text style={styles.navText}>Passbook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <View style={styles.homeCircle}>
            <Image source={require('../assets/footer-icons/home.png')} style={styles.homeIcon} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Funds')}
        >
          <Image source={require('../assets/footer-icons/bank2.png')} style={[styles.navIcon, { tintColor: '#000' }]} />
          <Text style={styles.navText}>Funds</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Image source={require('../assets/footer-icons/chat_new.png')} style={[styles.navIcon, { tintColor: '#000' }]} />
          <Text style={styles.navText}>Support</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Animated Drawer */}
      <Modal
        animationType="none" // We handle animation manually
        transparent={true}
        visible={drawerVisible}
        onRequestClose={closeDrawer}
      >
        <View style={styles.drawerContainer}>
          {/* Overlay - Fade In/Out */}
          <Animated.View style={[styles.drawerOverlay, { opacity: fadeAnim }]}>
            <TouchableOpacity
              style={{ flex: 1 }}
              activeOpacity={1}
              onPress={closeDrawer}
            />
          </Animated.View>

          {/* Drawer Content - Slide In/Out */}
          <Animated.View style={[styles.drawerContent, { transform: [{ translateX: slideAnim }] }]}>

            {/* Header Section */}
            <View style={styles.drawerHeader}>
              <View style={styles.drawerHeaderContent}>
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={35} color="#fff" />
                </View>
                <View style={styles.userInfoText}>
                  <Text style={styles.userName}>{userData.name}</Text>
                  <Text style={styles.userPhone}>{userData.phone}</Text>
                  <Text style={styles.userSince}>Since {userData.date}</Text>
                </View>
              </View>
              <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#D32F2F" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
              {/* Menu Item - Home */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); }}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#C36578' }]}>
                  <MenuIcon name="home" />
                </View>
                <Text style={styles.menuText}>Home</Text>
              </TouchableOpacity>

              {/* Menu Item - My Profile */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('MyProfile'); }}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#C36578' }]}>
                  <MenuIcon name="person" />
                </View>
                <Text style={styles.menuText}>My Profile</Text>
              </TouchableOpacity>

              {/* Menu Item - Add Money */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('AddFund'); }}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#C36578' }]}>
                  <MenuIcon name="currency-inr" type="MaterialCommunityIcons" />
                </View>
                <Text style={styles.menuText}>Add Money</Text>
              </TouchableOpacity>

              {/* Menu Item - Withdraw Money */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('WithdrawFund'); }}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#C36578' }]}>
                  <MenuIcon name="cash-remove" type="MaterialCommunityIcons" />
                </View>
                <Text style={styles.menuText}>Withdraw Money</Text>
              </TouchableOpacity>

              {/* Menu Item - My Bids */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('MyBids'); }}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#C36578' }]}>
                  <MenuIcon name="history" type="MaterialCommunityIcons" />
                </View>
                <Text style={styles.menuText}>My Bids</Text>
              </TouchableOpacity>

              {/* Menu Item - Passbook */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('Passbook'); }}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#C36578' }]}>
                  <MenuIcon name="swap-horizontal" type="MaterialCommunityIcons" />
                </View>
                <Text style={styles.menuText}>Passbook</Text>
              </TouchableOpacity>

              {/* Menu Item - Funds */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('Funds'); }}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#C36578' }]}>
                  <MenuIcon name="account-balance" type="MaterialIcons" />
                </View>
                <Text style={styles.menuText}>Funds</Text>
              </TouchableOpacity>

              {/* Menu Item - Notification */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('Notification'); }}
              >
                <View style={styles.menuIconContainer}>
                  <MenuIcon name="notifications" />
                </View>
                <Text style={styles.menuText}>Notification</Text>
              </TouchableOpacity>

              {/* Menu Item - Charts */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('Charts'); }}
              >
                <View style={styles.menuIconContainer}>
                  <MenuIcon name="bar-chart" />
                </View>
                <Text style={styles.menuText}>Charts</Text>
              </TouchableOpacity>

              {/* Menu Item - Game Rate */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('GameRate'); }}
              >
                <View style={styles.menuIconContainer}>
                  <MenuIcon name="attach-money" type="MaterialIcons" />
                </View>
                <Text style={styles.menuText}>Game Rate</Text>
              </TouchableOpacity>

              {/* Menu Item - Time Table */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('TimeTable'); }}
              >
                <View style={styles.menuIconContainer}>
                  <MenuIcon name="timer-outline" type="MaterialCommunityIcons" />
                </View>
                <Text style={styles.menuText}>Time Table</Text>
              </TouchableOpacity>

              {/* Menu Item - Notice board / Rules */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('NoticeBoard'); }}
              >
                <View style={styles.menuIconContainer}>
                  <MenuIcon name="clipboard-list" type="FontAwesome5" />
                </View>
                <Text style={styles.menuText}>Notice board / Rules</Text>
              </TouchableOpacity>

              {/* Menu Item - Settings */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('Settings'); }}
              >
                <View style={styles.menuIconContainer}>
                  <MenuIcon name="settings-sharp" />
                </View>
                <Text style={styles.menuText}>Settings</Text>
              </TouchableOpacity>

              {/* Menu Item - How to Play */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('HowToPlay'); }}
              >
                <View style={styles.menuIconContainer}>
                  <MenuIcon name="play-circle" type="FontAwesome5" />
                </View>
                <Text style={styles.menuText}>How to Play</Text>
              </TouchableOpacity>

              {/* Menu Item - Change Password */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); navigation.navigate('ChangePassword'); }}
              >
                <View style={styles.menuIconContainer}>
                  <MenuIcon name="key" />
                </View>
                <Text style={styles.menuText}>Change Password</Text>
              </TouchableOpacity>

              {/* Menu Item - Share App */}
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => { closeDrawer(); shareApp(); }}
              >
                <View style={styles.menuIconContainer}>
                  <MenuIcon name="share-social" />
                </View>
                <Text style={styles.menuText}>Share App</Text>
              </TouchableOpacity>

              {/* Menu Item - Logout */}
              <TouchableOpacity style={styles.menuItem} onPress={() => { closeDrawer(); navigation.navigate('Login'); }}>
                <View style={styles.menuIconContainer}>
                  <MenuIcon name="log-out-outline" />
                </View>
                <Text style={styles.menuText}>Logout</Text>
              </TouchableOpacity>

              <Text style={styles.versionText}>Version: 1.0.1</Text>
            </ScrollView>
          </Animated.View>
        </View>
      </Modal>

      {/* Game Info Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={infoModalVisible}
        onRequestClose={() => setInfoModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.infoModalOverlay}
          activeOpacity={1}
          onPress={() => setInfoModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={styles.infoModalContent}
            onPress={() => { }}
          >
            {selectedGame && (
              <>
                <View style={styles.infoModalHeader}>
                  <Text style={styles.infoModalTitle}>{selectedGame.name}</Text>
                  <TouchableOpacity onPress={() => setInfoModalVisible(false)} style={styles.infoModalClose}>
                    <Ionicons name="close-circle" size={28} color="#ddd" />
                  </TouchableOpacity>
                </View>

                {/* Open Bid Time */}
                <View style={styles.timeRow}>
                  <View style={styles.timeLabelContainer}>
                    <Ionicons name="time-outline" size={22} color="#C36578" style={styles.timeIcon} />
                    <Text style={styles.timeLabel}>Open Bid Time</Text>
                  </View>
                  <Text style={styles.timeValue}>
                    {selectedGame.time ? selectedGame.time.split(' - ')[0] : '--:--'}
                  </Text>
                </View>

                {/* Close Bid Time */}
                <View style={styles.timeRow}>
                  <View style={styles.timeLabelContainer}>
                    <Ionicons name="time-outline" size={22} color="#C36578" style={styles.timeIcon} />
                    <Text style={styles.timeLabel}>Close Bid Time</Text>
                  </View>
                  <Text style={styles.timeValue}>
                    {selectedGame.time ? selectedGame.time.split(' - ')[1] : '--:--'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.infoModalOkButton}
                  onPress={() => setInfoModalVisible(false)}
                >
                  <Text style={styles.infoModalOkText}>OK</Text>
                </TouchableOpacity>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2e3caff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // backgroundColor: '#C36578', // Transparent/matching background
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: 45, // Adjusted for status bar
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C36578',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    shadowRadius: 8,
    elevation: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
    fontFamily: 'Roboto_700Bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C36578',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 8,
    elevation: 12,
  },
  rupeeSymbol: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Roboto_700Bold',
    marginRight: 6,
  },
  balanceText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto_700Bold',
    letterSpacing: 1,
  },
  notificationIcon: {
    marginLeft: 5,
    // color handled in component
  },
  gameButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -3,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  gameButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6B3A3A',
    paddingVertical: 8,
    borderRadius: 30,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#000',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 18,
    height: 45,
    paddingHorizontal: 15,
    justifyContent: 'flex-start',
    paddingLeft: 2,
  },
  gameButtonText: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 12,
    fontFamily: 'Raleway_600SemiBold',
  },
  actionWrapper: {
    backgroundColor: '#f8daa7ff',
    marginHorizontal: 10,
    borderRadius: 12,
    paddingVertical: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 24,
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: -5,
    marginBottom: 10,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 30,
    marginRight: 7,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 24,
    height: 40,
    justifyContent: 'flex-start',
    paddingLeft: 2,
    paddingHorizontal: 15,
  },
  contactButtonWhatsapp: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderRadius: 30,
    marginLeft: 7,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 24,
    height: 40,
    justifyContent: 'flex-start',
    paddingLeft: 2,
    paddingHorizontal: 15,
  },
  contactText: {
    fontSize: 16,
    marginLeft: 12,
    color: '#333',
    fontFamily: 'Poppins_400Regular',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: -5,
    // marginBottom removed as it's inside wrapper
  },
  addMoneyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    borderRadius: 30,
    marginRight: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 24,
    height: 40,
    justifyContent: 'flex-start',
    paddingLeft: 2,
    paddingHorizontal: 15,
  },
  withdrawButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    paddingVertical: 8,
    borderRadius: 30,
    marginLeft: 7,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 18,
    height: 40,
    justifyContent: 'flex-start',
    paddingLeft: 2,
    paddingHorizontal: 15,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16, // Keep 16 or 17
    marginLeft: 10,
    fontFamily: 'Roboto_700Bold',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 12,
  },
  contactIcon: {
    width: 34,
    height: 34,
    resizeMode: 'contain',
  },
  actionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  gamesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  gameCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.08)',
  },
  gameIcon: {
    width: 55,
    height: 55,
    borderRadius: 12,
    backgroundColor: '#C36578',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameIconText: {
    color: '#fff',
    fontSize: 28,
    fontFamily: 'Poppins_500Medium',
  },
  gameInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gameName: {
    fontSize: 22,
    color: '#000',
    fontFamily: 'Poppins_600SemiBold',
  },
  gameCode: {
    fontSize: 20,
    color: '#4CAF50',
    marginTop: -3,
    fontFamily: 'Poppins_500Medium',
  },
  gameStatus: {
    fontSize: 14,
    color: '#D32F2F',
    marginTop: 4,
    fontFamily: 'Poppins_500Medium',
  },
  gameTime: {
    fontSize: 12,
    color: '#000000ff',
    marginTop: 2,
    fontFamily: 'Poppins_500Medium',
  },
  gameActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoButton: {
    marginTop: 10,
  },
  closedBadge: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 25,
  },
  closedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Roboto_700Bold',
  },
  playNowBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 25,
  },
  playNowText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Roboto_700Bold',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    // Home stays inside footer now
  },
  homeCircle: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#C36578',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 15,
  },
  navText: {
    fontSize: 11,
    color: '#555',
    marginTop: 4,
    fontFamily: 'sans-serif',
  },
  navIcon: {
    width: 35,
    height: 35,
    resizeMode: 'contain',
  },
  homeIcon: {
    width: 30,
    height: 30,
    resizeMode: 'contain',
    tintColor: '#fff',
  },
  // Game Info Modal Styles
  infoModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoModalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    elevation: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  infoModalHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  infoModalTitle: {
    fontSize: 20,
    fontFamily: 'Roboto_700Bold',
    color: '#000',
    textAlign: 'center',
  },
  infoModalClose: {
    position: 'absolute',
    right: 0,
    top: -5,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#C36578',
    borderRadius: 12, // Increased radius for pill shape
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  timeLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    marginRight: 10,
  },
  timeLabel: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Poppins_500Medium',
  },
  timeValue: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Poppins_400Regular',
  },
  infoModalOkButton: {
    backgroundColor: '#C36578',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  infoModalOkText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Roboto_700Bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    padding: 20,
    marginBottom: 20,
    fontFamily: 'Roboto_700Bold',
  },
  // DRAWER STYLES
  drawerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: '100%',
    height: '100%',
  },
  drawerContent: {
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 45,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: '#fff', // Or keep transparent if you want
  },
  drawerHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C36578', // Matching reddish tone
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfoText: {
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    color: '#333',
    fontFamily: 'Roboto_700Bold',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontFamily: 'Roboto_700Bold',
  },
  userSince: {
    fontSize: 12,
    color: '#719CB0', // Blue-ish tone from screenshot
    marginTop: 2,
    fontFamily: 'Roboto_700Bold',
  },
  closeButton: {
    padding: 5,
    marginTop: 0,
  },
  menuItems: {
    flex: 1,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#C36578', // Reddish/Pink circle
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    // Add shadow
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5, // Even deeper
    },
    shadowOpacity: 0.6, // Stronger opacity
    shadowRadius: 6,
    elevation: 10, // Higher elevation
  },
  menuText: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'Roboto_700Bold',
  },
});
