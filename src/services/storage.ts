import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  USERNAME: 'username',
  PASSWORD: 'password', // Note: In production, use SecureStore
  COOKIE: 'cookie',
  TOKEN: 'token',
  SCHEDULE: 'schedule',
  CLASS_COLORS: 'class_colors',
  SETTINGS: 'settings',
  STUDENT_INFO: 'student_info',
  LAST_FETCH_TIME: 'last_fetch_time',
  CALENDAR_ID: 'calendar_id',
  GOOGLE_USER: 'google_user',
};

export const storage = {
  saveGoogleUser: async (user: any) => {
    try {
      await AsyncStorage.setItem(KEYS.GOOGLE_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save google user', e);
    }
  },

  getGoogleUser: async () => {
    try {
      const json = await AsyncStorage.getItem(KEYS.GOOGLE_USER);
      return json ? JSON.parse(json) : null;
    } catch (e) {
      console.error('Failed to get google user', e);
      return null;
    }
  },

  saveCredentials: async (username: string, password: string, cookie: string, token: string) => {
    try {
      await AsyncStorage.multiSet([
        [KEYS.USERNAME, username],
        [KEYS.PASSWORD, password],
        [KEYS.COOKIE, cookie],
        [KEYS.TOKEN, token],
      ]);
    } catch (e) {
      console.error('Failed to save credentials', e);
    }
  },

  getCredentials: async () => {
    try {
      const values = await AsyncStorage.multiGet([KEYS.USERNAME, KEYS.PASSWORD, KEYS.COOKIE, KEYS.TOKEN]);
      return {
        username: values[0][1],
        password: values[1][1],
        cookie: values[2][1],
        token: values[3][1],
      };
    } catch (e) {
      console.error('Failed to get credentials', e);
      return null;
    }
  },

  clearCredentials: async () => {
    try {
      await AsyncStorage.multiRemove([KEYS.USERNAME, KEYS.PASSWORD, KEYS.COOKIE, KEYS.TOKEN, KEYS.STUDENT_INFO, KEYS.SCHEDULE]);
    } catch (e) {
      console.error('Failed to clear credentials', e);
    }
  },

  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error('Failed to clear all storage', e);
    }
  },

  saveSchedule: async (schedule: any[]) => {
    try {
      await AsyncStorage.setItem(KEYS.SCHEDULE, JSON.stringify(schedule));
    } catch (e) {
      console.error('Failed to save schedule', e);
    }
  },

  getSchedule: async () => {
    try {
      const json = await AsyncStorage.getItem(KEYS.SCHEDULE);
      return json ? JSON.parse(json) : [];
    } catch (e) {
      console.error('Failed to get schedule', e);
      return [];
    }
  },

  saveStudentInfo: async (info: any) => {
      try {
          await AsyncStorage.setItem(KEYS.STUDENT_INFO, JSON.stringify(info));
      } catch (e) {
          console.error(e);
      }
  },

  getStudentInfo: async () => {
      try {
          const json = await AsyncStorage.getItem(KEYS.STUDENT_INFO);
          return json ? JSON.parse(json) : null;
      } catch (e) {
          return null;
      }
  },

  saveClassColors: async (colors: Record<string, string>) => {
    try {
      await AsyncStorage.setItem(KEYS.CLASS_COLORS, JSON.stringify(colors));
    } catch (e) {
      console.error('Failed to save class colors', e);
    }
  },

  getClassColors: async () => {
    try {
      const json = await AsyncStorage.getItem(KEYS.CLASS_COLORS);
      return json ? JSON.parse(json) : {};
    } catch (e) {
      return {};
    }
  },

  saveSettings: async (settings: any) => {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  getSettings: async () => {
    try {
      const json = await AsyncStorage.getItem(KEYS.SETTINGS);
      // Default settings
      const defaults = {
          autoFetch: false,
          fetchFrequency: 'daily',
          fetchClass: true,
          fetchExam: true,
      };
      return json ? { ...defaults, ...JSON.parse(json) } : defaults;
    } catch (e) {
      return { autoFetch: false, fetchFrequency: 'daily', fetchClass: true, fetchExam: true };
    }
  },
  
  saveCalendarId: async (id: string) => {
      await AsyncStorage.setItem(KEYS.CALENDAR_ID, id);
  },
  
  getCalendarId: async () => {
      return await AsyncStorage.getItem(KEYS.CALENDAR_ID);
  }
};
