CREATE TABLE joueurs(
	id_joueur INTEGER PRIMARY KEY,
  email VARCHAR,
  mdp VARCHAR,
  golds INTEGER,
  diamants INTEGER,
  last_seen INTEGER
);

CREATE TABLE herosObtenus (
  id_joueur INTEGER NOT NULL,
  id_hero INTEGER NOT NULL,
  niveau INTEGER NOT NULL
);

CREATE TABLE niveauChance(
  rarete VARCHAR PRIMARY KEY,
  poids INTEGER
);

CREATE TABLE coutEvolution(
  niveau INTEGER PRIMARY KEY,
  cout INTEGER
);

CREATE TABLE guidePerso(
  id_hero INTEGER PRIMARY KEY,
  rarete VARCHAR,
  niveau_1 INTEGER,
  niveau_2 INTEGER,
  niveau_3 INTEGER,
  niveau_4 INTEGER,
  niveau_5 INTEGER
);

INSERT INTO joueurs(id_joueur, email, mdp, golds, diamants, last_seen) VALUES 
  (1, 'Jenshin@bruh.net', 'fgh', 3000, 100, strftime('%s','now'));

INSERT INTO niveauChance(rarete, poids) VALUES 
  ('commun', 90),
  ('rare', 7),
  ('ssr', 3);

INSERT INTO coutEvolution(niveau, cout) VALUES
  (1, 1000),
  (2, 3000),
  (3, 5000),
  (4, 10000),
  (5, 30000);

INSERT INTO guidePerso(id_hero, rarete, niveau_1, niveau_2, niveau_3, niveau_4, niveau_5) VALUES
  (1, 'commun' , 100, 200, 300, 400, 500),
  (2, 'rare', 30, 70, 150, 400, 700),
  (3, 'ssr', 150, 300, 350, 400, 420),
  (4, 'commun' , 50, 100, 200, 350, 550),
  (5, 'commun' , 150, 200, 250, 450, 500),
  (6, 'rare' , 50, 150, 250, 400, 650),
  (7, 'rare' , 150, 220, 300, 450, 600),
  (8, 'ssr' , 50, 100, 350, 500, 850),
  (9, 'ssr' , 20, 80, 200, 400, 1000),
  (10, 'commun' , 50, 150, 250, 350, 450),
  (11, 'commun' , 110, 210, 310, 410, 490);

INSERT INTO herosObtenus(id_joueur, id_hero, niveau) VALUES
  (1, 2, 1),
  (1, 1, 3);
