const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/user');

passport.use(new GoogleStrategy(
{
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:5001/api/auth/google/callback"
},
async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });

    return done(null, {
      existingUser: !!user,
      user,
      googleProfile: {
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName
      }
    });
  } catch (err) {
    return done(err, null);
  }
}));


// Serialize/deserialize (not used for JWT, but required by passport)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then(user => done(null, user)));

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Start Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:3000/register' }),
  (req, res) => {

    // Existing user → issue JWT
    if (req.user.existingUser) {
      const token = jwt.sign(
        { id: req.user.user._id, role: req.user.user.role },
        process.env.JWT_SECRET
      );
      return res.redirect(`http://localhost:3000/oauth-success?token=${token}`);
    }

    // New Google user → redirect to register details page
    const googleData = encodeURIComponent(JSON.stringify(req.user.googleProfile));
    res.redirect(`http://localhost:3000/register?google=true&data=${googleData}`);
  }
);


module.exports = router;