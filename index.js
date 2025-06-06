const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); 
const userRoutes = require('./routes/userRoutes');
const timeTableRoutes = require('./routes/timeTableRoutes');
const academicRoutes = require('./routes/academicRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const substitutionRoutes = require('./routes/substitutionRoutes');

dotenv.config(); 

const app = express();
app.use(express.json()); 
connectDB();

app.use(cors({ 
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], 
    credentials: true 
}));

app.use('/api/users', userRoutes);
app.use('/api/timeTable', timeTableRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/substitution', substitutionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`) });