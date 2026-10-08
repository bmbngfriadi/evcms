require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const absoluteUploadDir = path.resolve(__dirname, '..', uploadDir);
if (!fs.existsSync(absoluteUploadDir)){
    fs.mkdirSync(absoluteUploadDir, { recursive: true });
}

// Static uploads directory
app.use('/evcms/uploads', express.static(absoluteUploadDir));

// API Routes
const apiRoutes = require('./routes/api');
app.use('/evcms/api', apiRoutes);

// Simple health check
app.get('/evcms/api/health', (req, res) => {
  res.json({ message: 'EVCMS API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
