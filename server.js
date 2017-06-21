const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();

const app = express();

const blogPostRouter = require('./blogPostRouter');

const {DATABASE_URL, PORT} = require('./config');
// const {BlogPost} = require('./models');

app.use(morgan('common'));
app.use(express.static('public'));
app.use(jsonParser);

mongoose.Promise = global.Promise;

// app.get('/', (req, res) => {
//   res.sendFile(__dirname + '/views/index.html');
// });

app.use('/blogpost', blogPostRouter);

let server;

function runServer(databaseUrl=DATABASE_URL, port=PORT) {

  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
      .on('error', err => {
        mongoose.disconnect();
        reject(err);
      });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
     return new Promise((resolve, reject) => {
       console.log('Closing server');
       server.close(err => {
           if (err) {
               return reject(err);
           }
           resolve();
       });
     });
  });
}


if (require.main === module) {
  runServer().catch(err => console.error(err));
};

module.exports = {app, runServer, closeServer};
