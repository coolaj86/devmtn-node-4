'use strict';

module.exports = function () {
  var express = require('express');
  var session = require('express-session');
  var bodyParser = require('body-parser');
  var app = express();

  app.use('/', bodyParser.urlencoded());
  app.use('/', bodyParser.json());
  app.use('/', session({ secret: require('./config').cookieSecret }));

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
  app.use('/login-with-basic', function (req, res) {
    var user = require('basic-auth')(req);
    if (user && 'coolaj86' === user.name
        && 'supersecret' === user.pass) {
      req.session.lastLogin = Date.now();
      res.send('Welcome!');
      return;
    }

    res.setHeader('WWW-Authenticate', 'Basic realm=Authorization Required');
    res.statusCode = 401;
    res.send('Fail!');
  });
  app.use('/login-with-form', function (req, res) {
    if ('coolaj86' === req.body.username
        && 'supersecret' === req.body.password) {
      res.send('Welcome!');
      return;
    }

    res.send('Fail!');
  });

  app.use('/', function (req, res) {
    // req.session.lastLoginType
    if (req.session.lastLogin) {
      res.send('Authenticated');
      return;
    }

    res.send('Unauthenticated');
  })

  return app;
};
