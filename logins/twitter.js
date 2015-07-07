'use strict';

module.exports.create = function (config, app, passport) {
  var TwitterStrategy = require('passport-twitter').Strategy;
  var twConfig = config.twitter;
  var twCallback = '/api/oauth/callback/twitter';
  var memDb = {};

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
};
