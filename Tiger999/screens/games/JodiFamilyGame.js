import React, { useState, useRef, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getWalletBalance } from '../../api/auth';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    Alert,
    StatusBar,
    Modal,
    Dimensions,
    Animated,
    Easing,
    ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

// Custom Marquee Component
const MarqueeText = ({ text, style }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [textWidth, setTextWidth] = useState(0);
    const containerWidth = SCREEN_WIDTH - 140;

    useEffect(() => {
        if (textWidth > 0) {
            animatedValue.setValue(containerWidth);
            Animated.loop(
                Animated.timing(animatedValue, {
                    toValue: -textWidth,
                    duration: 8000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [textWidth, containerWidth]);

    return (
        <View style={{ width: containerWidth, overflow: 'hidden', alignItems: 'center' }}>
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

export default function JodiFamilyGame({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const { gameName } = route.params || { gameName: 'JODI FAMILY' };
    const [selectedGameType, setSelectedGameType] = useState('OPEN');
    const [showDropdown, setShowDropdown] = useState(false);
    const [showPointsPicker, setShowPointsPicker] = useState(false);
    const [digit, setDigit] = useState('');
    const [points, setPoints] = useState('');
    const [bids, setBids] = useState([]);
    const [totalBids, setTotalBids] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [balance, setBalance] = useState(0.0);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipMessage, setTooltipMessage] = useState('');
    const [filteredJodis, setFilteredJodis] = useState([]);
    const [showJodiPicker, setShowJodiPicker] = useState(false);

    const getCurrentDate = () => {
        const date = new Date();
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

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
        let bidCount = bids.length;
        let pointSum = bids.reduce((sum, bid) => sum + parseInt(bid.points || 0), 0);
        setTotalBids(bidCount);
        setTotalPoints(pointSum);
    }, [bids]);

    // Generate filtered jodis based on current input
    const generateFilteredJodis = (inputValue) => {
        if (!inputValue) return [];

        const jodiArray = [];

        if (inputValue.length === 1) {
            const digit = parseInt(inputValue);
            const startNum = digit * 10;
            const endNum = startNum + 9;
            for (let i = startNum; i <= endNum; i++) {
                jodiArray.push(i < 10 ? `0${i}` : `${i}`);
            }
        } else if (inputValue.length === 2) {
            // If 2 digits entered, show just that one (or we could show range, but user said "same for 2,3 till 99" which implies the single digit entry logic is key)
            // But if they type 12, we can just close it or show 12. Let's show the specific one to confirm selection.
            jodiArray.push(inputValue);
        }

        return jodiArray;
    };

    const handleJodiChange = (text) => {
        // Only allow numeric input
        const numericText = text.replace(/[^0-9]/g, '');

        if (numericText.length > 2) return;

        setDigit(numericText);

        // Update filtered jodis
        const filtered = generateFilteredJodis(numericText);
        setFilteredJodis(filtered);

        // Show picker if there's filtered results
        if (filtered.length > 0 && numericText.length > 0) {
            setShowJodiPicker(true);
        } else {
            setShowJodiPicker(false);
        }
    };

    const showTooltipMessage = (message) => {
        setTooltipMessage(message);
        setShowTooltip(true);
        setTimeout(() => {
            setShowTooltip(false);
        }, 2000);
    };

    const getJodiFamily = (inputJodi) => {
        if (!inputJodi || inputJodi.length !== 2) return [];

        const digit1 = parseInt(inputJodi[0]);
        const digit2 = parseInt(inputJodi[1]);

        const d1 = digit1;
        const d2 = digit2;
        const c1 = (d1 + 5) % 10;
        const c2 = (d2 + 5) % 10;

        // Family members (8 jodis)
        // 1. Direct: d1d2
        // 2. Cut 1: c1d2
        // 3. Cut 2: d1c2
        // 4. Full Cut: c1c2
        // 5. Reverse: d2d1
        // 6. Cut 1 Rev: c2d1
        // 7. Cut 2 Rev: d2c1
        // 8. Full Cut Rev: c2c1

        const family = new Set([
            `${d1}${d2}`,
            `${c1}${d2}`,
            `${d1}${c2}`,
            `${c1}${c2}`,
            `${d2}${d1}`,
            `${c2}${d1}`,
            `${d2}${c1}`,
            `${c2}${c1}`
        ]);

        return Array.from(family).sort((a, b) => a - b);
    };

    const handleJodiSelect = (value) => {
        setDigit(value.toString());
        setShowJodiPicker(false);
    };

    const handlePointsChange = (text) => {
        // Only allow numeric input
        const numericText = text.replace(/[^0-9]/g, '');
        setPoints(numericText);
    };

    const handleAddBid = () => {
        // Validate digit
        if (!digit || digit.length !== 2) {
            Alert.alert('Error', 'Please enter a valid 2-digit number');
            return;
        }

        // Validate points
        if (!points || points === '') {
            showTooltipMessage('Please select points');
            return;
        }

        const pointsValue = parseInt(points);
        if (pointsValue < 5) {
            showTooltipMessage('min amount 5');
            return;
        }

        const familyJodis = getJodiFamily(digit);
        const totalCost = pointsValue * familyJodis.length;

        // Check if balance is sufficient
        if (totalCost > balance) {
            Alert.alert('Insufficient Balance', `You need ${totalCost} points for these ${familyJodis.length} bids, but have only ${balance.toFixed(1)}`);
            return;
        }

        const newBids = familyJodis.map(jodi => ({
            id: `${jodi}-${Date.now()}-${Math.random()}`,
            pana: jodi,
            points: points,
            type: selectedGameType.toLowerCase(),
        }));

        setBids(prev => [...prev, ...newBids]);
        // setDigit('');
        // setPoints('');
    };

    const handleDeleteBid = (bidId) => {
        setBids(prev => prev.filter(bid => bid.id !== bidId));
    };

    const handleSubmit = () => {
        if (bids.length === 0) {
            Alert.alert('Error', 'Please add at least one bid');
            return;
        }

        // Check if total points exceed balance
        if (totalPoints > balance) {
            Alert.alert('Insufficient Balance', 'Total points exceed your available balance');
            return;
        }

        Alert.alert(
            'Confirm Submission',
            `Are you sure you want to submit?\n\nTotal Bids: ${bids.length}\nTotal Points: ${totalPoints}`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel'
                },
                {
                    text: 'Submit',
                    onPress: () => {
                        Alert.alert(
                            'Success',
                            `${bids.length} bids submitted for ${totalPoints} points!`,
                            [{
                                text: 'OK', onPress: () => {
                                    setBids([]);
                                    setDigit('');
                                    setPoints('');
                                    setShowJodiPicker(false);
                                    fetchBalance();
                                }
                            }]
                        );
                    }
                }
            ]
        );
    };

    const renderBidItem = ({ item }) => (
        <View style={styles.bidRow}>
            <Text style={styles.bidCell}>{item.pana}</Text>
            <Text style={styles.bidCell}>{item.points}</Text>
            <Text style={styles.bidCell}>{item.type}</Text>
            <TouchableOpacity onPress={() => handleDeleteBid(item.id)} style={styles.deleteBtn}>
                <View style={styles.deleteIconContainer}>
                    <Ionicons name="trash-outline" size={16} color="#fff" />
                </View>
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{gameName}</Text>
                <View style={styles.balanceChip}>
                    <Ionicons name="wallet-outline" size={16} color="#fff" />
                    <Text style={styles.balanceText}>{balance.toFixed(1)}</Text>
                </View>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {/* Date and Game Type Row */}
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

                {/* Enter Digit Input */}
                <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Enter Digit:</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Jodi"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            maxLength={2}
                            value={digit}
                            onChangeText={handleJodiChange}
                            editable={true}
                            autoCapitalize="none"
                        />
                        {/* Jodi Picker Dropdown */}
                        {showJodiPicker && filteredJodis.length > 0 && (
                            <View style={styles.pointsPickerContainer}>
                                <TouchableOpacity
                                    style={styles.pickerCloseBtn}
                                    onPress={() => setShowJodiPicker(false)}
                                >
                                    <Ionicons name="close-circle" size={20} color="#999" />
                                </TouchableOpacity>
                                <ScrollView
                                    style={styles.pointsPickerScroll}
                                    showsVerticalScrollIndicator={true}
                                    nestedScrollEnabled={true}
                                >
                                    {filteredJodis.map((item) => (
                                        <TouchableOpacity
                                            key={item}
                                            style={styles.pointsPickerItem}
                                            onPress={() => handleJodiSelect(item)}
                                        >
                                            <Text style={styles.pointsPickerText}>{item}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>
                            </View>
                        )}
                    </View>
                </View>

                {/* Enter Points Input with Picker */}
                <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Enter Points:</Text>
                    <View style={styles.inputWrapper}>
                        <TextInput
                            style={styles.textInput}
                            placeholder="Point"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={points}
                            onChangeText={handlePointsChange}
                            editable={true}
                            autoCapitalize="none"
                        />

                        {/* Tooltip */}
                        {showTooltip && (
                            <View style={styles.tooltip}>
                                <View style={styles.tooltipBubble}>
                                    <Ionicons name="information-circle" size={16} color="#fff" style={styles.tooltipIcon} />
                                    <Text style={styles.tooltipText}>{tooltipMessage}</Text>
                                </View>
                                <View style={styles.tooltipArrow} />
                            </View>
                        )}
                    </View>
                </View>

                {/* Add Button */}
                <TouchableOpacity style={styles.addButton} onPress={handleAddBid}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>

                {/* Table Header */}
                <View style={styles.tableHeader}>
                    <Text style={styles.tableHeaderText}>Pana</Text>
                    <Text style={styles.tableHeaderText}>Point</Text>
                    <Text style={styles.tableHeaderText}>Type</Text>
                    <Text style={styles.tableHeaderText}>Delete</Text>
                </View>

                {/* Bids List */}
                <FlatList
                    data={bids}
                    renderItem={renderBidItem}
                    keyExtractor={item => item.id}
                    style={styles.bidsList}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.emptyList}>
                            <Text style={styles.emptyText}>No bids added yet</Text>
                        </View>
                    }
                />
            </View>

            {/* Bottom Bar */}
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
        paddingVertical: 15,
        paddingTop: 45,
        backgroundColor: '#F5EDE0'
    },
    backButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#D0D0D0',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0E8Da'
    },
    headerTitle: {
        flex: 1,
        fontSize: 17,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        textTransform: 'uppercase',
        textAlign: 'center',
        marginHorizontal: 10
    },
    balanceChip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#C36578',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6
    },
    balanceText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        fontFamily: 'RaleighStdDemi'
    },
    content: {
        flex: 1,
        paddingHorizontal: 15
    },
    topRow: {
        flexDirection: 'row',
        gap: 10,
        paddingTop: 12,
        paddingBottom: 15
    },
    datePickerBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        gap: 8
    },
    dateText: {
        fontSize: 14,
        color: '#000',
        fontFamily: 'RaleighStdDemi'
    },
    dropdown: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        paddingHorizontal: 15,
        paddingVertical: 14,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E8E8E8'
    },
    dropdownText: {
        fontSize: 15,
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        fontWeight: '500'
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        gap: 10
    },
    inputLabel: {
        fontSize: 15,
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        flex: 0.8
    },
    inputWrapper: {
        flex: 1.2,
        position: 'relative'
    },
    textInput: {
        width: '100%',
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 25,
        fontSize: 16,
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        borderWidth: 1,
        borderColor: '#E8E8E8',
        textAlign: 'center'
    },
    tooltip: {
        position: 'absolute',
        right: -10,
        top: '50%',
        transform: [{ translateY: -20 }],
        zIndex: 1000,
        flexDirection: 'row',
        alignItems: 'center',
    },
    tooltipBubble: {
        backgroundColor: '#C36578',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    tooltipArrow: {
        width: 0,
        height: 0,
        borderTopWidth: 6,
        borderTopColor: 'transparent',
        borderBottomWidth: 6,
        borderBottomColor: 'transparent',
        borderRightWidth: 8,
        borderRightColor: '#C36578',
        marginLeft: -8,
    },
    tooltipIcon: {
        marginRight: 2,
    },
    tooltipText: {
        color: '#fff',
        fontSize: 12,
        fontFamily: 'RaleighStdDemi',
        fontWeight: '600',
    },
    pointsPickerContainer: {
        position: 'absolute',
        top: 55,
        left: 0,
        width: '100%',
        backgroundColor: '#fff',
        borderRadius: 15,
        maxHeight: 400, // Increased to ensure all 10 items fit
        borderWidth: 1,
        borderColor: '#E8E8E8',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        zIndex: 1000,
    },
    pointsPickerScroll: {
        maxHeight: 400,
        paddingTop: 0, // Removed padding top to save space
    },
    pointsPickerItem: {
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    pointsPickerText: {
        fontSize: 16,
        color: '#000',
        fontFamily: 'RaleighStdDemi',
        textAlign: 'center',
    },
    pickerCloseBtn: {
        position: 'absolute',
        top: 5,
        right: 5,
        padding: 5,
        zIndex: 10,
    },
    addButton: {
        backgroundColor: '#C36578',
        paddingVertical: 14,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 10, // Reduced margin
        marginTop: 10
    },
    addButtonText: {
        color: '#fff',
        fontSize: 17,
        fontWeight: 'bold',
        fontFamily: 'RaleighStdDemi'
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#C36578',
        marginBottom: 5
    },
    tableHeaderText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'RaleighStdDemi',
        color: '#C36578'
    },
    bidsList: {
        flex: 1,
        marginBottom: 10
    },
    bidRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6, // Slightly reduced
        paddingHorizontal: 15,
        marginBottom: 3, // Reduced
        backgroundColor: '#fff',
        borderRadius: 25,
        borderWidth: 1,
        borderColor: '#E8E8E8',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1
    },
    bidCell: {
        flex: 1,
        textAlign: 'center',
        fontSize: 15,
        color: '#333',
        fontFamily: 'RaleighStdDemi'
    },
    deleteBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    deleteIconContainer: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#C36578',
        justifyContent: 'center',
        alignItems: 'center'
    },
    emptyList: {
        paddingVertical: 40,
        alignItems: 'center'
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        fontFamily: 'RaleighStdDemi'
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: '#F5EDE0',
        borderTopWidth: 2,
        borderTopColor: '#C36578',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    statsContainer: {
        flex: 1,
        flexDirection: 'row',
        gap: 20
    },
    statItem: {
        flex: 1,
        alignItems: 'center'
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'RaleighStdDemi',
        marginBottom: 4
    },
    statValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
        fontFamily: 'RaleighStdDemi'
    },
    submitButton: {
        backgroundColor: '#C36578',
        paddingHorizontal: 50,
        paddingVertical: 14,
        borderRadius: 10,
        marginLeft: 10
    },
    submitButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'RaleighStdDemi',
        letterSpacing: 0.5
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    modalContent: {
        backgroundColor: '#fff',
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
        borderColor: '#E8E8E8'
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
    }
});