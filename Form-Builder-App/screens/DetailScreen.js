import {FlatList, Text, SafeAreaView, StyleSheet } from 'react-native';
import React, { useEffect, useState } from 'react';
// You can import supported modules from npm
import { Card } from 'react-native-paper';

export default function DetailScreen({route}) {
    const { response } = route.params || {};

    const renderAnswer = (answer, type) => {
      if (!answer) return null;
  
      if (type === 'CHECKBOX' || type === 'GRID') {
        return Array.isArray(answer) ? (
          <Text style={styles.answer}>{answer.join(', ')}</Text>
        ) : (
          <Text style={styles.answer}>{answer.toString()}</Text>
        );
      }

      return <Text style={styles.answer}>{answer.toString()}</Text>;
    }

    return (
      <SafeAreaView style={styles.container}>
      <FlatList
        data={response.responses}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
        <React.Fragment>
          <Text style={styles.question}>
          {index + 1}. {item.question}
          </Text>
          {renderAnswer(item.answer, item.type)}
        </React.Fragment>
        )}
        showsVerticalScrollIndicator={false}
      />
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  //  justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
question: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 8,
    marginHorizontal: 8,
  },
  answer: {
    fontSize: 14,
    marginVertical: 5,
    marginHorizontal: 20,
  }
});
