const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const timeTableRoutes = require('./routes/timeTableRoutes');
const academicRoutes = require('./routes/academicRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const substitutionRoutes = require('./routes/substitutionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dataDeletionRoutes = require('./routes/dataDeletionRoutes');

dotenv.config();

const app = express();
app.use(express.json());
connectDB();

app.use(cors({
    // origin: 'https://aalim-client.vercel.app',
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.use('/api/users', userRoutes);
app.use('/api/timeTable', timeTableRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/substitution', substitutionRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/dataDeletion', dataDeletionRoutes);

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});