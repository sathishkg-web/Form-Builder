import React, { useEffect } from 'react';
import { Alert, StyleSheet, View, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { Ionicons } from '@expo/vector-icons';

const FormPreviewScreen = ({ route }) => {
  const { formId, formResponseUrl } = route.params || {};

  useEffect(() => {
    if (formId) {
    //  console.log('Form ID:', formId);
    }
    if (formResponseUrl) {
    //  console.log('Form URL:', formResponseUrl);
    }
  }, [formId, formResponseUrl]);

  if (!formResponseUrl) {
    return (
      <View style={styles.fallbackContainer}>
        <Ionicons name="eye-off" size={48} color="purple" />
        <Text style={styles.fallbackText}>No Preview Available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WebView source={{ uri: formResponseUrl }} style={styles.webview} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ecf0f1',
  },
  webview: {
    flex: 1,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: 16,
  },
  fallbackText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default FormPreviewScreen;
