const mongoose = require('mongoose');
const { mongoDB } = require('./config/dbConfig');

const { mongoURI } = mongoDB;

// MongoDB options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

// Connect to MongoDB
mongoose.connect(mongoURI, options)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

module.exports = mongoose;