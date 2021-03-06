'use strict';

var https = require('https');
var http = require('http');
var port = process.argv[2] || 8443;
var testCert = require('localhost.daplie.com-certificates');
var server = https.createServer({
  key: testCert.key
, cert: testCert.cert
, ca: testCert.ca
, SNICallback: function (domainname, cb) {
    // check domainname if you need to switch between certificates
    cb(null, require('tls').createSecureContext(testCert));
  }
});
var insecure = http.createServer();
var app = require('./app');

server.on('request', app());
server.listen(port, function () {
  console.log('Listening on https://localhost.daplie.com:'
    + server.address().port);
});

insecure.on('request', app());
insecure.listen(8080, function () {
  console.log('Listening insecurely on', insecure.address().port);
});
