const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Clerk's userId
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  createdDate: { type: Date, default: Date.now }, // Automatically store user creation date
});


const QuestionSchema = new mongoose.Schema({
    type: { type: String, required: true, enum: ['text', 'grid', 'checkbox','multipleChoice'] }, // "Text", "Grid", "CheckBox"
    label: { type: String, required: true }, // Label for the question
    options: { type: [String], default: [] }, // Options for CheckBox and Grid
    image: { type: String, default: '' }, // Optional question image
    grid: { 
      rows: { type: [String], default: [] }, // Rows for Grid type questions
      columns: { type: [String], default: [] } // Columns for Grid type questions
    },
    required: { type: Boolean, default: false } // Whether the question is mandatory
  });
  

const FormSchema = new mongoose.Schema({
  googleFormId: { type: String, required: true, unique: true },
  formEditUrl: { type: String, required: true },
  formResponseUrl: { type: String, required: true },
  title: { type: String, required: true },
//  headerImage: String,
  questions: [QuestionSchema],
  createdDate: { type: Date, default: Date.now }, // Automatically store creation date
  createdBy: { type: String, required: true }, // Reference to the user who created the form
});

const ResponseSchema = new mongoose.Schema({
  //formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
  formId: { type: String, required: true},
  //timestamp: { type: String, required: true },
  responses: [
    {
      responseId: { type: String, required: true },
      timestamp: { type: String, required: true },
    //  questionId: { type: mongoose.Schema.Types.ObjectId },
      question: {type: String},
      type: { type: String },
      answer: mongoose.Schema.Types.Mixed, // Text, Array, or other types based on the question
    },
  ],
});

module.exports = {
  Form: mongoose.model('Form', FormSchema),
  Response: mongoose.model('Response', ResponseSchema),
  User: mongoose.model('User', UserSchema),
};

// const mongoose = require('mongoose');

// const QuestionSchema = new mongoose.Schema({
//   type: { type: String, required: true }, // "Text", "Grid", "CheckBox"
//   label: { type: String, required: true },
//   options: [String], // For CheckBox and Grid
//   image: String,     // Optional question image
// });

// const FormSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   headerImage: String,
//   questions: [QuestionSchema],
// });

// const ResponseSchema = new mongoose.Schema({
//   formId: { type: mongoose.Schema.Types.ObjectId, ref: 'Form' },
//   answers: [
//     {
//       questionId: { type: mongoose.Schema.Types.ObjectId },
//       answer: mongoose.Schema.Types.Mixed, // Text, Array, or other types based on the question
//     },
//   ],
// });

// module.exports = {
//   Form: mongoose.model('Form', FormSchema),
//   Response: mongoose.model('Response', ResponseSchema),
// };
