'use strict';

module.exports = function () {
  var express = require('express');
  var bodyParser = require('body-parser');
  var app = express();

  app.use('/', bodyParser.urlencoded());
  app.use('/', bodyParser.json());
  app.use('/', function (req, res, next) {
    console.log('hello');
    console.log(req.headers);
    console.log(req.body);
    next();
  });
  app.use('/login-with-basic', function (req, res) {
    var user = require('basic-auth')(req);
    if (user && 'coolaj86' === user.name
        && 'supersecret' === user.pass) {
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

    res.setHeader('WWW-Authenticate', 'Basic realm=Authorization Required');
    res.statusCode = 401;
    res.send('Fail!');
  });

  return app;
};
