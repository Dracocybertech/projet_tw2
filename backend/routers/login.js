const express = require('express');
const router = express.Router();
router.use(express.urlencoded({ extended: true }));

const sqlite3 = require('sqlite3').verbose();



// connecting an existing database (handling errors)
const db = new sqlite3.Database('../db/projet.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database projet.sqlite login!');
});


// check credentials in database + initialize session
router.post('/login', function (req, res, next) {

	let data = req.body;
	console.log(data);
	if(data['email']!=null && data['email']!="" && data['mdp']!=null && data['mdp']!=""){
		
		db.serialize(() => {
			// check if the password is okay
			const statement = db.prepare("SELECT email,mdp FROM joueurs WHERE email=?;");
			statement.get(data['email'], (err, result) => {
				if(err){
					next(err);
				} else {
					if(result){
						req.session.loggedin=true;
						req.session.login=result['email'];
						req.session.id_joueur = "";
						console.log("bon email/mdp");
						next();
					} else {
						res.render('login.ejs', {logged: false, login: req.session.login, error: true});
					}
				}
			});
			statement.finalize();

		});

	} else {
		res.status(400).send('Bad request!');
	}
});



router.use('/login', function (req, res) {
    console.log("router.use login");
	res.render('login.ejs', {logged: req.session.loggedin, login: req.session.login, error: false});
    });

router.use('/logout', function (req, res) {
    console.log("router.use('/logout'");
	req.session.destroy();
	res.redirect('/login');
});


// handling errors
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})


module.exports = router;
