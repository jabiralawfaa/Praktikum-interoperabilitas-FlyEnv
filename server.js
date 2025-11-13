require('dotenv').config();
const { movieDb, directorDb } = require('./database.js');
const cors = require('cors');
const express = require('express');
const app = express();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {authenticateToken, authorizeRoles} = require('./middleware/auth.js');
const JWT_SECRET = process.env.JWT_SECRET;
const port = process.env.PORT || 5173;

// enable cors
app.use(cors());
// middleware data
app.use(express.json());

// AUTHENTICATION movie endpoints
app.post('/auth/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username dan Password (min 6 char) harus diisi' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ error: 'Gagal memproses pendaftaran' });
    }
    const sql = 'INSERT INTO users (username, password, role) VALUES (?,?,?)';
    const params = [username.toLowerCase(), hashedPassword,'user'];

    movieDb.run(sql, params, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Username sudah digunakan'})
        }
        console.error("Error inserting user : ", err);
        return res.status(500).json({ error: 'Gagal menyimpan pengguna' });
      }
      res.status(201).json({
        message: "Registrasi Berhasil",
        userId: this.lastID
      })
    });
  })
});

// SETELAH PENGUJIAN HAPUS/KOMEN
app.post('/auth/register-admin', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username dan Password (min 6 char) harus diisi' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ error: 'Gagal memproses pendaftaran' });
    }
    const sql = 'INSERT INTO users (username, password, role) VALUES (?,?,?)';
    const params = [username.toLowerCase(), hashedPassword,'admin'];

    movieDb.run(sql, params, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Username admin sudah digunakan'})
        }
        console.error("Error inserting user : ", err);
        return res.status(500).json({ error: 'Gagal menyimpan pengguna' });
      }
      res.status(201).json({
        message: "Registrasi Berhasil",
        userId: this.lastID
      })
    });
  })
});

app.post('/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username dan Password (min 6 char) harus diisi' });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  movieDb.get(sql, [username.toLowerCase()],(err,user) => {
    if (err || !user){
      return  res.status(400).json({ error: 'Kredensial tidak valid' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(400).json({ error: 'Kredensial tidak valid' });
      }

      const payload = {
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: '1h'}, (err, token) => {
        if (err) {
          console.error("Error signing token:", err);
          return res.status(500).json({ error: 'Gagal membuat token' });
        }
        res.json({
          message: 'Login Berhasil',
          token: token
        })
      })
    })
  });
});


// movie endpoints
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

app.post('/movies',authenticateToken, (req, res) => {
  console.log("Request POST/movies oleh user:", req.user.username);
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
app.put('/movies/:id', [authenticateToken, authorizeRoles('admin')], (req, res) => {
  console.log("Request PUT/movies oleh user:", req.user.username);
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
app.delete('/movies/:id', [authenticateToken, authorizeRoles('admin')], (req, res) => {
  console.log("Request DELETE/movies oleh user:", req.user.username);
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


// AUTHENTICATION director endpoints
app.post('/auth/director/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username dan Password (min 6 char) harus diisi' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ error: 'Gagal memproses pendaftaran' });
    }
    const sql = 'INSERT INTO users (username, password, role) VALUES (?,?,?)';
    const params = [username.toLowerCase(), hashedPassword, 'user'];

    directorDb.run(sql, params, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Username sudah digunakan'})
        }
        console.error("Error inserting user : ", err);
        return res.status(500).json({ error: 'Gagal menyimpan pengguna' });
      }
      res.status(201).json({
        message: "Registrasi Berhasil",
        userId: this.lastID
      })
    });
  })
});

app.post('/auth/director/register-admin', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username dan Password (min 6 char) harus diisi' });
  }

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      console.error("Error hashing password:", err);
      return res.status(500).json({ error: 'Gagal memproses pendaftaran' });
    }
    const sql = 'INSERT INTO users (username, password, role) VALUES (?,?,?)';
    const params = [username.toLowerCase(), hashedPassword, 'admin'];

    directorDb.run(sql, params, function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ error: 'Username admin sudah digunakan'})
        }
        console.error("Error inserting user : ", err);
        return res.status(500).json({ error: 'Gagal menyimpan pengguna' });
      }
      res.status(201).json({
        message: "Registrasi Berhasil",
        userId: this.lastID
      })
    });
  })
});

app.post('/auth/director/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password || password.length < 6) {
    return res.status(400).json({ error: 'Username dan Password (min 6 char) harus diisi' });
  }

  const sql = 'SELECT * FROM users WHERE username = ?';
  directorDb.get(sql, [username.toLowerCase()],(err,user) => {
    if (err || !user){
      return  res.status(400).json({ error: 'Kredensial tidak valid' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(400).json({ error: 'Kredensial tidak valid' });
      }

      const payload = {
        user: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      };

      jwt.sign(payload, JWT_SECRET, { expiresIn: '1h'}, (err, token) => {
        if (err) {
          console.error("Error signing token:", err);
          return res.status(500).json({ error: 'Gagal membuat token' });
        }
        res.json({
          message: 'Login Berhasil',
          token: token
        })
      })
    })
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

app.post('/directors',authenticateToken, (req, res) => {
  console.log("Request POST/directors oleh user:", req.user.username);
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

app.put('/directors/:id',[authenticateToken, authorizeRoles('admin')], (req, res) => {
  console.log("Request PUT/directors oleh user:", req.user.username);
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


app.delete('/directors/:id', [authenticateToken, authorizeRoles('admin')], (req, res) => {
  console.log("Request DELETE/directors oleh user:", req.user.username);
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