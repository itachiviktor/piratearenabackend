CREATE TABLE CharacterEntity (
    id int NOT NULL,
    name varchar(255) NOT NULL,
    PRIMARY KEY (ID)
);

INSERT INTO CharacterEntity(id, name) VALUES (1, 'Ace');
INSERT INTO CharacterEntity(id, name) VALUES (2, 'Alvida');
INSERT INTO CharacterEntity(id, name) VALUES (3, 'Arlong');
INSERT INTO CharacterEntity(id, name) VALUES (4, 'Basil');
INSERT INTO CharacterEntity(id, name) VALUES (5, 'Beckman');
INSERT INTO CharacterEntity(id, name) VALUES (6, 'Bepo');
INSERT INTO CharacterEntity(id, name) VALUES (7, 'Bogart');
INSERT INTO CharacterEntity(id, name) VALUES (8, 'Buggy');
INSERT INTO CharacterEntity(id, name) VALUES (9, 'Capone');
INSERT INTO CharacterEntity(id, name) VALUES (10, 'Coby');
INSERT INTO CharacterEntity(id, name) VALUES (11, 'Crocodile');
INSERT INTO CharacterEntity(id, name) VALUES (12, 'Doflamingo');
INSERT INTO CharacterEntity(id, name) VALUES (13, 'Ippon');
INSERT INTO CharacterEntity(id, name) VALUES (14, 'Jean');
INSERT INTO CharacterEntity(id, name) VALUES (15, 'Jonathan');
INSERT INTO CharacterEntity(id, name) VALUES (16, 'Law');
INSERT INTO CharacterEntity(id, name) VALUES (17, 'Luffy');
INSERT INTO CharacterEntity(id, name) VALUES (18, 'Marco');
INSERT INTO CharacterEntity(id, name) VALUES (19, 'Mihawk');
INSERT INTO CharacterEntity(id, name) VALUES (20, 'Nami');
INSERT INTO CharacterEntity(id, name) VALUES (21, 'Oars');
INSERT INTO CharacterEntity(id, name) VALUES (22, 'Richie');
INSERT INTO CharacterEntity(id, name) VALUES (23, 'Roo');
INSERT INTO CharacterEntity(id, name) VALUES (24, 'Sanji');
INSERT INTO CharacterEntity(id, name) VALUES (25, 'Shanks');
INSERT INTO CharacterEntity(id, name) VALUES (26, 'Spandam');
INSERT INTO CharacterEntity(id, name) VALUES (27, 'Usopp');
INSERT INTO CharacterEntity(id, name) VALUES (28, 'Yasopp');
INSERT INTO CharacterEntity(id, name) VALUES (29, 'Yosaku');
INSERT INTO CharacterEntity(id, name) VALUES (30, 'Zoro');

CREATE TABLE CharacterToUser (
    characterId int NOT NULL,
    userId int NOT NULL
);

-- Egy userhez így lehet sok karaktert hozzá rendelni
INSERT INTO CharacterToUser(characterId, userId) VALUES (1, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (2, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (3, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (4, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (5, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (6, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (7, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (8, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (10, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (11, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (12, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (13, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (14, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (15, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (16, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (17, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (18, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (19, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (20, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (21, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (22, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (23, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (24, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (25, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (26, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (27, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (28, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (29, 6);
INSERT INTO CharacterToUser(characterId, userId) VALUES (30, 6);
