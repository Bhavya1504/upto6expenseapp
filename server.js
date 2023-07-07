const express = require('express');
const app = express();
const mysql = require('mysql');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL Connection
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'bhavya27465@',
  database: 'nodecomplete',
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL database: ' + err.stack);
    return;
  }
  console.log('Connected to MySQL database as id ' + connection.threadId);
});

// Set the path to the static files (signup.html and signup.js)
const staticPath = path.join(__dirname, '');

// Serve static files from the root directory
app.use(express.static(staticPath));

// Serve signup.html
app.get('/signup.html', (req, res) => {
  res.sendFile(path.join(staticPath, 'signup.html'));
});

// Serve signup.js
app.get('/signup.js', (req, res) => {
  res.sendFile(path.join(staticPath, 'signup.js'));
});

// Root Route
app.get('/', (req, res) => {
  res.redirect('/signup.html');
});

// Signup Route
app.post('/user/signup', (req, res) => {
  const { name, email, password } = req.body;

  // Check if the email already exists
  const checkEmailQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(checkEmailQuery, [email], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query: ' + error.stack);
      return res.status(500).json({ message: 'Failed to signup' });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash the password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password: ' + err.stack);
        return res.status(500).json({ message: 'Failed to signup' });
      }

      // Insert the new user into the database with hashed password
      const insertUserQuery = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
      connection.query(insertUserQuery, [name, email, hashedPassword], (err, result) => {
        if (err) {
          console.error('Error executing MySQL query: ' + err.stack);
          return res.status(500).json({ message: 'Failed to signup' });
        }

        return res.status(201).json({ message: 'Signup successful' });
      });
    });
  });
});

// Login Route
app.post('/user/login', (req, res) => {
  const { email, password } = req.body;

  // Retrieve the user from the database based on the email
  const getUserQuery = 'SELECT * FROM users WHERE email = ?';
  connection.query(getUserQuery, [email], (error, results) => {
    if (error) {
      console.error('Error executing MySQL query: ' + error.stack);
      return res.status(500).json({ message: 'Failed to login' });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = results[0];

    // Compare the provided password with the hashed password in the database
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords: ' + err.stack);
        return res.status(500).json({ message: 'Failed to login' });
      }

      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid email or password' });
      }

      // Login successful
      return res.status(200).json({ message: 'Login successful' });
    });
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
