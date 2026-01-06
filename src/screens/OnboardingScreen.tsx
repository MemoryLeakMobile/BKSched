import React, { useState } from 'react';
import { View, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { Text, Button, useTheme } from 'react-native-paper';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ onLogin }: { onLogin: () => void }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const theme = useTheme();

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="calendar-alt" size={80} color="#374151" />
            </View>
            <Text variant="headlineSmall" style={styles.title}>
              Quản lý thời khóa biểu thông minh cùng BKSched
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Quản lý lịch học dễ dàng hơn bao giờ hết
            </Text>
          </View>
        );
      case 2:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="exchange-alt" size={80} color="#374151" />
            </View>
            <Text variant="headlineSmall" style={styles.title}>
              Đồng bộ tự động với Google Calendar
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Mọi thay đổi trong MyBK sẽ tự động cập nhật sang lịch cá nhân của bạn.
            </Text>
          </View>
        );
      case 3:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="clock" size={80} color="#374151" />
            </View>
            <Text variant="headlineSmall" style={styles.title}>
              Không bỏ lỡ bất kỳ thay đổi nào
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Khi có thay đổi về phòng học, giờ học hoặc lịch thi, bạn sẽ được thông báo ngay.
            </Text>
          </View>
        );
      case 4:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="users" size={80} color="#374151" />
            </View>
            <Text variant="headlineSmall" style={styles.title}>
              Thiết kế tối giản, tập trung vào trải nghiệm
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              BKSched được tối ưu cho sinh viên - nhanh, nhẹ và dễ sử dụng trên mọi thiết bị
            </Text>
          </View>
        );
      case 5:
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <FontAwesome5 name="user-circle" size={80} color="#374151" />
            </View>
            <Text variant="headlineMedium" style={styles.title}>
              BKSched
            </Text>
            <Text variant="bodyMedium" style={styles.description}>
              Hãy đăng nhập để bắt đầu đồng bộ lịch học
            </Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderContent()}
        
        <View style={styles.footer}>
          {currentStep < 5 ? (
            <Button 
              mode="contained" 
              onPress={nextStep} 
              style={styles.nextButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Tiếp tục
            </Button>
          ) : (
            <Button 
              mode="contained" 
              onPress={onLogin} 
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
              labelStyle={styles.buttonLabel}
            >
              Đăng nhập bằng Google
            </Button>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBE6F5',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  iconContainer: {
    width: 128,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  description: {
    color: '#6B7280',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  footer: {
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  nextButton: {
    borderRadius: 30,
    width: 128,
    backgroundColor: '#5E4B8B',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  loginButton: {
    borderRadius: 30,
    width: '100%',
    backgroundColor: '#5E4B8B',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonContent: {
    height: 48,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  loginButtons: {
    width: '100%',
    alignItems: 'center',
  },
});

export default OnboardingScreen;
