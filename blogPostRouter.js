const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {BlogPost} = require('./models');


router.get('/', (req, res) => {
  BlogPost.find().limit(5)
  .exec()
    .then(blogPosts => {
      res.json({
        blogPosts: blogPosts.map(
          blogPost => blogPost.apiRepr())
      });
    })
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Some baaaad shit went down here - try again!'});
    });
});

router.get('/id', (req, res) => {
  BlogPost
    .findById(req.params.id)
    .exec()
    .then(blogpost => blogPost.apiRepr())
    .catch(
      err => {
        console.error(err);
        res.status(500).json({message: 'Something\'s happening here, what it is ain\'t exactly clear'});
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
    .then(blogpost => res.status(201).json(blogPost.apiRepr()))
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


router.put('/posts/:id', (req, res) => {
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
    .then(updatedPost => res.status(201).json(updatedPost.apiRepr()))
    .catch(err => res.status(500).json({message: 'Something went wrong'}));
});

module.exports = router;
