'use strict';

module.exports.create = function (config, app) {
  var scmp = require('scmp');
  var result;

  app.post('/api/login-with-form', function (req, res) {

    if (!scmp(config.admin.name, req.body.username)) {
      res.send({ error: { message: "bad username" } });
      return;
    }

    if (!scmp(config.admin.pass, req.body.password)) {
      res.send({ error: { message: "bad password" } });
      return;
    }

    result = { success: true };
    if (req.session && req.session.count) {
      result.count = req.session.count;
    }
    res.send(result);
  });
};
