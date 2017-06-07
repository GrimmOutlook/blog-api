const express = require('express');
const router = express.Router();
const morgan = require('morgan');
const bodyParser = require('body-parser');

const {BlogPost} = require('./models');

const jsonParser = bodyParser.json();
const app = express();


app.use(morgan('common'));
