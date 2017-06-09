const express = require('express');
const router = express.Router();

const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();


const {BlogPosts} = require('./models');


// dummy data
// a title, content, an author name, and (optionally) a publication date
BlogPosts.create(
  'An Awesome Title', 'Master cleanse taiyaki XOXO scenester pork belly skateboard semiotics selfies, vape marfa shabby chic hella meditation. Helvetica humblebrag 3 wolf moon tousled, ethical la croix whatever hammock gochujang deep v kogi fanny pack before they sold out thundercats small batch. Aesthetic vexillologist affogato gastropub. Selvage raclette chia yuccie, before they sold out schlitz wolf man bun keffiyeh tousled hashtag. Thundercats meggings pork belly locavore raclette. Enamel pin YOLO flannel health goth vegan. Cardigan vexillologist viral tote bag bitters, waistcoat pork belly kinfolk hoodie tattooed pabst.', 'Bugs Bunny');
BlogPosts.create(
  'This Title Will Make You Read the Article', 'Kale chips DIY, flexitarian poke copper mug cred bitters vegan before they sold out venmo. Humblebrag taiyaki raw denim, succulents venmo aesthetic retro keytar pour-over subway tile blog normcore banjo paleo. Cornhole shabby chic cold-pressed, tumeric leggings coloring book farm-to-table flexitarian lyft knausgaard occupy lo-fi drinking vinegar kinfolk. Scenester four dollar toast umami, stumptown tattooed irony activated charcoal mustache direct trade humblebrag. YOLO fam butcher health goth skateboard, pinterest banh mi actually narwhal unicorn. Next level actually mustache vape, authentic XOXO shoreditch butcher fam. Glossier raclette activated charcoal hashtag celiac, typewriter bespoke adaptogen fanny pack man braid.', 'Yosemite Sam', '2014');


router.get('/', (req, res) => {
  res.json(BlogPosts.get());
});


router.post('/', jsonParser, (req, res) => {
  // a title, content, an author name, and (optionally) a publication date
  const requiredFields = ['title', 'content', 'author', 'pubdate'];
  for (let i=0; i < requiredFields.length; i++) {
    let field = requiredFields[i];
    if (!(field in req.body)) {
      let message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  const blogPost = BlogPosts.create(req.body.title, req.body.content, req.body.author, req.body.pubdate);
  res.status(201).json(blogPost);
});


router.delete('/:id', (req, res) => {
  BlogPosts.delete(req.params.id);
  console.log(`Deleted Blog Post: \`${req.params.id}\``);
  res.status(204).end();
});


router.put('/:id', jsonParser, (req, res) => {
  const requiredFields = ['title', 'content', 'author', 'pubdate'];
  for (let i=0; i < (requiredFields.length - 1); i++) {
    let field = requiredFields[i];
    if (!(field in req.body)) {
      let message = `Missing \`${field}\` in request body`
      console.error(message);
      return res.status(400).send(message);
    }
  }
  if (req.params.id !== req.body.id) {
    let message = (
      `Request path id (${req.params.id}) and request body id `
      `(${req.body.id}) must match`);
    console.error(message);
    return res.status(400).send(message);
  }
  console.log(`Updating Blog Post: \`${req.body.title}\``);
  const updatedBlogPost = BlogPosts.update({
    id: req.params.id,
    title: req.body.title,
    content: req.body.content,
    author: req.body.author,
    pubdate: req.body.pubdate
  });
  res.status(204).json(updatedBlogPost);
})

module.exports = router;
