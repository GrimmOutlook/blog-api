const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {BlogPost} = require('./models');


// .then(restaurants => {
//       res.json({
//         restaurants: restaurants.map(
//           (restaurant) => restaurant.apiRepr())
//       });
//     })

//     .then(posts => {
//       res.json(posts.map(
//         post => post.apiRepr())
//       );
//     })

router.get('/', (req, res) => {
  console.log("WTF doesn't this GET request work?");
  BlogPost.find()
  .exec()
    .then(posts => {
      res.json(posts.map(post => post.apiRepr()));
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Some baaaad shit went down here - try again!'});
    });
});

router.get('/:id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .exec()
    .then(post => res.json(post.apiRepr()))
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Something\'s happening here, what it is ain\'t exactly clear.'});
    });
});


router.post('/', (req, res) => {
  // a title, content, an author name, and (optionally) a publication date
  const requiredFields = ['title', 'content', 'author'];
  for (let i=0; i < requiredFields.length; i++) {
    const field = requiredFields[i];
    if (!(field in req.body)) {
      const message = `Missing \`${field}\` in request body`;
      console.error(message);
      return res.status(400).send(message);
    }
  }
  BlogPost
    .create({
      title: req.body.title,
      content: req.body.content,
      author: req.body.author
    })
    .then(post => res.status(201).json(post.apiRepr()))
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Step away from the ledge and try again!'});
    });
});


router.delete('/:id', (req, res) => {
  BlogPost
    .findByIdAndRemove(req.params.id)
    .exec()
    .then(() => {
      res.status(204).json({message: `You did it! ${req.params.id} is gone!`})
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Your mission has failed, better luck next time.'});
    });
});


router.put('/:id', (req, res) => {
  if (!(req.params.id === req.body.id)) {
    res.status(400).json({
      error: 'Request path id and request body id values must match'
    });
  }

  const updated = {};
  const updateableFields = ['title', 'content', 'author'];
  updateableFields.forEach(field => {
    if (field in req.body) {
      updated[field] = req.body[field];
    }
  });

  BlogPost
    .findByIdAndUpdate(req.params.id, {$set: updated}, {new: true})
    .exec()
    .then(doesntMatterWhat => res.status(201).json(doesntMatterWhat.apiRepr()))
    .catch(err => res.status(500).json({message: 'Something went wrong, be very afraid!'}));
});

module.exports = router;
