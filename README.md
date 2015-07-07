# devmtn-node-4

  * Basic Auth (HTTP standard)
  * Form-based Auth (no standard)
  * Token & OAuth-based

Note that the stuff in this README is above and beyond what we did in
class today.

Security
--------

The problem with the web is that it was invented without any thought
of security, so all of the security options were added later and
turned off by default as to not break pre-existing applications.

[HelmetJS](https://github.com/helmetjs) has a bunch of modules for
express that you can include to turn pretty much every available web
security measure on.

By turning the security measures on and not using vulnerable
technologies, it's very easy to keep your users safe.

Basic Auth
----------

This is an actual HTTP standard and is implemented in every HTTP library
I know of.

The url `https://coolaj86:supersecret@localhost.daplie.com:8443`
will send a header such as this one:

```
Authorization: Basic Y29vbGFqODY6c3VwZXJzZWNyZXQ=
```

You could parse it by hand pretty easily, or use an existing module.

```js
var basicAuth = require('basic-auth');

app.post('/api/login-with-basic', function (req, res) {
  var user = basicAuth(req);

  if (!user) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Please Login"');
    res.send({ error: { message: "basic auth was not supplied" } });
    return;
  }

  if (!scmp('coolaj86', user.name)) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Please Login"');
    res.send({ error: { message: "bad username" } });
    return;
  }

  if (!scmp('supersecret', user.pass)) {
    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Please Login"');
    res.send({ error: { message: "bad password" } });
    return;
  }

  res.send({ success: true });
})
```

Create a link and try to log in

```html
<a href="/api/login-with-http-basic">Go to login page</a>
```

Using the username and password options for `$.ajax`, `$http`, and node's
`https` will also generate this header automatically.

It's created from base64, like so:

```js
'use strict';

new Buffer('coolaj86:supersecret', 'utf8').toString('base64');
new Buffer('Y29vbGFqODY6c3VwZXJzZWNyZXQ=', 'base64').toString('utf8');
```

Here's a cURL example (which you could easily adapt to postman)

```bash
# this way
curl https://localhost.daplie.com:8443/login \
  -X POST \
  --user 'coolaj86:supersecret'

# or this way
curl https://coolaj86:supersecret@localhost.daplie.com:8443/login \
  -X POST
```

### Security

This is kinda no-duh, but if a user create's a link with their username
and password in it and shares it, the person receiving the link can
gain access to their account.

Google does not index links with `user:pass@` in them and I don't believe
it honors those links if they are clicked on in Chrome.

Form Auth
---------

There is no standard for form auth. Using JSON is more secure than using
urlencoded because JSON is not vulnerable to certain classes of form attack.

```js
// scmp is a constant-time string compare function
// use it instead of === to prevent timing attacks
var scmp = require('scmp');

app.use('/', bodyParser.json())

// warning: if you include bodyParser.urlencoded()
// your server will be vulnerable to CSRF attacks

app.post('/api/login-with-form', function (req, res) {

  if (!scmp('coolaj86', req.body.username)) {
    res.send({ error: { message: "bad username" } });
    return;
  }

  if (!scmp('supersecret', req.body.password)) {
    res.send({ error: { message: "bad password" } });
    return;
  }

  res.send({ success: true });
})
```

Create a link and try to log in

```html
<a href="/api/login-with-http-basic">Go to login page</a>
```

JSON

```
curl https://localhost.daplie.com:8443/login \
  -X POST \
  -H 'Content-Type: application/json; charset=utf-8' \
  -d '{ "username": "coolaj86&password=supersecret'
```

www-form-urlencoded

```
curl https://localhost.daplie.com:8443/login \
  -X POST \
  -d 'username=coolaj86&password=supersecret'
```

An advantage to using forms over Basic Auth is if your authorization
process requires additional information.

The only common case that comes immediately to mind is with "tenanted apps",
where a customer account must be selected. For example, Sally may have
accounts with both Dan the Dentist and Orem the Orthopedic Surgeon
through a contracted 3rd party software Bob's Billing and she might actually
have a different password for each.

### Security

* using bodyParser.urlencoded() makes you vulnerable to CSRF attacks
* using === to test against passwords, tokens, or secrets makes you vulnerable to timing attacks

Passwords, HTTPS, and Remote Passwords
----------------------------

You should **never** handle a password without **https**.

For example: if you're ever on a cruise to Mexico or the Bahamas,
there's a good chance that one of the tourist coffeeshops you visit
will offer you free wifi in exchange for being able to snoop all of
your unencrypted traffic and steal your identity.

Also, your average High School or college CS or IT student will at some
point discover the fun of using common network tools to mess with people's
cookies, tokens, and such from the library (or student housing). It might
be as innocent as laughing at what you're searching for on a woman's health
forum... or not.

Furthermore, it is much safer if you never send passwords to your
server at all, but instead a computation which is based on the
user's password.

See this info on "secure remote passwords"
  * [Secure your users' passwords from the browser on](https://coolaj86.com/articles/secure-your-users-passwords-from-the-browser-on/)
  * [User passwords should never leave the browser](http://connect2id.com/blog/user-passwords-should-never-leave-the-browser)
  * [PBKDF2 Demo](https://jswebcrypto.azurewebsites.net/demo.html#/pbkdf2)

... or just don't take a user's password at all and use
passport-facebook, passport-twitter, and passport-google instead

Sessions
--------

Sessions can be managed via Cookies or via Tokens, but most libraries
still use tokens :-(

Also, only webapps (AngularJS, etc) can take advantage of token sessions.

Sites that use serverside apps with html forms and html rendering
(ruby on Rails, Django etc) must use cookies.

### with Cookies

Luckily express-session uses a secret value to verify that cookies
aren't being forged and the `secure` option will prevent cookies
from being used over unencrypted http.

```js
var session = require('express-session');

// generate the cookie secret and then store it in config.js
// require('crypto').randomBytes(32).toString('hex');
var cookieSecret = require('./config').cookieSecret;

app.set('trust proxy', 1);
app.use('/', session({
  secret: [ cookieSecret ],
, cookie: {
    path: '/api/'
  , secure: true
  , httpOnly: true
  , store: new session.MemoryStore()
  }
}))

// Note: you'll want to replace MemoryStore with a MongoDb store
// https://github.com/expressjs/session#compatible-session-stores

// just to show that sessions are always active
app.use('/', function (req, res) {
  if (!req.session.count) {
    req.session.count = 0;
  }
  req.session.count += 1;
  console.log(req.session);
});
```

### with Tokens

Tokens must be sent with every request via JavaScript using
the `access_token` (de facto standard) query parameter,
the `Authorization: Bearer <<token>>` (de facto standard),
or `Authorization: token <<token>>` (actual standard that no one uses).

Angular's has "http interceptors" that facilitate this.

These could be used with guest accounts, just like cookies,
but it's more typical to store guest information
(such as items in shopping cart) in localStorage or
indexedDb and merge the data if the user actually logs in.

JWT is the only standardized token type, and it's pretty legit.
It can store the entire session in the browser if needed.

```js
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

// generate the jwt secret and then store it in config.js
// require('crypto').randomBytes(32).toString('hex');
var jwtHmacSecret = require('./config').jwtHmacSecret;

app.use('/api/login', function (req, res) {
  var user = basicAuth(req);
  var token;

  if (!(user
    && scmp('coolaj86', user.name)
    && scmp('supersecret', user.pass))) {

    res.statusCode = 401;
    res.setHeader('WWW-Authenticate', 'Basic realm="Please Login"');
    res.send({ error: { message: "bad basic auth" } });

    return;
  }

  // this data is publicly visible, but signed.
  token = jwt.sign({ user: 'coolaj86', admin: true }, jwtHmacSecret);
  res.send({ access_token: token });
});

app.use('/api/account', expressJwt({
  secret: jwtHmacSecret
}));

app.use('/api/admin', expressJwt({
  secret: jwtHmacSecret
}), function (req, res, next) {
  if (!req.user.admin) {
    res.send({ error: { message: "you are not an admin" } });
    return;
  }

  next();
});
```

Note that if you wanted to do something like a counter, you would want
to either reissue the token with each request or mimic express-session,
but using tokens instead of cookies.

### Security

Cookies are sent with every request to a matching domain and path -
there's no way to turn them on or off.

Using cookies makes your site vulnerable to XSS attacks, but
[CSP](https://github.com/helmetjs/csp) and
[X-XSS-Protection](https://github.com/helmetjs/x-xss-protection)
can be used to mitigate this.

When using tokens to access static resources such as a file download or
an image, you must either append the token to the query parameters or
you must create an API endpoint to exchange a token for a one-time link
to that resource.

If a user wanted to share an image, not realizing that their token was in
the query parameters and unwittingly sent it to an attacker, the attacker
could compromise the account.

```html
<img src="https://localhost.daplie.com:8443/api/downloads/pretty-cat.jpg?access_token=<<token>>">
```

<!--
```js
$http.get({
  url: "https://localhost.daplie.com:8443/api/urls/pretty-cat.jpg"
, headers: {
    'Authorization': 'Bearer ' + accessToken
  }
})
```
-->

OAuth
---------

OAuth 1.0, 1.0a, 2.0 and OpenID Connect (essentially OAuth3) are used
by Twitter, Facebook, Google, etc to allow you to let them handle all
of the security issues related to login, while you just handle the token.

Some of the OAuth providers use JWTs, other providers just use random
strings and then store the session the same way the would with a cookie.

Tokens generally look like this, but potentially a lot longer.

```
Authorization: Bearer aaaaaaaaaa.bbbbbbbbbbb.cccccccccccc
```

Because there are slight variations in the OAuth standard and no one has
yet to make an OAuth library that accounts for those variations, each
login type must be handled on a case-by-case basis with something like
PassportJS.

PassportJS
----------

Here's an example of using twitter. Note that PassportJS has it's own
session wrapper that must be used in conjunction with express-session.

For the most part PassportJS is a copy-and-paste solution.
You find an example that is specific to the login system that you
want, you coy and paste the demo code, and then you replace the
demo keys and `XYZ_GOES_HERE` with actual values.

```js
var twConfig = require('./config').twitter;
var twCallback = '/auth/twitter/callback';
var memDb = {};

// express session must come first
app.use('/', session({ secret: require('./config').cookieSecret }));

// passport comes after
app.use(passport.initialize());
app.use(passport.session());

passport.use('twitter', new TwitterStrategy({
  consumerKey: twConfig.key
, consumerSecret: twConfig.secret
, callbackURL: 'https://localhost.daplie.com:8443' + twCallback
}, function(token, tokenSecret, profile, done) {
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
  var id = user.profile.token;

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
app.get('/auth/twitter/authorization_dialog'
  , passport.authenticate('twitter'));
app.get(twCallback
  , passport.authenticate('twitter', {
    successRedirect: '/home',
    failureRedirect: '/login'
  }), function(req, res) {
    console.log(req.session);
    res.end("doesn't get here");
  });
```

Then have a link to open the dialog box

```html
<a href="/oauth/twitter/authorization_dialog">Connect with Twitter</a>
```

### Good Reads

* [OAuth2 Simplified](https://aaronparecki.com/articles/2012/07/29/1/oauth2-simplified)
* How to Tweet from NodeJS | [code](https://github.com/coolaj86/node-twitter-demo) | [screencast](https://coolaj86.com/articles/how-to-tweet-from-nodejs.html)

Using Fake Domains
------------------

Because cookies, localStorage, indexedDB, etc can start to get
really wonky when developing, I recommend not using `localhost`,
but using distinct domains for different projects.

`localhost.daplie.com` and `localhost.coolaj86.com` are dedicated
for this purpose and you can also add to your `/etc/hosts`.

I strongly recommend using the `localhost.` prefix so that you don't
do something silly that you forget about that makes debugging more
difficult later.

`sudo vim /etc/hosts`:
```
127.0.0.1 localhost.example.com
127.0.0.1 localhost.fakedomain.com
```
