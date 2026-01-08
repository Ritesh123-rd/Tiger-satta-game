import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Image, StyleSheet, Text } from 'react-native';

// Auth Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// Main Screens
import HomeScreen from './screens/HomeScreen';
import GameDetailScreen from './screens/GameDetailScreen';

// Game Play Screens (from games folder)
import SingleDigitGame from './screens/games/SingleDigitGame';
import SingleDigitBulkGame from './screens/games/SingleDigitBulkGame';
import JodiGame from './screens/games/JodiGame';
import JodiBulkGame from './screens/games/JodiBulkGame';
import SinglePanaGame from './screens/games/SinglePanaGame';
import SinglePanaBulkGame from './screens/games/SinglePanaBulkGame';
import DoublePanaGame from './screens/games/DoublePanaGame';
import DoublePanaBulkGame from './screens/games/DoublePanaBulkGame';
import TriplePanaGame from './screens/games/TriplePanaGame';
import FullSangamGame from './screens/games/FullSangamGame';
import HalfSangamAGame from './screens/games/HalfSangamAGame';
import HalfSangamBGame from './screens/games/HalfSangamBGame';
import PanaFamilyGame from './screens/games/PanaFamilyGame';
import SPDPTPGame from './screens/games/SPDPTPGame';
import TwoDigitPanaGame from './screens/games/TwoDigitPanaGame';
import SPMotorGame from './screens/games/SPMotorGame';
import DPMotorGame from './screens/games/DPMotorGame';
import JodiFamilyGame from './screens/games/JodiFamilyGame';
import RedJodiGame from './screens/games/RedJodiGame';
import OddEvenGame from './screens/games/OddEvenGame';

// Utility Screens
import MyBidsScreen from './screens/MyBidsScreen';
import PassbookScreen from './screens/PassbookScreen';
import FundsScreen from './screens/FundsScreen';
import NotificationScreen from './screens/NotificationScreen';
import SettingsScreen from './screens/SettingsScreen';
import GameRateScreen from './screens/GameRateScreen';
import TimeTableScreen from './screens/TimeTableScreen';
import UpdatePasswordScreen from './screens/UpdatePasswordScreen';
import TransactionHistoryScreen from './screens/TransactionHistoryScreen';
import PSStarlineScreen from './screens/PSStarlineScreen';
import PSJackpotScreen from './screens/PSJackpotScreen';
import AddFundScreen from './screens/AddFundScreen';
import WithdrawFundScreen from './screens/WithdrawFundScreen';
import ChartsScreen from './screens/ChartsScreen';
import NoticeBoardScreen from './screens/NoticeBoardScreen';
import HowToPlayScreen from './screens/HowToPlayScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';

const Stack = createStackNavigator();

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

// Loading Screen Component - Empty (logo is shown by native splash screen)
const LoadingScreen = () => (
  <View style={loadingStyles.container} />
);

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 280,
    height: 280,
  },

});

export default function App() {
  const [loaded, error] = useFonts({
    'RaleighStdDemi': require('./assets/fonts/RaleighStd-Demi.otf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Main Screens */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="GameDetail" component={GameDetailScreen} />

        {/* Game Play Screens */}
        <Stack.Screen name="SingleDigitGame" component={SingleDigitGame} />
        <Stack.Screen name="SingleDigitBulkGame" component={SingleDigitBulkGame} />
        <Stack.Screen name="JodiGame" component={JodiGame} />
        <Stack.Screen name="JodiBulkGame" component={JodiBulkGame} />
        <Stack.Screen name="SinglePanaGame" component={SinglePanaGame} />
        <Stack.Screen name="SinglePanaBulkGame" component={SinglePanaBulkGame} />
        <Stack.Screen name="DoublePanaGame" component={DoublePanaGame} />
        <Stack.Screen name="DoublePanaBulkGame" component={DoublePanaBulkGame} />
        <Stack.Screen name="TriplePanaGame" component={TriplePanaGame} />
        <Stack.Screen name="FullSangamGame" component={FullSangamGame} />
        <Stack.Screen name="HalfSangamAGame" component={HalfSangamAGame} />
        <Stack.Screen name="HalfSangamBGame" component={HalfSangamBGame} />
        <Stack.Screen name="PanaFamilyGame" component={PanaFamilyGame} />
        <Stack.Screen name="SPDPTPGame" component={SPDPTPGame} />
        <Stack.Screen name="TwoDigitPanaGame" component={TwoDigitPanaGame} />
        <Stack.Screen name="SPMotorGame" component={SPMotorGame} />
        <Stack.Screen name="DPMotorGame" component={DPMotorGame} />
        <Stack.Screen name="JodiFamilyGame" component={JodiFamilyGame} />
        <Stack.Screen name="RedJodiGame" component={RedJodiGame} />
        <Stack.Screen name="OddEvenGame" component={OddEvenGame} />

        {/* Utility Screens */}
        <Stack.Screen name="AddFund" component={AddFundScreen} />
        <Stack.Screen name="WithdrawFund" component={WithdrawFundScreen} />
        <Stack.Screen name="MyBids" component={MyBidsScreen} />
        <Stack.Screen name="Passbook" component={PassbookScreen} />
        <Stack.Screen name="Funds" component={FundsScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="GameRate" component={GameRateScreen} />
        <Stack.Screen name="TimeTable" component={TimeTableScreen} />
        <Stack.Screen name="PSStarline" component={PSStarlineScreen} />
        <Stack.Screen name="PSJackpot" component={PSJackpotScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="UpdatePassword" component={UpdatePasswordScreen} />
        <Stack.Screen name="TransactionHistory" component={TransactionHistoryScreen} />
        <Stack.Screen name="Charts" component={ChartsScreen} />
        <Stack.Screen name="NoticeBoard" component={NoticeBoardScreen} />
        <Stack.Screen name="HowToPlay" component={HowToPlayScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
