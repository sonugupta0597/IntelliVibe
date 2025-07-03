const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
dotenv.config();

const jobRoutes = require('./routes/JobRoutes');
const authRoutes = require('./routes/authRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true 
}));

// Middleware
app.use(cors()); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// ...
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Database Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB Connected...'))
.catch(err => console.error(err));


// Simple Test Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes); // Add this
app.use('/api/applications', applicationRoutes);

const PORT = process.env.PORT || 5001;

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Created uploads directory');
}

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));