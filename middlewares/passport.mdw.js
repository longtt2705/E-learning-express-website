const e = require("express");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const key = require("../key/key");
const accountModel = require("../models/account.model");
const cryptoRandomString = require("crypto-random-string");

module.exports = (app) => {
  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser((user, done) => {
    done(null, user.Username);
  });

  passport.deserializeUser(async (username, done) => {
    const account = await accountModel.singleByUserNameWithoutProvider(
      username
    );
    done(null, account);
  });

  passport.use(
    new GoogleStrategy(
      {
        clientID: key.googleClientID,
        clientSecret: key.googleClientSecret,
        callbackURL: "http://localhost:5555/auth/google/callback",
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        const email = profile.emails[0].value;
        const name = profile.displayName;
        const provider = profile.provider;

        // check if this email has been registered in local before
        const accLocal = await accountModel.singleByUserName(email);
        if (accLocal !== null) done(null, false);
        else {
          let accAuth = await accountModel.singleByUserName(email, provider);
          if (accAuth === null) {
            const account = {
              username: email,
              password: cryptoRandomString({ length: 20 }),
              phone: null,
              balance: 100.0,
              name: name,
              image: "avatar.jpg",
              statusid: 4,
              roleid: 2,
              provider: provider,
            };
            await accountModel.add(account);
            accAuth = await accountModel.singleByUserName(email, provider);
          }
          accAuth.role = {
            isAdmin: false,
            isStudent: true,
            isTeacher: false,
          };
          req.session.isAuth = true;
          req.session.authUser = accAuth;
          done(null, accAuth);
        }
      }
    )
  );
};
