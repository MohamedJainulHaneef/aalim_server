const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db'); 
const userRoutes = require('./routes/userRoutes');
const timeTableRoutes = require('./routes/timeTableRoutes');

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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`) });