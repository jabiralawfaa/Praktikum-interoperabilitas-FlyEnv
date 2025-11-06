require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();

const DBSOURCE_1 = process.env.DB_SOURCE_1;
const DBSOURCE_2 = process.env.DB_SOURCE_2;
let movieDb = new sqlite3.Database(DBSOURCE_1, (err) => {
    if (err) {
        console.error(err.message);
        throw err;
    } else {
        console.log('Connected to the SQLite database for movies.');
        movieDb.run(`CREATE TABLE IF NOT EXISTS movie (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title text,
            director text,
            year integer
            )`,
            (err) => {
                if (err) { // This error is for CREATE TABLE itself
                    console.error('Error creating movie table:', err.message);
                    return;
                }
                // Check if the table is empty before inserting data
                movieDb.get("SELECT COUNT(id) as count FROM movie", (err, row) => {
                    if (err) {
                        console.error('Error counting movies:', err.message);
                        return;
                    }
                    if (row.count === 0) {
                        console.log('Movie table is empty, seeding initial data...');
                        const insert = 'INSERT INTO movie (title, director, year) VALUES (?,?,?)';
                        movieDb.run(insert, ["The Shawshank Redemption", "Frank Darabont", 1994]);
                        movieDb.run(insert, ["The Godfather", "Francis Ford Coppola", 1972]);
                        movieDb.run(insert, ["The Dark Knight", "Christopher Nolan", 2008]);
                        movieDb.run(insert, ["Pulp Fiction", "Quentin Tarantino", 1994]);
                        movieDb.run(insert, ["Fight Club", "David Fincher", 1999]);
                    }
                });
            });

        movieDb.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username text NOT NULL UNIQUE,
            password text NOT NULL
            )`,
            (err) => {
                if (err) {
                    console.error('Error membuat tabel:', err.message);
                    return;
                }
            },
        );
    }
    
});



let directorDb = new sqlite3.Database(DBSOURCE_2, (err) => {
    if (err) {
        console.error(`Error connecting to directors DB: ${err.message}`);
        throw err;
    } else {
        console.log('Connected to the SQLite database for directors.');
        directorDb.run(`CREATE TABLE IF NOT EXISTS directors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            birthYear INTEGER
            )`, (err) => {
                if (err) {
                    console.error('Error creating directors table:', err.message);
                    return;
                }
                directorDb.get("SELECT COUNT(id) as count FROM directors", (err, row) => {
                    if (err) {
                        console.error('Error counting directors:', err.message);
                        return;
                    }
                    if (row.count === 0) {
                        console.log('Directors table is empty, seeding initial data...');
                        const insert = 'INSERT INTO directors (name, birthYear) VALUES (?,?)';
                        directorDb.run(insert, ["Frank Darabont", 1959]);
                        directorDb.run(insert, ["Francis Ford Coppola", 1939]);
                        directorDb.run(insert, ["Christopher Nolan", 1970]);
                        directorDb.run(insert, ["Quentin Tarantino", 1963]);
                        directorDb.run(insert, ["David Fincher", 1962]);
                    }
                });
            }
        );
        directorDb.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username text NOT NULL UNIQUE,
            password text NOT NULL
            )`,
            (err) => {
                if (err) {
                    console.error('Error membuat tabel:', err.message);
                    return;
                }
            },
        );

            
    }
});

module.exports = { movieDb, directorDb };