'use strict';

module.exports.create = function (config, app) {
  var scmp = require('scmp');
  var basicAuth = require('basic-auth');

  app.use('/api/login-with-basic', function (req, res) {
    var user = basicAuth(req);
    var result;

    if (!user) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Please Login"');
      res.send({ error: { message: "basic auth was not supplied" } });
      return;
    }

    if (!scmp(config.admin.name, user.name)) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Please Login"');
      res.send({ error: { message: "bad username" } });
      return;
    }

    if (!scmp(config.admin.pass, user.pass)) {
      res.statusCode = 401;
      res.setHeader('WWW-Authenticate', 'Basic realm="Please Login"');
      res.send({ error: { message: "bad password" } });
      return;
    }

    result = {
      success: true
    , notice: "now that the basic login is stored in the browser you can hit refresh over and over and it's always saved."
    };
    if (req.session && req.session.count) {
      result.count = req.session.count;
    }
    res.send(result);
  });
};
