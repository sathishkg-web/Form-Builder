import React, { useState, useEffect } from 'react';
import {ActivityIndicator, ToastAndroid, Alert, Platform, KeyboardAvoidingView, SafeAreaView, View, Text, TextInput, TouchableOpacity, Switch, FlatList, Image, Dimensions } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
import { Picker } from '@react-native-picker/picker';
import QuestionPicker from '../components/QuestionPicker.js';
import axios from 'axios';
import tw from 'tailwind-react-native-classnames';
import { useAuth } from '@clerk/clerk-expo';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { db, storage } from '../config/firebaseConfig.js';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { collection, setDoc, doc, Timestamp } from 'firebase/firestore';
//import  launchImageLibrary  from 'react-native-image-picker';

export default function FormBuildScreen({ route, navigation }) {
  const [formId, setFormId] = useState(route.params?.formId || null);
  const [title, setTitle] = useState('');
  const [questionImage, setQuestionImage] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [gformId,setGformId] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { userId } = useAuth();
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    if (formId) {
      fetchFormData(formId);
    }
  }, [formId]);

  const handleChoosePhoto = async (index) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
     // console.log('Permission status:', status);
      
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
        return;
      }
  
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaType: 'photo',
        quality: 1,
      });
      
      console.log('Image picker result:', result); // Check the entire result object
  
      if (!result.canceled) {
        console.log('Image selected:', result.assets[0]); // Check the selected asset
        const newQuestions = [...questions];
        newQuestions[index].image = result.assets[0].uri;
        console.log('Updated question:', newQuestions[index]); // Check the updated question
        setQuestions(newQuestions);
      } else {
        console.log('Image picker was canceled');
      }
    } catch (error) {
      console.error('Error in handleChoosePhoto:', error);
    }
  };
  
  // const uploadImageToFirebase = async () => {
  //   if (!questionImage) return null;

  //   try {
  //     setUploading(true);
  //     const response = await fetch(questionImage.uri);
  //     const blob = await response.blob();
  //     const storageRef = ref(storage, `questionImages/${new Date().getTime()}`);
  //     const snapshot = await uploadBytes(storageRef, blob);
  //     setUploading(false);

  //     return await getDownloadURL(snapshot.ref);
  //   } catch (error) {
  //     console.error('Image upload failed:', error);
  //     setUploading(false);
  //     return null;
  //   }
  // };



  const fetchFormData = async (id) => {
    try {
      const response = await axios.get(`https://appscriptform-50024412718.development.catalystappsail.in/form/${id}`);
      const { title, questions, googleFormId } = response.data;
      setTitle(title || '');
      //setHeaderImage(headerImage || '');
      setQuestions(questions || []);
      setGformId(googleFormId || '');
    } catch (error) {
      console.error('Error fetching form data:', error);
    //  Alert.alert('Error', 'Failed to fetch form data.');
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, { type: 'Text', label: '', options: [], image: '', grid: { rows: [], columns: [] }, required: false }]);
  };

  const deleteQuestion = (index) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const addChoice = (index) => {
    const newQuestions = [...questions];
    newQuestions[index].options.push('');
    setQuestions(newQuestions);
  };

  const updateChoice = (qIndex, cIndex, text) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[cIndex] = text;
    setQuestions(newQuestions);
  };

  const removeChoice = (qIndex, cIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options.splice(cIndex, 1);
    setQuestions(newQuestions);
  };

  const addRow = (index, rowName) => {
    const newQuestions = [...questions];
    newQuestions[index].grid.rows.push(rowName);
    setQuestions(newQuestions);
  };

  const addColumn = (index, columnName) => {
    const newQuestions = [...questions];
    newQuestions[index].grid.columns.push(columnName);
    setQuestions(newQuestions);
  };

  const removeRow = (qIndex, rIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].grid.rows.splice(rIndex, 1);
    setQuestions(newQuestions);
  };

  const removeColumn = (qIndex, cIndex) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].grid.columns.splice(cIndex, 1);
    setQuestions(newQuestions);
  };

  const uploadImagesForQuestions = async () => {
  const uploadedQuestions = await Promise.all(
    questions.map(async (question) => {
      if (question.image) {
        try {
          const response = await fetch(question.image);
          const blob = await response.blob();
          const storageRef = ref(storage, `questionImages/${new Date().getTime()}`);
          const snapshot = await uploadBytes(storageRef, blob);
          const imageUrl = await getDownloadURL(snapshot.ref);
          console.log('Uploaded image URL:', imageUrl); // Add this log
          return { ...question, image: imageUrl }; // Replace local URI with uploaded URL
        } catch (error) {
          console.error(`Image upload failed for question: ${question.label}`, error);
        }
      }
      return question;
    })
  );
  return uploadedQuestions;
};

  const saveForm = async () => {
  try {
    setLoading(true);
    const uploadedQuestions = await uploadImagesForQuestions();
    console.log(uploadedQuestions);

    const metadata = { title, questions: uploadedQuestions, formId: '' } //gformId };
    const AppScriptPayload = JSON.stringify(metadata);
    //const method=gformId? 'PUT':'POST';
    
      // 1. Call App Script API to get the Google Form ID
      const appScriptResponse = await axios.post('https://script.google.com/macros/s/AKfycbz3Zyb62TRiuUC40gwv9hOYA2kvQCcdSwqhnHFk7xK7nyb2dY5qAw_ECXDMySAqpjOimQ/exec', AppScriptPayload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );

      const { googleFormId, formEditUrl, formResponseUrl } = appScriptResponse.data;

       // Check if we have the required data
    if (!appScriptResponse) {
      throw new Error('No response data received');
    }
    
      // Alert.alert(
      //   'Response Data',
      //   JSON.stringify(appScriptResponse, null, 2)
      // );
      // Alert each value separately for debugging
    // Alert.alert(
    //   'Parsed Values',
    //   `Form ID: ${googleFormId}\n\nEdit URL: ${formEditUrl}\n\nResponse URL: ${formResponseUrl}`
    // );

   //  setFormId(googleFormId);
      // 2. Save form metadata to backend
      const backendPayload = {
        title,
      //  headerImage,
        questions: uploadedQuestions,
        googleFormId, // Attach Google Form ID
        formEditUrl,
        formResponseUrl,
        createdBy: userId || 'anonymous', // Attach user ID or 'anonymous'
      };
      //https://appscriptform-50024412718.development.catalystappsail.in
      const backendResponse = await axios.post('https://appscriptform-50024412718.development.catalystappsail.in/form', backendPayload);

      // alert(`Form saved with ID: ${backendResponse.data._id}`);
      // alert(`Form saved with ID: ${backendResponse.data.formEditUrl}`);
      // alert(`Form saved with ID: ${backendResponse.data.formEditUrl}`);
      ToastAndroid.show('Form Created Successfully', ToastAndroid.CENTER, ToastAndroid.SHORT);
      setLoading(false);
    //  navigation.goBack();
    } catch (error) {
      console.error('Error saving form:', error);
      alert('Failed to save form. Please try again.');
    }

  };
  return (
    <SafeAreaView style={tw`flex-1`}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={tw`flex-1`}
      >
        <View style={tw`flex-row justify-between items-center mt-0 px-2 p-4 mt-1`}>
          <Text style={tw`text-2xl font-bold mb-3`}>Form Builder</Text>
          <TouchableOpacity
            style={tw`bg-purple-500 p-2 rounded w-20 mb-3`}
            onPress={saveForm}
          >
            {loading?<ActivityIndicator size="small" color="#ffffff" />:<Text style={tw`text-white text-center`}>Save</Text>}
          </TouchableOpacity>
        </View>

        <TextInput
          style={tw`border p-2 mb-2 font-bold text-lg mt-2 rounded mx-4`}
          placeholder="Form Title"
          value={title}
          onChangeText={setTitle}
        />
        <TouchableOpacity
          style={tw`bg-purple-500 p-2 rounded mb-4 mx-4`}
          onPress={addQuestion}
        >
          <Text style={tw`text-white text-center`}>Add Question</Text>
        </TouchableOpacity>
        <FlatList
          showsVerticalScrollIndicator={false}
          data={questions}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View key={index} style={tw`mb-2 border p-2 shadow-md bg-white p-4 rounded-lg mt-2 border-purple-100 mx-4`}>
              <Text style={tw`font-bold mb-2`}>Question {index + 1}</Text>
              <TextInput
                style={tw`border p-2 mb-2 rounded`}
                placeholder="Question Label"
                value={item.label}
                onChangeText={(text) => {
                  const newQuestions = [...questions];
                  newQuestions[index].label = text;
                  setQuestions(newQuestions);
                }}
              />
              {(item.image || questions[index].image)&& <Image source={{ uri: item.image }} style={{ width: screenWidth - 75, height: 200, resizeMode: 'cover', borderRadius: 8 }} />}
              <TouchableOpacity
                style={tw`mt-2 bg-purple-500 p-2 rounded mb-2`}
                onPress={()=>handleChoosePhoto(index)}>
                <Text style={tw`text-white text-center`}>Add Image</Text>
              </TouchableOpacity>
              <QuestionPicker
                        questions={questions}
                        setQuestions={setQuestions}
                        index={index}
                        item={item}
                    />
              {/* <RNPickerSelect
    onValueChange={(value) => {
        const newQuestions = [...questions];
        newQuestions[index].type = value;
        setQuestions(newQuestions);
    }}
    items={[
        { label: 'Text', value: 'text' },
        { label: 'Grid', value: 'grid' },
        { label: 'Checkbox', value: 'checkbox' },
        { label: 'Multiple Choice', value: 'multipleChoice' }
    ]}
    value={item.type}
    placeholder={{ label: 'Select Question Type', value: null }}
    style={{
        inputAndroid: {
            ...tw`border p-1`,
            color: 'black',  // Ensures text is visible
            backgroundColor: 'white',  // Better visibility
            paddingRight: 30, // Space for the dropdown icon
        },
        inputIOS: {
            ...tw`border p-1`,
            color: 'black',
            backgroundColor: 'white',
            paddingRight: 30,
        }
    }}
    useNativeAndroidPickerStyle={false} // More consistent cross-platform look
    touchableWrapperProps={{
        activeOpacity: 0.7
    }}
/> */}
              {(item.type === 'checkbox' || item.type==='multipleChoice') && (
                <View style={tw`mb-2`}>
                  {item.options.map((option, cIndex) => (
                    <View key={cIndex} style={tw`flex-row items-center`}>
                      <TextInput
                        style={tw`border p-2 mt-2 rounded w-3/4`}
                        placeholder={`Option ${cIndex + 1}`}
                        value={option}
                        onChangeText={(text) => updateChoice(index, cIndex, text)}
                      />
                      <TouchableOpacity
                        style={tw`bg-red-500 p-2 rounded mt-2 ml-2`}
                        onPress={() => removeChoice(index, cIndex)}
                      >
                        <Text style={tw`text-white text-center`}>x</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    style={tw`bg-green-500 p-2 rounded mt-2`}
                    onPress={() => addChoice(index)}
                  >
                    <Text style={tw`text-white text-center`}>Add Choice</Text>
                  </TouchableOpacity>
                </View>
              )}
              {item.type === 'grid' && (
                <View style={tw`mt-2`}>
                  <Text style={tw`font-bold`}>Rows:</Text>
                  {item.grid.rows.map((row, rIndex) => (
                    <View key={rIndex} style={tw`flex-row items-center mb-2`}>
                      <Text style={tw`flex-1`}>{row}</Text>
                      <TouchableOpacity
                        style={tw`bg-red-500 p-2 rounded`}
                        onPress={() => removeRow(index, rIndex)}
                      >
                        <Text style={tw`text-white text-center`}>x</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TextInput
                    style={tw`border p-2 mb-2 rounded`}
                    placeholder="Enter Row Name"
                    onSubmitEditing={(event) => addRow(index, event.nativeEvent.text)}
                  />
                  <Text style={tw`font-bold mt-2`}>Columns:</Text>
                  {item.grid.columns.map((col, cIndex) => (
                    <View key={cIndex} style={tw`flex-row items-center mb-2`}>
                      <Text style={tw`flex-1`}>{col}</Text>
                      <TouchableOpacity
                        style={tw`bg-red-500 p-2 rounded`}
                        onPress={() => removeColumn(index, cIndex)}
                      >
                        <Text style={tw`text-white text-center`}>x</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TextInput
                    style={tw`border p-2 mb-2 rounded`}
                    placeholder="Enter Column Name"
                    onSubmitEditing={(event) => addColumn(index, event.nativeEvent.text)}
                  />
                </View>
              )}
              <View style={tw`flex-row justify-between items-center mt-0`}>
                <Text>Required:</Text>
                <Switch
                  value={item.required}
                  onValueChange={(value) => {
                    const newQuestions = [...questions];
                    newQuestions[index].required = value;
                    setQuestions(newQuestions);
                  }}
                />
              </View>
              <TouchableOpacity
                style={tw`bg-red-500 p-2 rounded mt-4`}
                onPress={() => deleteQuestion(index)}
              >
                <Text style={tw`text-white text-center`}>Delete Question</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={tw`pb-20`}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
