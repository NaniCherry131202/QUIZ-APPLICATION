const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, // Title is required
        trim: true,      // Trim whitespace
        maxlength: 200   // Add a reasonable maximum length
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true  // Quiz must have a creator
    },
    questions: [
        {
            question: { 
                type: String, 
                required: true, // Question text is required
                trim: true,       // Trim whitespace
                maxlength: 500    // Add a reasonable maximum length
            },
            options: {
                type: [String], 
                required: true, // Options are required
                validate: [ // Custom validator to check for minimum options
                    function(val) { return val.length >= 2; }, 
                    'A question must have at least two options'
                ]
            },
            correctAnswer: { 
                type: String, 
                required: true, // Correct answer is required
                validate: { // Custom validator to check if correctAnswer is in options
                    validator: function(v) {
                        return this.options.includes(v);
                    },
                    message: 'Correct answer must be one of the available options'
                }
            }
        }
    ]
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);