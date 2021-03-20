const exec = require('child_process').exec;

// Lazy man variables
const charRev = 'characteristic_reviews.csv';
const reviews = 'reviews.csv';
const photos = 'reviews_photos.csv';
const chars = 'characteristics.csv';

const filePath = `/Users/robertstrange/Desktop/SDC/${photos}`;

// Change if/when needed
const db = 'reviewsWarehouse';
const collection = 'reviews_photos';

const command = `mongoimport --db ${db} --collection ${collection} --type csv --headerline --file '${filePath}'`

exec(command, (err) => {
  if (err) {
    console.error(err);
  } else {
    console.log('Files loaded');
  }
})

module.exports = {
  exec,
};
// import to mongo takes db, collection, file type, and file path. Headerline for csv uses first line as name
// mongoimport --db reviewsWarehouse --collection reviews_photos --type csv --headerline --file /Users/robertstrange/Desktop/SDC/reviews_photos.csv