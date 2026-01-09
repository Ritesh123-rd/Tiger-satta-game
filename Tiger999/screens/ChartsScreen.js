import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ChartsScreen({ navigation }) {
    const chartItems = [
        { id: 1, name: 'TIME BAZAR', type: 'Main Bazar' },
        { id: 2, name: 'KARNATAKA DAY', type: 'Main Bazar' },
        { id: 3, name: 'SUN DAY', type: 'Main Bazar' },
        { id: 4, name: 'SRIDEVI', type: 'Main Bazar' },
        { id: 5, name: 'MADHUR DAY', type: 'Main Bazar' },
        { id: 6, name: 'PUNE DAY', type: 'Main Bazar' },
    ];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#C36578" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Charts</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Content */}
            <ScrollView style={styles.content}>
                {chartItems.map((item) => (
                    <TouchableOpacity key={item.id} style={styles.chartCard}>
                        <View style={styles.chartIcon}>
                            <Ionicons name="bar-chart" size={28} color="#C36578" />
                        </View>
                        <View style={styles.chartInfo}>
                            <Text style={styles.chartName}>{item.name}</Text>
                            <Text style={styles.chartType}>{item.type}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#666" />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5EDE0',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#C36578',
        paddingHorizontal: 15,
        paddingVertical: 15,
        paddingTop: 45,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        fontFamily: 'RaleighStdDemi',
    },
    content: {
        flex: 1,
        padding: 15,
    },
    chartCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 15,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    chartIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#FFF0F3',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    chartInfo: {
        flex: 1,
    },
    chartName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        fontFamily: 'RaleighStdDemi',
    },
    chartType: {
        fontSize: 13,
        color: '#666',
        marginTop: 3,
        fontFamily: 'RaleighStdDemi',
    },
});
