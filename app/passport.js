var passportLocal = require('passport-local');
var User = require('./models/user');

module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        done(null, user.email);
    });
    passport.deserializeUser(function (email, done) {
        User.findOne({ email: email }, function (err, user) {
            done(err, user);
        });
    });
    passport.use(new passportLocal.Strategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function (email, password, done) {
            User.findOne({ email: email.trim().toLowerCase() }, function (err, user) {
                if (err) {
                    return done(err);
                }
                if (!user) {
                    return done(null, false);
                }
                if (user.encryptPassword(password) === user.password) {
                    return done(null, user);
                } else {
                    return done(null, false);
                }
            });
        })
    );
};