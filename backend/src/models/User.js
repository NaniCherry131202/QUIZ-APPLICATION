const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,        // Remove leading/trailing whitespace
        maxlength: 255     // Set a reasonable limit
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,       // Remove leading/trailing whitespace
        lowercase: true,  // Store emails in lowercase
        match: [         // Regular expression for email validation
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Invalid email format'
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: 8      // Set a minimum password length (adjust as needed)
    },
    role: {
        type: String,
        enum: ['teacher', 'student'],
        required: true
    },
    lastScore:{
        type:Number,
    }

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);