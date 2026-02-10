import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getWalletBalance, placeFullSangamBet, getMarkets } from '../../../api/auth';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Alert, Modal, Dimensions, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

const MarqueeText = ({ text, style }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [textWidth, setTextWidth] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        if (textWidth > 0 && containerWidth > 0) {
            animatedValue.setValue(containerWidth);
            Animated.loop(
                Animated.timing(animatedValue, {
                    toValue: -textWidth,
                    duration: 8000,
                    easing: Easing.linear,
                    useNativeDriver: true
                })
            ).start();
        }
    }, [textWidth, containerWidth]);

    return (
        <View
            style={{ flex: 1, overflow: 'hidden', alignItems: 'center', marginHorizontal: 10 }}
            onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
        >
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

export default function FullSangamGame({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const { gameName, marketId, marketName, isOpenAvailable = true, isCloseAvailable = true } = route.params || { gameName: 'FULL SANGAM' };

    const [balance, setBalance] = useState(0.0);
    const [currentMarketId, setCurrentMarketId] = useState(marketId);
    const [selectedGameType, setSelectedGameType] = useState('OPEN');
    const [showDropdown, setShowDropdown] = useState(false);
    const [openPana, setOpenPana] = useState('');
    const [closePana, setClosePana] = useState('');
    const [points, setPoints] = useState('');
    const [bids, setBids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const fetchBalance = async () => {
        try {
            const mobile = await AsyncStorage.getItem('userMobile');
            const userId = await AsyncStorage.getItem('userId');
            if (mobile && userId) {
                const response = await getWalletBalance(mobile, userId);
                if (response && (response.status === true || response.status === 'true')) {
                    setBalance(parseFloat(response.balance));
                }
            }
        } catch (error) {
            console.error('Error fetching balance:', error);
        }
    };

    const fetchMarkets = async () => {
        try {
            const response = await getMarkets();
            if (response && (response.status === true || response.status === 'true')) {
                const searchName = (marketName || gameName).trim().toUpperCase();
                const currentMarket = response.data.find(m =>
                    m.market_name.trim().toUpperCase() === searchName ||
                    m.market_name.trim().toUpperCase() === gameName.trim().toUpperCase()
                );

                if (currentMarket) {
                    setCurrentMarketId(currentMarket.id);
                    console.log('Market fetched and updated for FullSangam:', currentMarket.id, currentMarket.market_name);
                }
            }
        } catch (error) {
            console.error('Error fetching markets:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchBalance();
            fetchMarkets();
        }, [])
    );

    const gameOptions = [
        ...(isOpenAvailable ? ['OPEN'] : []),
        ...(isCloseAvailable ? ['CLOSE'] : [])
    ];

    useEffect(() => {
        if (gameOptions.length > 0 && !gameOptions.includes(selectedGameType)) {
            setSelectedGameType(gameOptions[0]);
        }
    }, [gameOptions]);

    const handleAddBid = () => {
        if (!openPana || openPana.length !== 3) {
            Alert.alert('Error', 'Please enter valid Open Pana (3 digits)');
            return;
        }
        if (!closePana || closePana.length !== 3) {
            Alert.alert('Error', 'Please enter valid Close Pana (3 digits)');
            return;
        }
        if (!points || parseInt(points) <= 0) {
            Alert.alert('Error', 'Please enter valid points');
            return;
        }

        const newBid = {
            id: Date.now().toString(),
            display: `${openPana} - ${closePana}`,
            type: "Full Sangam",
            openPana: openPana,
            closePana: closePana,
            points: parseInt(points),
            session: selectedGameType
        };

        setBids([newBid, ...bids]);
        setOpenPana('');
        setClosePana('');
        setPoints('');
    };

    const handleDeleteBid = (id) => {
        setBids(bids.filter(bid => bid.id !== id));
    };

    const totalBidsCount = bids.length;
    const totalPointsSum = bids.reduce((sum, bid) => sum + bid.points, 0);

    const handleSubmit = () => {
        if (bids.length === 0) {
            Alert.alert('Error', 'Please add at least one bid');
            return;
        }
        if (!currentMarketId) {
            Alert.alert('Error', 'Market ID missing. Please go back and try again.');
            return;
        }
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = async () => {
        setLoading(true);
        setShowConfirmModal(false);

        try {
            const userId = await AsyncStorage.getItem('userId');
            const username = await AsyncStorage.getItem('userName') || await AsyncStorage.getItem('userMobile');

            if (!userId) {
                Alert.alert('Error', 'User ID not found. Please login again.');
                setLoading(false);
                return;
            }

            // Prepare formatted bids according to user's JSON example
            const formattedBids = bids.map(bid => ({
                display: bid.display,
                type: bid.type,
                openPana: bid.openPana,
                closePana: bid.closePana,
                points: bid.points
            }));

            const response = await placeFullSangamBet(
                userId,
                username,
                formattedBids,
                marketName || gameName,
                String(currentMarketId),
                totalPointsSum,
                selectedGameType // open_closed
            );

            if (response && (response.status === true || response.status === 'true' || response.status === 'success')) {
                fetchBalance();
                setBids([]);
                Alert.alert('Success', `${totalBidsCount} bids placed successfully!`, [{ text: 'OK' }]);
            } else {
                Alert.alert('Error', response?.message || 'Failed to place bets. Please try again.');
            }
        } catch (error) {
            console.error('Error in handleConfirmSubmit:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getCurrentDate = () => {
        const date = new Date();
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 15) }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <MarqueeText text={`${gameName} - FULL SANGAM`} style={styles.headerTitle} />
                <View style={styles.balanceChip}>
                    <Ionicons name="wallet-outline" size={16} color="#fff" />
                    <Text style={styles.balanceText}>{balance.toFixed(1)}</Text>
                </View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                <View style={styles.topRow}>
                    <View style={styles.datePickerBtn}>
                        <Ionicons name="calendar-outline" size={18} color="#C36578" />
                        <Text style={styles.dateText}>{getCurrentDate()}</Text>
                    </View>
                    <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)}>
                        <Text style={styles.dropdownText}>{selectedGameType}</Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* Input Fields */}
                <View style={styles.inputCard}>
                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Enter Open Pana:</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Pana"
                            placeholderTextColor="#999"
                            keyboardType="number-pad"
                            maxLength={3}
                            value={openPana}
                            onChangeText={setOpenPana}
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Enter Close Pana:</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Pana"
                            placeholderTextColor="#999"
                            keyboardType="number-pad"
                            maxLength={3}
                            value={closePana}
                            onChangeText={setClosePana}
                        />
                    </View>

                    <View style={styles.inputRow}>
                        <Text style={styles.inputLabel}>Enter Points:</Text>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Points"
                            placeholderTextColor="#999"
                            keyboardType="number-pad"
                            value={points}
                            onChangeText={setPoints}
                        />
                    </View>

                    <TouchableOpacity style={styles.addButton} onPress={handleAddBid}>
                        <Text style={styles.addButtonText}>ADD BID</Text>
                    </TouchableOpacity>
                </View>

                {/* Bids List */}
                {bids.length > 0 && (
                    <View style={styles.tableContainer}>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.headerText, { flex: 2 }]}>Sangam</Text>
                            <Text style={[styles.headerText, { flex: 1 }]}>Points</Text>
                            <Text style={[styles.headerText, { flex: 0.5 }]}></Text>
                        </View>
                        {bids.map((item) => (
                            <View key={item.id} style={styles.bidRow}>
                                <Text style={[styles.bidCell, { flex: 2 }]}>{item.display}</Text>
                                <Text style={[styles.bidCell, { flex: 1 }]}>{item.points}</Text>
                                <TouchableOpacity onPress={() => handleDeleteBid(item.id)} style={styles.deleteBtn}>
                                    <Ionicons name="trash-outline" size={20} color="#C36578" />
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 15), height: 75 + insets.bottom }]}>
                <View style={styles.totalSection}>
                    <View style={styles.totalItem}>
                        <Text style={styles.totalLabel}>Bids</Text>
                        <Text style={styles.totalValue}>{totalBidsCount}</Text>
                    </View>
                    <View style={styles.totalItem}>
                        <Text style={styles.totalLabel}>Points</Text>
                        <Text style={styles.totalValue}>{totalPointsSum}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>SUBMIT</Text>
                </TouchableOpacity>
            </View>

            {/* Confirmation Modal */}
            <Modal visible={showConfirmModal} transparent={true} animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModal}>
                        <Text style={styles.confirmTitle}>Confirm Submission</Text>
                        <Text style={styles.confirmSubtitle}>Total Bids: {totalBidsCount} | Total Points: {totalPointsSum}</Text>

                        <ScrollView style={styles.confirmList}>
                            <View style={styles.confirmTableHeader}>
                                <Text style={[styles.confirmHeaderText, { flex: 2 }]}>Sangam</Text>
                                <Text style={[styles.confirmHeaderText, { flex: 1 }]}>Point</Text>
                                <Text style={[styles.confirmHeaderText, { flex: 1 }]}>Session</Text>
                            </View>
                            {bids.map((bid) => (
                                <View key={bid.id} style={styles.confirmRow}>
                                    <Text style={[styles.confirmCell, { flex: 2 }]}>{bid.display}</Text>
                                    <Text style={[styles.confirmCell, { flex: 1 }]}>{bid.points}</Text>
                                    <Text style={[styles.confirmCell, { flex: 1 }]}>{bid.session}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.confirmButtons}>
                            <TouchableOpacity style={[styles.confirmButton, styles.cancelButton]} onPress={() => setShowConfirmModal(false)}>
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.confirmButton, styles.confirmSubmitButton]} onPress={handleConfirmSubmit} disabled={loading}>
                                <Text style={styles.confirmSubmitButtonText}>{loading ? 'Processing...' : 'Confirm'}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Dropdown Modal */}
            <Modal visible={showDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowDropdown(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDropdown(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Game Type</Text>
                        {gameOptions.map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.modalOption, selectedGameType === type && styles.modalOptionSelected]}
                                onPress={() => {
                                    setSelectedGameType(type);
                                    setShowDropdown(false);
                                }}
                            >
                                <Text style={[styles.modalOptionText, selectedGameType === type && styles.modalOptionTextSelected]}>{type}</Text>
                                {selectedGameType === type && <Ionicons name="checkmark-circle" size={22} color="#2E4A3E" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5EDE0' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F5EDE0' },
    backButton: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: '#D0D0D0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' },
    headerTitle: { fontSize: 16, fontWeight: '700', color: '#000', textTransform: 'uppercase' },
    balanceChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C36578', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
    balanceText: { color: '#fff', fontSize: 14, fontWeight: '700' },
    content: { flex: 1, paddingHorizontal: 16, paddingTop: 16 },
    topRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    datePickerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 30, gap: 8 },
    dateText: { fontSize: 14, color: '#000', fontWeight: '500' },
    dropdown: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 30 },
    dropdownText: { fontSize: 14, color: '#000', fontWeight: '500' },
    inputCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, marginBottom: 20, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
    inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, justifyContent: 'space-between' },
    inputLabel: { fontSize: 14, color: '#333', fontWeight: '600', flex: 1 },
    textInput: { backgroundColor: '#F9F9F9', borderBottomWidth: 2, borderBottomColor: '#C36578', paddingHorizontal: 15, paddingVertical: 8, fontSize: 16, color: '#000', fontWeight: '700', flex: 1, textAlign: 'center' },
    addButton: { backgroundColor: '#C36578', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    addButtonText: { color: '#fff', fontSize: 14, fontWeight: '700', letterSpacing: 1 },
    tableContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 10, marginBottom: 20 },
    tableHeader: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', marginBottom: 5 },
    headerText: { fontSize: 14, fontWeight: '700', color: '#666', textAlign: 'center' },
    bidRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    bidCell: { fontSize: 14, color: '#333', fontWeight: '600', textAlign: 'center' },
    deleteBtn: { flex: 0.5, alignItems: 'center' },
    bottomBar: { flexDirection: 'row', backgroundColor: '#F5EDE0', paddingHorizontal: 16, paddingVertical: 15, borderTopWidth: 2, borderTopColor: '#C36578', alignItems: 'center', gap: 12, position: 'absolute', bottom: 0, left: 0, right: 0 },
    totalSection: { flexDirection: 'row', flex: 1, gap: 20 },
    totalItem: { alignItems: 'center', flex: 1 },
    totalLabel: { fontSize: 14, color: '#666', marginBottom: 4, fontWeight: '500' },
    totalValue: { fontSize: 22, fontWeight: '700', color: '#000' },
    submitButton: { backgroundColor: '#C36578', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 12, alignItems: 'center', minWidth: 140 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    confirmModal: { backgroundColor: '#fff', borderRadius: 20, padding: 20, width: SCREEN_WIDTH * 0.9, maxHeight: '80%' },
    confirmTitle: { fontSize: 20, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 8 },
    confirmSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16, fontWeight: '500' },
    confirmList: { maxHeight: 300, marginBottom: 16 },
    confirmTableHeader: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: '#C36578', marginBottom: 8 },
    confirmHeaderText: { fontSize: 14, fontWeight: '600', color: '#C36578', textAlign: 'center' },
    confirmRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#E8E8E8' },
    confirmCell: { fontSize: 14, color: '#000', textAlign: 'center', fontWeight: '500' },
    confirmButtons: { flexDirection: 'row', gap: 12 },
    confirmButton: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
    cancelButton: { backgroundColor: '#E8E8E8' },
    cancelButtonText: { color: '#666', fontSize: 16, fontWeight: '600' },
    confirmSubmitButton: { backgroundColor: '#C36578' },
    confirmSubmitButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 24, paddingHorizontal: 20, width: SCREEN_WIDTH * 0.8, maxWidth: 320 },
    modalTitle: { fontSize: 18, fontWeight: '700', color: '#333', textAlign: 'center', marginBottom: 20 },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, marginBottom: 12, backgroundColor: '#F5EDE0', borderWidth: 2, borderColor: '#E8E8E8' },
    modalOptionSelected: { backgroundColor: '#E8F5E9', borderColor: '#2E4A3E' },
    modalOptionText: { fontSize: 16, fontWeight: '600', color: '#333' },
    modalOptionTextSelected: { color: '#2E4A3E' }
});
