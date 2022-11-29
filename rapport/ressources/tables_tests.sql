CREATE TABLE Joueurs (
    id INTEGER PRIMARY KEY,
    email VARCHAR,
    mdp VARCHAR,
    golds INTEGER,
    diamants INTEGER
)

CREATE TABLE PersoObtenus (
    id_joueur INTEGER PRIMARY KEY,
    id_perso INTEGER,
    niveau INTEGER,
)

CREATE TABLE GuidePerso(
    id_perso INTEGER PRIMARY KEY,
    niveau1 INTEGER,
    niveau2 INTEGER,
    niveau3 INTEGER,
    niveau4 INTEGER,
    niveau5 INTEGER
)

CREATE TABLE NiveauChance(
    rarete VARCHAR PRIMARY KEY,
    poids INTEGER
)

CREATE TABLE CoutEvolution (
    niveau INTEGER PRIMARY KEY,
    cout INTEGER
)

