'use strict';

module.exports = function () {
  var express = require('express');
  var session = require('express-session');
  var passport = require('passport');
  var TwitterStrategy = require('passport-twitter').Strategy;
  var bodyParser = require('body-parser');
  var app = express();
  var twConfig = require('./config').twitter;
  var twCallback = '/api/oauth/callback/twitter';
  var memDb = {};

  function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/');
  }

  // using urlencoded opens you up to CSRF attacks
  //app.use('/', bodyParser.urlencoded());
  app.use('/', bodyParser.json());

  // express session must come first
  app.use('/', session({
    secret: require('./config').cookieSecret
  , cookie: {
      secure: true
    , httpOnly: true
    , path: '/api'
    , store: new session.MemoryStore()
    }
  }));

  // passport init and session comes after express session
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use('myTwitter', new TwitterStrategy({
    consumerKey: twConfig.key
  , consumerSecret: twConfig.secret
  , callbackURL: 'https://localhost.daplie.com:8443' + twCallback
  }, function(token, tokenSecret, profile, done) {
    console.log('twitter profile:', profile);
    // the token and tokenSecret I could use to tweet on behalf of the user

    // this object, is going to end up as `req.user` and `req.session.user`
    return done(null, {
      token: token
    , tokenSecret: tokenSecret
    , profile: profile
    });
  }));

  // save to database
  passport.serializeUser(function(user, done) {
    var id = user.profile.id;

    // this should go into mongo db or whatever and hand back an id
    memDb[id] = user;

    done(null, id);
  });

  // retrieve from database
  passport.deserializeUser(function(id, done) {
    // this should retrieve from mongo and hand back a user object
    var user = memDb[id];

    done(null, user);
  });

  // Passport handles the OAuth details
  app.get('/api/oauth/authorization_dialog/twitter'
    , passport.authenticate('myTwitter'));
  app.get(twCallback
    , passport.authenticate('myTwitter', {
      successRedirect: '/login_success',
      failureRedirect: '/?error=E_BAD_AUTH&error_message=login%20failed'
    }), function(req, res) {
      console.log(req.session);
      res.end("doesn't get here");
    });

  app.use('/api', function (req, res, next) {
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
