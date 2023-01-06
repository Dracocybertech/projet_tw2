const express = require('express');
const router = express.Router();

const sqlite3 = require('sqlite3').verbose();
const prixInvocation = Number.parseFloat(100).toExponential(2); //On a besoin de 100 golds pour invoquer un personnage
const remboursementCommun = 10;
const remboursementRare = 30;
const remboursementSsr = 50;


// connecting an existing database (handling errors)
const db = new sqlite3.Database('./db/projet.sqlite', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database projet.sqlite !');
});

router.get('/initialisationHerosObtenus', function (req, res) {//Initialisation des héros du joueur
    let id_joueur;
    let tabHeros = [];
    db.serialize(() => {
        const statement = db.prepare("SELECT id_joueur FROM joueurs WHERE email = ?;");//On cherche l'id du joueur dont on  a l'email
        statement.all(req.session.login, (err, result) => {//On envoie le login de la session
            if (err) {
                res.status(400)
            } else {

                id_joueur = result[0].id_joueur;//On récupère l'id du joueur
                const statement2 = db.prepare("SELECT id_hero, niveau FROM herosObtenus WHERE id_joueur = ?;");//On cherche les héros liés à l'id d'un joueur dans la table herosObtenus
                statement2.all(id_joueur, (err, result2) => {
                    if (err) {
                        res.status(400)
                    } else {
                        if (result2.length == 0) {//Si le tableau est vide
                            res.status(200).json(result2);

                        }
                        else {//S'il y a des héros déj) enregistrés
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

router.get('/initialisationHeros1', function (req, res) {//Initialisation du héros s'il y a un nouveau compte
    let heros1 = {};
    let id_hero = 1;
    const statement = db.prepare("SELECT rarete, niveau_1, niveau_2, niveau_3, niveau_4, niveau_5 FROM guidePerso WHERE id_hero = ?;");//on récupère les informations pour le héros de id_hero
    statement.all(id_hero, (err, result) => {//On envoie id_hero
        if (err) {
            res.status(400)
        } else {
            for (row in result) {
                heros1.rarete = result[0].rarete;//Ajout de la rareté
                heros1.niveau_1 = result[0].niveau_1;//Ajout de niveau_1
                heros1.niveau_2 = result[0].niveau_2;//Ajout de niveau_2
                heros1.niveau_3 = result[0].niveau_3;//Ajout de niveau_3
                heros1.niveau_4 = result[0].niveau_4;//Ajout de niveau_4
                heros1.niveau_5 = result[0].niveau_5;//Ajout de niveau_5
                heros1.niveau = 1;//Ajout du niveau
                heros1.id_hero = id_hero;//Ajout de l'id_hero
            }
            const statement2 = db.prepare("SELECT cout FROM coutEvolution WHERE niveau = ?;");//On cherche le coût pour le niveau ?
            statement2.all(heros1.niveau, (err, result2) => {//Envoie du niveau de héros1
                if (err) {
                    res.status(400)
                } else {
                    heros1.cout = result2[0].cout;//On récupère le coût
                    res.status(200).json(heros1).end();//On envoie le héros
                }
            });
            statement2.finalize();
        };
    });
    statement.finalize();

});

router.post('/initialisationHerosObtenusguidePerso', function (req, res) {//Ajout d'informations pour l'initialisation
    let data = req.body;
    let id_hero = data['id_hero'];//On récupère l'id_hero
    let heros = {};
    const statement = db.prepare("SELECT rarete, niveau_1, niveau_2, niveau_3, niveau_4, niveau_5 FROM guidePerso WHERE id_hero = ?;");//Collecte des infos de la table guidePerso
    statement.all(id_hero, (err, result) => {//On envoie id_hero
        if (err) {
            res.status(400);
        } else {
            for (row in result) {
                heros.rarete = result[row].rarete;//Ajout de la rareté
                heros.niveau_1 = result[row].niveau_1;//Ajout de niveau_1
                heros.niveau_2 = result[row].niveau_2;//Ajout de niveau_2
                heros.niveau_3 = result[row].niveau_3;//Ajout de niveau_3
                heros.niveau_4 = result[row].niveau_4;//Ajout de niveau_4
                heros.niveau_5 = result[row].niveau_5;//Ajout de niveau_5
            }
            res.status(200).json(heros);//On envoie le héros

        }
    });
    statement.finalize();
});

router.post('/initialisationHerosObtenuscoutEvolution', function (req, res) {//Ajout d'informations pour l'initialisation
    let data = req.body;
    let niveau = data['niveau'];//On récupère le niveau
    let cout = 0;
    if (niveau < 5) {//Si le niveau est inférieur au niveau maximal
        const statement = db.prepare("SELECT cout FROM coutEvolution WHERE niveau = ?;");//On cherche le coût pour le niveau ?
        statement.all(niveau, (err, result) => {//On envoie le niveau
            if (err) {
                res.status(400);
            } else {
                cout = result[0].cout;//On récupère le coût
                res.status(200).json(cout).end();//On envoie le coût
            }
        });

        statement.finalize();
    }
    else {
        res.status(200).json(cout).end();//On envoie 0 pour le coût
    }
});

router.get('/initialisationGoldEtDiamant', function (req, res, next) {
    db.serialize(() => {
        const statement = db.prepare("SELECT golds,diamants FROM joueurs WHERE id_joueur = ?");
        statement.get(req.session.id_joueur, (err, result) => {
            if (err) {
                next(err);
            } else {
                if (result) {
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


router.post('/diamantSuffisant', function (req, res) {//Retourne vrai si on a assez de diamants
    let data = req.body;
    let diamant = parseInt(data['diamant']);//On récupère la valeur des diamants

    if (prixInvocation > diamant) {
        res.status(200).json(false).end();
    }
    else {
        res.status(200).json(true).end();
    }
});

router.get('/rareteRandom', function (req, res) {//Retourne une rareté aléatoire de la table niveauChance
    let rarete = Math.random() * 100;
    db.serialize(() => {
        db.all("SELECT * FROM niveauChance;", (err, rows) => {//On récupère les informations de la table niveauChance
            if (rows) {
                let poids = 0;
                for (row in rows) {//Pour chaque rareté
                    poids += rows[row].poids;//On incrémente poids pour augmenter les chance d'obtenir une rareté plus basse
                    if (poids >= rarete) {
                        res.status(200).json(rows[row].rarete).end();//Envoie de la rareté
                        break;
                    }
                }
            }

        })
    });
});


router.post('/triParRarete', function (req, res) {//Obtention d'un héros à la rareté demandée
    let data = req.body;
    let tabHeros = [];
    db.serialize(() => {
        const statement = db.prepare("SELECT * FROM guidePerso WHERE rarete = ?;");//On veut les informations de guidePerso pour la rareté ?
        statement.all(data['rarete'], (err, result) => {//Envoie de la rareté
            if (err) {
                res.status(400);
            } else {
                tabHeros = result;
                const rndInt = Math.floor(Math.random() * tabHeros.length);
                let heros = tabHeros[rndInt];//Choix d'un héros au hasard
                heros.niveau = 1;//Ajout du niveau
                res.status(200).json(heros);//Envoie du héros
            }
        });
        statement.finalize();

    });
});

router.post('/ajoutInfosInvocationHeros', function (req, res) {//Ajout d'informations
    let data = req.body;
    let niveau = data['niveau'];
    let cout = 0;
    if (niveau < 5) {
        const statement = db.prepare("SELECT cout FROM coutEvolution WHERE niveau = ?;");
        statement.all(niveau, (err, result) => {
            if (err) {
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

router.post('/argentSuffisant', function (req, res) {//Retourne vrai si on a assez d'argent pour une invocation
    let data = req.body;
    let argent = parseInt(data['argent'], 10);
    if (prixInvocation > argent) {
        res.status(200).json(false).end();
    }
    else {
        res.status(200).json(true).end();
    }
});

router.post('/invocationHero', function (req, res) {//Invocation d'un héros (deprecated)
    let heros = req.body;
    db.serialize(() => {
        const statement = db.prepare("SELECT * FROM guidePerso WHERE rarete = ?;");
        statement.all(data['rarete'], (err, result) => {
            if (err) {
                res.status(400)
            } else {
                tabHeros = result;
                res.status(200).json(tabHeros);
            }
        });
        statement.finalize();
    });
});

router.post('/remboursement', function (req, res) {//Retourne la valeur de diamant à rembourser si le héros est déjà obtenu
    let heros = req.body;
    let rarete = heros['rarete'];//obtention de la rareté
    if (rarete == "commun") {//En fonction de la rareté, la valeur change
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
    let data = req.body;
    let gold = data.gold;
    let diamant = data.diamant;
    db.serialize(() => {
        const statement = db.prepare("UPDATE joueurs SET golds = ?, diamants = ? WHERE email= ?");
        statement.run(gold, diamant, req.session.login, (err, result) => {
            if (err) {
                res.status(400)
            } else {
                res.status(200).json(true).end();
            }

        });
        statement.finalize();
    });

});

router.get('/deleteHeros', function (req, res) {//Supprime les héros de la table herosObtenus pour l'id du joueur
    id_joueur = req.session.id_joueur;//Obtention de l'id du joueur
    db.serialize(() => {
        const statement = db.prepare("DELETE FROM herosObtenus WHERE id_joueur= ?");//Supprime les héros de la table herosObtenus pour l'id du joueur
        statement.run(id_joueur, (err, result) => {//Envoie de l'id_joueur
            if (err) {
                res.status(400)
            } else {
                res.status(200).json(true).end();
            }

        });
        statement.finalize();
    });
});

router.post('/enregistrementHeros', function (req, res) {//Enregistre les héros du joueur dans la table herosObtenus
    id_joueur = req.session.id_joueur;//Obtention de l'id_joueur
    let heros = req.body;
    let id_hero = heros.id_hero;
    let niveau = heros.niveau;
    db.serialize(() => {
        const statement = db.prepare("INSERT INTO herosObtenus (id_joueur, id_hero, niveau) VALUES (?,?,?)"); //Enregistre les héros du joueur dans la table herosObtenus
        statement.run(id_joueur, id_hero, niveau, (err, result) => {
            if (err) {
                res.status(400)
            } else {
                res.status(200).json(true).end();
            }

        });
        statement.finalize();
    });



});

router.get('/vueTableSQL', function (req, res) {//Permet de voir la table joueurs

    db.all("SELECT * FROM joueurs;", (err, rows) => {
        if (rows) {
            console.log(rows);
        }
    })

    res.status(200).json(true).end();

});

router.get('/vueTableSQLHerosObtenus', function (req, res) {//Permet de voir la table joueurs

    db.all("SELECT * FROM joueurs;", (err, rows) => {
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
