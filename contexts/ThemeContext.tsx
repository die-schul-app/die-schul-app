import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { getTheme } from '@/service/db/getTheme';
import { setTheme as saveTheme } from '@/service/db/setTheme';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const fetchTheme = async () => {
      const storedTheme = await getTheme();
      setTheme(storedTheme);
    };

    fetchTheme();
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const themeColors = useMemo(() => {
    return theme === 'light' ? Colors.light : Colors.dark;
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
