//var express = require('express');
//var router = express.Router();
//mongo schema
/*var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;*/
function requirelogIn(req, res, next) {
    if (!req.user) {
        res.redirect('/login');
    } else {
        next();
    }
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/login');
}




module.exports = function(app, passport) {
    /* GET home page. */
    app.get('/', function(req, res, next) {
        if (req.user) {
            res.render('index', {
                title: 'Express',
                user: req.user.facebook

            });
        } else {
            res.render('index', {
                title: 'Express',
                user: {}
            });
        }

    });


    app.get('/dashboard', isLoggedIn, function(req, res, next) {

        res.render('dashboard');

    });


    app.get('/login', function(req, res, next) {
        if (req.session && req.session.user) {
            User_c.findOne({
                email: req.session.user.email
            }, function(err, user) {
                if (!user) {
                    req.session.reset();
                    res.render('login');
                } else {
                    res.locals.user = user;
                    res.redirect('/dashboard');
                }
            })
        } else {
            res.render('login');
        }
    });



    app.get('/logout', function(req, res, next) {
        req.session.reset();
        res.redirect('/');
    });


    app.post('/login', function(req, res, next) {
        User_c.findOne({
            email: req.body.email
        }, function(err, user) {
            if (!user) {
                res.render('login.jade', {
                    error: 'Invalid emial of password'
                });
            } else {
                if (req.body.password == user.password) {
                    req.session.user = user;
                    res.render('dashboard');
                } else {

                    res.render('login', {
                        error: 'Invalid  password'
                    });
                }
            }
        })
    });

    app.get('/partials/:partialPath', function(req, res) {

        res.render('partials/' + req.params.partialPath);
        console.log('Inside template block' + req.params.partialPath);

    });


    //facebook
    app.get('/auth/facebook', passport.authenticate('facebook'));
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/',
            failureRedirect: '/login'
        }));
}