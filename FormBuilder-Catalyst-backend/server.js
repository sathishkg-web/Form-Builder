const express = require('express');
const mongoose = require('mongoose');
const { Form, Response, User } = require('./models');
const axios = require('axios');
const app = express();

require("dotenv").config({
  path: '.env'
})

app.use(express.json());
app.use(require('cors')());

mongoose.connect(process.env.DB_URL);
const db=mongoose.connection
db.once('open',()=>{
    console.log('Mongodb connection successful');
})

app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body
  });
  next();
});

//https://nrj1s8vv-3000.inc1.devtunnels.ms/

// Webhook endpoint
app.post("/webhook", async (req, res) => {
  const { formId, timestamp, formResponses } = req.body;

  console.log("New Form Submission:");
  console.log("Form ID:", formId);
  console.log("Timestamp:", timestamp);
  console.log("Responses:", formResponses);

  try {
    // Save data to MongoDB with formId
    const newResponse = new FormResponse({ formId, timestamp, formResponses });
    await newResponse.save();

    console.log("Data saved to MongoDB successfully");
    res.status(200).send("Webhook received and data stored successfully");
  } catch (error) {
    console.error("Error saving data to MongoDB:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get('/forms', async (req, res) => {
  try {
    // Fetch all forms from the database
    console.log('get hit');
    const forms = await Form.find();
  //  console.log('forms',forms);
    // Return the forms as JSON
    return res.status(200).json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

//Create form
app.post('/form', async (req, res) => {
  const { googleFormId, ...formData } = req.body;

  if (!googleFormId) {
    return res.status(400).json({ error: 'googleformId is required.' });
  }

  try {
    // Check if formId exists
    const existingForm = await Form.findOne({ googleFormId });

    if (existingForm) {
      // Update the existing form
      const updatedForm = await Form.findOneAndUpdate(
        { googleFormId },
        { $set: formData },
        { new: true } // Return the updated document
      );
      return res.status(200).json(updatedForm);
    }

    // Save a new form if formId does not exist
    const newForm = new Form({ googleFormId, ...formData });
    await newForm.save();
    return res.status(201).json(newForm);

  } catch (error) {
    console.error('Error processing form:', error);
    if (error.code === 11000) {
      // Handle duplicate key error (edge case)
      return res.status(409).json({ error: 'Duplicate formId detected.' });
    }
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// API Endpoint to delete a form by ID
app.delete('/form/:id', async (req, res) => {
  const formId = req.params.id;

  try {
    const deletedForm = await Form.findByIdAndDelete(formId);
    if (!deletedForm) {
      return res.status(404).json({ message: 'Form not found' });
    }
    console.log('Form deleted successfully:', deletedForm);
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// API Endpoint to get a form by ID
app.get('/form/:id', async (req, res) => {
  const formId = req.params.id;

  try {
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }
    res.json(form);
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/form/:id/responses', async (req, res) => {
  const formId = req.params.id;
  console.log('Requesting responses for formId:', formId);
  
  try {
    // Add request timeout and better error handling
    const googleResponse = await axios.get(
      'https://script.google.com/macros/s/AKfycbz3Zyb62TRiuUC40gwv9hOYA2kvQCcdSwqhnHFk7xK7nyb2dY5qAw_ECXDMySAqpjOimQ/exec',
      {
        params: { formId },
        timeout: 10000, // 10 second timeout
        validateStatus: false // Don't reject on non-2xx status codes
      }
    );
    
    // Log the entire response for debugging
    console.log('Google API Response Status:', googleResponse.status);
    console.log('Google API Response Headers:', googleResponse.headers);
    console.log('Google API Response Data:', googleResponse.data);
    
    // Check if the response is valid
    if (!googleResponse.data) {
      throw new Error('Empty response from Google Apps Script');
    }
    
    const googleFormResponses = googleResponse.data.responses;
    if (!googleFormResponses) {
      throw new Error('No responses field in Google Apps Script response');
    }

    // Fetch existing responses from MongoDB
    const existingResponses = await Response.find({ formId });
    console.log('Existing responses count:', existingResponses.length);

    // Filter out responses that are already saved
    const existingResponseIds = existingResponses.map(response => 
      response.responses[0]?.responseId
    ).filter(Boolean);
    
    const newResponses = googleFormResponses.filter(response => 
      !existingResponseIds.includes(response.responseId)
    );
    console.log('New responses to save:', newResponses.length);

    // Save new responses to MongoDB
    if (newResponses.length > 0) {
      const newResponseDocs = newResponses.map(response => ({
        formId,
        responses: response.answers.map(answer => ({
          responseId: response.responseId,
          timestamp: response.timestamp,
          question: answer.question,
          type: answer.type,
          answer: answer.answer
        }))
      }));
      
      await Response.insertMany(newResponseDocs);
      console.log('Successfully saved new responses');
    }
    
    // Send all response records in the response
    const allResponses = await Response.find({ formId });
    console.log('Successfully retrieved all response records');

    // Return success response
    return res.json({
      success: true,
      totalResponses: googleFormResponses.length,
      newResponsesSaved: newResponses.length,
      allResponses
    });

    // Send all response records in the response
    // const allResponses = await Response.find({ formId });
    // return res.json({
    //   success: true,
    //   totalResponses: googleFormResponses.length,
    //   newResponsesSaved: newResponses.length,
    //   allResponses
    // });

  } catch (error) {
    console.error('Error processing form responses:', error);
    
    // Send detailed error response
    return res.status(500).json({
      success: false,
      error: error.message,
      details: {
        formId,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// app.put('/form/:id', async (req, res) => {
//   const form = await Form.findByIdAndUpdate(req.params.id, req.body, { new: true });
//   res.json(form);
// });

const PORT = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
