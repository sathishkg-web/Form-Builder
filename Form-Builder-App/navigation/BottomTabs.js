// src/navigation/BottomTabs.js
import React, {useEffect} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Dimensions,  ToastAndroid } from 'react-native';
import FormBuildScreen from '../screens/FormBuildScreen';
import FormPreviewScreen from '../screens/FormPreviewScreen';
import FormResponseScreen from '../screens/FormResponseScreen';

const Tab = createBottomTabNavigator();

const BottomTabs = ({route}) => {
  const { formId, formResponseUrl, gformId } = route.params || {};  // Retrieve formId from route params
  
  // useEffect(() => {
  //   Alert.alert('Route Params:', route.params.formId);
  //   Alert.alert('Route Params:', route.params.formResponseUrl);
  // }, [route.params]);
  
  // useEffect(()=>{
  //   ToastAndroid.show('Form ID: ' + formId, ToastAndroid.SHORT);
  //   ToastAndroid.show(' url' + formResponseUrl, ToastAndroid.SHORT);
  // },[route.params]);
  return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#A78BF0', }}>
      <Tab.Screen
        name="QUESTIONS"
        component={FormBuildScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="help-circle" color={color} size={size} />,
        }}
        initialParams={{ formId }}
      />
      <Tab.Screen
        name="PREVIEW"
        component={FormPreviewScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="eye" color={color} size={size} />,
        }}
        initialParams={{ formId,formResponseUrl}}
      />
      <Tab.Screen
        name="RESPONSES"
        component={FormResponseScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="create" color={color} size={size} />,
        }}
        initialParams={{ formId, gformId}}
      />
    </Tab.Navigator>
  );
};

export default BottomTabs;
