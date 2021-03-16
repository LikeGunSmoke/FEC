const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';

const dbName = 'reviews';
const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});

client.connect((err) => {
  assert.equal(null, err);
  console.log('Connected to MongoDB Server');

  const db = client.db(dbName);

  insertDocuments(db, () => {
    client.close();
  });

});

const insertDocuments = (db, cb) => {
  const collection = db.collection('reviews');
  collection.insertMany([{a: 1}, {b: 2}, {c: 3}], (err, result) => {
    console.log('inserted documents');
    cb(result);
  })
}




// connect to mongoDB
// brew services start mongodb-community
// node /Users/robertstrange/hackreactorsei/SDC/FEC/server/db/index.js

// start shell
// mongo

// import csv files
/* mongoimport --db reviews --collection reviews --type csv --headerline --file /Users/robertstrange/Desktop/copy-of-reviews.csv


*/

/* Links
 https://docs.mongodb.com/manual/mongo/

*/

/* MongoDB Notes
  list all docs in collection: db.collectionName.find()

*/