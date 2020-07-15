const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const config = require('./config');
const {dbUrl} = config;
const User = require('./models/user');

MongoClient.connect(dbUrl, function(err, db) {
  if (err) throw err;
  console.log('Database created!');
  var currentDB = db.db('monitoring');
  currentDB.createCollection('faces', function(err) {
    if (err) throw err;
    console.log('Collection created!');
  });
  currentDB.createCollection('events', function(err) {
    if (err) throw err;
    console.log('Collection created!');
    //process.exit(0);
  });
  currentDB.createCollection('users', function(err) {
    if (err) throw err;
    console.log('Collection created!');
    //process.exit(0);
  });
  var adminUser = {isAdmin: true, username: 'admin', password: User.encryptPass('admin')};
  currentDB.collection('users').findOneAndUpdate({id: 0}, {$set: adminUser},{upsert: true}, function(err) {
    if (err) throw err;
    console.log('1 user inserted');
    db.close();
    process.exit(0);
  });
});
