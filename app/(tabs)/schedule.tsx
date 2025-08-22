import { supabase } from '@/config/supabaseClient';
import { getClass } from '@/service/Class/DB/getClass';
import { DSBClient } from '@/service/DSB/dsbclient';
import { TimeTable } from '@/service/DSB/timetable';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function Schedule() {
    const [timetable, setTimetable] = useState<TimeTable | null>(null);
    const [userClass, setUserClass] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const dsb_username = "148922";
    const dsb_password = "vPl4nS4g";

    const fetchData = async () => {
        try {
            const { data, error } = await getClass();
            if (error) {
                console.error("Failed to get class:", error);
                return;
            }
            const currentClass = data ? data[0].class : null;
            console.log('Current class:', currentClass);
            setUserClass(currentClass);

            const client = new DSBClient(dsb_username, dsb_password);
            await client.fetchTimetables();
            const today = '2025-07-21';
            const table = await client.getTimetable(today);
            console.log('Timetable:', table);
            setTimetable(table);
        } catch (error) {
            console.error('Failed to fetch timetable:', error);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        const channel = supabase
            .channel('class-change')
            .on('postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_setting',
                },
                (payload: RealtimePostgresChangesPayload<{ [key: string]: any }>) => {
                    console.log('Database change received!', payload);
                    fetchData();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    if (loading) return <Text>Loading...</Text>;

    return (
        <View style={styles.container}>
            {timetable && userClass ? (
                <Text>
                    {`Timetable for ${timetable.date}:\n${timetable.items
                        .filter(item => item.class.toLowerCase() === userClass.toLowerCase())
                        .map(item => `${item.periodStart}-${item.periodEnd}: ${item.subject} in ${item.room} with ${item.teacher}`)
                        .join('\n')}`}
                </Text>
            ) : (
                <Text>No timetable available</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
});
