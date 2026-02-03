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

export default function FullSangamGame({ navigation, route }) {
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


    const { gameName } = route.params || { gameName: 'FULL SANGAM' };
    const [selectedGameType, setSelectedGameType] = useState('OPEN');
    const [showDropdown, setShowDropdown] = useState(false);
    const [openPana, setOpenPana] = useState('');
    const [closePana, setClosePana] = useState('');
    const [points, setPoints] = useState('');
    const [bids, setBids] = useState([]);
    const [totalBids, setTotalBids] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const totalB = bids.length;
        const totalP = bids.reduce((sum, bid) => sum + parseInt(bid.points), 0);
        setTotalBids(totalB);
        setTotalPoints(totalP);
    }, [bids]);

    const getCurrentDate = () => {
        const date = new Date();
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    const handleAddBid = () => {
        if (!openPana || openPana.length !== 3) { Alert.alert('Error', 'Please enter valid Open Pana (3 digits)'); return; }
        if (!closePana || closePana.length !== 3) { Alert.alert('Error', 'Please enter valid Close Pana (3 digits)'); return; }
        if (!points || parseInt(points) <= 0) { Alert.alert('Error', 'Please enter valid points'); return; }

        const newBid = {
            id: Date.now().toString(),
            sangam: `${openPana}-${closePana}`,
            points: points,
            type: selectedGameType.toLowerCase()
        };

        setBids([newBid, ...bids]);
        setOpenPana('');
        setClosePana('');
        setPoints('');
    };

    const handleDeleteBid = (id) => {
        setBids(bids.filter(bid => bid.id !== id));
    };

    const handleSubmit = () => {
        if (bids.length === 0) {
            Alert.alert('Error', 'Please add at least one bid');
            return;
        }
        setShowConfirmModal(true);
    };

    const finalSubmit = () => {
        Alert.alert(
            'Success',
            `${totalBids} bids submitted for ${totalPoints} points!`,
            [{
                text: 'OK', onPress: () => {
                    setBids([]);
                    setShowConfirmModal(false);
                }
            }]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color="#000" /></TouchableOpacity>
                <MarqueeText text={`${gameName} - FULL SANGAM`} style={styles.headerTitle} />
                <View style={styles.balanceChip}><Ionicons name="wallet-outline" size={14} color="#fff" /><Text style={styles.balanceText}>{balance.toFixed(1)}</Text></View>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.topRow}>
                    <View style={styles.datePickerBtn}><Ionicons name="calendar-outline" size={16} color="#C36578" /><Text style={styles.dateText}>{getCurrentDate()}</Text></View>
                    <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)}>
                        <Text style={styles.dropdownText}>{selectedGameType}</Text>
                        <Ionicons name="chevron-down" size={18} color="#B8860B" />
                    </TouchableOpacity>
                </View>

                {/* Input Fields Row - Horizontal Style as per Image */}
                <View style={styles.horizontalInputContainer}>
                    <View style={styles.horizontalInputRow}>
                        <Text style={styles.horizontalLabel}>Enter Open Pana:</Text>
                        <TextInput style={styles.horizontalTextInput} placeholder="Pana" placeholderTextColor="#999" keyboardType="numeric" maxLength={3} value={openPana} onChangeText={setOpenPana} />
                    </View>

                    <View style={styles.horizontalInputRow}>
                        <Text style={styles.horizontalLabel}>Enter Close Pana:</Text>
                        <TextInput style={styles.horizontalTextInput} placeholder="Pana" placeholderTextColor="#999" keyboardType="numeric" maxLength={3} value={closePana} onChangeText={setClosePana} />
                    </View>

                    <View style={styles.horizontalInputRow}>
                        <Text style={styles.horizontalLabel}>Enter Points:</Text>
                        <TextInput style={styles.horizontalTextInput} placeholder="Point" placeholderTextColor="#999" keyboardType="numeric" value={points} onChangeText={setPoints} />
                    </View>
                </View>

                <TouchableOpacity style={styles.addButton} onPress={handleAddBid}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>

                {/* Bids Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.headerText, { flex: 2 }]}>Sangam</Text>
                    <Text style={[styles.headerText, { flex: 1.5 }]}>Amount</Text>
                    <Text style={[styles.headerText, { flex: 1 }]}>Delete</Text>
                </View>

                {/* Bids List */}
                {bids.map((item) => (
                    <View key={item.id} style={styles.bidRow}>
                        <Text style={[styles.bidCell, { flex: 2 }]}>{item.sangam}</Text>
                        <Text style={[styles.bidCell, { flex: 1.5 }]}>{item.points}</Text>
                        <TouchableOpacity onPress={() => handleDeleteBid(item.id)} style={styles.deleteBtn}>
                            <View style={styles.deleteIconContainer}>
                                <Ionicons name="trash-outline" size={12} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>
                ))}
            </ScrollView>

            {/* Bottom Submit Button */}
            <TouchableOpacity
                style={[styles.submitButtonFixed, { paddingBottom: Math.max(insets.bottom, 16), height: 60 + insets.bottom }]}
                onPress={handleSubmit}
            >
                <Text style={styles.submitButtonText}>Submit</Text>
            </TouchableOpacity>

            {/* Confirmation Modal */}
            <Modal
                visible={showConfirmModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowConfirmModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { width: SCREEN_WIDTH * 0.9, maxHeight: '80%' }]}>
                        <Text style={styles.modalTitle}>Confirm Your Bids</Text>

                        <View style={styles.confirmTableHeader}>
                            <Text style={[styles.confirmHeaderText, { flex: 2 }]}>Sangam</Text>
                            <Text style={[styles.confirmHeaderText, { flex: 1 }]}>Points</Text>
                            <Text style={[styles.confirmHeaderText, { flex: 1 }]}>Type</Text>
                        </View>

                        <ScrollView style={{ marginVertical: 10 }}>
                            {bids.map((bid) => (
                                <View key={bid.id} style={styles.confirmBidRow}>
                                    <Text style={[styles.confirmBidText, { flex: 2 }]}>{bid.sangam}</Text>
                                    <Text style={[styles.confirmBidText, { flex: 1 }]}>{bid.points}</Text>
                                    <Text style={[styles.confirmBidText, { flex: 1 }]}>{bid.type}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        <View style={styles.confirmTotalRow}>
                            <Text style={styles.confirmTotalLabel}>Total Bids: {totalBids}</Text>
                            <Text style={styles.confirmTotalLabel}>Total Points: {totalPoints}</Text>
                        </View>

                        <View style={styles.confirmButtonRow}>
                            <TouchableOpacity
                                style={[styles.confirmButton, { backgroundColor: '#999' }]}
                                onPress={() => setShowConfirmModal(false)}
                            >
                                <Text style={styles.confirmButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.confirmButton, { backgroundColor: '#C36578' }]}
                                onPress={finalSubmit}
                            >
                                <Text style={styles.confirmButtonText}>Confirm Submit</Text>
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, paddingTop: 45, backgroundColor: '#F5EDE0' },
    backButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: '#D0D0D0', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0E8Da' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', fontFamily: 'RaleighStdDemi', textTransform: 'uppercase' },
    balanceChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C36578', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, gap: 4 },
    balanceText: { color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
    content: { flex: 1, paddingHorizontal: 15, paddingTop: 10 },
    topRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
    datePickerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: '#E8E8E8', gap: 8 },
    dateText: { fontSize: 13, color: '#000', fontFamily: 'RaleighStdDemi' },
    dropdown: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: '#E8E8E8' },
    dropdownText: { fontSize: 14, color: '#000', fontFamily: 'RaleighStdDemi', fontWeight: '500' },
    inputGroup: { marginBottom: 15 },
    inputLabel: { fontSize: 14, color: '#000', fontFamily: 'RaleighStdDemi', marginBottom: 8 },
    textInput: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 14, borderRadius: 12, fontSize: 16, color: '#000', fontFamily: 'RaleighStdDemi', borderWidth: 1, borderColor: '#E8E8E8', textAlign: 'center' },

    // Horizontal Inputs
    horizontalInputContainer: { marginBottom: 15 },
    horizontalInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, justifyContent: 'space-between' },
    horizontalLabel: { fontSize: 14, color: '#333', fontFamily: 'RaleighStdDemi', flex: 1 },
    horizontalTextInput: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 25, fontSize: 14, color: '#000', fontFamily: 'RaleighStdDemi', borderWidth: 1, borderColor: '#E8E8E8', textAlign: 'center', flex: 1, minWidth: 120 },

    addButton: { backgroundColor: '#C36578', paddingVertical: 10, borderRadius: 5, alignItems: 'center', alignSelf: 'center', width: '80%', marginBottom: 20 },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },

    // Table Styles
    tableHeader: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#C36578', paddingBottom: 10, marginBottom: 10, marginHorizontal: 5 },
    headerText: { fontSize: 14, fontWeight: 'bold', color: '#C36578', textAlign: 'center', fontFamily: 'RaleighStdDemi' },
    bidRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 25, marginBottom: 8, borderWidth: 1, borderColor: '#E8E8E8', marginHorizontal: 5 },
    bidCell: { fontSize: 14, color: '#000', textAlign: 'center', fontFamily: 'RaleighStdDemi' },
    deleteBtn: { flex: 1, alignItems: 'center' },
    deleteIconContainer: { backgroundColor: '#C36578', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

    submitButtonFixed: {
        backgroundColor: '#C36578',
        paddingVertical: 16,
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        justifyContent: 'center'
    },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 20, paddingHorizontal: 25, width: SCREEN_WIDTH * 0.8, maxWidth: 320, elevation: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', fontFamily: 'RaleighStdDemi', textAlign: 'center', marginBottom: 20 },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, marginBottom: 10, backgroundColor: '#F5EDE0', borderWidth: 2, borderColor: '#E8E8E8' },
    modalOptionSelected: { backgroundColor: '#E8F5E9', borderColor: '#2E4A3E' },
    modalOptionText: { fontSize: 16, fontWeight: '600', color: '#333', fontFamily: 'RaleighStdDemi' },
    modalOptionTextSelected: { color: '#2E4A3E' },

    // Confirmation Modal Styles
    confirmTableHeader: { flexDirection: 'row', backgroundColor: '#C36578', paddingVertical: 10, borderRadius: 5 },
    confirmHeaderText: { color: '#fff', fontWeight: 'bold', textAlign: 'center', fontSize: 14, fontFamily: 'RaleighStdDemi' },
    confirmBidRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE' },
    confirmBidText: { textAlign: 'center', fontSize: 14, color: '#333', fontFamily: 'RaleighStdDemi' },
    confirmTotalRow: { paddingVertical: 15, borderTopWidth: 2, borderTopColor: '#C36578', marginTop: 5 },
    confirmTotalLabel: { fontSize: 16, fontWeight: 'bold', color: '#000', textAlign: 'right', marginBottom: 5, fontFamily: 'RaleighStdDemi' },
    confirmButtonRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
    confirmButton: { flex: 1, paddingVertical: 12, borderRadius: 25, alignItems: 'center' },
    confirmButtonText: { color: '#fff', fontSize: 14, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
});
