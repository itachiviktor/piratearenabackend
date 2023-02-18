CREATE TABLE ParameterStore (
    id int NOT NULL,
    name varchar(255) NOT NULL,
    paramValue varchar(255) NOT NULL,
    PRIMARY KEY (ID)
);

INSERT INTO ParameterStore(id, name, paramValue) VALUES (1, 'gameLocation', 'https://drive.google.com/file/d/1kOCuvbsT_y1P3PalZXFLkm9PJKgC0DJG/view?usp=sharing');

