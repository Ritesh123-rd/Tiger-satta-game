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

export default function RedJodiGame({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const [balance, setBalance] = useState(0.0);
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

    const { gameName } = route.params || { gameName: 'RED JODI' };
    const [selectedGameType, setSelectedGameType] = useState('OPEN');
    const [showDropdown, setShowDropdown] = useState(false);

    // State to hold points for each jodi
    const [jodiPoints, setJodiPoints] = useState({});

    // Generate all jodi numbers (00, 05, 11, 16, 22, 27... 99)
    const jodiNumbers = [
        '00', '05',
        '11', '16',
        '22', '27',
        '33', '38',
        '44', '49',
        '50', '55',
        '61', '66',
        '72', '77',
        '83', '88',
        '94', '99'
    ];

    const getCurrentDate = () => {
        const date = new Date();
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    const handlePointChange = (jodi, value) => {
        setJodiPoints(prev => ({
            ...prev,
            [jodi]: value
        }));
    };

    // Get valid bets for confirmation
    const getValidBets = () => {
        return Object.entries(jodiPoints)
            .filter(([jodi, points]) => points && parseInt(points) > 0)
            .map(([jodi, points]) => ({
                jodi,
                points: parseInt(points),
                type: selectedGameType.toLowerCase()
            }));
    };

    const totalBids = getValidBets().length;
    const totalPoints = getValidBets().reduce((sum, bet) => sum + bet.points, 0);

    const handleSubmit = () => {
        const validBets = getValidBets();

        if (validBets.length === 0) {
            Alert.alert('Error', 'Please enter points for at least one jodi');
            return;
        }

        // Show confirmation modal
        setShowConfirmModal(true);
    };

    const handleConfirmSubmit = () => {
        // Close confirmation modal
        setShowConfirmModal(false);

        // Here you would typically make an API call to submit the bets
        Alert.alert('Success', 'Bets placed successfully!', [
            {
                text: 'OK',
                onPress: () => setJodiPoints({})
            }
        ]);
    };

    const renderJodiRow = (jodi1, jodi2) => {
        return (
            <View key={`${jodi1}-${jodi2}`} style={styles.jodiRow}>
                {/* First Jodi */}
                <View style={styles.jodiContainer}>
                    <View style={styles.jodiNumberBox}>
                        <Text style={styles.jodiNumberText}>{jodi1}</Text>
                    </View>
                    <TextInput
                        style={styles.jodiInput}
                        placeholder=""
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={jodiPoints[jodi1] || ''}
                        onChangeText={(value) => handlePointChange(jodi1, value)}
                    />
                </View>

                {/* Second Jodi */}
                {jodi2 && (
                    <View style={styles.jodiContainer}>
                        <View style={styles.jodiNumberBox}>
                            <Text style={styles.jodiNumberText}>{jodi2}</Text>
                        </View>
                        <TextInput
                            style={styles.jodiInput}
                            placeholder=""
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={jodiPoints[jodi2] || ''}
                            onChangeText={(value) => handlePointChange(jodi2, value)}
                        />
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={22} color="#000" />
                </TouchableOpacity>
                <MarqueeText text={`${gameName} - JODI`} style={styles.headerTitle} />
                <View style={styles.balanceChip}>
                    <Ionicons name="wallet-outline" size={14} color="#fff" />
                    <Text style={styles.balanceText}>{balance.toFixed(1)}</Text>
                </View>
            </View>

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

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.jodiGrid}>
                    {renderJodiRow('00', '05')}
                    {renderJodiRow('11', '16')}
                    {renderJodiRow('22', '27')}
                    {renderJodiRow('33', '38')}
                    {renderJodiRow('44', '49')}
                    {renderJodiRow('50', '55')}
                    {renderJodiRow('61', '66')}
                    {renderJodiRow('72', '77')}
                    {renderJodiRow('83', '88')}
                    {renderJodiRow('94', '99')}
                </View>
            </ScrollView>

            <View style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 15), height: 75 + insets.bottom }]}>
                <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Bids</Text>
                        <Text style={styles.statValue}>{totalBids}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Points</Text>
                        <Text style={styles.statValue}>{totalPoints}</Text>
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
                            <Text style={[styles.confirmHeaderText, { flex: 1 }]}>Jodi</Text>
                            <Text style={[styles.confirmHeaderText, { flex: 1 }]}>Points</Text>
                            <Text style={[styles.confirmHeaderText, { flex: 1 }]}>Type</Text>
                        </View>

                        {/* Scrollable Bets List */}
                        <ScrollView
                            style={styles.confirmScrollView}
                            showsVerticalScrollIndicator={true}
                            nestedScrollEnabled={true}
                        >
                            {getValidBets().map((bet, index) => (
                                <View key={`${bet.jodi}-${index}`} style={[
                                    styles.confirmTableRow,
                                    index % 2 === 0 && styles.confirmTableRowEven
                                ]}>
                                    <Text style={[styles.confirmTableCell, { flex: 1 }]}>{bet.jodi}</Text>
                                    <Text style={[styles.confirmTableCell, { flex: 1 }]}>{bet.points}</Text>
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
    container: { flex: 1, backgroundColor: '#F5EDE0' },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        paddingTop: 45,
        backgroundColor: '#F5EDE0'
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
    topRow: {
        flexDirection: 'row',
        gap: 10,
        paddingHorizontal: 15,
        paddingTop: 10,
        paddingBottom: 12
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
    content: {
        flex: 1,
        paddingHorizontal: 15
    },
    jodiGrid: {
        paddingBottom: 100
    },
    jodiRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 6,
        gap: 10
    },
    jodiContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    jodiNumberBox: {
        backgroundColor: '#C36578',
        width: 50,
        height: 38,
        borderTopLeftRadius: 6,
        borderBottomLeftRadius: 6,
        justifyContent: 'center',
        alignItems: 'center'
    },
    jodiNumberText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'RaleighStdDemi'
    },
    jodiInput: {
        flex: 1,
        backgroundColor: '#D5E5E8',
        height: 38,
        borderTopRightRadius: 6,
        borderBottomRightRadius: 6,
        fontSize: 14,
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        textAlign: 'center',
        paddingHorizontal: 6
    },
    bottomBar: {
        flexDirection: 'row',
        backgroundColor: '#F5EDE0',
        paddingHorizontal: 15,
        paddingVertical: 15,
        borderTopWidth: 2,
        borderTopColor: '#C36578',
        alignItems: 'center',
        gap: 15,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    statsContainer: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center'
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
        fontFamily: 'RaleighStdDemi',
    },
    statValue: {
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
        backgroundColor: '#F5EDE0',
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
    }
});