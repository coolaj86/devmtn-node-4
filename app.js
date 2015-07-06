'use strict';

module.exports = function () {
  var express = require('express');
  var session = require('express-session');
  var passport = require('passport');
  var TwitterStrategy = require('passport-twitter').Strategy;
  var bodyParser = require('body-parser');
  var app = express();
  var requireAuth = function(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/login');
  }

  app.use('/', bodyParser.urlencoded());
  app.use('/', bodyParser.json());
  // express session must come first
  app.use('/', session({ secret: require('./config').cookieSecret }));
  // passport comes after
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use('twitter', new TwitterStrategy({
    consumerKey: 'qgT3gYCqZCTbyL5EVzcOMVL8R',
    consumerSecret: 'Qkp6wOagy4pnC87kjBlwEAbFQstLrlFADvpitZ4tYNdc9UjE7G',
    callbackURL: 'http://localhost:8080/auth/twitter/callback'
  }, function(token, tokenSecret, profile, done) {
    console.log('some kind of test', token);
    return done(null, profile);
  }));

  // save to database
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  // retrieve from database
  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  app.get('/auth/twitter/authorization_dialog'
    , passport.authenticate('twitter'));
  app.get('/auth/twitter/callback'
    , passport.authenticate('twitter', {
      successRedirect: '/home',
      failureRedirect: '/login'
    }), function(req, res) {
      console.log(req.session);
      res.end("doesn't get here");
    });

  app.use('/', function (req, res, next) {
    if (!req.session.count) {
      req.session.count = 0;
    }
    req.session.count += 1;

    console.log('hello');
    console.log(req.headers);
    console.log(req.body);
    console.log(req.session);
    next();
  });

  app.use('/api/protected', requireAuth, function (req, res) {
    res.send("Congrats, you got here");
  });

  app.use('/', express.static(__dirname + '/public'));

  return app;
};
