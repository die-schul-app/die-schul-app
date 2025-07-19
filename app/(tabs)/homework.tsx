import { FlatList, StyleSheet, Text, View } from 'react-native';
import AddButton from '@/components/Buttons/AddButton';
import HomeworkBox from '@/components/Boxes/HomeworkBox';
import { getHomework } from '@/service/getHomework';
import formatDate from '@/service/Date/formatDate';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '@/config/supabaseClient';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type HomeworkType = {
    id: number;
    subject: string;
    to_do: string;
    due_date: string; 
};

export default function Homework() {
    const { theme } = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;
    const { user } = useAuth();
    const [homework, setHomework] = useState<HomeworkType[] | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchAndSetHomework = async () => {
        if (!user) return;

        const { Homework, error } = await getHomework(user);
        if (error) {
            setError(error);
        } else {
            setHomework(Homework as HomeworkType[]);
        }
    };

    useEffect(() => {
        fetchAndSetHomework();

        const channel = supabase
            .channel('homework-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'homework',
                },
                (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
                    console.log('Database change received!', payload);
                    fetchAndSetHomework();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user]);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            {error && <Text style={{ color: 'red', padding: 20 }}>Error: {error}</Text>}

            {homework && homework.length === 0 && (
                <Text style={[styles.emptyText, { color: colors.text }]}>No homework found. Add some!</Text>
            )}

            <FlatList
                data={homework}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <HomeworkBox
                        homework_id={item.id} 
                        Subject={item.subject}
                        Text={item.to_do}
                        date={formatDate(item.due_date)}
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
    emptyText: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 18,
    },
});