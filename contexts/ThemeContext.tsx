import { getTheme } from '@/service/db/getTheme';
import { setTheme as saveTheme } from '@/service/db/setTheme';
import { createContext, default as React, default as React, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

type ThemeProviderProps = {
    children: React.ReactNode;
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
    const { user } = useAuth();
    const [theme, setTheme] = useState('dark');

    useEffect(() => {
        const fetchTheme = async () => {
            const storedTheme = await getTheme(user);
            setTheme(storedTheme);
        };

        fetchTheme();
    }, [user]);

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        saveTheme(user, newTheme).then();
    };
    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
