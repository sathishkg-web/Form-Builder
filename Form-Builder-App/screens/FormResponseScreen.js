import { ActivityIndicator, View, TouchableOpacity, Text, SafeAreaView, StyleSheet } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { Ionicons } from '@expo/vector-icons';
import { Card } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
//import tw from 'tailwind-react-native-classnames';

export default function FormResponseScreen({ route, navigation }) {
  const { formId, gformId } = route.params || {};

  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total,setTotal]=useState(0);

  
    const fetchResponses = async () => {
      if(gformId){
      try {
        setLoading(true);
        //https://appscriptform-50024412718.development.catalystappsail.in
        const response = await axios.get(`https://appscriptform-50024412718.development.catalystappsail.in/form/${gformId}/responses`);
        setResponses(response.data.allResponses);
        console.log(response.data.allResponses);
        setTotal(response.data.totalResponses || response.data.allResponses.length);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    }
    };

    // useEffect(() => {
    //   if(gformId){
    //   fetchResponses(); // Fetch responses on load
    //   }
    // },[gformId])

    if (!gformId) {
      return (
        <View style={styles.fallbackContainer}>
          <Ionicons name="document-text" size={48} color="purple" />
          <Text style={styles.fallbackText}>No Response in form yet</Text>
        </View>
      );
    }

    if (loading && formId) {
      return (
        <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
          <TouchableOpacity
          
        style={tw`absolute bottom-8 right-7 bg-purple-500 rounded-full w-16 h-16 justify-center items-center shadow-lg z-50`}
        onPress={() =>fetchResponses()} 
      >
        <Ionicons name="refresh" size={32} color="white" />
      </TouchableOpacity>
          <ActivityIndicator size="large" color="purple" />
        </View>
      );
    }

  const renderItem = ({ item, index }) => (
    <Card style={{ margin: 10 }}>
      <TouchableOpacity onPress={() => navigation.navigate('Detail', { response: item })}> 
        <Text style={tw`ml-4 py-3`}>{index + 1}. {item.responses[0]?.answer}</Text>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={tw`absolute bottom-8 right-7 bg-purple-500 rounded-full w-16 h-16 justify-center items-center shadow-lg z-50`}
        onPress={() =>fetchResponses()} // Navigate to Form screen with formId as null
      >
        <Ionicons name="refresh" size={32} color="white" />
      </TouchableOpacity>
      <Text style={tw`mx-4 mt-5 mb-2`}>No. of Responses : {total} </Text>
      <FlatList
        data={responses}
        renderItem={renderItem}
        keyExtractor={(item) => item._id.toString()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#ecf0f1',
    padding: 8,
  },
  fallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    padding: 16,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  fallbackText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    textAlign: 'center',
  },
});
