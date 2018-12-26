var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({dest: './uploads'});
var passport = require('passport');
var LocalStrategy =  require('passport-local').Strategy;

// Require our mongoose model.
var User = require('../models/user');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' }); // From views directory jade will render register.jade and substitute
  // values of any variables in the resulting html.
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

// Request to handle the post to the form.
router.post('/register', upload.single('profileimage'), function(req, res, next) { // upload.single('profileimage') is for uploading the image via 'profileimage' field.
  // We can access the posted form data from req object.
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  if(req.file){
  	console.log('Uploading File...');
    var profileimage = req.file.filename; // multer will name the uploaded file with a hash string. We are persisting this string to db
    // so that we can link the user with the file.
  } else {
  	console.log('No File Uploaded...');
  	var profileimage = 'noimage.jpg';
  }

  // Form Validator - we have included the express validator middleware so we could use checkBody function on the req obj.
  req.checkBody('name','Name field is required').notEmpty();
  req.checkBody('email','Email field is required').notEmpty();
  req.checkBody('email','Email is not valid').isEmail();
  req.checkBody('username','Username field is required').notEmpty();
  req.checkBody('password','Password field is required').notEmpty();
  req.checkBody('password2','Passwords do not match').equals(req.body.password);

  // Check Errors - we have included the express validator middleware so we could use validationErrors function on the req obj.
  var errors = req.validationErrors();

  if(errors){
  	res.render('register', {
  		errors: errors
  	});
  } else{
  	var newUser = new User({
      name: name,
      email: email,
      username: username,
      password: password,
      profileimage: profileimage
    });

    User.createUser(newUser, function(err, user){
      if(err) throw err;
      console.log(user);
    });

    // Display flash message.
    req.flash('success', 'You are now registered and can login'); // First param is the class for the element and second is the content for the element.
    // Also note that line num 32 is required in layout.jade file to display messages in html.

    res.location('/');
    res.redirect('/');
  }
});

// Route to autheticate. Refer http://www.passportjs.org/docs/downloads/html/ for usage.
router.post('/login',
  passport.authenticate('local',{failureRedirect:'/users/login', failureFlash: 'Invalid username or password'}),
  function(req, res) {
   req.flash('success', 'You are now logged in');
   res.redirect('/'); // Redirect to home page.
});

// In a typical web application, the credentials used to authenticate a user will only be transmitted during the login request. If authentication succeeds, a session will be established and maintained via a cookie set in the user's browser.
// Each subsequent request will not contain credentials, but rather the unique cookie that identifies the session. In order to support login sessions, Passport will serialize and deserialize user instances to and from the session.
// In this example, only the user ID is serialized to the session, keeping the amount of data stored within the session small. When subsequent requests are received, this ID is used to find the user, which will be restored to req.user.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

// For passport authentication we will be using local strategy. So we need to configure a local strategy.
passport.use(new LocalStrategy(function(username, password, done){
  // We get the user obj based on the username passed in.
  User.getUserByUsername(username, function(err, user){
    if(err) throw err;
    // If no user is found for the entered username call done method with a message.
    if(!user){
      return done(null, false, {message: 'Unknown User'});
    }

    // Compare the entered password with the password of user obj fetched from db.
    User.comparePassword(password, user.password, function(err, isMatch){
      if(err) return done(err);
      if(isMatch){
        return done(null, user);
      } else {
        return done(null, false, {message:'Invalid Password'});
      }
    });
  });
}));

router.get('/logout', function(req, res){
  req.logout(); // Call the logout function of req obj to logout.
  req.flash('success', 'You are now logged out');
  res.redirect('/users/login');
});
module.exports = router;
