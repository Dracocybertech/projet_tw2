const express = require('express');
const router = express.Router();

const sqlite3 = require('sqlite3').verbose();
const prixInvocation = 100; //On a besoin de 100 golds pour invoquer un personnage
const remboursementCommun = 10;
const remboursementRare = 30;
const remboursementSsr = 50;


// connecting an existing database (handling errors)
const db = new sqlite3.Database('../db/projet.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database projet.sqlite guide!');
});

router.get('/initialisationHerosDB', function (req, res) {

        console.log("serialize");
        db.all("SELECT *", (err, rows) => {
                console.log("db.all");
                console.log(rows);
                res.status(200).json(rows);
                });

});

router.use('/', function (req, res) {
    db.serialize(() => {
        console.log("serialize");
        db.all("SELECT * FROM joueurs", (err, rows) => {
                console.log("db.all");


                })
            });
    res.render('guide.ejs');
});



// handling errors
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})


//						res.render('guide.ejs', {logged: false, session: req.session, error: true});


module.exports = router;
