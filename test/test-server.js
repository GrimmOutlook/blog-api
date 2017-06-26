const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');


// const {DATABASE_URL} = require('../config');
const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

// const blogPostRouter = require('../blogPostRouter');

const should = chai.should();

chai.use(chaiHttp);
// chai.use('/blogpost', blogPostRouter);

// ----------------------------------------------------------------------------------

function seedBlogData() {
  console.info('seeding blog data');
  const fakeBlogData = [];

  for (let i=1; i<=3; i++){
    fakeBlogData.push(generateFakeBlog());
  }
  // this will return a promise
  return BlogPost.insertMany(fakeBlogData);
}

function generateFakeBlog() {
  return {
    title: faker.lorem.words(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
      },
    content: faker.lorem.paragraph()
  }
}

// function tearDownDb() {
//     console.warn('Deleting database');
//     return mongoose.connection.dropDatabase();
// }

function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err))
  });
}

//---------------------------------------------------------------------------------

describe('BlogPosts API', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    return seedBlogData();
  });

  afterEach(function() {
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });

  describe('GET endpoint', function() {

    it('should list all blogposts on GET', function() {
      let res;
      return chai.request(app)
        .get('/blogpost')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          // res.should.be.json;
          res.body.should.have.length.of.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          res.body.should.have.lengthOf(count);
        });
    });

    it('should return blogposts with correct fields on GET', function(){
      let res;
      return chai.request(app)
        .get('/blogpost')
        .then(_res => {
          res = _res;
          res.should.have.status(200);
          res.body.should.be.a('array');
          res.body.should.have.length.of.at.least(1);

          res.body.forEach(function(blogpost) {
            blogpost.should.be.a('object');
            blogpost.should.include.keys(
              'id', 'author', 'content', 'title', 'created');
          });
          res = res.body[0];
          return BlogPost.findById(res.id).exec();
        })
        .then(blogpost => {
            res.title.should.equal(blogpost.title);
            res.content.should.equal(blogpost.content);
            res.author.should.equal(blogpost.authorName);
        });
    });
  });  // describe GET Endpoint end bracket / parentheses


  describe('POST endpoint', function() {

    it('should add a new blogpost on POST', function() {
      const newBlogPost = {
        title: faker.lorem.sentence(),
            author: {
              firstName: faker.name.firstName(),
              lastName: faker.name.lastName()
            },
            content: faker.lorem.paragraph()
      };

      return chai.request(app)
        .post('/blogpost')
        .send(newBlogPost)
        .then(function(res) {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.should.include.keys(
                'id', 'author', 'content', 'title', 'created');
          res.body.title.should.equal(newBlogPost.title);
          res.body.id.should.not.be.null;  // order matter for this?
          res.body.author.should.equal(`${newBlogPost.author.firstName} ${newBlogPost.author.lastName}`);
          res.body.content.should.equal(newBlogPost.content);
          return BlogPost.findById(res.body.id).exec();
        })
        .then(function(stuff){
          stuff.title.should.equal(newBlogPost.title);
          stuff.author.firstName.should.equal(newBlogPost.author.firstName);
          stuff.author.lastName.should.equal(newBlogPost.author.lastName);
          stuff.content.should.equal(newBlogPost.content);
        });
      });
  });  // describe POST Endpoint end bracket / parentheses

  describe('DELETE endpoint', function() {

    it('should delete blogpost by ID on DELETE', function() {
      let blogpost;
      return BlogPost
        .findOne()
        .exec()
        .then(_blogpost => {
          blogpost = _blogpost;
          return chai.request(app).delete(`/blogpost/${blogpost.id}`);
        })
        .then(res => {
          res.should.have.status(204);
          return BlogPost.findById(blogpost.id);
        })
        .then(_blogpost => {
          should.not.exist(_blogpost);
        });
    });
  });  // describe DELETE Endpoint end bracket / parentheses


  describe('PUT endpoint', function() {

    it('should update submitted fields on PUT', function() {
      const updatedBlogPost = {
        title: 'This title is better',
        content: 'Updated content for breaking news',
        author: {
          firstName: 'Updater',
          lastName: 'McUpdaterson'
        }
      };

      return BlogPost
        .findOne()
        .exec()
        .then(blogpost => {
          updatedBlogPost.id = blogpost.id;
          return chai.request(app)
            .put(`/blogpost/${blogpost.id}`)
            .send(updatedBlogPost)
        })
        .then(res => {
          res.should.have.status(201);
          res.should.be.json;
          res.body.should.be.a('object');
          res.body.title.should.equal(updatedBlogPost.title);
          res.body.author.should.equal(
            `${updatedBlogPost.author.firstName} ${updatedBlogPost.author.lastName}`);
          res.body.content.should.equal(updatedBlogPost.content);

          return BlogPost.findById(res.body.id).exec();
        })
        .then(blogpost => {
          blogpost.title.should.equal(updatedBlogPost.title);
          blogpost.author.firstName.should.equal(updatedBlogPost.author.firstName);
          blogpost.author.lastName.should.equal(updatedBlogPost.author.lastName);
          blogpost.content.should.equal(updatedBlogPost.content);
        });
    });
  });

});  // describe BlogPosts API end bracket / parentheses


// it('should error if POST missing expected values', function() {
//     const badRequestData = {};
//     return chai.request(app)
//       .post('/blog-posts')
//       .send(badRequestData)
//       .catch(function(res) {
//         res.should.have.status(404);
//       });
//   });

