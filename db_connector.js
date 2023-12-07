const mongoose = require('mongoose');
const dbConfig = require('./config/db_config');

const { username, password, host, port, database } = dbConfig;

//const dbURI = `mongodb://${username}:${password}@${host}:${port}/${database}`;

const dbURI = `mongodb://${host}:${port}/${database}`;

mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 연결 성공 시 이벤트
mongoose.connection.on('connected', () => {
  console.log(`Mongoose connected to ${dbURI}`);
});

// 연결 에러 시 이벤트
mongoose.connection.on('error', (err) => {
  console.log(`Mongoose connection error: ${err}`);
});

// 연결이 끊겼을 때 이벤트
mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// 프로세스가 종료될 때 MongoDB 연결 해제
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('Mongoose disconnected through app termination');
    process.exit(0);
  });
});
