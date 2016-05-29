var express = require('express');
var app = express();
var morgan = require('morgan');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var routes = require('./routes/index');
var passport = require('passport');
//var users = require('./routes/users');
var session = require('express-session');
 
// view engine setup  https://www.airpair.com/express/posts/expressjs-and-passportjs-sessions-deep-dive
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.locals.pretty = true;

app.use(express.static(path.join(__dirname, 'public')));



var mongoose = require('mongoose');
//mongoose.connect('mongodb://localhost/roadfravel');

mongoose.connect('mongodb://roadfravel:roadfravel123!@ds019033.mlab.com:19033/heroku_hc77r703');

var MongoStore = require('connect-mongo')(session);
var elasticsearch = require('elasticsearch');
var elasticSearchClient = new elasticsearch.Client({
  host: 'localhost:9200'
});


require('./config/passport')(passport);
app.use(morgan('dev'));

//app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
//sessions
app.use(session({
  resave:true,
  saveUninitialized:true,
  secret:"wug34t8adp9y0wuetk#$%",
  cookie:{
      maxAge : 2 * 24 * 60 * 60 * 1000
    },
  store: new MongoStore({mongooseConnection:mongoose.connection})
}));


 app.use(passport.initialize());

 app.use(passport.session());

/*app.use(function(req, res, next) {



  next();
});*/


// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());



//app.use(isLoggedIn);




require('./routes/index')(app,passport);
//app.use('/', routes);
//app.use('/users', users);

require('./routes/offerandfetch')(app,elasticSearchClient);





// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});









// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




module.exports = app;
