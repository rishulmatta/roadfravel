var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;
var configAuth = require('./../config/auth')
var User       = require('./../models/user');


module.exports = function(passport) {
passport.use(new FacebookStrategy({
	    clientID: configAuth.facebookAuth.clientID,
	    clientSecret: configAuth.facebookAuth.clientSecret,
	    callbackURL: configAuth.facebookAuth.callbackURL,
	    passReqToCallback: true,
	    profileFields: ['id', 'email', 'gender', 'link', 'locale', 'displayName', 'timezone', 'photos'],
  
	  },
	  function(req, accessToken, refreshToken, profile, done) {
	    	process.nextTick(function(){
	    		//user is not logged in yet
	    		if(!req.user){
					User.findOne({'facebook.id': profile.id}, function(err, user){
		    			if(err)
		    				return done(err);
		    			if(user){
		    				if(!user.facebook.token){
		    					user.facebook.token = accessToken;
		    					user.facebook.name = profile.displayName;
		    					user.facebook.email = profile.emails[0].value;
		    					user.facebook.id = profile.id;
		    					user.facebook.gender = profile.gender;
		    					user.facebook.profileUrl = profile.profileUrl;
		    					user.facebook.profilePicUrl = profile.photos[0].value;
		    					user.save(function(err){
		    						if(err)
		    							throw err;
		    					});

		    				}
		    				return done(null, user);
		    			}
		    			else {
		    				var newUser = new User();
	    						newUser.facebook.token = accessToken;
		    					newUser.facebook.name = profile.displayName;
		    					newUser.facebook.email = profile.emails[0].value;
		    					newUser.facebook.id = profile.id;
		    					newUser.facebook.gender = profile.gender;
		    					newUser.facebook.profileUrl = profile.profileUrl;
		    					newUser.facebook.profilePicUrl = profile.photos[0].value;

		    				newUser.save(function(err){
		    					if(err)
		    						throw err;
		    					return done(null, newUser);
		    				})
		    			}
		    		});
	    		}

	    		//user is logged in already, and needs to be merged
	    		else {
	    			var user = req.user;
					user.facebook.token = accessToken;
					user.facebook.name = profile.displayName;
					user.facebook.email = profile.emails[0].value;
					user.facebook.id = profile.id;
					user.facebook.gender = profile.gender;
					user.facebook.profileUrl = profile.profileUrl;
					user.facebook.profilePicUrl = profile.photos[0].value;

					user.update(
					   {"facebook.id":profile.id},
					    user,
					  
					   function(err){
	    				if(err)
	    					throw err
	    				return done(null, user);
	    			}
					);

	    		
	    		}
	    		
	    	});
	    }

	));

    passport.serializeUser(function(user, done) {
    	console.log("inside serialize" +user);
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {

    	User.findById(id, function(err, user){
    		console.log("inside deserializeUser" +user);
			done(err, user);
		});
       
    });

}