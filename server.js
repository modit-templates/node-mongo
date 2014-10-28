var express  = require('express');
var mongoose = require('mongoose');
var initDB   = require('./initDB');
var User     = require('./models/user');

// environment variables can be set in fig.yml

var PORT      = process.env.PORT      || 3000;
var MONGO_URI = process.env.MONGO_URI || 'mongodb://db:27017/example';
var NUM_USERS = process.env.NUM_USERS || 10;

var app = express();

// use ejs for template engine and configure it

app.engine('html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');

// our only route - gets users from db and displays them

app.get('/', getUsers, function(req, res) {
  res.render('users');
});

// connect to mongo running in our db container

connect();

// then add some data and start listening for requests

mongoose.connection.once('open', function() {
  console.log('Connected!');
  initDB(NUM_USERS).then(listen, function(err) {
    console.log('ERROR initializing data: ' + err);
  })
});

// calls itself with exponential backoff if connection fails

function connect(attempt) {
  console.log('Connecting to: ' + MONGO_URI + ' ...'); 
  mongoose.connect(MONGO_URI, function(err, res) {
    if (err) {
      attempt = attempt || 0;
      var timeoutSecs = Math.exp(attempt);
      console.log('ERROR! ' + err);
      console.log('Retrying in ' + timeoutSecs + 's.');
      setTimeout(connect, timeoutSecs * 1000, attempt + 1);
    }
  });
}

// called after connecting to db and initializing data

function listen() {
  var server = app.listen(PORT, function() {
    console.log('Server listening on port ' + server.address().port);
  });
}

// middleware - gets users and calls next route
// note view templates can use any properties set on res.locals

function getUsers(req, res, next) {
  User.find({}).sort('-age').exec(function(err, users) { 
    if (err) { 
      res.end('Error querying users. ' + err);
    } else {
      res.locals.users = users;
      next();
    }
  });
}

