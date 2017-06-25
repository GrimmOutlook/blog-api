const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const faker = require('faker');


// const {DATABASE_URL} = require('../config');
const {BlogPost} = require('../models');
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

// const blogPostRouter = require('./blogPostRouter');

const should = chai.should();

chai.use(chaiHttp);
// chai.use(blogPostRouter);

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

describe('BlogPosts', function() {

  before(function() {
    return runServer(TEST_DATABASE_URL);
  });

  beforeEach(function() {
    console.log('WTF is going on');
    return seedBlogData();
    console.log(seedBlogData());
    console.log('WTF is going on, part 2');
  });

  afterEach(function() {
    // console.log(seedBlogData());
    return tearDownDb();
  });

  after(function() {
    return closeServer();
  });


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

});


//   it('should add an item on POST', function() {
//     const newBlogPost = {
//       title: 'Testing Title',
//       content: 'Testing 1 2 3, Testing 1 2 3',
//       author: 'Dr. Seuss',
//       publishDate: '1998'
//     };

//       const expectedKeys = ['id'].concat(Object.keys(newBlogPost));

//     return chai.request(app)
//       .post('/blogpost')
//       .send(newBlogPost)
//       .then(function(res) {
//         res.should.have.status(201);
//         res.should.be.json;
//         res.body.should.be.a('object');
//         res.body.should.have.all.keys(expectedKeys);
//         res.body.title.should.equal(newBlogPost.title);
//         res.body.content.should.equal(newBlogPost.content);
//         res.body.author.should.equal(newBlogPost.author);
//         res.body.publishDate.should.equal(newBlogPost.publishDate);
//       });
//   });


//   it('should update items on PUT', function() {

//     const updatedBlogPost = {
//       title: 'This title is better',
//       content: 'Updated content for breaking news',
//       author: 'Mr. Updater',
//       publishDate: '1683'
//     };

//     return chai.request(app)
//       .get('/blogpost')
//       .then(function(res) {
//         updatedBlogPost.id = res.body[0].id;
//         return chai.request(app)
//           .put(`/blogpost/${updatedBlogPost.id}`)
//           .send(updatedBlogPost)
//           .then(function(res) {
//             res.should.have.status(204);
//           });
//       });
//   });


//   // test strategy:
//   //  1. GET a shopping list items so we can get ID of one
//   //  to delete.
//   //  2. DELETE an item and ensure we get back a status 204
//   it('should delete items on DELETE', function() {
//     return chai.request(app)
//       // first have to get so we have an `id` of item
//       // to delete
//       .get('/blogpost')
//       .then(function(res) {
//         return chai.request(app)
//           .delete(`/blogpost/${res.body[0].id}`);
//       })
//       .then(function(res) {
//         res.should.have.status(204);
//       });
//   });
// });


// it('should error if POST missing expected values', function() {
//     const badRequestData = {};
//     return chai.request(app)
//       .post('/blog-posts')
//       .send(badRequestData)
//       .catch(function(res) {
//         res.should.have.status(404);
//       });
//   });

