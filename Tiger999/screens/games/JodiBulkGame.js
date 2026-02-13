import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getWalletBalance } from '../../api/auth';
import { API_BASE_URL } from '../../api/config';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput, FlatList, Alert, StatusBar, Animated, Easing, Dimensions, Modal, ActivityIndicator, ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomAlert from '../../components/CustomAlert';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

const MarqueeText = ({ text, style }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [textWidth, setTextWidth] = useState(0);
    const containerWidth = SCREEN_WIDTH - 140;

    useEffect(() => {
        if (textWidth > 0) {
            animatedValue.setValue(containerWidth);
            Animated.loop(Animated.timing(animatedValue, { toValue: -textWidth, duration: 8000, easing: Easing.linear, useNativeDriver: true })).start();
        }
    }, [textWidth, containerWidth]);

    return (
        <View style={{ width: containerWidth, overflow: 'hidden', alignItems: 'center' }}>
            <Animated.Text onLayout={(e) => setTextWidth(e.nativeEvent.layout.width)} style={[style, { transform: [{ translateX: animatedValue }] }]} numberOfLines={1}>
                {text}   {text}   {text}
            </Animated.Text>
        </View>
    );
};

export default function JodiBulkGame({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const { gameName, gameId } = route.params || { gameName: 'JODI BULK' };
    const [balance, setBalance] = useState(0.0);

    // Inputs
    const [points, setPoints] = useState('');
    const [jodiDigit, setJodiDigit] = useState('');

    const [bids, setBids] = useState([]);
    const [totalBids, setTotalBids] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        title: '',
        message: '',
        type: 'success',
        onClose: null
    });


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

    useFocusEffect(
        useCallback(() => {
            fetchBalance();
        }, [])
    );

    useEffect(() => {
        setTotalBids(bids.length);
        setTotalPoints(bids.reduce((sum, bid) => sum + parseInt(bid.points || 0), 0));
    }, [bids]);

    const handleAddBid = () => {
        if (!points || parseInt(points) <= 0) {
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Please enter valid points',
                type: 'error'
            });
            return;
        }

        if (!jodiDigit || jodiDigit.length !== 2) {
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Please enter a valid 2-digit Jodi',
                type: 'error'
            });
            return;
        }


        const newBid = {
            id: Date.now().toString() + Math.random().toString(),
            jodi: jodiDigit,
            points: points,
            type: 'open' // Keeping 'open' as standard or derived? Image shows type 'open'.
        };

        setBids(prev => [...prev, newBid]);
        // Reset only Jodi Digit usually, or both? 
        // User pattern: usually points stay same, digit changes, OR digit stays same.
        // Let's reset Jodi digit to allow quick next entry.
        setJodiDigit('');
    };

    const handleDeleteBid = (bidId) => setBids(prev => prev.filter(bid => bid.id !== bidId));

    const handleSubmit = () => {
        if (bids.length === 0) {
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Please add at least one bid',
                type: 'error'
            });
            return;
        }
        if (totalPoints > balance) {
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Insufficient balance',
                type: 'error'
            });
            return;
        }

        setShowConfirmModal(true);
    };

    const handleFinalSubmit = async () => {
        setSubmitting(true);
        try {
            const token = await AsyncStorage.getItem('user_token');
            const bidsPayload = bids.map(b => ({
                game_id: gameId,
                game_type: 'OPEN', // Defaulting to OPEN based on image 'type: open'
                digit: b.jodi,
                points: b.points,
                type: 'jodi'
            }));

            const response = await fetch(`${API_BASE_URL}/place-bid-bulk`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ bids: bidsPayload })
            });

            const data = await response.json();
            if (data.status === 'success') {
                setShowConfirmModal(false);
                setAlertConfig({
                    visible: true,
                    title: 'Success',
                    message: 'Bids placed successfully!',
                    type: 'success',
                    onClose: () => {
                        setBids([]);
                        setPoints('');
                        setJodiDigit('');
                        fetchBalance();
                        navigation.goBack();
                    }
                });

            } else {
                setAlertConfig({
                    visible: true,
                    title: 'Error',
                    message: data.message || 'Failed to place bids',
                    type: 'error'
                });
            }

        } catch (error) {
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Network request failed',
                type: 'error'
            });
        } finally {

            setSubmitting(false);
        }
    };

    const renderBidItem = ({ item }) => (
        <View style={styles.bidRow}>
            <Text style={styles.bidCell}>{item.jodi}</Text>
            <Text style={styles.bidCell}>{item.points}</Text>
            <Text style={styles.bidCell}>{item.type}</Text>
            <TouchableOpacity onPress={() => handleDeleteBid(item.id)} style={styles.deleteBtn}>
                <View style={styles.deleteIconContainer}><Ionicons name="trash-outline" size={16} color="#fff" /></View>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#000" /></TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>{gameName || 'SRIDEVI NIGHT'} - JODI</Text>
                </View>
                <View style={styles.balanceChip}><Ionicons name="wallet-outline" size={18} color="#fff" /><Text style={styles.balanceText}>{balance.toFixed(1)}</Text></View>
            </View>

            <View style={styles.content}>

                {/* Points Input First */}
                <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Enter Points:</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="2121"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={points}
                        onChangeText={setPoints}
                    />
                </View>

                {/* Jodi Digit Input Second */}
                <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Enter Jodi Digit:</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Jodi"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        maxLength={2}
                        value={jodiDigit}
                        onChangeText={(text) => {
                            setJodiDigit(text);
                            if (text.length === 2) {
                                if (!points || parseInt(points) <= 0) {
                                    setAlertConfig({
                                        visible: true,
                                        title: 'Error',
                                        message: 'Please enter valid points first',
                                        type: 'error'
                                    });
                                    setJodiDigit('');
                                    return;
                                }


                                const newBid = {
                                    id: Date.now().toString() + Math.random().toString(),
                                    jodi: text,
                                    points: points,
                                    type: 'open'
                                };

                                setBids(prev => [newBid, ...prev]);
                                setTimeout(() => setJodiDigit(''), 50);
                            }
                        }}
                    />
                </View>

                {/* Add Button - Kept as fallback or remove? User didn't say remove, just 'auto add'. */}
                {/* Visual design had Add button, keeping it for manual triggers if needed or just visual balance. */}
                <TouchableOpacity style={styles.addButton} onPress={handleAddBid}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>

                {/* List Header */}
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Jodi</Text>
                    <Text style={styles.tableHeaderText}>Point</Text>
                    <Text style={styles.tableHeaderText}>Type</Text>
                    <Text style={styles.tableHeaderText}>Delete</Text>
                </View>

                <FlatList
                    data={bids}
                    renderItem={renderBidItem}
                    keyExtractor={item => item.id}
                    style={styles.bidsList}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            </View>

            <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 15), height: 75 + insets.bottom }]}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}><Text style={styles.statLabel}>Bids</Text><Text style={styles.statValue}>{totalBids}</Text></View>
                    <View style={styles.statItem}><Text style={styles.statLabel}>Points</Text><Text style={styles.statValue}>{totalPoints}</Text></View>
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}><Text style={styles.submitButtonText}>Submit</Text></TouchableOpacity>
            </View>

            {/* Confirmation Modal */}
            <Modal visible={showConfirmModal} transparent={true} animationType="slide" onRequestClose={() => setShowConfirmModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Confirm Bids</Text>
                        <View style={styles.modalListHeader}>
                            <Text style={[styles.modalListHeaderText, { flex: 1 }]}>Jodi</Text>
                            <Text style={[styles.modalListHeaderText, { flex: 1 }]}>Points</Text>
                            <Text style={[styles.modalListHeaderText, { flex: 1 }]}>Type</Text>
                        </View>
                        <ScrollView style={{ maxHeight: 200 }}>
                            {bids.map((bid) => (
                                <View key={bid.id} style={styles.modalListItem}>
                                    <Text style={[styles.modalListItemText, { flex: 1 }]}>{bid.jodi}</Text>
                                    <Text style={[styles.modalListItemText, { flex: 1 }]}>{bid.points}</Text>
                                    <Text style={[styles.modalListItemText, { flex: 1 }]}>{bid.type}</Text>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={styles.modalSummary}>
                            <Text style={styles.modalSummaryText}>Total Bids: {totalBids}</Text>
                            <Text style={styles.modalSummaryText}>Total Points: {totalPoints}</Text>
                        </View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setShowConfirmModal(false)}>
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={handleFinalSubmit} disabled={submitting}>
                                {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalButtonText}>Final Submit</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <CustomAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => {
                    setAlertConfig({ ...alertConfig, visible: false });
                    if (alertConfig.onClose) alertConfig.onClose();
                }}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F5EDE0' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, paddingTop: 45 },
    backButton: { padding: 5, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 20 },
    headerTitleContainer: { flex: 1, alignItems: 'center' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', fontFamily: 'RaleighStdDemi', textTransform: 'uppercase' },
    balanceChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C36578', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, gap: 5 },
    balanceText: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
    content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },

    // Inputs
    inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, justifyContent: 'space-between' },
    inputLabel: { fontSize: 16, color: '#333', flex: 1, fontFamily: 'RaleighStdDemi' },
    textInput: {
        flex: 1.2,
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 25,
        fontSize: 16,
        color: '#333',
        fontFamily: 'RaleighStdDemi',
        borderWidth: 1,
        borderColor: '#ddd',
        textAlign: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 }
    },

    addButton: {
        backgroundColor: '#C36578',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 20,
        elevation: 3
    },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },

    tableHeader: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 5, borderBottomWidth: 2, borderBottomColor: '#C36578', marginBottom: 5 },
    tableHeaderText: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#C36578', fontFamily: 'RaleighStdDemi' },
    bidsList: { flex: 1 },
    bidRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, marginBottom: 8, backgroundColor: '#fff', borderRadius: 25, borderWidth: 1, borderColor: '#eee', elevation: 1 },
    bidCell: { flex: 1, textAlign: 'center', fontSize: 14, color: '#333', fontFamily: 'RaleighStdDemi' },
    deleteBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    deleteIconContainer: { padding: 6, backgroundColor: '#C36578', borderRadius: 15 },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#EBDCCB',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#DCC3B0',
        justifyContent: 'space-between'
    },
    statsContainer: { flexDirection: 'row', gap: 20 },
    statItem: { alignItems: 'center' },
    statLabel: { fontSize: 12, color: '#555', fontFamily: 'RaleighStdDemi' },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#000', fontFamily: 'RaleighStdDemi' },
    submitButton: { backgroundColor: '#C36578', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 10, elevation: 2 },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },

    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { width: '90%', backgroundColor: '#fff', borderRadius: 15, padding: 20, maxHeight: '80%' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#C36578', textAlign: 'center', marginBottom: 15, fontFamily: 'RaleighStdDemi' },
    modalListHeader: { flexDirection: 'row', backgroundColor: '#F5EDE0', padding: 10, borderRadius: 8, marginBottom: 5 },
    modalListHeaderText: { fontWeight: 'bold', fontSize: 14, color: '#333', textAlign: 'center', fontFamily: 'RaleighStdDemi' },
    modalListItem: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    modalListItemText: { fontSize: 14, color: '#555', textAlign: 'center', fontFamily: 'RaleighStdDemi' },
    modalSummary: { marginTop: 15, alignItems: 'flex-end', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
    modalSummaryText: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 5, fontFamily: 'RaleighStdDemi' },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, gap: 15 },
    modalButton: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    cancelButton: { backgroundColor: '#999' },
    confirmButton: { backgroundColor: '#C36578' },
    modalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16, fontFamily: 'RaleighStdDemi' }
});
