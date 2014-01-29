-- SQLite3 Datatype Affinity: http://www.sqlite.org/datatype3.html
CREATE TABLE project(
    id INTEGER PRIMARY KEY ASC,
    name VARCHAR(255) NOT NULL,
    state BLOB,
    created DATETIME,
    createdBy INTEGER,
    lastModified DATETIME,
    lastModifiedBy INTEGER,

    UNIQUE (name),
    FOREIGN KEY (createdBy) REFERENCES user(id),
    FOREIGN KEY (lastModifiedBy) REFERENCES user(id)
);

CREATE TABLE user(
    id INTEGER PRIMARY KEY ASC,
    login VARCHAR(50) NOT NULL,
    password VARCHAR(32) NOT NULL,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    created DATETIME,
    createdBy INTEGER,
    lastModified DATETIME,
    lastModifiedBy INTEGER,

    UNIQUE (login),
    FOREIGN KEY (createdBy) REFERENCES user(id),
    FOREIGN KEY (lastModifiedBy) REFERENCES user(id)
);

-- Dummy user:
INSERT INTO user (login, firstName, password)
    values ('default', 'default', 'c21f969b5f03d33d43e04f8f136e7682');
