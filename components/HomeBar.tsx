import { MaterialIcons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

type NavItem = {
  name: string;
  iconName: keyof typeof MaterialIcons.glyphMap;
  route: string;
};

const navItems: NavItem[] = [
  { name: 'Home', iconName: 'home', route: '/' },
  { name: 'Homework', iconName: 'menu-book', route: '/homework' },
  { name: 'Settings', iconName: 'settings', route: '/settings' },
];

export default function HeaderNavbar() {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = `/${segments[0] || ''}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {navItems.map((item) => {
          const isActive = currentRoute === item.route;
          return (
            <Pressable
              key={item.name}
              onPress={() => router.push(item.route as any)} 
              style={styles.navItem}
            >
              <MaterialIcons
                name={item.iconName}
                size={28}
                color={isActive ? 'white' : 'lightgray'}
              />
              <Text style={[styles.label, { color: isActive ? 'white' : 'lightgray' }]}>
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#00529B',
  },
  container: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  navItem: {
    alignItems: 'center',
    padding: 4,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});