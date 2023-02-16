CREATE TABLE UserEntity (
    id int NOT NULL AUTO_INCREMENT,
    username varchar(255) NOT NULL,
    password varchar(255) NOT NULL,
	token varchar(255),
    PRIMARY KEY (ID)
);

INSERT INTO UserEntity(username, password, token) VALUES ('itachiviktor','Rohadjmeg1',null);
INSERT INTO UserEntity(username, password, token) VALUES ('a','a',null);