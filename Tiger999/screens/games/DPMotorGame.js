import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getWalletBalance } from '../../api/auth';
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Alert, Modal, Dimensions, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

export default function DPMotorGame({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [balance, setBalance] = useState(0.0);

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


    const { gameName } = route.params || { gameName: 'DP MOTOR' };
    const [selectedGameType, setSelectedGameType] = useState('OPEN');
    const [showDropdown, setShowDropdown] = useState(false);
    const [digit, setDigit] = useState('');
    const [points, setPoints] = useState('');
    const [bids, setBids] = useState([]);
    const [totalBids, setTotalBids] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showDigitError, setShowDigitError] = useState(false);
    const [showPointsError, setShowPointsError] = useState(false);

    const getCurrentDate = () => {
        const date = new Date();
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    const generatePanas = () => {
        const uniqueDigits = [...new Set(digit.split(''))];
        if (uniqueDigits.length < 4 || uniqueDigits.length > 10) {
            setShowDigitError(true);
            return;
        }
        setShowDigitError(false);

        const pointsNum = parseInt(points);
        if (!points || pointsNum < 5 || pointsNum > 10000) {
            setShowPointsError(true);
            return;
        }
        setShowPointsError(false);

        const newBidsArray = [];
        for (let i = 0; i < uniqueDigits.length; i++) {
            for (let j = 0; j < uniqueDigits.length; j++) {
                if (i !== j) {
                    const d1 = uniqueDigits[i];
                    const d2 = uniqueDigits[j];
                    const p = [d1, d1, d2].sort().join('');
                    if (!newBidsArray.some(b => b.pana === p)) {
                        newBidsArray.push({
                            id: `dp-${p}-${Date.now()}-${newBidsArray.length}`,
                            pana: p,
                            point: pointsNum,
                            type: selectedGameType,
                        });
                    }
                }
            }
        }

        const updatedBids = [...bids, ...newBidsArray];
        setBids(updatedBids);
        setTotalBids(updatedBids.length);
        setTotalPoints(updatedBids.reduce((sum, b) => sum + parseInt(b.point), 0));
        // Digit and points should not clear as per user request
    };

    const deleteBid = (id) => {
        const updatedBids = bids.filter(bid => bid.id !== id);
        setBids(updatedBids);
        setTotalBids(updatedBids.length);
        setTotalPoints(updatedBids.reduce((sum, b) => sum + parseInt(b.point), 0));
    };

    const handleSubmit = () => {
        if (bids.length > 0) {
            setShowConfirmModal(true);
        } else {
            alert('No bids to submit. Please generate bids first.');
        }
    };

    const confirmSubmit = () => {
        setBids([]);
        setTotalBids(0);
        setTotalPoints(0);
        setDigit('');
        setPoints('');
        setShowConfirmModal(false);
        alert('Bids submitted successfully!');
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color="#000" /></TouchableOpacity>
                <MarqueeText text={`${gameName} - DP MOTOR`} style={styles.headerTitle} />
                <View style={styles.balanceChip}><Ionicons name="wallet-outline" size={14} color="#fff" /><Text style={styles.balanceText}>{balance.toFixed(1)}</Text></View>
            </View>

            <View style={styles.content}>
                <View style={styles.topRow}>
                    <View style={styles.datePickerBtn}><Ionicons name="calendar-outline" size={16} color="#C36578" /><Text style={styles.dateText}>{getCurrentDate()}</Text></View>
                    <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)}>
                        <Text style={styles.dropdownText}>{selectedGameType}</Text>
                        <Ionicons name="chevron-down" size={18} color="#B8860B" />
                    </TouchableOpacity>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Enter Digit:</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.inputField}
                            placeholder="Number"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            maxLength={10}
                            value={digit}
                            onChangeText={(text) => {
                                const cleanText = text.replace(/[^0-9]/g, '');
                                const uniqueText = [...new Set(cleanText.split(''))].join('');
                                setDigit(uniqueText);
                                if (showDigitError) setShowDigitError(false);
                            }}
                        />
                        {showDigitError && (
                            <>
                                <View style={styles.warningIconContainer}>
                                    <Ionicons name="information-circle" size={20} color="#ff0000" />
                                </View>
                                <View style={styles.tooltipContainer}>
                                    <View style={styles.tooltipBubble}>
                                        <Text style={styles.tooltipText}>Not Valid Pana</Text>
                                    </View>
                                    <View style={styles.tooltipArrow} />
                                </View>
                            </>
                        )}
                    </View>
                </View>

                <View style={styles.row}>
                    <Text style={styles.label}>Enter Points:</Text>
                    <View style={styles.inputContainer}>
                        <TextInput
                            style={styles.inputField}
                            placeholder="Point"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={points}
                            onChangeText={(text) => {
                                const val = parseInt(text);
                                if (val > 10000) {
                                    setPoints('10000');
                                } else {
                                    setPoints(text);
                                }
                                if (showPointsError) setShowPointsError(false);
                            }}
                        />
                        {showPointsError && (
                            <>
                                <View style={styles.warningIconContainer}>
                                    <Ionicons name="information-circle" size={20} color="#ff0000" />
                                </View>
                                <View style={styles.tooltipContainer}>
                                    <View style={styles.tooltipBubble}>
                                        <Text style={styles.tooltipText}>min amount 5</Text>
                                    </View>
                                    <View style={styles.tooltipArrow} />
                                </View>
                            </>
                        )}
                    </View>
                </View>

                <TouchableOpacity style={styles.addBtn} onPress={generatePanas}><Text style={styles.addBtnText}>Add</Text></TouchableOpacity>

                <View style={styles.tableHeader}>
                    <Text style={styles.headerText}>Pana</Text>
                    <Text style={styles.headerText}>Point</Text>
                    <Text style={styles.headerText}>Type</Text>
                    <Text style={styles.headerText}>Delete</Text>
                </View>

                <ScrollView style={styles.bidsScrollContainer} showsVerticalScrollIndicator={false}>
                    {bids.map((item) => (
                        <View key={item.id} style={styles.bidCard}>
                            <Text style={styles.bidCardText}>{item.pana}</Text>
                            <Text style={styles.bidCardText}>{item.point}</Text>
                            <Text style={styles.bidCardText}>{item.type}</Text>
                            <TouchableOpacity onPress={() => deleteBid(item.id)} style={styles.deleteBtn}>
                                <Ionicons name="trash-outline" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            </View>

            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 15), height: 75 + insets.bottom }]}>
                <View style={styles.totalInfo}>
                    <Text style={styles.totalLabel}>Bids</Text>
                    <Text style={styles.totalValue}>{totalBids}</Text>
                </View>
                <View style={styles.totalInfo}>
                    <Text style={styles.totalLabel}>Points</Text>
                    <Text style={styles.totalValue}>{totalPoints}</Text>
                </View>
                <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                    <Text style={styles.submitBtnText}>SUBMIT</Text>
                </TouchableOpacity>
            </View>

            <Modal
                animationType="fade"
                transparent={true}
                visible={showConfirmModal}
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalConfirmTitle}>Confirm Your Bids</Text>
                        <View style={styles.confirmHeader}>
                            <Text style={styles.confirmHeaderText}>Jodi</Text>
                            <Text style={styles.confirmHeaderText}>Points</Text>
                            <Text style={styles.confirmHeaderText}>Type</Text>
                        </View>
                        <ScrollView style={styles.reviewList}>
                            {bids.map((bid) => (
                                <View key={bid.id} style={styles.reviewRow}>
                                    <Text style={styles.reviewText}>{bid.pana}</Text>
                                    <Text style={styles.reviewText}>{bid.point}</Text>
                                    <Text style={styles.reviewText}>{bid.type}</Text>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={styles.modalTotalSection}>
                            <Text style={styles.modalTotalLabel}>Total Bids: {totalBids}</Text>
                            <Text style={styles.modalTotalLabel}>Total Points: {totalPoints}</Text>
                        </View>
                        <View style={styles.modalActionButtons}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowConfirmModal(false)}>
                                <Text style={styles.btnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmBtn} onPress={confirmSubmit}>
                                <Text style={styles.btnText}>Confirm Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowDropdown(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDropdown(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Game Type</Text>
                        {['OPEN', 'CLOSE'].map(type => (
                            <TouchableOpacity key={type} style={[styles.modalOption, selectedGameType === type && styles.modalOptionSelected]} onPress={() => { setSelectedGameType(type); setShowDropdown(false); }}>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 12, paddingTop: 45, backgroundColor: '#F5EDE0' },
    backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#D0D0D0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0E8Da' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', fontFamily: 'RaleighStdDemi', textTransform: 'uppercase' },
    balanceChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C36578', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 5 },
    balanceText: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
    content: { flex: 1, padding: 15 },
    topRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    datePickerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, gap: 10 },
    dateText: { fontSize: 14, color: '#000', fontFamily: 'RaleighStdDemi' },
    dropdown: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10 },
    dropdownText: { fontSize: 14, color: '#000', fontFamily: 'RaleighStdDemi' },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
    label: { flex: 1, fontSize: 14, color: '#000', fontWeight: '500', fontFamily: 'RaleighStdDemi' },
    inputContainer: { flex: 1, position: 'relative', flexDirection: 'row', alignItems: 'center', zIndex: 10 },
    inputField: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 10, fontSize: 14, color: '#000', fontFamily: 'RaleighStdDemi' },
    warningIconContainer: { position: 'absolute', right: 10, zIndex: 20 },
    tooltipContainer: { position: 'absolute', top: -42, right: 0, alignItems: 'center', zIndex: 30 },
    tooltipArrow: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#fff', zIndex: 31 },
    tooltipBubble: { backgroundColor: '#fff', paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3, borderWidth: 1, borderColor: '#eee', minWidth: 100 },
    tooltipText: { color: '#333', fontSize: 12, fontWeight: 'bold', fontFamily: 'RaleighStdDemi', textAlign: 'center' },
    addBtn: { backgroundColor: '#C36578', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginBottom: 20 },
    addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
    tableHeader: { flexDirection: 'row', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#C36578' },
    headerText: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: 'bold', color: '#C36578', fontFamily: 'RaleighStdDemi' },
    bidsScrollContainer: { flex: 1, marginTop: 10 },
    bidCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginVertical: 4, paddingVertical: 10, paddingHorizontal: 5, borderRadius: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },
    bidCardText: { flex: 1, textAlign: 'center', fontSize: 14, color: '#333', fontFamily: 'RaleighStdDemi' },
    deleteBtn: { backgroundColor: '#C36578', padding: 6, borderRadius: 15, marginRight: 5 },
    bottomBar: {
        flexDirection: 'row',
        backgroundColor: '#F5EDE0',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#E0E0E0',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    totalInfo: { flex: 1, alignItems: 'center' },
    totalLabel: { fontSize: 12, color: '#666', fontFamily: 'RaleighStdDemi' },
    totalValue: { fontSize: 16, fontWeight: 'bold', color: '#000', fontFamily: 'RaleighStdDemi' },
    submitBtn: { backgroundColor: '#C36578', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25 },
    submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#fff', borderRadius: 15, padding: 20, width: '85%', maxHeight: '75%' },
    modalConfirmTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 15, fontFamily: 'RaleighStdDemi' },
    confirmHeader: { flexDirection: 'row', backgroundColor: '#C36578', paddingVertical: 10, borderRadius: 8, marginBottom: 10 },
    confirmHeaderText: { flex: 1, color: '#fff', fontSize: 14, fontWeight: 'bold', textAlign: 'center', fontFamily: 'RaleighStdDemi' },
    reviewList: { maxHeight: 250, marginBottom: 15 },
    reviewRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    reviewText: { flex: 1, fontSize: 14, textAlign: 'center', fontFamily: 'RaleighStdDemi' },
    modalTotalSection: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#E0E0E0', marginBottom: 15 },
    modalTotalLabel: { fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginVertical: 3, fontFamily: 'RaleighStdDemi' },
    modalActionButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    cancelBtn: { flex: 1, backgroundColor: '#808080', paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
    confirmBtn: { flex: 1, backgroundColor: '#C36578', paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
    btnText: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 20, paddingHorizontal: 25, width: SCREEN_WIDTH * 0.8, maxWidth: 320, elevation: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', fontFamily: 'RaleighStdDemi', textAlign: 'center', marginBottom: 20 },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, marginBottom: 10, backgroundColor: '#F5EDE0', borderWidth: 2, borderColor: '#E8E8E8' },
    modalOptionSelected: { backgroundColor: '#E8F5E9', borderColor: '#2E4A3E' },
    modalOptionText: { fontSize: 16, fontWeight: '600', color: '#333', fontFamily: 'RaleighStdDemi' },
    modalOptionTextSelected: { color: '#2E4A3E' },
});
