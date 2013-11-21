CREATE TABLE user(
    userid INTEGER PRIMARY KEY ASC,
    username TEXT,
    password TEXT
);

CREATE TABLE state(
    stateid INTEGER PRIMARY KEY ASC,
    application TEXT,
    json TEXT,
    userid INTEGER,
    FOREIGN KEY(userid) REFERENCES user(userid)
);

-- Dummy user: default, default
INSERT INTO user(username, password) values('default', 'c21f969b5f03d33d43e04f8f136e7682');
