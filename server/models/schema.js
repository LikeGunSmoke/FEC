const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.once('open', () => {
  console.log('Connected to Mongoose')
  const reviews = new mongoose.Schema({
    product: Number,
    page: Number,
    count: Number,
    results: [{
      review_id: Number,
      rating: Number,
      summary: String,
      recommended: Boolean,
      response: null,
      body: String,
      date: Date,
      reviewer_name: String,
      helpfulness: Number,
      photos:[{
        id: Number,
        url: String,
      }]
    }]
  })
  const reviewsMeta = new mongoose.Schema({
    product_id: Number,
    ratings: {
      1: Number,
      2: Number,
      3: Number,
      4: Number,
      5: Number
    },
    recommended: {
      0: Number,
      1: Number
    },
    characteristics: {}
  })
})

db.on('error', console.error.bind(console, 'connection error'));