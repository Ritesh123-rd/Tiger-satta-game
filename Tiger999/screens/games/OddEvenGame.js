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

export default function OddEvenGame({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [balance, setBalance] = useState(0.0);
    const [bets, setBets] = useState([]);
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

    useFocusEffect(
        useCallback(() => {
            fetchBalance();
        }, [])
    );

    const { gameName } = route.params || { gameName: 'ODD EVEN' };
    const [selectedGameType, setSelectedGameType] = useState('OPEN');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedType, setSelectedType] = useState('ODD');
    const [points, setPoints] = useState('');
    const [tooltipMessage, setTooltipMessage] = useState('');
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipTarget, setTooltipTarget] = useState('points');

    const showTooltipMessage = (message, target = 'points') => {
        setTooltipMessage(message);
        setTooltipTarget(target);
        setShowTooltip(true);
        setTimeout(() => {
            setShowTooltip(false);
        }, 2000);
    };

    const getCurrentDate = () => {
        const date = new Date();
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    // Calculate total bids and points
    const totalBids = bets.length;
    const totalPoints = bets.reduce((sum, bet) => sum + parseInt(bet.point), 0);

    const handleAdd = () => {
        if (!points || parseInt(points) < 5) {
            showTooltipMessage('min amount 5', 'points');
            return;
        }

        const pointValue = parseInt(points);
        const gameType = selectedGameType.toLowerCase();

        // Determine which digits to add based on selection
        let digitsToAdd = [];
        if (selectedType === 'ODD') {
            digitsToAdd = [1, 3, 5, 7, 9];
        } else {
            digitsToAdd = [0, 2, 4, 6, 8];
        }

        // Create new bets for all digits
        const newBets = digitsToAdd.map(digit => ({
            id: `${Date.now()}_${digit}`,
            ank: digit,
            point: pointValue,
            type: gameType
        }));

        setBets([...bets, ...newBets]);
        setPoints('');
    };

    const handleDelete = (id) => {
        setBets(bets.filter(bet => bet.id !== id));
    };

    const handleSubmit = () => {
        if (bets.length === 0) {
            Alert.alert('Error', 'Please add at least one bet');
            return;
        }
        // Show confirmation modal instead of direct alert
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = () => {
        // Close confirmation modal
        setShowConfirmModal(false);

        // Here you would typically make an API call to submit the bets
        // For now, showing success message
        Alert.alert(
            'Success',
            `${totalBids} bets placed successfully!`,
            [{
                text: 'OK',
                onPress: () => {
                    setBets([]);
                    setPoints('');
                }
            }]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#E8DDD0" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color="#000" />
                </TouchableOpacity>
                <MarqueeText text={`${gameName} - ODD EVEN`} style={styles.headerTitle} />
                <View style={styles.balanceChip}>
                    <Ionicons name="wallet-outline" size={14} color="#fff" />
                    <Text style={styles.balanceText}>{balance.toFixed(1)}</Text>
                </View>
            </View>

            {/* Static Content Section */}
            <View style={styles.staticContent}>
                <View style={styles.topRow}>
                    <View style={styles.datePickerBtn}>
                        <Ionicons name="calendar-outline" size={16} color="#C36578" />
                        <Text style={styles.dateText}>{getCurrentDate()}</Text>
                    </View>
                    <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)}>
                        <Text style={styles.dropdownText}>{selectedGameType}</Text>
                        <Ionicons name="chevron-down" size={18} color="#B8860B" />
                    </TouchableOpacity>
                </View>

                <View style={styles.oddEvenRow}>
                    <TouchableOpacity
                        style={[styles.oddEvenButton, selectedType === 'ODD' && styles.oddEvenButtonActive]}
                        onPress={() => setSelectedType('ODD')}
                    >
                        <View style={styles.radioOuter}>
                            {selectedType === 'ODD' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={[styles.oddEvenText, selectedType === 'ODD' && styles.oddEvenTextActive]}>
                            Odd Digit
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.oddEvenButton, selectedType === 'EVEN' && styles.oddEvenButtonActive]}
                        onPress={() => setSelectedType('EVEN')}
                    >
                        <View style={styles.radioOuter}>
                            {selectedType === 'EVEN' && <View style={styles.radioInner} />}
                        </View>
                        <Text style={[styles.oddEvenText, selectedType === 'EVEN' && styles.oddEvenTextActive]}>
                            Even Digit
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.inputRow}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Enter Points:</Text>
                        <View style={styles.inputWithButton}>
                            <View style={styles.inputWrapper}>
                                <TextInput
                                    style={styles.textInput}
                                    placeholder="Point"
                                    placeholderTextColor="#999"
                                    keyboardType="numeric"
                                    value={points}
                                    onChangeText={setPoints}
                                />
                                {showTooltip && (
                                    <View style={styles.tooltip}>
                                        <View style={styles.tooltipBubble}>
                                            <Ionicons name="information-circle" size={16} color="#000" style={styles.tooltipIcon} />
                                            <Text style={styles.tooltipText}>{tooltipMessage}</Text>
                                        </View>
                                        <View style={styles.tooltipArrow} />
                                    </View>
                                )}
                                {showTooltip && (
                                    <Ionicons name="information-circle" size={18} color="red" style={styles.errorIcon} />
                                )}
                            </View>
                            <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
                                <Text style={styles.addButtonText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Table Header - Static */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { flex: 0.8 }]}>Ank</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Point</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Type</Text>
                    <Text style={[styles.tableHeaderText, { flex: 1 }]}>Delete</Text>
                </View>
            </View>

            {/* Scrollable Table Content Only */}
            <ScrollView style={styles.scrollableContent} showsVerticalScrollIndicator={false}>
                {bets.map((bet) => (
                    <View key={bet.id} style={styles.tableRow}>
                        <Text style={[styles.tableCell, { flex: 0.8 }]}>{bet.ank}</Text>
                        <Text style={[styles.tableCell, { flex: 1 }]}>{bet.point}</Text>
                        <Text style={[styles.tableCell, { flex: 1 }]}>{bet.type}</Text>
                        <TouchableOpacity
                            style={[styles.tableCell, { flex: 1, alignItems: 'center' }]}
                            onPress={() => handleDelete(bet.id)}
                        >
                            <View style={styles.deleteButton}>
                                <Ionicons name="trash-outline" size={14} color="#fff" />
                            </View>
                        </TouchableOpacity>
                    </View>
                ))}
                <View style={{ height: 20 }} />
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 15), height: 75 + insets.bottom }]}>
                <View style={styles.summaryContainer}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Bids</Text>
                        <Text style={styles.summaryValue}>{totalBids}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Points</Text>
                        <Text style={styles.summaryValue}>{totalPoints}</Text>
                    </View>
                </View>
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                    <Text style={styles.submitButtonText}>SUBMIT</Text>
                </TouchableOpacity>
            </View>

            {/* Game Type Selection Modal */}
            <Modal visible={showDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowDropdown(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDropdown(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Game Type</Text>
                        {['OPEN', 'CLOSE'].map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.modalOption, selectedGameType === type && styles.modalOptionSelected]}
                                onPress={() => {
                                    setSelectedGameType(type);
                                    setShowDropdown(false);
                                }}
                            >
                                <Text style={[styles.modalOptionText, selectedGameType === type && styles.modalOptionTextSelected]}>
                                    {type}
                                </Text>
                                {selectedGameType === type && <Ionicons name="checkmark-circle" size={22} color="#2E4A3E" />}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Confirmation Modal */}
            <Modal visible={showConfirmModal} transparent={true} animationType="fade" onRequestClose={() => setShowConfirmModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.confirmModalContent}>
                        <Text style={styles.confirmModalTitle}>Confirm Your Bids</Text>

                        {/* Table Header */}
                        <View style={styles.confirmTableHeader}>
                            <Text style={[styles.confirmHeaderText, { flex: 1 }]}>Ank</Text>
                            <Text style={[styles.confirmHeaderText, { flex: 1 }]}>Points</Text>
                            <Text style={[styles.confirmHeaderText, { flex: 1 }]}>Type</Text>
                        </View>

                        {/* Scrollable Bets List */}
                        <ScrollView
                            style={styles.confirmScrollView}
                            showsVerticalScrollIndicator={true}
                            nestedScrollEnabled={true}
                        >
                            {bets.map((bet, index) => (
                                <View key={bet.id} style={[
                                    styles.confirmTableRow,
                                    index % 2 === 0 && styles.confirmTableRowEven
                                ]}>
                                    <Text style={[styles.confirmTableCell, { flex: 1 }]}>{bet.ank}</Text>
                                    <Text style={[styles.confirmTableCell, { flex: 1 }]}>{bet.point}</Text>
                                    <Text style={[styles.confirmTableCell, { flex: 1 }]}>{bet.type.toUpperCase()}</Text>
                                </View>
                            ))}
                        </ScrollView>

                        {/* Divider Line */}
                        <View style={styles.confirmDivider} />

                        {/* Summary */}
                        <View style={styles.confirmSummary}>
                            <Text style={styles.confirmSummaryText}>Total Bids: {totalBids}</Text>
                            <Text style={styles.confirmSummaryText}>Total Points: {totalPoints}</Text>
                        </View>

                        {/* Action Buttons */}
                        <View style={styles.confirmButtonsContainer}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setShowConfirmModal(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.confirmSubmitButton}
                                onPress={handleConfirmSubmit}
                            >
                                <Text style={styles.confirmSubmitButtonText}>Confirm Submit</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#E8DDD0'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        paddingTop: 45,
        backgroundColor: '#E8DDD0'
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#D5D5D5',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF9F3'
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        textTransform: 'uppercase'
    },
    balanceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C36578',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 18,
        gap: 4
    },
    balanceText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
        fontFamily: 'RaleighStdDemi'
    },
    staticContent: {
        backgroundColor: '#E8DDD0',
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    scrollableContent: {
        flex: 1,
        paddingHorizontal: 15,
    },
    topRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 20
    },
    datePickerBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF9F3',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        gap: 8
    },
    dateText: {
        fontSize: 13,
        color: '#000',
        fontFamily: 'RaleighStdDemi'
    },
    dropdown: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFF9F3',
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E5E5E5'
    },
    dropdownText: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        fontWeight: '500'
    },
    oddEvenRow: {
        flexDirection: 'row',
        gap: 15,
        marginBottom: 20
    },
    oddEvenButton: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 25,
        backgroundColor: '#FFF9F3',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        gap: 10
    },
    oddEvenButtonActive: {
        backgroundColor: '#FFF9F3',
        borderColor: '#E5E5E5'
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#999',
        justifyContent: 'center',
        alignItems: 'center'
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#000'
    },
    oddEvenText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#333',
        fontFamily: 'RaleighStdDemi'
    },
    oddEvenTextActive: {
        color: '#000'
    },
    inputRow: {
        marginBottom: 20
    },
    inputGroup: {
        marginBottom: 8,
        width: '100%'
    },
    inputLabel: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        marginBottom: 8
    },
    inputWithButton: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'stretch'
    },
    textInput: {
        flex: 1,
        backgroundColor: '#FFF9F3',
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderRadius: 25,
        fontSize: 16,
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        borderWidth: 1,
        borderColor: '#E5E5E5',
        textAlign: 'center'
    },
    addButton: {
        backgroundColor: '#C36578',
        paddingHorizontal: 30,
        paddingVertical: 14,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 100
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'RaleighStdDemi'
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: 'transparent',
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#C36578',
        marginBottom: 10,
    },
    tableHeaderText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#C36578',
        fontFamily: 'RaleighStdDemi',
        textAlign: 'center'
    },
    tableRow: {
        flexDirection: 'row',
        backgroundColor: '#FFF9F3',
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#E5E5E5',
        alignItems: 'center'
    },
    tableCell: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        textAlign: 'center'
    },
    deleteButton: {
        backgroundColor: '#C36578',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center'
    },
    bottomBar: {
        backgroundColor: '#F5EDE0',
        borderTopWidth: 2,
        borderTopColor: '#C36578',
        paddingHorizontal: 15,
        paddingVertical: 15,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    summaryContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-around',
    },
    summaryItem: {
        alignItems: 'center'
    },
    summaryLabel: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'RaleighStdDemi',
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'RaleighStdDemi'
    },
    submitButton: {
        backgroundColor: '#C36578',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center'
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'RaleighStdDemi',
        letterSpacing: 1
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        backgroundColor: '#FFF9F3',
        borderRadius: 20,
        paddingVertical: 20,
        paddingHorizontal: 25,
        width: SCREEN_WIDTH * 0.8,
        maxWidth: 320,
        elevation: 10
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'RaleighStdDemi',
        textAlign: 'center',
        marginBottom: 20
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 12,
        marginBottom: 10,
        backgroundColor: '#E8DDD0',
        borderWidth: 2,
        borderColor: '#E5E5E5'
    },
    modalOptionSelected: {
        backgroundColor: '#E8F5E9',
        borderColor: '#2E4A3E'
    },
    modalOptionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        fontFamily: 'RaleighStdDemi'
    },
    modalOptionTextSelected: {
        color: '#2E4A3E'
    },
    // Confirmation Modal Styles
    confirmModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 20,
        width: SCREEN_WIDTH * 0.85,
        maxHeight: '80%',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84
    },
    confirmModalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        textAlign: 'center',
        marginBottom: 18
    },
    confirmTableHeader: {
        flexDirection: 'row',
        backgroundColor: '#C36578',
        paddingVertical: 12,
        paddingHorizontal: 10,
        borderTopLeftRadius: 10,
        borderTopRightRadius: 10
    },
    confirmHeaderText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'RaleighStdDemi',
        textAlign: 'center'
    },
    confirmScrollView: {
        maxHeight: 350,
        minHeight: 100,
        flexGrow: 0,
        marginBottom: 5
    },
    confirmTableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
        backgroundColor: '#FFFFFF'
    },
    confirmTableRowEven: {
        backgroundColor: '#F9F9F9'
    },
    confirmTableCell: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        textAlign: 'center'
    },
    confirmDivider: {
        height: 2,
        backgroundColor: '#C36578',
        marginVertical: 12
    },
    confirmSummary: {
        alignItems: 'center',
        marginBottom: 20
    },
    confirmSummaryText: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        marginVertical: 3
    },
    confirmButtonsContainer: {
        flexDirection: 'row',
        gap: 10
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#999',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'RaleighStdDemi'
    },
    confirmSubmitButton: {
        flex: 1,
        backgroundColor: '#C36578',
        paddingVertical: 14,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center'
    },
    confirmSubmitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'RaleighStdDemi'
    },
    inputWrapper: {
        flex: 1,
        position: 'relative',
    },
    errorIcon: {
        position: 'absolute',
        right: 15,
        top: '50%',
        marginTop: -9,
    },
    tooltip: {
        position: 'absolute',
        top: -45,
        right: 0,
        zIndex: 1000,
        alignItems: 'flex-end',
    },
    tooltipBubble: {
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderWidth: 1,
        borderColor: '#E5E5E5',
    },
    tooltipIcon: {
        marginRight: 6,
    },
    tooltipText: {
        color: '#000',
        fontSize: 12,
        fontWeight: '600',
    },
    tooltipArrow: {
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#fff',
        transform: [{ rotate: '180deg' }],
        marginRight: 15,
        marginTop: -1,
    },
});