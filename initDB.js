var mongoose  = require('mongoose');
var User = require('./models/user'); 

var FIRST_NAMES = ['Engelbert', 'Harvey', 'Peggy', 'Ivan'];
var LAST_NAMES  = ['Humperdinck', 'Wallbanger', 'Guggenheim', 'Drago'];

// clear out old users and create some random new ones

module.exports = function(count) {
  var i, users = [];

  for (i = 0; i < count; i++) {
    users[i] = {
      name: { 
        first: pickName(FIRST_NAMES), 
        last: pickName(LAST_NAMES)
      },
      age: Math.floor(Math.random() * 110)
    };
  }
  
  return User.remove({}).exec().then(function() {
    User.create(users);
  });
};

// randomly select an item from a list

function pickName(list) {
  return list[Math.floor(Math.random() * list.length)];
}

