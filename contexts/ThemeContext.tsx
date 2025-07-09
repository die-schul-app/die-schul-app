import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { Colors } from '@/constants/Colors';
import { getTheme } from '@/service/db/getTheme';
import { setTheme as saveTheme } from '@/service/db/setTheme';

const ThemeContext = createContext({ theme: 'light', toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

type ThemeProviderProps = {
  children: React.ReactNode;
};

export const ThemeProvider = ({ children}: ThemeProviderProps) => {
  const [theme, setTheme] = useState('dark');

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
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
