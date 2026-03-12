import React, { useEffect, useRef } from 'react';
import { Alert, Platform, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

import DashboardScreen from './src/screens/DashboardScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AlertsScreen from './src/screens/AlertsScreen';
import { colors } from './src/theme';

// Show notifications in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Dashboard: { focused: 'leaf', unfocused: 'leaf-outline' },
  History: { focused: 'analytics', unfocused: 'analytics-outline' },
  Settings: { focused: 'options', unfocused: 'options-outline' },
  Alerts: { focused: 'notifications', unfocused: 'notifications-outline' },
};

const DarkTheme = {
  dark: true,
  colors: {
    primary: colors.mint,
    background: colors.bgDeep,
    card: colors.bgDeep,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.mint,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' },
    medium: { fontFamily: 'System', fontWeight: '500' },
    bold: { fontFamily: 'System', fontWeight: '700' },
    heavy: { fontFamily: 'System', fontWeight: '900' },
  },
};

export default function App() {
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      const { title, body } = notification.request.content;
      Alert.alert(title || 'Notification', body || '');
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {});

    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(notificationListener.current);
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);

  return (
    <NavigationContainer theme={DarkTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            const icons = TAB_ICONS[route.name];
            const iconName = focused ? icons.focused : icons.unfocused;
            return (
              <View style={focused ? {
                shadowColor: colors.mint,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.6,
                shadowRadius: 8,
              } : undefined}>
                <Ionicons name={iconName} size={size} color={color} />
              </View>
            );
          },
          tabBarActiveTintColor: colors.mint,
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.25)',
          tabBarStyle: {
            backgroundColor: 'rgba(10, 15, 13, 0.95)',
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 88,
            paddingTop: 8,
            paddingBottom: 28,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.5,
          },
          headerStyle: {
            backgroundColor: colors.bgDeep,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
            shadowOpacity: 0,
            elevation: 0,
          },
          headerTitleStyle: {
            fontWeight: '800',
            color: colors.textPrimary,
            fontSize: 18,
            letterSpacing: -0.5,
          },
        })}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Climate Core' }} />
        <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Tab.Screen name="Alerts" component={AlertsScreen} options={{ title: 'Alerts' }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

async function registerForPushNotifications() {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return;
  }

  try {
    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Expo push token:', token.data);
  } catch (e) {
    console.log('Failed to get push token:', e.message);
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
    });
  }
}
