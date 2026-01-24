import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    StatusBar,
    ActivityIndicator,
    Alert
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFundRequestHistory } from '../../api/auth';

export default function AddFundHistoryScreen({ navigation }) {
    const [loading, setLoading] = useState(true);
    const [history, setHistory] = useState([]);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'User ID not found');
                return;
            }

            const response = await getFundRequestHistory(userId);
            if (response && (response.status === true || response.status === 'true')) {
                setHistory(response.data || []);
            }
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const renderHistoryItem = (item) => (
        <View key={item.id} style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.amount}>₹ {item.request_amount}</Text>
                <View style={[
                    styles.statusPill,
                    { backgroundColor: item.request_accecept === 'ACCECEPT' ? '#E8F5E9' : '#FFF3E0' }
                ]}>
                    <Text style={[
                        styles.statusText,
                        { color: item.request_accecept === 'ACCECEPT' ? '#2E7D32' : '#EF6C00' }
                    ]}>
                        {item.request_accecept}
                    </Text>
                </View>
            </View>

            <View style={styles.details}>
                <View style={styles.detailRow}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>{item.datee}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Ionicons name="time-outline" size={14} color="#666" />
                    <Text style={styles.detailText}>{item.timee}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Text style={styles.requestId}>Request ID: #{item.id}</Text>
                <Text style={styles.username}>User: {item.username}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#f2e3caff" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={26} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Add Fund History</Text>
                <TouchableOpacity onPress={fetchHistory} style={styles.refreshButton}>
                    <Ionicons name="refresh" size={24} color="#000" />
                </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {loading ? (
                    <View style={styles.centerMode}>
                        <ActivityIndicator size="large" color="#6B3A3A" />
                    </View>
                ) : history.length === 0 ? (
                    <View style={styles.centerMode}>
                        <MaterialCommunityIcons name="folder-outline" size={100} color="#6B3A3A" />
                        <Text style={styles.emptyText}>NO DATA FOUND</Text>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
                        {history.map(renderHistoryItem)}
                    </ScrollView>
                )}
            </View>
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 20,
        justifyContent: 'space-between',
    },
    backButton: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#f2e3caff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
    },
    headerTitle: {
        fontSize: 22,
        color: '#000',
        fontFamily: 'Roboto_700Bold',
        flex: 1,
        marginLeft: 15,
    },
    refreshButton: {
        padding: 10,
    },
    content: {
        flex: 1,
        paddingHorizontal: 15,
    },
    centerMode: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#333',
        marginTop: 15,
        fontFamily: 'Poppins_400Regular',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 10,
    },
    amount: {
        fontSize: 20,
        fontFamily: 'Roboto_700Bold',
        color: '#6B3A3A',
    },
    statusPill: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 12,
        fontFamily: 'Poppins_600SemiBold',
        fontWeight: 'bold',
    },
    details: {
        flexDirection: 'row',
        marginBottom: 10,
        gap: 15,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
    },
    detailText: {
        fontSize: 13,
        color: '#666',
        fontFamily: 'Poppins_400Regular',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 5,
    },
    requestId: {
        fontSize: 11,
        color: '#999',
        fontFamily: 'Poppins_400Regular',
    },
    username: {
        fontSize: 11,
        color: '#999',
        fontFamily: 'Poppins_400Regular',
    },
});
