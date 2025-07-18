import Threedots from '@/components/Buttons/Threedots';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import React, {useState} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DotsModal } from './DotsModal';

type BoxProps = {
    Subject: string;
    Text: string;
    date: string;
    homework_id: number;
};

const HomeworkBox = (prop: BoxProps) => {
    const { theme } = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;

    const [isModalVisible, setModalVisible] = useState(false);
    const openModal = () => setModalVisible(true);
    const closeModal = () => setModalVisible(false);

    return (
        <View style={[styles.square, { backgroundColor: colors.background }]}>
            <View style={styles.nextCenter}>
                <View style={styles.centerBox}>
                    <Text style={[styles.homeworkFont, { backgroundColor: colors.primary, color: '#fff'}]}>{prop.Subject} {prop.date}</Text>
                </View>
                <View style={styles.threeDotsWrapper}>
                    <Threedots handlePress={openModal}/>
                    <DotsModal visible={isModalVisible} onClose ={closeModal} homework_id ={prop.homework_id}/>
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