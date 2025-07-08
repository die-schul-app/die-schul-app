import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Threedots from '@/components/Buttons/Threedots'

type BoxProps = {
    Subject: string;
    Text: string;
    date: string;
};

const HomeworkBox = ( prop: BoxProps ) => {
    return (
        <View style={styles.Square}>
            <View style={styles.nextcenter}>
                <View style={styles.centerBox}>
                    <Text style={styles.HomeworkFont}>{prop.Subject} {prop.date}</Text>
                </View>
                <View style={styles.ThreedotsWrapper}>
                    <Threedots/>
                </View>
            </View>
            <View style={styles.InnerSquare}>
                <Text style={styles.InnerText}>{prop.Text}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    Square: {
        width: 375,
        height: 150,
        backgroundColor: '#1F2937',
        borderRadius: 12,
        padding: 10,
        marginVertical: 10,
    },
    nextcenter: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    HomeworkFont: {
        fontSize: 22,
        paddingVertical: 4,
        backgroundColor: '#374151',
        color: '#F9FAFB',
        textAlign: 'center',
        fontWeight: '600',
        borderRadius: 6,
        overflow: 'hidden',
        width: '100%',
    },
    InnerSquare: {
        flex: 1,
        backgroundColor: '#4B5563',
        marginTop: 8,
        borderRadius: 8,
        padding: 8,
    },
    InnerText: {
        color: '#E5E7EB',
        fontSize: 16,
    },
    centerBox: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
    },
    ThreedotsWrapper: {
        position: 'absolute',
        right: 0,
        padding: 5,
    },
})

export default HomeworkBox