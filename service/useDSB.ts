import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { DSBClient } from './DSB/DSBClient';
import { ScheduleItem, TimeTable } from './DSB/TimeTable';
import { AuthenticationError, IncompatiblePlan, NetworkError } from './DSB/errors';

const DSB_CREDENTIALS_KEY = 'dsb_credentials';
const DSB_CACHE_KEY = 'dsb_timetable_cache';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface DSBCredentials {
  username: string;
  password: string;
}

interface CachedTimetable {
  data: TimeTable;
  timestamp: number;
}

export interface DSBState {
  isLoading: boolean;
  isAuthenticated: boolean;
  timetable: ScheduleItem[] | null;
  error: string | null;
  lastUpdated: Date | null;
}

export function useDSB() {
  const [state, setState] = useState<DSBState>({
    isLoading: false,
    isAuthenticated: false,
    timetable: null,
    error: null,
    lastUpdated: null,
  });

  const [dsbClient, setDsbClient] = useState<DSBClient | null>(null);

  // Load saved credentials on mount
  useEffect(() => {
    loadSavedCredentials();
  }, []);

  const loadSavedCredentials = async () => {
    try {
      const savedCredentials = await AsyncStorage.getItem(DSB_CREDENTIALS_KEY);
      if (savedCredentials) {
        const credentials: DSBCredentials = JSON.parse(savedCredentials);
        const client = new DSBClient(credentials.username, credentials.password);
        setDsbClient(client);
        setState(prev => ({ ...prev, isAuthenticated: true }));
        
        // Try to load cached timetable
        await loadCachedTimetable();
      }
    } catch (error) {
      console.error('Failed to load saved credentials:', error);
    }
  };

  const loadCachedTimetable = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(DSB_CACHE_KEY);
      if (cachedData) {
        const cached: CachedTimetable = JSON.parse(cachedData);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - cached.timestamp < CACHE_DURATION) {
          setState(prev => ({
            ...prev,
            timetable: cached.data.items,
            lastUpdated: new Date(cached.timestamp),
          }));
          return true;
        }
      }
    } catch (error) {
      console.error('Failed to load cached timetable:', error);
    }
    return false;
  };

  const saveTimetableToCache = async (timetable: TimeTable) => {
    try {
      const cacheData: CachedTimetable = {
        data: timetable,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(DSB_CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to cache timetable:', error);
    }
  };

  const authenticate = async (username: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const client = new DSBClient(username, password);
      // Test authentication by trying to fetch timetable
      await client.getTimetable();
      
      // Save credentials
      const credentials: DSBCredentials = { username, password };
      await AsyncStorage.setItem(DSB_CREDENTIALS_KEY, JSON.stringify(credentials));
      
      setDsbClient(client);
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: true,
        error: null,
      }));
      
      // Fetch timetable after successful authentication
      await fetchTimetable(client);
      return true;
    } catch (error) {
      let errorMessage = 'Authentication failed';
      
      if (error instanceof AuthenticationError) {
        errorMessage = 'Invalid username or password';
      } else if (error instanceof NetworkError) {
        errorMessage = 'Network error - check your internet connection';
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        error: errorMessage,
      }));
      return false;
    }
  };

  const fetchTimetable = async (client?: DSBClient): Promise<void> => {
    const activeClient = client || dsbClient;
    if (!activeClient) {
      setState(prev => ({ ...prev, error: 'Not authenticated' }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const timetable = await activeClient.getTimetable();
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        timetable: timetable.items,
        lastUpdated: new Date(),
        error: null,
      }));
      
      // Cache the timetable
      await saveTimetableToCache(timetable);
    } catch (error) {
      let errorMessage = 'Failed to fetch timetable';
      
      if (error instanceof IncompatiblePlan) {
        errorMessage = 'Timetable format not supported';
      } else if (error instanceof NetworkError) {
        errorMessage = 'Network error - check your internet connection';
      } else if (error instanceof AuthenticationError) {
        errorMessage = 'Authentication expired - please login again';
        setState(prev => ({ ...prev, isAuthenticated: false }));
      }
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(DSB_CREDENTIALS_KEY);
      await AsyncStorage.removeItem(DSB_CACHE_KEY);
      
      dsbClient?.clearCredentials();
      setDsbClient(null);
      
      setState({
        isLoading: false,
        isAuthenticated: false,
        timetable: null,
        error: null,
        lastUpdated: null,
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const refreshTimetable = async (): Promise<void> => {
    if (dsbClient) {
      await fetchTimetable();
    }
  };

  const getTodaysSchedule = (): ScheduleItem[] => {
    if (!state.timetable) return [];
    
    const today = new Date().toLocaleDateString('de-DE', { weekday: 'long' });
    return state.timetable.filter(item => item.day === today);
  };

  return {
    ...state,
    authenticate,
    logout,
    refreshTimetable,
    getTodaysSchedule,
  };
}
