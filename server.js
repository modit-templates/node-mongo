var express = require('express');
var mongoose = require('mongoose');

var PORT = process.env.PORT || 3000;
var MONGO_URI = process.env.MONGO_URI || 'mongodb://db:27017/example';

var FIRST_NAMES = ['Engelbert', 'Harvey', 'Peggy', 'Nancy', 'Ivan'];
var LAST_NAMES = ['Humperdinck', 'Wallbanger', 'Guggenheim', 'Narwhal', 'Drago'];

var app = express();

var userSchema = new mongoose.Schema({
  name: {
    first: String,
    last: { type: String, trim: true }
  },
  age: { type: Number, min: 0}
});

var SuperUser = mongoose.model('SuperUsers', userSchema);

mongoose.connect(MONGO_URI, { 
  server: { socketOptions: { autoReconnect: true } }
});

mongoose.connection.on('error', function(err) {
  console.log('ERROR connecting to: ' + MONGO_URI + '. ' + err);
});

mongoose.connection.once('open', function() {
  console.log('Successfully connected to: ' + MONGO_URI);

  app.get('/', function (req, res) {

    var rando = new SuperUser ({
      name: { 
        first: pickName( FIRST_NAMES ), 
        last: pickName( LAST_NAMES )
      },
      age: Math.floor( Math.random() * 110 )
    });

    rando.save(function (err) {
      if (err) { console.log('Error on save!'); }
      createWebpage(req, res);
    });
  });

  var server = app.listen(PORT, function () {
    var port = server.address().port;
    console.log('Example app listening on port ' + port);
  });
});

function createWebpage(req, res) {
  res.writeHead(200, {'Content-Type': 'text/html'});

  SuperUser.find({}).sort('-age').limit(20).exec(function(err, result) { 
    if (!err) { 
      res.end(html1 + JSON.stringify(result, undefined, 2) +  html2 + result.length + html3);
    } else {
      res.end('Error querying users. ' + err);
    }
  });
}

function pickName(list) {
  return list[ Math.floor( Math.random() * list.length ) ];
}

var html1 = '<title> node-mongo: Docker Node.js MongoDB Mongoose demo on Modit </title> \
<head> \
<style> body {background-color: #222222; color: #95bc11; font-family: sans-serif} </style> \
</head> \
<body> \
<h1> node-mongo: Docker Node.js MongoDB Mongoose demo on Modit </h1> \
<br\> \
<br\> \
<br\> <h2> Oldest 20 users in MonogoDB database </h2> <pre><code> ';
var html2 = '</code></pre> <br\> <i>';
var html3 = ' documents. Refresh the page to generate more</i> <br\> <br\> \
<br\> <br\> <center><i> Demo code available at <a href="https://github.com/modit-templates/node-mongo">github.com</a> </i></center>';

