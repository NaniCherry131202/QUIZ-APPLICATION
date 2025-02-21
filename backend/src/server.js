const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes.js');
const quizRoutes = require('./routes/quiz.routes.js');
const adminRoutes = require("./routes/admin.routes");
const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.use('/api/auth', authRoutes);
app.use('/api/quizzes', quizRoutes);
app.use("/api/admin", adminRoutes);

app.listen(2424, () => console.log('Server running on port 2424'));
