import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Threedots from '@/components/Buttons/Threedots'

type BoxProps = {
    Subject: string;
    Text: string;
    date: string;
};

import { Colors } from '@/constants/Colors';

import { useTheme } from '@/contexts/ThemeContext';

const HomeworkBox = (prop: BoxProps) => {
    const { theme } = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;

    return (
        <View style={[styles.square, { backgroundColor: colors.background }]}>
            <View style={styles.nextCenter}>
                <View style={styles.centerBox}>
                    <Text style={[styles.homeworkFont, { backgroundColor: colors.tint, color: theme === 'light' ? colors.text : 'black' }]}>{prop.Subject} {prop.date}</Text>
                </View>
                <View style={styles.threeDotsWrapper}>
                    <Threedots />
                </View>
            </View>
            <View style={[styles.innerSquare, { backgroundColor: colors.background, borderColor: colors.tint, borderWidth: 1 }]}>
                <Text style={[styles.innerText, { color: colors.text }]}>{prop.Text}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    square: {
        height: 150,
        borderRadius: 12,
        padding: 10,
        marginVertical: 10,
    },
    nextCenter: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    homeworkFont: {
        fontSize: 22,
        paddingVertical: 4,
        textAlign: 'center',
        fontWeight: '600',
        borderRadius: 6,
        overflow: 'hidden',
        width: '100%',
    },
    innerSquare: {
        flex: 1,
        backgroundColor: '#E5E7EB',
        marginTop: 8,
        borderRadius: 8,
        padding: 8,
    },
    innerText: {
        fontSize: 16,
    },
    centerBox: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
    },
    threeDotsWrapper: {
        position: 'absolute',
        right: 0,
        padding: 5,
    },
});

export default HomeworkBox