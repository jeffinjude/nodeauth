var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', ensureAuthenticated, function(req, res, next) { // Call ensureAuthenticated function to check whether user is authenticated.
  res.render('index', { title: 'Members' }); // index.jade will be rendered and in that template file if the variable
  // title is used then it's value will be substituted with 'Members'.
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){ // If authenticated we proceed else we redirect to login page.
		return next();
	}
	res.redirect('/users/login');
}

module.exports = router; // This is important, if not present we can't use it in app js or any external file
