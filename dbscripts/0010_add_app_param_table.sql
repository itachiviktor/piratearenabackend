CREATE TABLE AppParameter (
    id int NOT NULL AUTO_INCREMENT,
    paramName varchar(50) NOT NULL,
    paramValue varchar(255) NOT NULL,
    PRIMARY KEY (ID)
);

INSERT INTO AppParameter(paramName, paramValue) VALUES ('clientVersion','0.0.1');
