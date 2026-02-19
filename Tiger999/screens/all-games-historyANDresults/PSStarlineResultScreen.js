import React, { useState, useEffect, useCallback } from 'react';
import {
    SafeAreaView,
    StatusBar,
    View,
    Text,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
    Platform,
    StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { starlinegetMarkets, getStarlineResults } from '../../api/auth';

const PSStarlineResultScreen = () => {
    const navigation = useNavigation();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const formatDate = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    };

    const formatDateDisplay = (date) => {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return `${day}/${month}/${year}`;
    };

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);

        const today = new Date();
        today.setHours(23, 59, 59, 999);

        // Prevent future dates
        if (newDate > today) return;

        setSelectedDate(newDate);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Markets
            const marketsRes = await starlinegetMarkets();
            let markets = [];
            if (marketsRes && marketsRes.status === true && marketsRes.data) {
                markets = marketsRes.data;
            } else {
                setLoading(false);
                setHistoryData([]);
                setRefreshing(false);
                return;
            }

            // 2. Fetch Results for each market for the selected date
            const dateStr = formatDate(selectedDate);
            const resultsPromises = markets.map(async (market) => {
                try {
                    const res = await getStarlineResults(market.id, dateStr);
                    let resultValue = "***-*";

                    if (res && res.status === 'success' && res.data && res.data.length > 0) {
                        // STRICTLY find the item belonging to this market ID
                        // The user complained "id ke hisab se result dikhna chahiye"
                        const item = res.data.find(r => String(r.market_id) === String(market.id));

                        if (item && item.open_number && item.last_digit_open) {
                            resultValue = `${item.open_number}-${item.last_digit_open}`;
                        } else if (res.data[0] && String(res.data[0].market_id) === String(market.id)) {
                            // Fallback to first item ONLY if ID matches
                            const first = res.data[0];
                            if (first.open_number && first.last_digit_open) {
                                resultValue = `${first.open_number}-${first.last_digit_open}`;
                            }
                        }
                    }
                    return {
                        id: market.id,
                        time: market.end_time_12 || market.market_name,
                        result: resultValue
                    };
                } catch (e) {
                    return {
                        id: market.id,
                        time: market.end_time_12 || market.market_name,
                        result: "***-*"
                    };
                }
            });

            const resultsData = await Promise.all(resultsPromises);
            setHistoryData(resultsData);

        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [selectedDate]);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Text style={styles.cardTime}>{item.time}</Text>
            <Text style={styles.cardResult}>{item.result}</Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>PS STARLINE RESULT HISTORY</Text>
            </View>

            <View style={styles.dateSelectorContainer}>
                <Text style={styles.selectDateLabel}>Select Date</Text>
                <View style={styles.dateControls}>
                    <TouchableOpacity onPress={() => changeDate(-1)} style={styles.arrowButton}>
                        <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <View style={styles.datePill}>
                        <Text style={styles.dateText}>{formatDateDisplay(selectedDate)}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => changeDate(1)}
                        style={[styles.arrowButton, { opacity: selectedDate.toDateString() === new Date().toDateString() ? 0.3 : 1 }]}
                        disabled={selectedDate.toDateString() === new Date().toDateString()}
                    >
                        <Ionicons name="chevron-forward" size={24} color="#333" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading && !refreshing ? (
                <View style={styles.loaderContainer}>
                    <ActivityIndicator size="large" color="#C36578" />
                </View>
            ) : (
                <FlatList
                    data={historyData}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#C36578"]} />
                    }
                />
            )}
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
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 10,
        paddingBottom: 15,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        marginLeft: 15,
        flex: 1,
    },
    dateSelectorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    selectDateLabel: {
        fontSize: 16,
        color: '#555',
        fontWeight: '500',
    },
    dateControls: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    datePill: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 5,
        elevation: 1,
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
    },
    arrowButton: {
        padding: 5,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2.0,
    },
    cardTime: {
        fontSize: 18,
        fontWeight: '500',
        color: '#C67C8E',
    },
    cardResult: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
});

export default PSStarlineResultScreen;