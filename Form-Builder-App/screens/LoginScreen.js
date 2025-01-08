import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, ToastAndroid } from 'react-native';
import { useOAuth } from "@clerk/clerk-expo";
import { useWarmUpBrowser } from '../hooks/warmUpBrowser';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

// Import the local image
const backgroundImage = require('../assets/images/login.png');

const LoginScreen = () => {
  useWarmUpBrowser();
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onPress = useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();
      if (createdSessionId) {
        setActive({ session: createdSessionId });
      }
    } catch (err) {
      console.log(err);
    }
  }, [startOAuthFlow]); // Make sure to include dependencies in the useCallback hook

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.background}
    >
      <View style={styles.container}>
        <TouchableOpacity style={styles.loginButton} onPress={onPress}>
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
        <Text style={{fontSize: 15, color: 'white'}}>Get Started</Text>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop:0
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginButton: {
    width: 300,
    height: 48,
    backgroundColor: 'orange',//'#8A2BE2',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginTop: 500,
    borderColor: '#FFFFFF',
    marginBottom:16
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
