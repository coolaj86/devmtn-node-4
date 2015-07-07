module.exports = {
  // create 256-bit (32-byte) a one-time secrets like this:
  // require('crypto').randomBytes(32).toString('hex');
  cookieSecret: '0000000000000000000000000000000000000000000000000000000000000000'
, jwtHmacSecret: '0000000000000000000000000000000000000000000000000000000000000000'
  // dummy app for https://localhost.daplie.com
, twitter: {
    key: 'zLSiRjzDHe8atXtTHbW4XSINr'
  , secret: 'jt5ncEQO5y7E4Z5aQguyZrpDdW8OohVXZz5pBL5yjghTE6CPvH'
  }
, admin: {
    name: 'coolaj86'
  , pass: 'supersecret'
  }
};
