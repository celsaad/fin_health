module.exports = (mongoose, config) => {
  const database = mongoose.connection;
  mongoose.Promise = Promise;

  mongoose.connect(config.database, {
    useMongoClient: true,
    promiseLibrary: global.Promise
  });

  database.on('error', error => console.log(`Connection to FinHealth database failed: ${error}`));
  database.on('connected', () => console.log('Connected to FinHealth database'));
  database.on('disconnected', () => console.log('Disconnected from FinHealth database'));

  process.on('SIGINT', () => {
    database.close(() => {
      console.log('FinHealth terminated, connection closed');
      process.exit(0);
    });
  });
};
