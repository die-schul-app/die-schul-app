import { FlatList, StyleSheet, Text, View } from 'react-native';
import AddButton from '@/components/Buttons/AddButton';
import HomeworkBox from '@/components/HomeworkBox';
import getHomework from '@/service/getHomework';
import formatDate from '@/service/Date/formatDate';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';

export default function Homework() {
    const { theme } = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;
    const { error, Homework } = getHomework();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {error && <Text>Error: {error}</Text>}

            <FlatList
                data={Homework}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <HomeworkBox
                        Subject={item.Subjekt}
                        Text={item.to_do}
                        date={formatDate(item.due)}
                    />
                )}
                contentContainerStyle={styles.listContent}
            />

            <AddButton />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
});
