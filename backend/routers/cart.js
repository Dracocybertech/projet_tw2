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
    console.log('Connected to the database projet.sqlite !');
});

router.get('/initialisationHerosObtenus', function (req, res) {
    db.serialize(() => {
        db.all("SELECT * FROM herosObtenus;", (err, rows) => {
                if (rows) {
                    res.status(200).json(rows).end();
                }

        })
    });
});
router.post('/argentSuffisant', function (req, res) {
    console.log("router argentSuffisant");

    let data = req.body;
    console.log(data);
    console.log(data['argent']);
    let argent = parseInt(data['argent']);
    let test = 200;
    if (prixInvocation > argent){
        res.status(200).json(false).end();
    }
    else {
        res.status(200).json(true).end();
    }
});

router.get('/rareteRandom', function (req, res) {
    console.log("router rareteRandom");
    let rarete = Math.random()*100;
    //console.log(rarete);
    db.serialize(() => {
        db.all("SELECT * FROM niveauChance;", (err, rows) => {
                if (rows) {
                    let poids = 0;
                        for(row in rows){
                            poids += rows[row].poids;
                            if (poids >= rarete) {
                                res.status(200).json(rows[row].rarete).end();
                                break;
                            }
                        }
                }

        })
    });
});


router.post('/triParRarete', function (req, res) {//Obtention d'un tableau json qui ne contient que les héros de la rareté demandée
    console.log("router triParRarete");

    let data = req.body;
    console.log(data);
    console.log(data['rarete']);
    let tabHeros = [];
    db.serialize(() => {
        console.log("serialize");
        const statement = db.prepare("SELECT * FROM guidePerso WHERE rarete = ?;");
        statement.all(data['rarete'], (err, result) => {
            if(err){
                res.status(400)
            } else {
                tabHeros = result;
                console.log("tabHeros.length : "+tabHeros.length);
                const rndInt = Math.floor(Math.random() * tabHeros.length);
                console.log("rdnInt : ",+rndInt)
                res.status(200).json(tabHeros[rndInt]);
            }
        });
        statement.finalize();

            });
});

router.post('/invocationHero', function (req, res) {//Obtention d'un tableau json qui ne contient que les héros de la rareté demandée
    console.log("router invocationHero");

    let heros = req.body;
    console.log(heros);
    console.log(heros['rarete']);
    db.serialize(() => {
        console.log("serialize");
        const statement = db.prepare("SELECT * FROM guidePerso WHERE rarete = ?;");
        statement.all(data['rarete'], (err, result) => {
            if(err){
                res.status(400)
            } else {
                console.log(result);
                tabHeros = result;
                res.status(200).json(tabHeros);
            }
        });
        statement.finalize();

            });
});


router.use('/', function (req, res) {
    //console.log("router.use");
    db.serialize(() => {
        console.log("serialize");
        db.all("SELECT * FROM joueurS;", (err, rows) => {
                console.log("db.all");
                if (rows) {
                    console.log(rows);
                        for(row in rows){
                            console.log(row);
                            }
                        }

                })
            });
        console.log("Nombre aléatoires");
        //console.log(Math.random()*100);
        res.render('cart.ejs');
        });



// handling errors
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})


//						res.render('cart.ejs', {logged: false, session: req.session, error: true});


module.exports = router;
