import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Colors} from '@/constants/Colors';
import {useTheme} from '@/contexts/ThemeContext';

interface ScheduleBoxProps {
    periodStart: number;
    periodEnd: number;
    teacher: string;
    subject: string;
    room: string;
    message?: string;
    className?: string;
    time?: string;
}

const ScheduleBox: React.FC<ScheduleBoxProps> = ({
                                                     subject,
                                                     room,
                                                     teacher,
                                                     periodStart,
                                                     periodEnd,
                                                     message,
                                                     className,
                                                     time
                                                 }) => {
    const {theme} = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;
    const period = periodEnd && periodEnd !== periodStart ? `${periodStart} - ${periodEnd}` : `${periodStart}`;

    return (
        <View style={[styles.square, {backgroundColor: colors.background}]}>
            <View style={styles.headerRow}>
                <Text style={[styles.subject, {
                    backgroundColor: colors.tint,
                    color: theme === 'light' ? colors.text : 'black'
                }]}>{subject}</Text>
                <Text style={[styles.period, {color: colors.text}]}>Period {period}</Text>
            </View>
            <View style={[styles.innerSquare, {
                backgroundColor: colors.background,
                borderColor: colors.tint,
                borderWidth: 1
            }]}>
                {time && <Text style={[styles.time, {color: colors.text}]}>{time}</Text>}
                <Text style={[styles.room, {color: colors.text}]}>{room}</Text>
                {teacher && <Text style={[styles.teacher, {color: colors.text}]}>{teacher}</Text>}
                {className && <Text style={[styles.className, {
                    color: colors.text,
                    fontStyle: 'italic',
                    fontSize: 13
                }]}>Class: {className}</Text>}
                {message && <Text style={{color: colors.text, marginTop: 4}}>{message}</Text>}
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
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    subject: {
        fontSize: 22,
        paddingVertical: 4,
        textAlign: 'left',
        fontWeight: '600',
        borderRadius: 6,
        overflow: 'hidden',
        flex: 1,
    },
    period: {
        fontSize: 16,
        marginLeft: 10,
        fontWeight: '500',
    },
    innerSquare: {
        flex: 1,
        backgroundColor: '#E5E7EB',
        marginTop: 8,
        borderRadius: 8,
        padding: 8,
    },
    time: {
        fontSize: 16,
        fontWeight: '500',
    },
    room: {
        fontSize: 15,
        marginTop: 2,
    },
    teacher: {
        fontSize: 14,
        marginTop: 2,
    },
    className: {
        marginTop: 2,
    },
});

export default ScheduleBox;
