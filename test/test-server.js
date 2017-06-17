const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');

const should = chai.should();

chai.use(chaiHttp);

describe('BlogPosts', function() {

  before(function() {
    return runServer();
  });

  after(function() {
    return closeServer();
  });

  // test strategy:
  //   1. make request to `/shopping-list`
  //   2. inspect response object and prove has right code and have
  //   right keys in response object.
  it('should list items on GET', function() {

    return chai.request(app)
      .get('/blogpost')
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');

        // because we create three items on app load
        res.body.length.should.be.above(0);
        // each item should be an object with key/value pairs
        // for `id`, `name` and `checked`.
        const expectedKeys = ['id', 'title', 'content', 'author', 'publishDate'];
        res.body.forEach(function(item) {
          item.should.be.a('object');
          item.should.include.keys(expectedKeys);
        });
      });
  });

  // test strategy:
  //  1. make a POST request with data for a new item
  //  2. inspect response object and prove it has right
  //  status code and that the returned object has an `id`
  it('should add an item on POST', function() {
    const newBlogPost = {
      title: 'Testing Title',
      content: 'Testing 1 2 3, Testing 1 2 3',
      author: 'Dr. Seuss',
      publishDate: '1998'
    };

      const expectedKeys = ['id'].concat(Object.keys(newBlogPost));

    return chai.request(app)
      .post('/blogpost')
      .send(newBlogPost)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.have.all.keys(expectedKeys);
        res.body.title.should.equal(newBlogPost.title);
        res.body.content.should.equal(newBlogPost.content);
        res.body.author.should.equal(newBlogPost.author);
        res.body.publishDate.should.equal(newBlogPost.publishDate);
      });
  });


  it('should update items on PUT', function() {

    const updatedBlogPost = {
      title: 'This title is better',
      content: 'Updated content for breaking news',
      author: 'Mr. Updater',
      publishDate: '1683'
    };

    return chai.request(app)
      .get('/blogpost')
      .then(function(res) {
        updatedBlogPost.id = res.body[0].id;
        return chai.request(app)
          .put(`/blogpost/${updatedBlogPost.id}`)
          .send(updatedBlogPost)
          .then(function(res) {
            res.should.have.status(204);
          });
      });
  });


  // test strategy:
  //  1. GET a shopping list items so we can get ID of one
  //  to delete.
  //  2. DELETE an item and ensure we get back a status 204
  it('should delete items on DELETE', function() {
    return chai.request(app)
      // first have to get so we have an `id` of item
      // to delete
      .get('/blogpost')
      .then(function(res) {
        return chai.request(app)
          .delete(`/blogpost/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});


it('should error if POST missing expected values', function() {
    const badRequestData = {};
    return chai.request(app)
      .post('/blog-posts')
      .send(badRequestData)
      .catch(function(res) {
        res.should.have.status(404);
      });
  });

