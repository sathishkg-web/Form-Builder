import { TouchableOpacity, Text, SafeAreaView, StyleSheet, Button, ToastAndroid } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabs from './BottomTabs';
import HomeScreen from '../screens/HomeScreen';
import DetailScreen from '../screens/DetailScreen';
import React, { useState, useRef, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import tw from 'tailwind-react-native-classnames';
import { useAuth } from '@clerk/clerk-react';

const stack = createStackNavigator();

export default function HomeNavigation() {
  const {isLoaded, signOut}= useAuth();

    useEffect(() => {
        ToastAndroid.showWithGravity(
          'Welcome to Form Builder App',
          ToastAndroid.SHORT,
          ToastAndroid.CENTER
        );
      }, []);
  return (
      <stack.Navigator initialRouteName="ALL FORMS" >
        <stack.Screen name="ALL FORMS" component={HomeScreen} options={{headerShown:true,headerTitleAlign: 'center',
        headerRight: ()=>(<TouchableOpacity onPress={()=>signOut()}><Ionicons name="log-out" size={35} color="#9333EA" style={tw`mr-2`}/></TouchableOpacity>),
        headerLeft: ()=>(<Ionicons name="menu" size={36} color="#9333EA" style={tw`ml-3`}/>)}}/>
        <stack.Screen name="FORM" component={BottomTabs} options={{
        headerShown: true,headerTitleAlign: 'center',
      }}/>
      <stack.Screen name="Detail" component={DetailScreen} options={{
        headerShown: true,headerTitleAlign: 'center',
      }}/>
      </stack.Navigator>
  );
}

