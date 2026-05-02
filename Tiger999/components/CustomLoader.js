import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Modal
} from 'react-native';

const CustomLoader = ({ visible }) => {
    const dot1 = useRef(new Animated.Value(0.3)).current;
    const dot2 = useRef(new Animated.Value(0.3)).current;
    const dot3 = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (visible) {
            const animate = (val, delay) => {
                Animated.loop(
                    Animated.sequence([
                        Animated.delay(delay),
                        Animated.timing(val, {
                            toValue: 1,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                        Animated.timing(val, {
                            toValue: 0.3,
                            duration: 400,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            };

            animate(dot1, 0);
            animate(dot2, 200);
            animate(dot3, 400);
        } else {
            dot1.setValue(0.3);
            dot2.setValue(0.3);
            dot3.setValue(0.3);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.dotContainer}>
                    <Animated.View style={[styles.dot, { opacity: dot1, transform: [{ scale: dot1 }] }]} />
                    <Animated.View style={[styles.dot, { opacity: dot2, transform: [{ scale: dot2 }] }]} />
                    <Animated.View style={[styles.dot, { opacity: dot3, transform: [{ scale: dot3 }] }]} />
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dotContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
    },
    dot: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        backgroundColor: '#C36578', // Your theme color
        shadowColor: '#C36578',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 5,
    },
});

export default CustomLoader;
