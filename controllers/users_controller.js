var crypto = require('crypto');
var mongoose = require('mongoose'),
  User = mongoose.model('User');

function hashPW(pwd) {
  return crypto.createHash('sha256').update(pwd).
  digest('base64').toString();
}
exports.signup = function(req, res) {
  console.log("Begin exports.signup");
  var user = new User({ username: req.body.username });
  console.log("after new user exports.signup");
  user.set('hashed_password', hashPW(req.body.password));
  console.log("after hashing user exports.signup");
  user.set('email', req.body.email);
  user.set('number_games_played', 0);
  console.log("after email user exports.signup");
  user.save(function(err) {
    console.log("In exports.signup");
    console.log(err);
    if (err) {
      res.session.error = err;
      res.redirect('/signup');
    }
    else {
      req.session.user = user.id;
      req.session.username = user.username;
      req.session.msg = 'Authenticated as ' + user.username;
      res.redirect('/');
    }
  });
};
exports.login = function(req, res) {
  User.findOne({ username: req.body.username })
    .exec(function(err, user) {
      if (!user) {
        err = 'User Not Found.';
      }
      else if (user.hashed_password ===
        hashPW(req.body.password.toString())) {
        req.session.regenerate(function() {
          console.log("login");
          console.log(user);
          req.session.user = user.id;
          req.session.username = user.username;
          req.session.msg = 'Authenticated as ' + user.username;
          req.session.color = user.color;
          req.session.number_games_played = user.number_games_played;
          res.redirect('/');
        });
      }
      else {
        err = 'Authentication failed.';
      }
      if (err) {
        req.session.regenerate(function() {
          req.session.msg = err;
          res.redirect('/login');
        });
      }
    });
};
exports.getUserProfile = function(req, res) {
  User.findOne({ _id: req.session.user })
    .exec(function(err, user) {
      if (!user) {
        
        res.json(404, { err: 'User Not Found.' });
      }
      else {
        console.log(user);
        res.json(user);
      }
    });
};
exports.updateUser = function(req, res) {
  User.findOne({ _id: req.session.user })
    .exec(function(err, user) {
      user.set('email', req.body.email);
      user.set('color', req.body.color);
      user.save(function(err) {
        if (err) {
          res.sessor.error = err;
        }
        else {
          req.session.msg = 'User Updated.';
          req.session.color = req.body.color;
        }
        res.redirect('/user');
      });
    });
};
exports.deleteUser = function(req, res) {
  User.findOne({ _id: req.session.user })
    .exec(function(err, user) {
      if (user) {
        user.remove(function(err) {
          if (err) {
            req.session.msg = err;
          }
          req.session.destroy(function() {
            res.redirect('/login');
          });
        });
      }
      else {
        req.session.msg = "User Not Found!";
        req.session.destroy(function() {
          res.redirect('/login');
        });
      }
    });
};

exports.getAllUsers = function(req, res){
  User.find().exec(function(err, user){
    if(err){
      console.log("There was an error getting all of the users");
    }else{
      res.json(user);
    }
  });
};

exports.updateHighscore = function(req, res){
  User.findOne({ _id: req.session.user })
    .exec(function(err, user) {
      console.log("Highscore that came in: " + req.body.highscore);
      
      if(user.number_games_played < req.body.highscore){
        user.set('number_games_played', req.body.highscore);
      }
      
      user.save(function(err) {
        if (err) {
          res.sessor.error = err;
        }
        else {
          req.session.msg = 'User Updated.';
          req.session.color = req.body.color;
          req.session.number_games_played = req.body.highscore;
        }
        res.redirect('/');
      });
    });
};