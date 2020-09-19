const express = require('express');
const passport = require('passport');
const router = express.Router();

// @desc Auth with Google
// @route GET /auth/google
router.get('/google', passport.authenticate('google', { scope: ['profile'] }));

// @desc Google auth callback
// @route GET /auth/google/callback
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: '/'
}), (req, res) => {
    res.redirect('/dashboard');
});

// @desc Logout uset
// @route /auth/logout
router.get('/logout', (req, res) => {
    // In passport middleware, after login we have a logout method on the req object
    req.logout();
    res.redirect('/');
});


module.exports = router