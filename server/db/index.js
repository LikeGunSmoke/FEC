const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = 'mongodb://localhost:27017';

const dbName = 'reviewsWarehouse';
const client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true});

client.connect((err) => {
  assert.equal(null, err);
  console.log('Connected to MongoDB Server');

  const db = client.db(dbName);

    client.close();

});

const addReview = (db, review, cb) => {
  const collection = db.collection('reviews');
  collection.insertOne(review, (err, result) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Added review');
      cb(result)
    }
  })
}


module.exports = {
  addReview,
}


// connect to mongoDB
// brew services start mongodb-community
// node /Users/robertstrange/hackreactorsei/SDC/FEC/server/db/index.js

// start shell
// mongo

// import csv files               *change per collection*
/* mongoimport --db reviewsWarehouse --collection reviews_photos --type csv --headerline --file /Users/robertstrange/Desktop/SDC/reviews_photos.csv


*/

/* Links
 https://docs.mongodb.com/manual/mongo/

*/

/* MongoDB Notes
  list all docs in collection: db.collectionName.find()

*/