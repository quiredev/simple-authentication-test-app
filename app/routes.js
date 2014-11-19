var User = require('./models/user');

function validateEmail (email) {
    var atpos = email.indexOf("@");
    if (atpos< 2 || atpos+2>=email.length) {
        return false;
    }
    return true;
}
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/signin')
}

module.exports = function (app, passport) {
    app.get('/:var(home|index)?', function (req, res) {
        res.render('index', { title: 'Home', isHome: true, user: req.user });
    });
    app.get('/about', function (req, res) {
        res.render('about', { title: 'About', isAbout: true, user: req.user });
    });
    app.get('/signup', function (req, res) {
        res.render('signup', { title: 'Sign Up', isSignUp: true, user: req.user });
    });
    app.post('/signup', function (req, res, next) {
        req.flash('username', req.body.username);
        req.flash('email', req.body.email);
        var errors = false;
        if (req.body.username === '') {
            errors = true; req.flash('error', '<br>Username field is required');
        }
        if (req.body.email === '') {
            errors = true; req.flash('error', '<br>Email field is required');
        } else {
            if (!validateEmail(req.body.email)) {
                errors = true; req.flash('error', '<br>Entered email address not a valid');
            }
        }
        if (req.body.password === '') {
            errors = true; req.flash('error', '<br>Password field is required');
        }
        if (req.body.password !== req.body.repassword) {
            errors = true; req.flash('error', '<br>Entered passwords do not match');
        }
        if (!errors) {
            var user = new User({ username: req.body.username, email: req.body.email, password: req.body.password });
            user.save(function (err) {
                if (err) {
                    req.flash('errors', 'Errors:');
                    if (err.toString().indexOf('duplicate key')) req.flash('error', '<br>Account with entered email address already exist');
                    res.redirect('/signup');
                } else {
                    passport.authenticate('local', { successRedirect: '/profile' })(req, res, next);
                }
            });
        } else {
            req.flash('errors', 'Errors:');
            res.redirect('/signup');
        }
    });
    app.get('/signin', function (req, res) {
        res.render('signin', { title: 'Sign In', isSignIn: true, user: req.user });
    });
    app.post('/signin', function (req, res, next) {
        req.flash('email', req.body.email);
        var errors = false;
        if (req.body.email === '') {
            errors = true; req.flash('error', '<br>Email field is required');
        }
        if (req.body.password === '') {
            errors = true; req.flash('error', '<br>Password field is required');
        }
        if (!errors) {
            passport.authenticate('local', function (err, user) {
                req.logIn(user, function (err) {
                    if (err) {
                        req.flash('errors', 'Authentication Error:');
                        req.flash('error', '<br>Invalid email or password');
                        res.redirect('/signin');
                    }
                    else {
                        res.redirect('/profile');
                    }
                });
            })(req, res, next);
        } else {
            req.flash('errors', 'Errors:');
            res.redirect('/signin');
        }
    });
    app.get('/profile', ensureAuthenticated, function (req, res) {
        res.render('profile', { title: 'Profile', isProfile: true, user: req.user });
    });
    app.get('/signout', function(req, res){
        req.logout();
        res.redirect('/');
    });
};