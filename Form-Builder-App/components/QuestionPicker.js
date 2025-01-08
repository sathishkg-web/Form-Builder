import React from 'react';
import { Picker } from '@react-native-picker/picker';
import tw from 'tailwind-react-native-classnames';

const QuestionPicker = ({ questions, setQuestions, index, item }) => {
    return (
        <Picker
            selectedValue={item.type}
            onValueChange={(value) => {
                const newQuestions = [...questions];
                newQuestions[index].type = value;
                setQuestions(newQuestions);
            }}
            style={{
                ...tw`border p-1`,
                color: 'black', // Ensures text is visible
                backgroundColor: 'white', // Better visibility
            }}
            mode="dropdown" // Sets the display mode for the picker
        >
            <Picker.Item label="Select Question Type" value={null} />
            <Picker.Item label="Text" value="text" />
            <Picker.Item label="Grid" value="grid" />
            <Picker.Item label="Checkbox" value="checkbox" />
            <Picker.Item label="Multiple Choice" value="multipleChoice" />
        </Picker>
    );
};

export default QuestionPicker;
