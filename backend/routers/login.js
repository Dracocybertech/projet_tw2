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


// check credentials in database + initialize session
router.post('/signup', function (req, res, next) {

	let newUser = true;

	let data = req.body;
	console.log(data);
	
	//Check que les données sont exploitables pour la BD
	if(data['email']!=null && data['email']!="" && data['mdp']!=null && data['mdp']!=""){
		
		//Début d'action sur la BD
		db.serialize(() => {

			//Vérif si ça existe déjà

			statement = db.prepare("SELECT email,mdp FROM joueurs WHERE email=?;");
			statement.get(data['email'], (err, result) => {
				if(err){
					next(err);
				} else {
					if(result){ //Ca existe alors on login
						req.session.loggedin=true;
						req.session.login=result['email'];
						req.session.id_joueur = "";
						console.log("78 Existe déjà donc on login");
						dejaAuth = false;
						console.log("80 Nouvel utilisateur ? ", newUser)
						next();
						console.log("82 Après le next");
					} else {// Nouveaux login et id donc on enchaîne

					}
				}
			});


			if (newUser){
					//Find last ID (Useless ?)

				console.log("93 Nouvel utilisateur ? ", newUser)

				let leId;

				statement = db.prepare("SELECT MAX(id_joueur) FROM joueurs");
				statement.get((err,result) => {
					if(err){
						next(err);
					} else {
						leId= result['MAX(id_joueur)'];
						console.log("MAX(id_joueur) : ",result['MAX(id_joueur)']);
						//console.log("Numéro d'ID max dans la boucle : ",leId); // OK
						next();
					}
					leId= result['MAX(id_joueur)'];

				});

				/*db.each("SELECT MAX(id_joueur) FROM joueurs",(err,row)=> {
					if (err){
						next(err);
					} else
					leId= row['MAX(id_joueur)'];
					//console.log("Numéro d'ID max dans la boucle : ",leId); // OK
				});*/

				console.log("119 Numéro d'ID max : ",leId);// Aucune valeur ?

				// Add last ID, email, password, new stats
				statement = db.prepare("INSERT INTO joueurs(id_joueur, email, mdp, golds, diamants, last_seen) VALUES (?,?,?,0,0,strftime('%s','now'));");
				statement.run(leId,data['email'],data['mdp']);
				console.log("124 nouvel utilisateur ajouté");
			}


			
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

/*router.use('/signup', function (req, res) {//Autologin
	console.log("router.use autologin");
	res.render('login.ejs', {logged: req.session.loggedin, login: req.session.login, error: false});
	});*/


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
