import React, { useState, useEffect, useCallback } from 'react';
import { PaperProvider, MD3LightTheme as DefaultTheme } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { View, BackHandler, Alert, StatusBar } from 'react-native';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import MyBKLoginScreen from './src/screens/MyBKLoginScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PreviewScreen from './src/screens/PreviewScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ColorAdjustScreen from './src/screens/ColorAdjustScreen';
import LoggerScreen from './src/screens/LoggerScreen';
import AnimatedScreen from './src/components/AnimatedScreen';
import { storage } from './src/services/storage';
import { calendarService } from './src/services/calendar';
import { hcmut } from './src/services/hcmut';
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://9d0639b2080805e1252e0cfbf320dfe5@o4510475319836672.ingest.us.sentry.io/4510475320819712',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6750A4', // Updated to match brand-purple from mockup
    background: '#FFFBFE',
  },
};

export default Sentry.wrap(function App() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showColorAdjust, setShowColorAdjust] = useState(false);
  const [showLogger, setShowLogger] = useState(false);
  const [isInitialFlow, setIsInitialFlow] = useState(false);
  const [scheduleData, setScheduleData] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [studentInfo, setStudentInfo] = useState<{name: string, id: string, internalId: number, username?: string} | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number>(hcmut.getCurrentSemester().code);
  const [classColors, setClassColors] = useState<Record<string, string>>({});

  const fetchSchedule = useCallback(async () => {
      const credentials = await storage.getCredentials();
      if (!credentials || !studentInfo) return;

      try {
          const year = Math.floor(selectedSemester / 10) + 2000;
          const semester = selectedSemester % 10;
          const result = await hcmut.getSchedule(
              credentials.cookie || '',
              { id: studentInfo.internalId, code: studentInfo.id },
              year,
              semester,
              credentials.token || undefined
          );
          
          if (result.data) {
              setScheduleData(result.data);
              await storage.saveSchedule(result.data);
          }
      } catch (e) {
          console.error("Fetch schedule error:", e);
      }
  }, [selectedSemester, studentInfo?.id, studentInfo?.internalId]);

  useEffect(() => {
    try {
      GoogleSignin.configure({
        webClientId: '360771838094-s6s3vs1kte5b8anf3on845ivif4dfn0e.apps.googleusercontent.com',
        offlineAccess: true,
        forceCodeForRefreshToken: true,
      });
    } catch (e) {
      console.error("Google Signin Configure Error:", e);
    }
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (studentInfo && user) {
        fetchSchedule();
    }
  }, [fetchSchedule, user]);

  const handleBackPress = useCallback(() => {
      if (showLogger) {
          setShowLogger(false);
          return true;
      }
      if (showColorAdjust) {
          setShowColorAdjust(false);
          return true;
      }
      if (showSettings) {
          setShowSettings(false);
          return true;
      }
      if (showProfile) {
          setShowProfile(false);
          return true;
      }
      if (showPreview) {
          setShowPreview(false);
          return true;
      }
      if (showLoginScreen) {
          setShowLoginScreen(false);
          return true;
      }
      return false;
  }, [showLogger, showColorAdjust, showSettings, showProfile, showPreview, showLoginScreen]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, [handleBackPress]);

  const loadFromStorage = async () => {
      try {
          const storedGoogleUser = await storage.getGoogleUser();
          if (storedGoogleUser) setUser(storedGoogleUser);

          const storedSchedule = await storage.getSchedule();
          const storedInfo = await storage.getStudentInfo();
          const storedColors = await storage.getClassColors();
          
          if (storedInfo) setStudentInfo(storedInfo);
          if (storedSchedule) setScheduleData(storedSchedule);
          if (storedColors) setClassColors(storedColors);
          
          try {
              await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
              const response = await GoogleSignin.signInSilently();
              if (response.type === 'success') {
                  setUser(response.data);
                  storage.saveGoogleUser(response.data);
              }
          } catch (e: any) {
              // Silent sign in failed or cancelled
          }
      } finally {
          setIsInitializing(false);
      }
  };

  const handleLogin = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      if (response.type === 'success') {
          setUser(response.data);
          storage.saveGoogleUser(response.data);
          setIsInitialFlow(true);
          setShowLoginScreen(true);
      }
    } catch (error: any) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
            console.log("User cancelled");
            // Do nothing, stay on Onboarding
        } else if (error.code === statusCodes.DEVELOPER_ERROR) {
            console.error("Developer Error:", error);
            Alert.alert("Lỗi cấu hình", "Google Sign-In chưa được cấu hình đúng.");
        } else {
            console.warn("Login error", error);
            // Fallback removed to prevent accidental home jump
        }
    }
  };

  const handleSwitchGoogle = async () => {
      try {
          await GoogleSignin.signOut();
          const response = await GoogleSignin.signIn();
          if (response.type === 'success') {
              setUser(response.data);
              storage.saveGoogleUser(response.data);
          }
      } catch (error: any) {
          if (error.code === statusCodes.DEVELOPER_ERROR) {
             Alert.alert("Lỗi cấu hình", "Google Sign-In chưa được cấu hình đúng.");
          } else {
             console.log(error);
          }
      }
  };

  const handleBKLoginSuccess = async (data: { studentId: string, studentName?: string, studentInternalId: number, schedule: any[], username?: string, cookie?: string, token?: string }) => {
    const info = { 
        name: data.studentName || `Sinh viên ${data.studentId}`, 
        id: data.studentId, 
        internalId: data.studentInternalId,
        username: data.username 
    };
    setStudentInfo(info);
    
    const newNotifications: any[] = [];
    if (scheduleData.length > 0) {
        data.schedule.forEach(newItem => {
            const oldItem = scheduleData.find(old => old.ID === newItem.ID);
            if (!oldItem) {
                newNotifications.push({ id: Date.now().toString() + Math.random(), title: newItem.TENMONHOC, message: 'Lịch mới được thêm' });
            } else if (JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
                 newNotifications.push({ id: Date.now().toString() + Math.random(), title: newItem.TENMONHOC, message: 'Lịch đã cập nhật' });
            }
        });
    }
    setNotifications(prev => [...newNotifications, ...prev]);

    setScheduleData(data.schedule);
    
    await storage.saveStudentInfo(info);
    await storage.saveSchedule(data.schedule);
    if (data.username && data.cookie) {
        await storage.saveCredentials(data.username, '******', data.cookie, data.token || '');
    }

    const classColors = await storage.getClassColors();
    await calendarService.syncSchedule(data.schedule, classColors);

    setShowLoginScreen(false);
    if (isInitialFlow) {
        setShowPreview(true);
        setIsInitialFlow(false);
    } else {
        setShowProfile(true);
    }
  };

  const handleSync = async () => {
      if (!scheduleData || scheduleData.length === 0) {
          Alert.alert("Thông báo", "Không có dữ liệu lịch để đồng bộ.");
          return;
      }
      
      const targetEmail = user?.user?.email || user?.email;
      if (!targetEmail) {
          Alert.alert("Lỗi", "Không tìm thấy thông tin tài khoản Google. Vui lòng đăng nhập lại.");
          return;
      }

      try {
          const classColors = await storage.getClassColors();
          await calendarService.syncSchedule(scheduleData, classColors, targetEmail);
          Alert.alert("Thành công", `Đã đồng bộ ${scheduleData.length} mục vào Google Calendar (${targetEmail}).`);
      } catch (e: any) {
          console.error(e);
          Alert.alert("Lỗi đồng bộ", e.message || "Không thể đồng bộ lịch.");
      }
  };

  const handlePreviewDone = () => {
      setShowPreview(false);
  };

  const handleLogout = async () => {
      try {
        await GoogleSignin.signOut();
        setUser(null);
        setStudentInfo(null);
        setScheduleData([]);
        setNotifications([]);
        
        setShowLoginScreen(false);
        setShowPreview(false);
        setShowProfile(false);
        setShowSettings(false);
        setShowColorAdjust(false);

        await storage.clearAll();
      } catch (error) {
        console.error(error);
      }
  };

  if (isInitializing) {
      return null;
  }

  let currentScreen;
  if (showLogger) {
      currentScreen = (
          <AnimatedScreen>
            <LoggerScreen onBack={() => setShowLogger(false)} />
          </AnimatedScreen>
      );
  } else if (showColorAdjust) {
      currentScreen = (
          <AnimatedScreen>
            <ColorAdjustScreen onBack={async () => {
                setShowColorAdjust(false);
                const colors = await storage.getClassColors();
                setClassColors(colors);
            }} />
          </AnimatedScreen>
      );
  } else if (showProfile) {
      currentScreen = (
          <AnimatedScreen>
            <ProfileScreen 
                user={user} 
                studentName={studentInfo?.name} 
                studentId={studentInfo?.id}
                bkUsername={studentInfo?.username}
                onBack={() => setShowProfile(false)}
                onSwitchGoogle={handleSwitchGoogle}
                onLoginBK={() => {
                    setShowProfile(false);
                    setShowLoginScreen(true);
                }}
                onLogout={handleLogout}
            />
          </AnimatedScreen>
      );
  } else if (showSettings) {
      currentScreen = (
          <AnimatedScreen>
            <SettingsScreen 
                onBack={() => setShowSettings(false)} 
                onOpenColorAdjust={() => setShowColorAdjust(true)}
            />
          </AnimatedScreen>
      );
  } else if (showPreview) {
      currentScreen = (
          <AnimatedScreen>
            <PreviewScreen schedule={scheduleData} onDone={handlePreviewDone} />
          </AnimatedScreen>
      );
  } else if (showLoginScreen) {
      currentScreen = (
          <AnimatedScreen>
            <MyBKLoginScreen 
                onLoginSuccess={handleBKLoginSuccess} 
                onBack={() => {
                    setShowLoginScreen(false);
                    if (!studentInfo) {
                        setUser(null);
                    } else {
                        setShowProfile(true);
                    }
                }} 
            />
          </AnimatedScreen>
      );
  } else if (user && studentInfo) {
      currentScreen = (
        <HomeScreen 
            onLogout={handleLogout} 
            schedule={scheduleData} 
            notifications={notifications}
            classColors={classColors}
            selectedSemester={selectedSemester}
            onSemesterChange={setSelectedSemester}
            onOpenProfile={() => setShowProfile(true)}
            onOpenSettings={() => setShowSettings(true)}
            onSync={handleSync}
        />
      );
  } else if (user) {
      currentScreen = (
        <AnimatedScreen>
            <MyBKLoginScreen 
                onLoginSuccess={handleBKLoginSuccess} 
                onBack={() => {
                    setUser(null);
                }} 
            />
        </AnimatedScreen>
      );
  } else {
      currentScreen = <OnboardingScreen onLogin={handleLogin} />;
  }

  return (
    <SafeAreaProvider>
      <PaperProvider theme={theme}>
        <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          {currentScreen}
        </View>
      </PaperProvider>
    </SafeAreaProvider>
  );
});