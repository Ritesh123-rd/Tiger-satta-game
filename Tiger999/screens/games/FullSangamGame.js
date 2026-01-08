import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, StatusBar, Alert, Modal, Dimensions, Animated, Easing } from 'react-native';
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
    const { gameName } = route.params || { gameName: 'FULL SANGAM' };
    const [selectedGameType, setSelectedGameType] = useState('OPEN');
    const [showDropdown, setShowDropdown] = useState(false);
    const [openPana, setOpenPana] = useState('');
    const [closePana, setClosePana] = useState('');
    const [points, setPoints] = useState('');

    const getCurrentDate = () => {
        const date = new Date();
        return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
    };

    const handleSubmit = () => {
        if (!openPana || openPana.length !== 3) { Alert.alert('Error', 'Please enter valid Open Pana (3 digits)'); return; }
        if (!closePana || closePana.length !== 3) { Alert.alert('Error', 'Please enter valid Close Pana (3 digits)'); return; }
        if (!points || parseInt(points) <= 0) { Alert.alert('Error', 'Please enter valid points'); return; }
        Alert.alert('Success', `Full Sangam bet placed: ${openPana}-${closePana} for ${points} points!`, [{ text: 'OK', onPress: () => { setOpenPana(''); setClosePana(''); setPoints(''); } }]);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#F5EDE0" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}><Ionicons name="arrow-back" size={22} color="#000" /></TouchableOpacity>
                <MarqueeText text={`${gameName} - FULL SANGAM`} style={styles.headerTitle} />
                <View style={styles.balanceChip}><Ionicons name="wallet-outline" size={14} color="#fff" /><Text style={styles.balanceText}>0.0</Text></View>
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.topRow}>
                    <View style={styles.datePickerBtn}><Ionicons name="calendar-outline" size={16} color="#ca1835" /><Text style={styles.dateText}>{getCurrentDate()}</Text></View>
                    <TouchableOpacity style={styles.dropdown} onPress={() => setShowDropdown(true)}>
                        <Text style={styles.dropdownText}>{selectedGameType}</Text>
                        <Ionicons name="chevron-down" size={18} color="#B8860B" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Enter Open Pana:</Text>
                    <TextInput style={styles.textInput} placeholder="000" placeholderTextColor="#999" keyboardType="numeric" maxLength={3} value={openPana} onChangeText={setOpenPana} />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Enter Close Pana:</Text>
                    <TextInput style={styles.textInput} placeholder="000" placeholderTextColor="#999" keyboardType="numeric" maxLength={3} value={closePana} onChangeText={setClosePana} />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Enter Points:</Text>
                    <TextInput style={styles.textInput} placeholder="Points" placeholderTextColor="#999" keyboardType="numeric" value={points} onChangeText={setPoints} />
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}><Text style={styles.submitButtonText}>Submit</Text></TouchableOpacity>
            </ScrollView>

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
    balanceChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ca1835', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 18, gap: 4 },
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
    submitButton: { backgroundColor: '#ca1835', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 20, marginBottom: 30 },
    submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold', fontFamily: 'RaleighStdDemi' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#fff', borderRadius: 20, paddingVertical: 20, paddingHorizontal: 25, width: SCREEN_WIDTH * 0.8, maxWidth: 320, elevation: 10 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', fontFamily: 'RaleighStdDemi', textAlign: 'center', marginBottom: 20 },
    modalOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 20, borderRadius: 12, marginBottom: 10, backgroundColor: '#F5EDE0', borderWidth: 2, borderColor: '#E8E8E8' },
    modalOptionSelected: { backgroundColor: '#E8F5E9', borderColor: '#2E4A3E' },
    modalOptionText: { fontSize: 16, fontWeight: '600', color: '#333', fontFamily: 'RaleighStdDemi' },
    modalOptionTextSelected: { color: '#2E4A3E' },
});
