const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
    student: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true  // Student is required
    },
    quiz: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Quiz', 
        required: true  // Quiz is required
    },
    answers: [{
        question: {  // Store the actual question ObjectId
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Question', // Reference the Question subdocument
            required: true
        },
        selectedOption: { 
            type: String, 
            required: true 
        }
    }],
    score: {
        type: Number,
        required: true, // Score is required
        min: 0          // Score cannot be negative
    }
}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);