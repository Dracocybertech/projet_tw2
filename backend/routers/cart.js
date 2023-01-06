const express = require('express');
const router = express.Router();

const sqlite3 = require('sqlite3').verbose();
const prixInvocation = Number.parseFloat(100).toExponential(2); //On a besoin de 100 golds pour invoquer un personnage
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
    let id_joueur;
    let tabHeros = [];
    db.serialize(() => {
        const statement = db.prepare("SELECT id_joueur FROM joueurs WHERE email = ?;");//On cherche l'id du joueur dont on  a l'email
        statement.all(req.session.login, (err, result) => {
            if(err){
                res.status(400)
            } else {

                id_joueur = result[0].id_joueur;
                const statement2 = db.prepare("SELECT id_hero, niveau FROM herosObtenus WHERE id_joueur = ?;");//On cherche les héros liés à l'id d'un joueur dans la table herosObtenus
                statement2.all(id_joueur, (err, result2) => {
//                 console.log("statement2");
                    if(err){
                        res.status(400)
                    } else {
                        if (result2.length == 0) {
                            res.status(200).json(result2);

                        }
                        else {
                            res.status(200).json(result2);
                        }
                    };
                });
                statement2.finalize();

            }

        });
        statement.finalize();
    });

});

router.get('/initialisationHeros1', function(req, res) {
    let heros1 = {};
    let id_hero = 1;
    const statement = db.prepare("SELECT rarete, niveau_1, niveau_2, niveau_3, niveau_4, niveau_5 FROM guidePerso WHERE id_hero = ?;");
    statement.all(id_hero, (err, result) => {
                    if(err){
                        res.status(400)
                    } else {
                        for (row in result) {
                        heros1.rarete = result[0].rarete;
                        heros1.niveau_1 = result[0].niveau_1;
                        heros1.niveau_2 = result[0].niveau_2;
                        heros1.niveau_3 = result[0].niveau_3;
                        heros1.niveau_4 = result[0].niveau_4;
                        heros1.niveau_5 = result[0].niveau_5;
                        heros1.niveau = 1;
                        heros1.id_hero = id_hero;
                        }
                        const statement2 = db.prepare("SELECT cout FROM coutEvolution WHERE niveau = ?;");
                        statement2.all(heros1.niveau, (err, result2) => {
                            if(err){
                                res.status(400)
                            } else {
                                heros1.cout = result2[0].cout;
                                res.status(200).json(heros1).end();
                            }
                        });
                        statement2.finalize();
                    };
                });
    statement.finalize();

});

router.post('/initialisationHerosObtenusguidePerso', function(req, res) {
    let data = req.body;
    let id_hero = data['id_hero'];
    let heros = {};
    const statement = db.prepare("SELECT rarete, niveau_1, niveau_2, niveau_3, niveau_4, niveau_5 FROM guidePerso WHERE id_hero = ?;");//Collecte des infos de la table guidePerso
    statement.all(id_hero, (err, result) => {
        if(err){
            res.status(400);
        } else {
            for (row in result) {
                heros.rarete = result[row].rarete;
                heros.niveau_1 = result[row].niveau_1;
                heros.niveau_2 = result[row].niveau_2;
                heros.niveau_3 = result[row].niveau_3;
                heros.niveau_4 = result[row].niveau_4;
                heros.niveau_5 = result[row].niveau_5;
            }
            res.status(200).json(heros);

        }
    });
    statement.finalize();
});

router.post('/initialisationHerosObtenuscoutEvolution', function(req, res) {
    let data = req.body;
    let niveau = data['niveau'];
    let cout = 0;
    const statement = db.prepare("SELECT cout FROM coutEvolution WHERE niveau = ?;");
    statement.all(niveau, (err, result) => {
        if(err){
            res.status(400);
        } else {
            cout = result[0].cout;
            res.status(200).json(cout).end();
        }
    });

    statement.finalize();

});

router.get('/initialisationGoldEtDiamant', function (req, res, next) {
    db.serialize(() => {
        const statement = db.prepare("SELECT golds,diamants FROM joueurs WHERE id_joueur = ?");
        statement.get(req.session.id_joueur, (err, result)=>{
            if(err){
                next(err);
            } else {
                if(result){
                    res.status(200).json(result).end();
                } else {
                    res.status(400).send('Bad request!');
                }
            }
        });
        statement.finalize();
    });
});

/*
router.get('/initialisationGoldEtDiamant', function (req, res) {
    db.serialize(() => {
        db.all("SELECT golds,diamants FROM joueurs;", (err, rows) => {
                if (rows) {
                    res.status(200).json(rows).end();
                }

        })
    });
});*/


router.post('/diamantSuffisant', function (req, res) {
    let data = req.body;
    let diamant = parseInt(data['diamant']);

    if (prixInvocation > diamant){
        res.status(200).json(false).end();
    }
    else {
        res.status(200).json(true).end();
    }
});

router.get('/rareteRandom', function (req, res) {
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
    let data = req.body;
    let tabHeros = [];
    db.serialize(() => {
        const statement = db.prepare("SELECT * FROM guidePerso WHERE rarete = ?;");
        statement.all(data['rarete'], (err, result) => {
            if(err){
                res.status(400);
            } else {
                tabHeros = result;
                const rndInt = Math.floor(Math.random() * tabHeros.length);
                let heros = tabHeros[rndInt];
                heros.niveau = 1;
                res.status(200).json(heros);
            }
        });
        statement.finalize();

            });
});

router.post('/ajoutInfosInvocationHeros', function(req,res) {
    let data = req.body;
    let niveau = data['niveau'];
    let cout = 0;
    if (niveau < 5) {
        const statement = db.prepare("SELECT cout FROM coutEvolution WHERE niveau = ?;");
        statement.all(niveau, (err, result) => {
            if(err){
                res.status(400);
            } else {
                cout = result[0].cout;
                res.status(200).json(cout).end();
            }
        });

        statement.finalize();
    }
    else {
        res.status(200).json(0).end();
    }

});

router.post('/argentSuffisant', function (req, res) {
    let data = req.body;
    let argent = parseInt(data['argent'],10);
    if (prixInvocation > argent){
        res.status(200).json(false).end();
    }
    else {
        res.status(200).json(true).end();
    }
});

router.post('/invocationHero', function (req, res) {//Obtention d'un tableau json qui ne contient que les héros de la rareté demandée
    let heros = req.body;
    db.serialize(() => {
        const statement = db.prepare("SELECT * FROM guidePerso WHERE rarete = ?;");
        statement.all(data['rarete'], (err, result) => {
            if(err){
                res.status(400)
            } else {
                tabHeros = result;
                res.status(200).json(tabHeros);
            }
        });
        statement.finalize();
    });
});

router.post('/remboursement', function (req, res) {//Obtention d'un tableau json qui ne contient que les héros de la rareté demandée
    let heros = req.body;
    let rarete = heros['rarete'];
    if (rarete == "commun") {
        res.status(200).json(remboursementCommun);
    }
    else {
        if (rarete == "rare") {
            res.status(200).json(remboursementRare);
        }
        else {
            res.status(200).json(remboursementSsr);
        }
    }
});


router.post('/enregistrementGoldDiamant', function (req, res) {
    console.log("route enregistrementGoldDiamant");
    console.log(req.session.login);
    let data = req.body;
    console.log("data : ");
    console.log(data);
    let gold = data.gold;
    console.log("gold : "+gold);
    let diamant = data.diamant;
    console.log("diamant : "+diamant);
    db.serialize(() => {
        const statement = db.prepare("UPDATE joueurs SET golds = ?, diamants = ? WHERE email= ?");
        statement.run(gold, diamant, req.session.login, (err, result) => {
            if(err){
                res.status(400)
            } else {
                console.log("PWEEET UPDATE joueurs SET golds = ?, diamants = ? WHERE email= ?");
                res.status(200).json(true).end();
            }

        });
        statement.finalize();
    });

});

router.get('/deleteHeros', function (req, res) {
    console.log("route deleteHeros");
    console.log(req.session.id_joueur);
    id_joueur = req.session.id_joueur;
    db.serialize(() => {
        const statement = db.prepare("DELETE FROM herosObtenus WHERE id_joueur= ?");
        statement.run(id_joueur, (err, result) => {
            if(err){
                res.status(400)
            } else {
                console.log("DELETE FROM herosObtenus WHERE id_joueur= ?");
                res.status(200).json(true).end();
            }

        });
        statement.finalize();
    });
});

router.post('/enregistrementHeros', function (req, res) {
    console.log("route enregistrementHeros");
    console.log(req.session.id_joueur);
    id_joueur = req.session.id_joueur;
    let heros = req.body;
    console.log("heros : ");
    console.log(heros);
    let id_hero = heros.id_hero;
    console.log("id_hero : "+id_hero);
    let niveau = heros.niveau;
    console.log("niveau : "+niveau);

    db.serialize(() => {
        const statement = db.prepare("INSERT INTO herosObtenus (id_joueur, id_hero, niveau) VALUES (?,?,?)") ;
        statement.run(id_joueur, id_hero, niveau, (err, result) => {
            if(err){
                res.status(400)
            } else {
                console.log("INSERT INTO herosObtenus (id_joueur, id_hero, niveau) VALUES (?,?,?)");
                res.status(200).json(true).end();
            }

        });
        statement.finalize();
    });



});

router.get('/vueTableSQL', function (req, res) {

        db.all("SELECT * FROM joueurs;", (err, rows) => {
            console.log("rows : ");
            console.log(rows);
                if (rows) {
                    console.log(rows);
                }

        })

    res.status(200).json(true).end();

});

router.get('/vueTableSQLHerosObtenus', function (req, res) {

        db.all("SELECT * FROM joueurs;", (err, rows) => {
            console.log("rows : ");
            console.log(rows);
                if (rows) {
                    console.log(rows);
                }
        })
    res.status(200).json(true).end();

});



router.use('/', function (req, res) {
    db.serialize(() => {
        db.all("SELECT * FROM joueurs;", (err, rows) => {
        })
    });
    res.render('cart.ejs');
});



// handling errors
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
})


//						res.render('cart.ejs', {logged: false, session: req.session, error: true});


module.exports = router;
