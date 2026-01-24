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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

export default function JodiGame({ navigation, route }) {
    const { gameName, gameType } = route.params || { gameName: 'JODI', gameType: 'open' };
    const [selectedGameType, setSelectedGameType] = useState('OPEN');
    const [showDropdown, setShowDropdown] = useState(false);
    const [jodi, setJodi] = useState('');
    const [points, setPoints] = useState('');
    const [bids, setBids] = useState([]);
    const [totalBids, setTotalBids] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
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

    useEffect(() => {
        let bidCount = bids.length;
        let pointSum = bids.reduce((sum, bid) => sum + parseInt(bid.points || 0), 0);
        setTotalBids(bidCount);
        setTotalPoints(pointSum);
    }, [bids]);

    const handleAddBid = () => {
        if (!jodi || jodi.length !== 2) {
            Alert.alert('Error', 'Please enter a valid 2-digit jodi');
            return;
        }
        if (!points || parseInt(points) <= 0) {
            Alert.alert('Error', 'Please enter valid points');
            return;
        }

        const newBid = {
            id: `${jodi}-${Date.now()}-${Math.random()}`,
            jodi: jodi,
            points: points,
            type: selectedGameType.toLowerCase(),
        };

        setBids(prev => [...prev, newBid]);
        setJodi('');
        setPoints('');
    };

    const handleDeleteBid = (bidId) => {
        setBids(prev => prev.filter(bid => bid.id !== bidId));
    };

    const handleSubmit = () => {
        if (bids.length === 0) {
            Alert.alert('Error', 'Please add at least one bid');
            return;
        }
        Alert.alert(
            'Success',
            `${totalBids} bids submitted for ${totalPoints} points!`,
            [{ text: 'OK', onPress: () => { setBids([]); setJodi(''); setPoints(''); } }]
        );
    };

    const renderBidItem = ({ item }) => (
        <View style={styles.bidRow}>
            <Text style={styles.bidCell}>{item.jodi}</Text>
            <Text style={styles.bidCell}>{item.points}</Text>
            <Text style={styles.bidCell}>{item.type}</Text>
            <TouchableOpacity onPress={() => handleDeleteBid(item.id)} style={styles.deleteBtn}>
                <View style={styles.deleteIconContainer}>
                    <Ionicons name="close" size={12} color="#C36578" />
                </View>
            </TouchableOpacity>
        </View>
    );

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

            <View style={styles.content}>
                <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Select Game Type:</Text>
                    <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)}>
                        <Text style={styles.dropdownText}>{selectedGameType}</Text>
                        <Ionicons name="chevron-down" size={20} color="#B8860B" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Enter Jodi:</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Jodi"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        maxLength={2}
                        value={jodi}
                        onChangeText={setJodi}
                    />
                </View>

                <View style={styles.inputRow}>
                    <Text style={styles.inputLabel}>Enter Points:</Text>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Point"
                        placeholderTextColor="#999"
                        keyboardType="numeric"
                        value={points}
                        onChangeText={setPoints}
                    />
                </View>

                <TouchableOpacity style={styles.addButton} onPress={handleAddBid}>
                    <Text style={styles.addButtonText}>Add</Text>
                </TouchableOpacity>

                <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderText, { color: '#C36578' }]}>Jodi</Text>
                    <Text style={[styles.tableHeaderText, { color: '#C36578' }]}>Point</Text>
                    <Text style={[styles.tableHeaderText, { color: '#C36578' }]}>Type</Text>
                    <Text style={[styles.tableHeaderText, { color: '#C36578' }]}>Delete</Text>
                </View>

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

            <View style={styles.bottomBar}>
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
                    <Text style={styles.submitButtonText}>Submit</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={showDropdown} transparent={true} animationType="fade" onRequestClose={() => setShowDropdown(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDropdown(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select Game Type</Text>
                        <TouchableOpacity
                            style={[styles.modalOption, selectedGameType === 'OPEN' && styles.modalOptionSelected]}
                            onPress={() => { setSelectedGameType('OPEN'); setShowDropdown(false); }}
                        >
                            <Text style={[styles.modalOptionText, selectedGameType === 'OPEN' && styles.modalOptionTextSelected]}>OPEN</Text>
                            {selectedGameType === 'OPEN' && <Ionicons name="checkmark-circle" size={22} color="#2E4A3E" />}
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.modalOption, selectedGameType === 'CLOSE' && styles.modalOptionSelected]}
                            onPress={() => { setSelectedGameType('CLOSE'); setShowDropdown(false); }}
                        >
                            <Text style={[styles.modalOptionText, selectedGameType === 'CLOSE' && styles.modalOptionTextSelected]}>CLOSE</Text>
                            {selectedGameType === 'CLOSE' && <Ionicons name="checkmark-circle" size={22} color="#2E4A3E" />}
                        </TouchableOpacity>
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
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#000', fontFamily: 'RaleighStdDemi', textTransform: 'uppercase', letterSpacing: 0.5 },
    balanceChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#C36578', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, gap: 4 },
    balanceText: { color: '#fff', fontSize: 12, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
    content: { flex: 1, paddingHorizontal: 15, paddingTop: 10 },
    inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    inputLabel: { fontSize: 14, color: '#000', fontFamily: 'RaleighStdDemi', flex: 1 },
    dropdown: { flex: 1.2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 25, borderWidth: 1, borderColor: '#E8E8E8' },
    dropdownText: { fontSize: 14, color: '#000', fontFamily: 'RaleighStdDemi', fontWeight: '500' },
    textInput: { flex: 1.2, backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 12, borderRadius: 25, fontSize: 14, color: '#000', fontFamily: 'RaleighStdDemi', borderWidth: 1, borderColor: '#E8E8E8', textAlign: 'center' },
    addButton: { backgroundColor: '#C36578', paddingVertical: 14, borderRadius: 25, alignItems: 'center', marginBottom: 15 },
    addButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
    tableHeader: { flexDirection: 'row', paddingVertical: 10, paddingHorizontal: 5, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
    tableHeaderText: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '600', fontFamily: 'RaleighStdDemi' },
    bidsList: { flex: 1 },
    bidRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 10, marginBottom: 6, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0' },
    bidCell: { flex: 1, textAlign: 'center', fontSize: 14, color: '#333', fontFamily: 'RaleighStdDemi' },
    deleteBtn: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    deleteIconContainer: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#C36578', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
    emptyList: { paddingVertical: 40, alignItems: 'center' },
    emptyText: { fontSize: 14, color: '#999', fontFamily: 'RaleighStdDemi' },
    bottomBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15, paddingBottom: 25, backgroundColor: '#F5EDE0', borderTopWidth: 2, borderTopColor: '#C36578' },
    statsContainer: { flex: 1, flexDirection: 'row' },
    statItem: { flex: 1, alignItems: 'center' },
    statLabel: { fontSize: 13, color: '#666', fontFamily: 'RaleighStdDemi' },
    statValue: { fontSize: 18, fontWeight: 'bold', color: '#000', fontFamily: 'RaleighStdDemi' },
    submitButton: { backgroundColor: '#C36578', paddingHorizontal: 45, paddingVertical: 14, borderRadius: 8 },
    submitButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 20, paddingHorizontal: 25, width: SCREEN_WIDTH * 0.8, maxWidth: 320, elevation: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', fontFamily: 'RaleighStdDemi', textAlign: 'center', marginBottom: 20 },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, marginBottom: 10, backgroundColor: '#F5EDE0', borderWidth: 2, borderColor: '#E8E8E8' },
    modalOptionSelected: { backgroundColor: '#E8F5E9', borderColor: '#2E4A3E' },
    modalOptionText: { fontSize: 16, fontWeight: '600', color: '#333', fontFamily: 'RaleighStdDemi' },
    modalOptionTextSelected: { color: '#2E4A3E' },
});
