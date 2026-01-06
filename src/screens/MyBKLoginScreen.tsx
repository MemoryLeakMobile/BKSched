import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, IconButton, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { hcmut } from '../services/hcmut';

interface MyBKLoginScreenProps {
  onLoginSuccess: (data: any) => void;
  onBack: () => void;
}

const MyBKLoginScreen: React.FC<MyBKLoginScreenProps> = ({ onLoginSuccess, onBack }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const trimmedUsername = username.replace(/(@mybk\.hcmut\.edu\.vn\.har|@mybk\.hcmut\.edu\.vn|@hcmut\.edu\.vn)$/, '');
      const loginResult = await hcmut.login(trimmedUsername, password);
      
      let studentId = '';
      let studentName = '';
      let studentInternalId = 0;
      try {
          const infoResult = await hcmut.getStudentInfo((loginResult as any).token, loginResult.cookie || '');
          
          if (infoResult.data && infoResult.data.code) {
              studentId = infoResult.data.code;
              studentInternalId = infoResult.data.id;
              studentName = infoResult.data.lastName && infoResult.data.firstName 
                ? `${infoResult.data.lastName} ${infoResult.data.firstName}`
                : (infoResult.data.ho_ten || infoResult.data.full_name || 'Sinh viên');
          } else {
              throw new Error("Không tìm thấy thông tin sinh viên");
          }
      } catch (infoError: any) {
          console.error("Failed to get student info:", infoError);
          Alert.alert('Lỗi', 'Đăng nhập thành công nhưng không lấy được thông tin cá nhân.');
          setLoading(false);
          return;
      }

      const scheduleResult = await hcmut.getSchedule(
          loginResult.cookie || '', 
          { id: studentInternalId, code: studentId }, 
          2025, // year
          2, // semester
          (loginResult as any).token
      );
      
      onLoginSuccess({ 
          studentId,
          studentName, 
          studentInternalId,
          schedule: scheduleResult.data, 
          username: username,
          cookie: loginResult.cookie,
          token: (loginResult as any).token
      });
      
    } catch (err: any) {
      console.log(err);
      setError('Tên người dùng hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingTop: insets.top }]}
    >
      <View style={styles.header}>
          <IconButton icon="arrow-left" onPress={onBack} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.formContainer}>
          <Text variant="displaySmall" style={styles.title}>MyBK</Text>
          
          <View style={styles.inputGroup}>
              <Text variant="labelMedium" style={styles.inputLabel}>Tên người dùng</Text>
              <View style={[styles.inputWrapper, { borderColor: theme.colors.primary }]}>
                <IconButton icon="magnify" size={24} iconColor="#49454F" />
                <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="john.doe1234"
                    placeholderTextColor="#79747E"
                    style={styles.input}
                    autoCapitalize="none"
                    mode="flat"
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    selectionColor={theme.colors.primary}
                    cursorColor={theme.colors.primary}
                    contentStyle={{paddingLeft: 0}}
                />
                {username.length > 0 && (
                    <IconButton icon="close-circle-outline" size={20} iconColor="#49454F" onPress={() => setUsername('')} />
                )}
              </View>
          </View>
          
          <View style={styles.inputGroup}>
              <Text variant="labelMedium" style={[styles.inputLabel, error ? {color: '#B3261E'} : {color: theme.colors.primary}]}>Mật khẩu</Text>
              <View style={[styles.inputWrapper, error ? {borderColor: '#B3261E'} : {borderColor: theme.colors.outline}]}>
                <IconButton icon="magnify" size={24} iconColor="#49454F" />
                <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="password"
                    placeholderTextColor="#79747E"
                    secureTextEntry
                    style={styles.input}
                    mode="flat"
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                    selectionColor={theme.colors.primary}
                    cursorColor={theme.colors.primary}
                    contentStyle={{paddingLeft: 0}}
                />
                {error && (
                     <IconButton icon="alert-circle" size={20} iconColor="#B3261E" />
                )}
              </View>
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <View style={{flex: 1}} />

          <Button 
            mode="contained" 
            onPress={handleLogin} 
            loading={loading}
            style={styles.button}
            contentStyle={{height: 48}}
            labelStyle={styles.buttonLabel}
          >
            Đăng nhập
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBFE',
  },
  header: {
    paddingHorizontal: 8,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    color: '#49454F',
    marginBottom: 48,
    fontWeight: '400',
  },
  inputGroup: {
      marginBottom: 24,
      position: 'relative',
  },
  inputLabel: {
      position: 'absolute',
      top: -10,
      left: 12,
      backgroundColor: '#FFFBFE',
      paddingHorizontal: 4,
      zIndex: 1,
      fontSize: 12,
      fontWeight: '500',
  },
  inputWrapper: {
      borderWidth: 2,
      borderRadius: 4,
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 50,
    fontSize: 16,
  },
  errorText: {
      color: '#B3261E',
      fontSize: 12,
      paddingHorizontal: 16,
      marginTop: -16,
      marginBottom: 24,
  },
  button: {
    marginTop: 'auto',
    backgroundColor: '#6750A4',
    borderRadius: 24,
    elevation: 0,
  },
  buttonLabel: {
      fontSize: 14,
      fontWeight: '500',
      textTransform: 'none',
  }
});

export default MyBKLoginScreen;
