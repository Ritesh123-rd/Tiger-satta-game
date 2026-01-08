import React, { useState, useRef, useEffect } from 'react';
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
  Share
} from 'react-native';
import { Ionicons, MaterialCommunityIcons, FontAwesome5, MaterialIcons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8; // 80% screen width

export default function HomeScreen({ navigation }) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [balance, setBalance] = useState(0.0);


  // Animation value for the drawer slide (starts off-screen to the left)
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Games List - Original Data
  const gamesList = [
    { id: 1, name: 'TIME BAZAR', code: '***_**_***', time: '12:50 PM - 01:50 PM', status: 'Close is Running', isOpen: true, initials: 'TI' },
    { id: 2, name: 'KARNATAKA DAY', code: '446-43-247', time: '10:10 AM - 11:10 AM', status: 'Closed for today', isOpen: false, initials: 'KA' },
    { id: 3, name: 'SUN DAY', code: '179-73-139', time: '10:40 AM - 11:44 AM', status: 'Closed for today', isOpen: false, initials: 'SU' },
    { id: 4, name: 'SRIDEVI', code: '250-78-170', time: '11:25 AM - 12:25 PM', status: 'Closed for today', isOpen: false, initials: 'SR' },
    { id: 5, name: 'MADHUR DAY', code: '789-56-234', time: '02:00 PM - 03:00 PM', status: 'Closed for today', isOpen: false, initials: 'MA' },
    { id: 6, name: 'PUNE DAY', code: '785-56-265', time: '02:00 PM - 04:00 PM', status: 'Closed for today', isOpen: false, initials: 'PU' },
  ];

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
            <Ionicons name="wallet" size={18} color="#fff" />
            <Text style={styles.balanceText}>₹ {balance.toFixed(1)}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notification')}>
            <Ionicons name="notifications" size={24} color="#ca1835" style={styles.notificationIcon} />
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
            <Ionicons name="play" size={22} color="#000" />
          </View>
          <Text style={styles.gameButtonText}>PS Starline</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.gameButton}
          onPress={() => navigation.navigate('PSJackpot')}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="play" size={22} color="#000" />
          </View>
          <Text style={styles.gameButtonText}>PS Jackpot</Text>
        </TouchableOpacity>
      </View>

      {/* Action Wrapper Container */}
      <View style={styles.actionWrapper}>
        {/* Contact Buttons */}
        <View style={styles.contactContainer}>
          <TouchableOpacity style={styles.contactButton} onPress={makeCall}>
            <View style={[styles.iconCircle, { backgroundColor: '#007AFF' }]}>
              <Ionicons name="call" size={20} color="#fff" />
            </View>
            <Text style={styles.contactText}>1234567890</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactButtonWhatsapp} onPress={openWhatsApp}>
            <View style={[styles.iconCircle, { backgroundColor: '#25D366' }]}>
              <Ionicons name="logo-whatsapp" size={20} color="#fff" />
            </View>
            <Text style={styles.contactText}>1234567890</Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.addMoneyButton}
            onPress={() => navigation.navigate('AddFund')}
          >
            <View style={styles.iconCircle}>
              <FontAwesome5 name="rupee-sign" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.actionButtonText}>ADD MONEY</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={() => navigation.navigate('WithdrawFund')}
          >
            <View style={styles.iconCircle}>
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
              <Text style={styles.gameName}>{game.name}</Text>
              <Text style={styles.gameCode}>{game.code}</Text>
              <Text style={[styles.gameStatus, { color: game.isOpen ? '#4CAF50' : '#D32F2F' }]}>
                {game.status}
              </Text>
              <Text style={styles.gameTime}>Timing: {game.time}</Text>
            </View>

            <View style={styles.gameActions}>
              <TouchableOpacity style={styles.infoButton}>
                <Ionicons name="information-circle" size={24} color="#FFC107" />
              </TouchableOpacity>
              {game.isOpen ? (
                <View style={styles.playNowBadge}>
                  <Text style={styles.playNowText}>Play Now</Text>
                </View>
              ) : (
                <View style={styles.closedBadge}>
                  <Text style={styles.closedBadgeText}>Closed</Text>
                </View>
              )}
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
          <Ionicons name="newspaper" size={24} color="#700f2b" />
          <Text style={styles.navText}>My Bids</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Passbook')}
        >
          <Ionicons name="book" size={24} color="#700f2b" />
          <Text style={styles.navText}>Passbook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navItem, styles.navItemActive]}>
          <View style={styles.homeCircle}>
            <Ionicons name="home" size={28} color="#fff" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Funds')}
        >
          <Ionicons name="wallet" size={24} color="#700f2b" />
          <Text style={styles.navText}>Funds</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navItem}>
          <Ionicons name="chatbubbles" size={24} color="#700f2b" />
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
                  <Text style={styles.userName}>tom</Text>
                  <Text style={styles.userPhone}>9552115645</Text>
                  <Text style={styles.userSince}>Since 03/01/2026</Text>
                </View>
              </View>
              <TouchableOpacity onPress={closeDrawer} style={styles.closeButton}>
                <Ionicons name="close" size={28} color="#D32F2F" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.menuItems} showsVerticalScrollIndicator={false}>
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
    // backgroundColor: '#ca1835', // Transparent/matching background
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: 45, // Adjusted for status bar
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ca1835', // Pill background color
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    // Shadow for depth
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    marginLeft: 10,
    fontFamily: 'RaleighStdDemi',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ca1835', // Matching pill color
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 25,
    marginRight: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  balanceText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 5,
    fontFamily: 'RaleighStdDemi',
  },
  notificationIcon: {
    marginLeft: 5,
    // color handled in component
  },
  gameButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  gameButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#700f2b', // Dark Brown
    paddingVertical: 8, // Less vertical padding as circle is bigger
    borderRadius: 30, // Full pill
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#000', // Thick black border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 10,
    height: 45,
    paddingHorizontal: 15, // Add horizontal padding for justify
    justifyContent: 'flex-start', // Align start to control spacing
    paddingLeft: 2,
  },
  gameButtonText: {
    color: '#fff',
    fontSize: 18, // Bigger
    marginLeft: 12, // More spacing
    fontFamily: 'RaleighStdDemi',
  },
  actionWrapper: {
    backgroundColor: '#FFEBC8', // Beige container
    marginHorizontal: 15,
    borderRadius: 20,
    paddingVertical: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 6,
  },
  contactContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
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
    borderColor: '#333',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    height: 37,
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
    borderColor: '#333',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    height: 37,
    justifyContent: 'flex-start',
    paddingLeft: 2,
    paddingHorizontal: 15,
  },
  contactText: {
    fontSize: 18, // Bigger
    marginLeft: 12,
    color: '#333',
    fontFamily: 'RaleighStdDemi',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    height: 37,
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    height: 37,
    justifyContent: 'flex-start',
    paddingLeft: 2,
    paddingHorizontal: 15,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16, // Keep 16 or 17
    marginLeft: 10,
    fontFamily: 'RaleighStdDemi',
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6, // Increased from 0.3
    shadowRadius: 5,
    elevation: 8, // Increased elevation
  },
  gamesList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  gameCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  gameIcon: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#ca1835',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameIconText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'RaleighStdDemi',
  },
  gameInfo: {
    flex: 1,
    marginLeft: 12,
  },
  gameName: {
    fontSize: 23,
    color: '#000',
    fontFamily: 'RaleighStdDemi',
  },
  gameCode: {
    fontSize: 23,
    color: '#4CAF50',
    marginTop: 2,
    fontFamily: 'RaleighStdDemi',
  },
  gameStatus: {
    fontSize: 16, // Fixed missing value
    color: '#D32F2F',
    marginTop: 4,
    fontFamily: 'RaleighStdDemi',
  },
  gameTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'RaleighStdDemi',
  },
  gameActions: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoButton: {
    marginBottom: 10,
  },
  closedBadge: {
    backgroundColor: '#D32F2F',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  closedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'RaleighStdDemi',
  },
  playNowBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 15,
  },
  playNowText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'RaleighStdDemi',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemActive: {
    marginTop: -20,
  },
  homeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ca1835',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  navText: {
    fontSize: 11,
    color: '#8B6F7E',
    marginTop: 4,
    fontFamily: 'RaleighStdDemi',
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
    backgroundColor: '#ca1835', // Matching reddish tone
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
    fontFamily: 'RaleighStdDemi',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontFamily: 'RaleighStdDemi',
  },
  userSince: {
    fontSize: 12,
    color: '#719CB0', // Blue-ish tone from screenshot
    marginTop: 2,
    fontFamily: 'RaleighStdDemi',
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
    backgroundColor: '#ca1835', // Reddish/Pink circle
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
    fontFamily: 'RaleighStdDemi',
  },
  versionText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    padding: 20,
    marginBottom: 20,
    fontFamily: 'RaleighStdDemi',
  },
});
