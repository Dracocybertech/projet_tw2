const express = require('express');
const router = express.Router();

// home
router.use('/home', function (req, res) {
	res.redirect('/');
});


router.use('/', function (req, res) {
	console.log("router.use('/'");
	res.render('login.ejs', {logged: req.session.loggedin, login: req.session.login, error: false});
});

// 404
router.use('*', function(req, res){
    res.status(404);
	res.render('404.ejs', {logged: req.session.loggedin});
});

module.exports = router;
