import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MyBidsScreen({ navigation }) {
  const bidOptions = [
    {
      id: 1,
      title: 'Bid History',
      subtitle: 'You can view your market bid history',
      icon: 'calendar'
    },
    {
      id: 2,
      title: 'Game Results',
      subtitle: 'You can view your market result history',
      icon: 'refresh'
    },
    {
      id: 3,
      title: 'PS Starline Bid History',
      subtitle: 'You can view starline history',
      icon: 'game-controller'
    },
    {
      id: 4,
      title: 'PS Starline Result History',
      subtitle: 'You can view starline result',
      icon: 'trophy'
    },
    {
      id: 5,
      title: 'PS Jackpot Bid History',
      subtitle: 'You can view Jackpot history',
      icon: 'game-controller'
    },
    {
      id: 6,
      title: 'PS Jackpot Result History',
      subtitle: 'You can view Jackpot result',
      icon: 'trophy'
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Bids</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        {bidOptions.map((option) => (
          <TouchableOpacity key={option.id} style={styles.optionCard}>
            <View style={styles.iconContainer}>
              <Ionicons name={option.icon} size={28} color="#fff" />
            </View>
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>{option.title}</Text>
              <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#D4B5A5" />
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    backgroundColor: '#F5EDE0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'RaleighStdDemi',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#5D3A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 5,
    fontFamily: 'RaleighStdDemi',
  },
  optionSubtitle: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'RaleighStdDemi',
  },
});
