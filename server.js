require('dotenv').config();
const { movieDb, directorDb } = require('./database.js');
const cors = require('cors');
const express = require('express');
const app = express();
const port = process.env.PORT || 5173;

// enable cors
app.use(cors());
// middleware data
app.use(express.json());

app.get('/movies', (req, res) => {
  const sql = "SELECT * FROM movie ORDER BY id ASC"; // Menggunakan movieDb
  movieDb.all(sql, [], (err, rows) => {
    if (err) {
      // 500 Internal Server Error is more appropriate for DB errors
      res.status(500).json({"error": err.message});
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    })
  });
});

app.get('/movies/:id', (req, res) => {
  const sql = "SELECT * FROM movie WHERE id = ?";
  const params = [req.params.id]; // Menggunakan movieDb
  movieDb.get(sql, params, (err, row) => {
    if (err) {
      res.status(500).json({"error": err.message});
      return;
    }
    // Handle case where movie is not found
    if (!row) {
      res.status(404).json({"error": "Movie not found"});
      return;
    }
    res.json({
      "message": "success",
      "data": row
    })
  });
});

app.post('/movies', (req, res) => {
    const { title, director, year } = { 
    ...req.query, 
    ...req.body 
  };
  

  if (!title || !director || !year) {
    return res.status(400).json({ 
      error: "Missing required fields: title, director, and year are required" 
    });
  }


if (isNaN(year) || year < 1800 || year > new Date().getFullYear() + 5) {
    return res.status(400).json({ 
      error: "Year must be a valid number between 1800 and current year + 5" 
    });
  }


  const sql = 'INSERT INTO movie (title, director, year) VALUES (?, ?, ?)'; // Menggunakan movieDb
  movieDb.run(sql, [title, director, year], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      message: "success",
      data: {
        id: this.lastID, 
        title, 
        director, 
        year: parseInt(year)
      }
    });
  });
});

// PUT (update) an existing movie
app.put('/movies/:id', (req, res) => {
  const { title, director, year } = {
    ...req.query,
    ...req.body
  };
  const id = req.params.id;

  if (!title || !director || !year) {
    return res.status(400).json({
      error: "Missing required fields: title, director, and year are required"
    });
  }

  if (isNaN(year) || year < 1800 || year > new Date().getFullYear() + 5) {
    return res.status(400).json({
      error: "Year must be a valid number between 1800 and current year + 5"
    });
  }

  const sql = 'UPDATE movie SET title = ?, director = ?, year = ? WHERE id = ?';
  movieDb.run(sql, [title, director, year, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json({
      message: "success",
      data: {
        id: parseInt(id),
        title,
        director,
        year: parseInt(year)
      },
      changes: this.changes
    });
  });
});

// DELETE a movie
app.delete('/movies/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM movie WHERE id = ?';
  movieDb.run(sql, id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Movie not found" });
    }
    res.json({
      message: "deleted",
      changes: this.changes,
      id: parseInt(id)
    });
  });
});

// --- Directors Endpoints ---
app.get('/directors', (req, res) => {
  const sql = "SELECT * FROM directors ORDER BY id ASC";
  directorDb.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({"error": err.message});
      return;
    }
    res.json({
      "message": "success",
      "data": rows
    })
  });
});

app.get('/directors/:id', (req, res) => {
  const sql = "SELECT * FROM directors WHERE id = ?";
  const params = [req.params.id];
  directorDb.get(sql, params, (err, row) => {
    if (err) {
      res.status(500).json({"error": err.message});
      return;
    }
    if (!row) {
      res.status(404).json({"error": "Director not found"});
      return;
    }
    res.json({
      "message": "success",
      "data": row
    })
  });
});

app.post('/directors', (req, res) => {
  const { name, birthYear } = {
    ...req.query,
    ...req.body
  };

  if (!name || !birthYear) {
    return res.status(400).json({
      error: "Missing required fields: name and birthYear are required"
    });
  }

  if (isNaN(birthYear) || birthYear < 1800 || birthYear > new Date().getFullYear()) {
    return res.status(400).json({
      error: "birthYear must be a valid number between 1800 and the current year"
    });
  }

  const sql = 'INSERT INTO directors (name, birthYear) VALUES (?, ?)';
  directorDb.run(sql, [name, birthYear], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: "success",
      data: {
        id: this.lastID,
        name,
        birthYear: parseInt(birthYear)
      }
    });
  });
});

app.put('/directors/:id', (req, res) => {
  const { name, birthYear } = {
    ...req.query,
    ...req.body
  };
  const id = req.params.id;

  if (!name || !birthYear) {
    return res.status(400).json({
      error: "Missing required fields: name and birthYear are required"
    });
  }

  if (isNaN(birthYear) || birthYear < 1800 || birthYear > new Date().getFullYear()) {
    return res.status(400).json({
      error: "birthYear must be a valid number between 1800 and the current year"
    });
  }

  const sql = 'UPDATE directors SET name = ?, birthYear = ? WHERE id = ?';
  directorDb.run(sql, [name, birthYear, id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Director not found" });
    }
    res.json({
      message: "success",
      data: {
        id: parseInt(id),
        name,
        birthYear: parseInt(birthYear)
      },
      changes: this.changes
    });
  });
});


app.delete('/directors/:id', (req, res) => {
  const id = req.params.id;
  const sql = 'DELETE FROM directors WHERE id = ?';
  directorDb.run(sql, id, function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Director not found" });
    }
    res.json({
      message: "deleted",
      changes: this.changes,
      id: parseInt(id)
    });
  });
});

// --- End Directors Endpoints ---

app.get('/status', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});


app.use((req, res) => {
  res.status(404).json({error: 'Route not found'});
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});