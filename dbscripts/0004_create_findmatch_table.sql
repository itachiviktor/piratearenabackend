CREATE TABLE FindMatch (
    id int NOT NULL AUTO_INCREMENT,
    token1 varchar(255),
    player1Character1 int,
    player1Character2 int,
    player1Character3 int,
    token2 varchar(255),
    player2Character1 int,
    player2Character2 int,
    player2Character3 int,
    gameMode varchar(255),
    PRIMARY KEY (ID)
);

