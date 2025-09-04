const express = require('express');
const app = express();
const port = 5173;

// middleware data
app.use(express.json());


let movies = [
    {id: 1, title: "Avengers Doomsday", director: "Peter Jackson", year: 2026},
    {id: 2, title: "Wednesday Season 2", director: "Peter Jackson", year: 2025},
    {id: 3, title: "Josee: tiger and fish", director: "Peter Jackson", year: 2022},
];

let idSeq = movies.length ? Math.max(...movies.map(m => m.id)) + 1 : 1;

// console.log(movies);

app.get('/', (req,res) => {
    res.send('Selamat datang di server Node.js');
});

app.get('/api/movies', (req,res) => {
    res.json(movies);
})

app.get('/api/movies/:id', (req,res) => {
    const movie = movies.find(n => n.id === parseInt(req.params.id));
    if (movie) {
        res.json(movie);
    } else {
        res.status(404).send('movie not found!');
    }
});

app.post('/api/movies/', (req,res) => {
    const {title, director, year} = req.body || {};
    if (!title || !director || !year) {
        return res.status(400).json({error: 'title, director, year wajib diisi'})
    }
    const newMovie = {id: idSeq++, title, director, year};
    movies.push(newMovie);
    res.status(201).json(newMovie);
});

app.put('/api/movies/:id', (req,res) => {
    const id = Number(req.params.id);
    const movieIndex = movies.findIndex(n => n.id === id);

    if (movieIndex === -1) {
        return res.status(404).json({error : 'movie tidak ditemukan'})
    }

    const {title, director, year} = req.body || {};
    const updatedMovie = {id, title, director, year};
    movies[movieIndex] = updatedMovie;
    res.json(updatedMovie);
});

app.delete('/api/movies/:id', (req,res) => {
    const id = Number(req.params.id);
    const movieIndex = movies.findIndex(n => n.id === id);

    if (movieIndex == -1) {
        return res.status(404).json({error: 'Movie tidak ditemukan'});
    }
    movies.splice(movieIndex, 1);
    res.status(204).send();
})


app.listen(port, () => {
    console.log(`Server running on ${port}`);
});