const mongoose = require('mongoose');
const dbConfig = require('./config/dbConfig');

mongoose.connect(dbConfig.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Connection Error:', err));

module.exports = mongoose;