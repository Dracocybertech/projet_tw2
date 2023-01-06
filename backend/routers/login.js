const express = require('express');
const router = express.Router();
router.use(express.urlencoded({ extended: true }));

const sqlite3 = require('sqlite3').verbose();

//Fonction pour chiffrer et déchiffrer un mdp
function chiffre(msg, cle) {
	var res = "";
	for (var i = 0; i < msg.length; i++) {
		var c = msg[i].charCodeAt(0) + cle;
		if (c < 100) {
			res = res + "0" + String(c);
		}
		else
			res = res + String(c);
	}
	return res;
}

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
	if (data['email'] != null && data['email'] != "" && data['mdp'] != null && data['mdp'] != "") {
		db.serialize(() => {
			// check if the password is okay
			const statement = db.prepare("SELECT * FROM joueurs WHERE email=? AND mdp=?;");
			statement.get(data['email'], chiffre(data['mdp'], 5), (err, result) => {
				if (err) {
					next(err);
				} else {
					if (result) {
						req.session.ses = result;
						req.session.loggedin = true;
						req.session.login = result['email'];
						req.session.id_joueur = result['id_joueur'];
						console.log("bon email/mdp");
						let goldsec = 0;
						let diamsec = 0;
						const statement4 = db.prepare("SELECT G.*, niveau FROM herosObtenus O, guidePerso G WHERE O.id_joueur = ? AND G.id_hero = O.id_hero;");
						statement4.all(req.session.id_joueur, (err, result2) => {
							result2.forEach(element => {
								goldsec += element['niveau_' + element['niveau']];
								diamsec += Math.floor(element['niveau_3'] / 100);
							})
							console.log("Temps écoulé depuis la déco en s", Math.floor(Date.now() / 1000) - result['last_seen']);
							let secondes_passees = Math.floor(Date.now() / 1000) - result['last_seen'];

							statement5 = db.prepare("UPDATE joueurs SET diamants = diamants + ? , golds = golds + ?  WHERE id_joueur= ? ;");
							statement5.run(diamsec * secondes_passees, goldsec * secondes_passees, req.session.id_joueur);
							statement5.finalize();
						});
						statement4.finalize();

						//res.render('login.ejs', {logged: false, session: req.session, error: true});
						res.redirect('/cart');
						//next(); //res.render de cart.
					} else {
						res.render('login.ejs', { logged: false, login: req.session.login, error: true });
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
	//Check que les données sont exploitables pour la BD
	if (data['email'] != null && data['email'] != "" && data['mdp'] != null && data['mdp'] != "") {
		//Début d'action sur la BD
		db.serialize(() => {
			//Vérifie si ça existe déjà
			statement = db.prepare("SELECT id_joueur,email,mdp FROM joueurs WHERE email=?;");
			statement.get(data['email'], (err, result) => {
				if (err) {
					next(err);
				} else {
					if (result) { //Ca existe alors on login
						req.session.loggedin = true;
						req.session.login = result['email'];
						req.session.id_joueur = result['id_joueur'];
						dejaAuth = false;
						next(err);
					} else {// Nouveaux login et id donc on enchaîne
						let leId;

						statement2 = db.prepare("SELECT MAX(id_joueur) FROM joueurs");
						statement2.get((err, result) => {
							if (err) {
								next(err);
							} else {
								leId = result['MAX(id_joueur)'] + 1;
								statement3 = db.prepare("INSERT INTO joueurs(id_joueur, email, mdp, golds, diamants, last_seen) VALUES (?,?,?,0,0,strftime('%s','now'));");
								statement3.run(leId, data['email'], chiffre(data['mdp'], 5));
								statement3.finalize();
							}
						});
						statement2.finalize();
					}
				}

			});
			next();
			statement.finalize();
		});
	} else {
		res.status(400).send('Bad request!');
	}
});



router.use('/login', function (req, res) {
	res.render('login.ejs', { logged: req.session.loggedin, login: req.session.login, error: false });
});

router.use('/logout', function (req, res) {
	db.serialize(() => {
		statement = db.prepare("UPDATE joueurs SET last_seen = strftime('%s','now') WHERE id_joueur=? ;");
		statement.run(req.session.id_joueur);
	});
	req.session.destroy();
	res.redirect('/login');
});



// handling errors
router.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).send('Something broke!');
})


module.exports = router;
