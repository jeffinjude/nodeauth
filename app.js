/*********************** REFER https://www.youtube.com/watch?v=hb26tQPmPl4 *****************************/
// After installing express and express-genrator npm dependencies give the command 'express' in the desired directory to generate
// a boiler plate node app.
// This would be our main js file of our app. The bootstraping file is /bin/www
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var passport = require('passport'); // Passport is an npm module for authentication.
var LocalStrategy =  require('passport-local').Strategy; // There are various authentcation strategies like facebook authentication etc.
// Here we would be using local db for username and password.
var multer = require('multer'); // npm module for uploading files.
var upload = multer({dest:'./uploads'});
var flash = require('connect-flash'); // npm module for displaying messages.
var mongo = require('mongodb');
var mongoose = require('mongoose'); // ORM for mongodb.
var db = mongoose.connection;
var expressValidator = require('express-validator');
var bcrypt = require('bcryptjs');

// We specify our routes in these files.
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express(); // This is an express js app (Web framework for node). Here we instantiate express.

// view engine setup. We use jade as view engine.
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Specify the middlewares. We use app.use function to specify the middle ware function. Middlewares are functions
// that have access to req and res objects and the manipulate them and calls the next middleware function.
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public'))); // We set the folder where static files (css, img files etc) of the application is present.
// Handle sessions
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));
// Specify the middlewares for passport
app.use(passport.initialize());
app.use(passport.session());
// Middleware for Validator. Should be specified after any bodyparser middlewares. Refer https://devhub.io/repos/ctavan-express-validator for usage.
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));
// Middleware for messages. Refer https://github.com/visionmedia/express-messages for usage.
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// For any get request the following callback will run.
app.get('*', function(req, res, next){
  res.locals.user = req.user || null; // We set a global variable using 'res.locals.<var_name>'.  'user' global var will hold the
  // currently logged in user obj.
  next();
});

// Specify the routers
app.use('/', indexRouter); // Any url with localhost will use this router.
app.use('/users', usersRouter); // Any url with localhost/users will use this router.

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
