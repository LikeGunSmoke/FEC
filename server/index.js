const path = require('path');

const express = require('express');
const mongoose = require('mongoose'); // added by me

const helpers = require('./helpers');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json({limit: '500kb'}));
app.use(express.urlencoded({limit: '500kb', extended: true}));

// Added by me



mongoose.connect('mongodb://localhost/reviewsWarehouse', {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error'));

db.once('open', () => {
  console.log('Connected to Mongoose');
})

const reviews_photos = new mongoose.Schema({
  id: Number,
  review_id: Number,
  url: String
}, {collection: 'reviews_photos'});

const characteristics = new mongoose.Schema({
  id: {type: Number,  index: true},
  product_id: Number,
  name: String,
}, {collection: 'characteristics'});

const characteristic_reviews = new mongoose.Schema({
  id: Number,
  characteristic_id: Number,
  review_id: Number,
  value: Number,
}, {collection: 'characteristic_reviews'});

const reviews = new mongoose.Schema({
  id: {type: Number, index: true},
  product_id: {type: Number,  index: true},
  rating: Number,
  date: Date,
  summary: String,
  body: String,
  recommend: Boolean,
  reported: Boolean,
  reviewer_name: String,
  reviewer_email: String,
  response: String,
  helpfulness: Number,

}, {collection: 'reviews'});

const reviewsModel = mongoose.model('review', reviews);
const charsModel = mongoose.model('characteristics', characteristics);
const charsRevModel = mongoose.model('characteristic_reviews', characteristic_reviews);
const photosModel = mongoose.model('reviews_photos', reviews_photos);

// get all reviews for a given product
app.get('/api/reviews/:product_id', (req, res) => {

  reviews.virtual('photos', {
    ref: 'reviews_photos',
    localField: 'id',
    foreignField: 'review_id'
  })

  // Not sure I'll need this
  // reviews.virtual('characteristics', {
  //   ref: 'characteristic_reviews',
  //   localField: 'id',
  //   foreignField: 'review_id'
  // })
  // .populate('characteristics') // add to query chain below if needed

  reviewsModel.find({product_id: req.params.product_id})

    .populate('photos')
    .exec((err, data) => {
      if (err) {
        console.log(err)
        res.status(400).send(err);
      } else {
        res.status(200).send(data)
      }
    })
})
// add review // testing out different query types, like the other ones better though...
app.put('/api/reviews', (req, res) => {
  reviewsModel.create(req.query)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    })
})
// update recommend status for given review
app.put('/api/reviews/:product_id/:id/recommend', (req, res) => {
  reviewsModel.findOneAndUpdate({id: req.params.id}, {recommend: true}, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(204).send(data);
    }
  })
})
// update reported status for a given review
app.put('/api/reviews/:product_id/:id/report', (req, res) => {
  reviewsModel.findOneAndUpdate({id: req.params.id}, {reported: true}, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(204).send(data);
    }
  })
})
// increment helpfulness property by one for a given review
app.put('/api/reviews/:product_id/:id/helpful', (req, res) => {
  reviewsModel.findOneAndUpdate({id: req.params.id}, {$inc: {helpfulness: 1}}, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(data);
    }
  })
})
// add a photo to a given review
app.put('/api/reviews/:product_id/:id/photo', (req, res) => {
  const url = req.query.url;
  let reviewImg = new reviewsModel();
  reviewImg.photos.push(photosModel.create({review_id: req.params.id, url: url}))

  photosModel.create({review_id: req.params.id, url: url}, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(data);
    }
  })
})
// get all photos for a given review
app.get('/api/reviews/:product_id/:id/photo', (req, res) => {
  photosModel.find({review_id: req.params.id}, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(data);
    }
  })
})

// Organize data
const organize = (arr) => {

  // arr is a mongoose document obj, sent as json string, parse to access stored methods/vars
  arr = JSON.parse(arr);

  const ratings = {};
  const recommended = {true: 0, false: 0};
  const chars = {};
  let productId;

  // get characteristic names
  arr[1].characteristics.forEach((char) => {
    chars[char.name] === undefined ? chars[char.name] = {id: char.id, value: 0} : null
  })

  arr.forEach((review) => {
    productId = review.product_id;
    // accumulate ratings
    ratings[review.rating] === undefined ? ratings[review.rating] = 1 : ratings[review.rating] = ratings[review.rating] + 1;
    // accumulate recommendations
    if (review.recommend === true) {
      recommended.true === 0 ? recommended.true = 1 : recommended.true = (recommended.true + 1);
    } else if (review.recommend === false) {
      recommended.false === 0 ? recommended.false = 1 : recommended.false = (recommended.false + 1)
    };
    // accumulate statistics
    review.stats.forEach((stat) => {
      for(let name in chars) {
        stat.characteristic_id === chars[name].id ? chars[name].value += stat.value : null
      }
    })
  })

  let result = {
    product_id: productId,
    ratings: ratings,
    recommended: recommended,
    characteristics: chars,

  }
  return result;
}

// get review meta data for a given product
app.get('/api/reviews/:product_id/meta', (req, res) => {

  reviews.virtual('characteristics', {
    ref: 'characteristics',
    localField: 'product_id',
    foreignField: 'product_id'
  })
  reviews.virtual('stats', {
    ref: 'characteristic_reviews',
    localField: 'id',
    foreignField: 'review_id'
  })

   reviewsModel.find({product_id: req.params.product_id})
  .select('id rating recommend product_id')
  .populate('characteristics')
  .populate('stats')
  .exec((err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      // data is mongoose document obj, convert to json to use/modify methods/vars
      res.status(200).send(organize(JSON.stringify(data)));
    }
  })
})

// these are for viewing sake
// returns name of chars per product
app.get('/api/reviews/:product_id/chars', (req, res) => {
  charsModel.find({product_id: req.params.product_id}, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(data);
    }
  })
})
// returns characteristics for a given review
app.get('/api/reviews/:product_id/:id/chars', (req, res) => {
  charsRevModel.find({id: req.params.id}, (err, data) => {
    if (err) {
      res.status(400).send(err);
    } else {
      res.status(200).send(data);
    }
  })
})




// Added by me


// Products GET /products Retrieves the list of products
app.get('/products', (req, res) => {
  helpers.getProductsList()
    .then((response) => {
      res.send(response.data)
    })
    .catch((error) => {
      console.log(error.data);
    })
});

// Products GET /products/:product_id Returns all product level information for a specified product id
app.get('/products/:product_id', (req, res) => {
  helpers.getProductById(req.params.product_id)
  .then((response) => {
    res.send(response.data)
  })
  .catch((error) => {
    console.log(error.data);
  })
});

// Products GET /products/:product_id/styles Returns all styles available for the given product
app.get('/products/:product_id/styles', (req, res) => {
  helpers.getStylesById(req.params.product_id)
  .then((response) => {
    res.send(response.data)
  })
  .catch((error) => {
    console.log(error.data);
  })
});

// Products GET /products/:product_id/related Returns the id's of products related to the product specified
app.get('/products/:product_id/related', (req, res) => {
  helpers.getRelatedProducts(req.params.product_id)
    .then((response) => {
      res.send(response.data)
    })
    .catch((error) => {
      console.log(error.data);
    })
});

// Reviews GET /reviewdata/:product_id Returns all review metadata for a specified product id
app.get('/reviewdata/:product_id', (req, res) => {
  helpers.getReviewData(req.params.product_id)
    .then((response) => {
      res.status(200).send(response.data)
    })
    .catch((error) => {
      res.status(400).send(error);
    })
});

// Reviews GET /reviews/:product_id/:sort/:count Returns all reviews for a specified product id
app.get('/reviews/:product_id/:sort/:count', (req, res) => {
  helpers.getAllReviews(req.params.product_id, req.params.sort, req.params.count)
    .then((response) => {
      res.status(200).send(response.data)
    })
    .catch((error) => {
      res.status(400).send(error);
    })
});

// Reviews PUT /reviews/:review_id/helpful Increases helpfulness by one for a specified review id
app.put('/reviews/:review_id/helpful', (req, res) => {
  helpers.voteHelpful(req.params.review_id)
    .then((response) => {
      res.status(200).send(response.data)
    })
    .catch((error) => {
      res.status(400).send(error);
    })
});

// Reviews PUT /reviews/:review_id/report Reports a specified review id
app.put('/reviews/:review_id/report', (req, res) => {
  helpers.reportReview(req.params.review_id)
    .then((response) => {
      res.status(200).send(response.data)
    })
    .catch((error) => {
      res.status(400).send(error);
    })
});

// Reviews POST /upload/photo Uploads photo to cloudinary
app.post('/upload/photo', (req, res) => {
  helpers.uploadPhoto(req.body)
    .then((response) => {
      res.status(201).send(response.secure_url)
    })
    .catch((error) => {
      res.status(400).send(error);
    })
});

// Reviews POST /reviews Posts a new review to the database
app.post('/reviews', (req, res) => {
  helpers.submitReview(req.body)
    .then((response) => {
      res.status(201).send(response.data)
    })
    .catch((error) => {
      res.status(400).send(error);
    })
});

app.get('/qa/questions/:product_id', (req, res) => {
  const pId = req.params.product_id;
  helpers.getQuestions(pId)
  .then((response) => res.status(200).send(response.data))
  .catch((err) => res.status(404).send(err))
});

app.get('/qa/questions/:question_id/answers', (req, res) => {
  const pId = req.params.question_id;
  helpers.getQuestions(pId)
    .then((response) => res.status(200).send(response.data))
    .catch((err) => res.status(404).send(err))
});

app.post('/qa/questions/:product_id', (req, res) => {
  const pId = req.params.question_id;
  const info = req.body;
  helpers.addQuestion(pId, info)
    .then((response) => res.status(201).send(response.data))
    .catch((err) => res.status(404).send(err))
});

app.post('/qa/questions/:question_id/answers', (req, res) => {
  const pId = req.params.question_id;
  const info = req.body;
  helpers.addAnswer(pId, info)
    .then((response) => res.status(201).send(response.data))
    .catch((err) => res.status(404).send(err))
});

app.put('/qa/questions/:question_id/helpful', (req, res) => {
  const pId = req.params.question_id;
  helpers.markQuestionHelpful(pId)
    .then((response) => res.status(204).send(response.data))
    .catch((err) => res.status(404).send(err))
});

app.put('/qa/answers/:answer_id/helpful', (req, res) => {
  const pId = req.params.answer_id;
  helpers.markAnswerHelpful(pId)
    .then((response) => res.status(204).send(response.data))
    .catch((err) => res.status(404).send(err))
});

app.put('/qa/questions/:question_id/report', (req, res) => {
  const pId = req.params.question_id;
  helpers.reportQuestion(pId)
    .then((response) => res.status(204).send(response.data))
    .catch((err) => res.status(404).send(err))
});

app.put('/qa/answers/:answer_id/report', (req, res) => {
  const pId = req.params.answer_id;
  helpers.reportAnswer(pId)
    .then((response) => res.status(204).send(response.data))
    .catch((err) => res.status(404).send(err))
});

// Interactions POST Posts a click to the database
app.post('/interactions', (req, res) => {
  helpers.postClick(req.body)
    .then((response) => res.send(response.data))
    .catch((err) => res.status(404).send(err))
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
});


/* gLearn notes */
/*
//[https://learn-2.galvanize.com/cohorts/2474/blocks/94/content_files/Front%20End%20Capstone/project-atelier-catwalk/products.md]
//Atelier API can currently be found at https://app-hrsei-api.herokuapp.com/api/fec2/:CAMPUS_CODE/
//In an HTTP GET request, parameters are sent as a query string: http://example.com/page?parameter=value&also=another
//In an HTTP POST or PUT request, the parameters are not sent along with the URI, but in the request body.
//...
//  Products[https://learn-2.galvanize.com/cohorts/2474/blocks/94/content_files/Front%20End%20Capstone/project-atelier-catwalk/products.md]
//  Reviews[https://learn-2.galvanize.com/cohorts/2474/blocks/94/content_files/Front%20End%20Capstone/project-atelier-catwalk/reviews.md]
//  Questions&Answers[https://learn-2.galvanize.com/cohorts/2474/blocks/94/content_files/Front%20End%20Capstone/project-atelier-catwalk/qa.md]
//  Cart[https://learn-2.galvanize.com/cohorts/2474/blocks/94/content_files/Front%20End%20Capstone/project-atelier-catwalk/cart.md]
//  Interations[https://learn-2.galvanize.com/cohorts/2474/blocks/94/content_files/Front%20End%20Capstone/project-atelier-catwalk/interactions.md]
*/
