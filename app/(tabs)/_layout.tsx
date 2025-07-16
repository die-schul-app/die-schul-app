import {Colors} from '@/constants/Colors';
import {useTheme} from '@/contexts/ThemeContext';
import {FontAwesome} from '@expo/vector-icons';
import {Tabs} from 'expo-router';
import React from 'react';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
    return <FontAwesome size={28} style={{marginBottom: -3}} {...props} />;
}

export default function TabLayout() {
    const {theme} = useTheme();
    const colors = theme === 'light' ? Colors.light : Colors.dark;

    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: colors.primary,
                tabBarStyle: {backgroundColor: colors.background},
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
            }}>
            <Tabs.Screen
                name="schedule"
                options={{
                    title: 'Schedule',
                    tabBarIcon: ({color}) => <TabBarIcon name="calendar" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="homework"
                options={{
                    title: 'Homework',
                    tabBarIcon: ({color}) => <TabBarIcon name="book" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="grades"
                options={{
                    title: 'Grades',
                    tabBarIcon: ({color}) => <TabBarIcon name="star" color={color}/>,
                }}
            />
            <Tabs.Screen
                name="settings"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({color}) => <TabBarIcon name="cog" color={color}/>,
                }}
            />
        </Tabs>
    );
} 