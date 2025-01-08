import React, { useEffect, useState } from 'react';
//import {Linking, Alert, SafeAreaView, StyleSheet, TouchableOpacity, Text, View, Modal, Button } from 'react-native';
import tw from 'tailwind-react-native-classnames';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from 'react-native-paper';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { ActivityIndicator, Linking, Alert, SafeAreaView, StyleSheet, TouchableOpacity, Text, View, Modal, Button, TextInput } from 'react-native';
import { FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export default function HomeScreen() {
  const navigation = useNavigation();
  const [forms, setForms] = useState([]);
  const [filteredForms, setFilteredForms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [formResponseUrl, setFormResponseUrl] = useState(null);
  const [isPressed, setIsPressed] = useState(false);
  const { userId,isLoaded, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [selectedFormId, setSelectedFormId] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Fetch forms from the backend API
    //https://appscriptform-50024412718.development.catalystappsail.in
    fetch('https://appscriptform-50024412718.development.catalystappsail.in/forms') 
      .then((response) => response.json())
      .then((data) => {
        const userForms = data.filter((form) => form.createdBy === userId);
        // Sort the forms by createdAt field (assuming it's in ISO 8601 format)
        const sortedForms = userForms.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));

        setForms(sortedForms); // Save the sorted data in the state
        setFilteredForms(sortedForms); // Initialize filtered forms
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching forms:', error);
        setLoading(false);
      });
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setLoading(true);
      //https://appscriptform-50024412718.development.catalystappsail.in
      fetch('https://appscriptform-50024412718.development.catalystappsail.in/forms')
        .then((response) => response.json())
        .then((data) => {
          const userForms = data.filter((form) => form.createdBy === userId);
          const sortedForms = userForms.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
          setForms(sortedForms);
          setFilteredForms(sortedForms);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching forms:', error);
          setLoading(false);
        });
    }, [userId])
  );


  // Open the detail view when a card is pressed
  const handleCardPress = (formId, formResponseUrl, gformId) => {
    setIsPressed(false)
    navigation.navigate('FORM', { formId, formResponseUrl,gformId }); // Navigate to FormDetail screen with formId
  };

  // Open the modal on long press
  const handleCardLongPress = (formId, formResponseUrl) => {
    setSelectedFormId(formId);
    setFormResponseUrl(formResponseUrl);
    setModalVisible(true); // Open the modal
  };

  // Close the modal
  const closeModal = () => {
    setModalVisible(false);
    setFormResponseUrl(null);
  };

  const openInBrowser = (url) => {
    Linking.openURL(url).catch(err => console.error('Failed to open URL:', err));
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      const filtered = forms.filter((form) =>
        form.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredForms(filtered);
    } else {
      setFilteredForms(forms);
    }
  };

  const handleDeleteForm = (formId) => {
   //https://appscriptform-50024412718.development.catalystappsail.in 
    fetch(`https://appscriptform-50024412718.development.catalystappsail.in/form/${formId}`, {
      method: 'DELETE',
    })
      .then((response) => {
        if (response.ok) {
          setForms((prevForms) => prevForms.filter((form) => form._id !== formId));
          setFilteredForms((prevFilteredForms) => prevFilteredForms.filter((form) => form._id !== formId));
          closeModal();
        } else {
          console.error('Failed to delete form');
        }
      })
      .catch((error) => {
        console.error('Error deleting form:', error);
      });
  };

  if (loading) {
    return (
      <View style={[styles.container,{justifyContent:'center',alignItems:'center'}]}>
        <ActivityIndicator size="large" color="purple" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
      <View style={tw`flex-row items-center bg-white p-2 rounded-lg shadow-sm mb-4 mx-4`}>
        <Ionicons name="search" size={24} color="gray" />
        <TextInput
          style={tw`ml-2 flex-1`}
          placeholder="Search forms..."
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      {/* Button to create a new form */}
      <TouchableOpacity
        style={tw`absolute bottom-8 right-7 bg-purple-500 rounded-full w-16 h-16 justify-center items-center shadow-lg z-50`}
        onPress={() => navigation.navigate('FORM',{formId:null})}  // Navigate to Form screen with formId as null
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Bottom Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={closeModal}
        >
          <View style={tw`flex-1 justify-end bg-black bg-opacity-50`}>
            <View style={tw`bg-white p-6 rounded-t-lg items-center`}>
          <TouchableOpacity onPress={() => openInBrowser(formResponseUrl)} style={tw`flex-row items-center mb-4`}>
            <Ionicons name="link" size={24} color="gray" style={tw`mr-2`} />
            <Text style={tw`text-lg text-gray-500`}>Edit Form Url</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => {handleDeleteForm(selectedFormId)}} style={tw`flex-row items-center mb-4`}>
            <Ionicons name="trash" size={24} color="gray" style={tw`mr-2`} />
            <Text style={tw`text-lg text-gray-500`}>Delete Form</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={closeModal} style={tw`rounded-full bg-purple-500 p-2`}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Render Forms */}
      <FlatList
        data={filteredForms}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.5}
            onPress={() => {setIsPressed(true); handleCardPress(item._id, item.formResponseUrl , item.googleFormId)}}
            onLongPress={() => {setIsPressed(false); handleCardLongPress(item._id, item.formResponseUrl)}}
            onPressOut={() => setIsPressed(false)}
            onLongPressOut={() => setIsPressed(false)}
            style={{ opacity: isPressed ? 0.5 : 1 }}
          >
            <View style={tw`mb-4 p-4 rounded-lg bg-gray-200 shadow-sm border-purple-100 flex-row justify-between`}>
              {/* Left side: Form Icon */}
              <View style={tw`flex justify-center items-center w-1/4`}>
                <Ionicons name="document-text" size={32} color="purple" />
              </View>

              {/* Right side: Title and Created Date */}
              <View style={tw`w-3/4 pl-2 justify-center`}>
                <Text style={tw`text-lg font-bold`}>{item.title}</Text>
                <Text style={tw`text-sm text-gray-600`}>{new Date(item.createdDate).toLocaleString()}</Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={tw`px-4`}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#ecf0f1',
    paddingTop: 16,
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});