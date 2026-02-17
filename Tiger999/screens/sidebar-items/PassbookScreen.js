import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFundRequestHistory, getWithdrawRequestHistory } from '../../api/auth';
import { useFocusEffect } from '@react-navigation/native';

export default function PassbookScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      fetchTransactionHistory();
    }, [])
  );

  const fetchTransactionHistory = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      console.log('Passbook: Fetching for userId:', userId);

      if (!userId) {
        console.log('Passbook: No userId found');
        setLoading(false);
        return;
      }

      let combinedHistory = [];

      // Fetch Fund Requests
      try {
        const fundResponse = await getFundRequestHistory(userId);
        console.log('Passbook: Fund Response:', JSON.stringify(fundResponse));
        if (fundResponse && (fundResponse.status === true || fundResponse.status === 'true')) {
          const funds = (fundResponse.data || []).map(item => ({ ...item, type: 'Deposit' }));
          combinedHistory = [...combinedHistory, ...funds];
        }
      } catch (err) {
        console.error('Passbook: Error fetching fund history:', err);
      }

      // Fetch Withdraw Requests
      try {
        const withdrawResponse = await getWithdrawRequestHistory(userId);
        console.log('Passbook: Withdraw Response:', JSON.stringify(withdrawResponse));
        if (withdrawResponse && (withdrawResponse.status === true || withdrawResponse.status === 'true')) {
          const withdraws = (withdrawResponse.data || []).map(item => ({ ...item, type: 'Withdraw' }));
          combinedHistory = [...combinedHistory, ...withdraws];
        }
      } catch (err) {
        console.error('Passbook: Error fetching withdraw history:', err);
      }

      console.log('Passbook: Combined History Length:', combinedHistory.length);

      // Attempt to sort by date and time descending
      combinedHistory.sort((a, b) => {
        // Construct date strings standardly if possible, but APIs often return "DD/MM/YYYY" or "YYYY-MM-DD" or similar
        // Let's rely on ID if date parsing fails or is ambiguous, assuming higher ID = newer

        // Try to create Date objects
        const dateA = new Date(`${a.datee} ${a.timee}`);
        const dateB = new Date(`${b.datee} ${b.timee}`);

        if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
          return dateB - dateA;
        }

        // Fallback to ID sorting
        const idA = parseInt(a.id, 10) || 0;
        const idB = parseInt(b.id, 10) || 0;
        return idB - idA;
      });

      setTransactions(combinedHistory);

    } catch (error) {
      console.error('Passbook: Critical Error fetching transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderTransactionItem = ({ item }) => {
    const isDeposit = item.type === 'Deposit';
    const isApproved = item.request_accecept === 'ACCECEPT';

    // Status color logic
    let statusColor = '#EF6C00'; // Default Orange (Pending)
    let statusBg = '#FFF3E0';

    if (item.request_accecept === 'ACCECEPT') {
      statusColor = '#2E7D32'; // Green
      statusBg = '#E8F5E9';
    } else if (item.request_accecept === 'REJECT') { // Assuming 'REJECT' or similar
      statusColor = '#C62828'; // Red
      statusBg = '#FFEBEE';
    }

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.typeContainer}>
            <View style={[styles.iconBox, { backgroundColor: isDeposit ? '#E8F5E9' : '#FFEBEE' }]}>
              <MaterialCommunityIcons
                name={isDeposit ? "arrow-down-bold" : "arrow-up-bold"}
                size={20}
                color={isDeposit ? "#2E7D32" : "#C62828"}
              />
            </View>
            <View>
              <Text style={styles.typeText}>{isDeposit ? 'Add Fund' : 'Withdrawal'}</Text>
              <Text style={styles.requestId}>ID: #{item.id}</Text>
            </View>
          </View>
          <Text style={[styles.amount, { color: isDeposit ? '#2E7D32' : '#C62828' }]}>
            {isDeposit ? '+' : '-'} ₹{item.request_amount}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardFooter}>
          <View style={styles.dateTime}>
            <Ionicons name="calendar-outline" size={14} color="#666" />
            <Text style={styles.dateText}>{item.datee}</Text>
            <Ionicons name="time-outline" size={14} color="#666" style={{ marginLeft: 8 }} />
            <Text style={styles.dateText}>{item.timee}</Text>
          </View>

          <View style={[styles.statusPill, { backgroundColor: statusBg }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.request_accecept}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Passbook</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={fetchTransactionHistory}>
          <Ionicons name="refresh" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.centerMode}>
            <ActivityIndicator size="large" color="#6B3A3A" />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.centerMode}>
            <MaterialCommunityIcons name="folder-alert-outline" size={80} color="#D4C5A9" />
            <Text style={styles.emptyText}>NO TRANSACTIONS FOUND</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderTransactionItem}
            keyExtractor={(item, index) => item.id ? item.id.toString() + item.type : index.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5EDE0'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingTop: 45,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    fontFamily: 'RaleighStdDemi'
  },
  refreshButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  centerMode: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 15,
    fontFamily: 'RaleighStdDemi',
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  typeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'RaleighStdDemi',
  },
  requestId: {
    fontSize: 12,
    color: '#999',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 13,
    color: '#666',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
