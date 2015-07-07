'use strict';

module.exports = function () {
  var express = require('express');
  var session = require('express-session');
  var passport = new (require('passport')).Passport();
  var bodyParser = require('body-parser');
  var config = require('./config');
  var app = express();

  function requireAuth(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    return res.redirect('/');
  }

  // using urlencoded opens you up to CSRF attacks
  //app.use('/', bodyParser.urlencoded());
  app.use('/', bodyParser.json());

  app.set('trust proxy', 1);
  // express session must come first
  app.use('/api', session({
    secret: require('./config').cookieSecret
  , cookie: {
      // only allow encrypted https connections
      secure: true
    , httpOnly: true
    , path: '/api'
    , store: new session.MemoryStore()
    }
  }));

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

  require('./logins/twitter').create(config, app, passport);
  require('./logins/basic').create(config, app);
  require('./logins/form').create(config, app);

  app.use('/api/protected', requireAuth, function (req, res) {
    res.send("Congrats, you got here");
  });

  app.use('/', express.static(__dirname + '/public'));

  return app;
};
