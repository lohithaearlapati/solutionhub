const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const session = require('express-session');
const bcrypt = require('bcrypt'); // Include bcrypt for password hashing
const MySQLStore = require('express-mysql-session')(session); // For session storage in MySQL

const app = express();
const port = 5000;

app.use(cors({
  origin: 'http://localhost:3000', // Your client-side URL
  credentials: true // Allow credentials (cookies, headers) to be sent
}));

// Use JSON middleware to parse JSON requests
app.use(express.json());
app.use((req, res, next) => {
  console.log('Session:', req.session); // Debugging purpose
  next();
});

// Create a MySQL connection pool
const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '1234',
  database: 'solutionhub',
  connectionLimit: 10 // Number of connections in pool
});
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error establishing database connection:', err);
    return;
  }
  console.log('Connected to the database');
  connection.release(); // Release the connection back to the pool
});

// Set up session store in MySQL
const sessionStore = new MySQLStore({}, db);

// Set up session management
app.use(session({
  secret: '12345', // Replace with a strong secret key
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  cookie: {
    secure: false, // Set to true if using HTTPS
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
  console.log('Session Data in checkAuth:', req.session); // Add logging
  if (!req.session.username) {
    return res.status(401).send('Unauthorized');
  }
  next();
};

// Registration route
app.post('/register', (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).send('All fields are required');
  }

  // Check if the user already exists
  const checkUserSql = 'SELECT * FROM users WHERE username = ? OR email = ?';
  db.query(checkUserSql, [username, email], (err, results) => {
    if (err) {
      console.error('Error during user check:', err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      // User already exists
      return res.status(409).send('User already exists');
    } else {
      // Hash the password before storing it
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          console.error('Error hashing password:', err);
          return res.status(500).send('Server error');
        }

        // Insert new user into the database
        const insertUserSql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
        db.query(insertUserSql, [username, hashedPassword, email], (err, result) => {
          if (err) {
            console.error('Error during user registration:', err);
            return res.status(500).send('Error registering user');
          }
          res.send('Registration successful');
        });
      });
    }
  });
});

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }

  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error('Error during query:', err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      bcrypt.compare(password, results[0].password, (err, isMatch) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return res.status(500).send('Server error');
        }

        if (isMatch) {
          req.session.username = username; // Set session data
          console.log('Login successful, session data:', req.session); // Add logging
          res.send('Login successful');
        } else {
          res.status(401).send('Invalid username or password');
        }
      });
    } else {
      res.status(401).send('Invalid username or password');
    }
  });
});

// Fetch all subjects
app.get('/subjects', (req, res) => {
  const sql = 'SELECT subject_name FROM subjects';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching subjects:', err);
      return res.status(500).send('Error fetching subjects');
    }
    res.json(results.map(row => row.subject_name));
  });
});

// Add a new subject
app.post('/subjects', checkAuth, (req, res) => {
  const { subject_name } = req.body;
  const username = req.session.username;

  if (!subject_name || !username) {
    return res.status(400).send('Subject name and username are required');
  }

  // Check if the subject already exists
  const checkSql = 'SELECT * FROM subjects WHERE subject_name = ?';
  db.query(checkSql, [subject_name], (err, results) => {
    if (err) {
      console.error('Error checking subject:', err);
      return res.status(500).send('Server error');
    }

    if (results.length > 0) {
      return res.status(409).send('Subject already exists');
    }

    // Insert the new subject
    const insertSql = 'INSERT INTO subjects (subject_name, username) VALUES (?, ?)';
    db.query(insertSql, [subject_name, username], (err, result) => {
      if (err) {
        console.error('Error inserting subject:', err);
        return res.status(500).send('Error adding subject');
      }
      res.send('Subject added successfully');
    });
  });
});

// Fetch topics for a specific subject
app.get('/subjects/:subjectName/topics', (req, res) => {
  const subjectName = req.params.subjectName;
  
  // Query to fetch topics related to the subject
  const sql = 'SELECT topic_name FROM topics WHERE subject_name = ?';
  db.query(sql, [subjectName], (err, results) => {
    if (err) {
      console.error('Error fetching topics:', err);
      return res.status(500).send('Error fetching topics');
    }
    res.json(results.map(row => row.topic_name)); // Send back the list of topics
  });
});

// Add a new topic
app.post('/subjects/:subjectName/topics', checkAuth, (req, res) => {
  const { topic_name } = req.body;
  const subjectName = req.params.subjectName;
  const username = req.session.username;

  if (!topic_name) {
    return res.status(400).send('Topic name is required');
  }

  // Insert the new topic
  const insertTopicSql = 'INSERT INTO topics (topic_name, subject_name, username) VALUES (?, ?, ?)';
  db.query(insertTopicSql, [topic_name, subjectName, username], (err, result) => {
    if (err) {
      console.error('Error inserting topic:', err);
      return res.status(500).send('Error adding topic');
    }
    res.send('Topic added successfully');
  });
});
app.post('/topics/:topicName/solutions', (req, res) => {
  const { topicName } = req.params;
  const { content, username } = req.body;

  // Validate input
  if (!content || !username) {
    return res.status(400).send('Content and username are required');
  }

  // Insert the new solution into the database
  const insertSolutionSql = 'INSERT INTO solutions (content, username, topic_name) VALUES (?, ?, ?)';
  db.query(insertSolutionSql, [content, username, topicName], (err, result) => {
    if (err) {
      console.error('Error inserting solution:', err);
      return res.status(500).send('Error adding solution');
    }
    res.send('Solution added successfully');
  });
});

// New endpoint to fetch solutions for a specific topic
app.get('/topics/:topicName/solutions', (req, res) => {
  const topicName = req.params.topicName;

  const sql = 'SELECT * FROM solutions WHERE topic_name = ?';
  db.query(sql, [topicName], (err, results) => {
    if (err) {
      console.error('Error fetching solutions:', err);
      return res.status(500).send('Error fetching solutions');
    }
    res.json(results);
  });
});
// Fetch solutions for a specific topic
app.get('/topics/:topicName/solutions', (req, res) => {
  const topicName = req.params.topicName;

  const sql = 'SELECT id, content, username, upvotes FROM solutions WHERE topic_name = ?';
  db.query(sql, [topicName], (err, results) => {
    if (err) {
      console.error('Error fetching solutions:', err);
      return res.status(500).send('Error fetching solutions');
    }
    res.json(results); // Return the results as JSON
  });
});
// Upvote a solution
// Backend route for upvoting a solution
app.post('/topics/:topicName/solutions/:solutionId/upvote', (req, res) => {
  const { solutionId } = req.params;
  const userId = req.session.username; // Assuming user session stores the username

  // Check if the user has already upvoted this solution
  const checkUpvoteSql = 'SELECT * FROM user_upvotes WHERE user_id = ? AND solution_id = ?';
  db.query(checkUpvoteSql, [userId, solutionId], (err, results) => {
    if (err) {
      console.error('Error checking upvotes:', err);
      return res.status(500).send('Error checking upvotes');
    }

    if (results.length > 0) {
      return res.status(400).send('You already upvoted this solution!');
    } else {
      // Proceed with upvoting
      const upvoteSql = 'UPDATE solutions SET upvotes = upvotes + 1 WHERE id = ?';
      db.query(upvoteSql, [solutionId], (err, result) => {
        if (err) {
          console.error('Error updating upvotes:', err);
          return res.status(500).send('Error upvoting solution');
        }

        // Record the upvote in user_upvotes table
        const insertUpvoteSql = 'INSERT INTO user_upvotes (user_id, solution_id) VALUES (?, ?)';
        db.query(insertUpvoteSql, [userId, solutionId], (err, result) => {
          if (err) {
            console.error('Error recording upvote:', err);
            return res.status(500).send('Error recording upvote');
          }
          return res.status(200).send('Upvoted successfully');
        });
      });
    }
  });
});
app.post('/subjects/delete', (req, res) => {
  const { subject_name, username } = req.body;

  if (!subject_name || !username) {
    return res.status(400).send('Subject name and username are required');
  }

  const deleteQuery = 'DELETE FROM subjects WHERE name = ? AND username = ?';

  db.query(deleteQuery, [subject_name, username], (err, result) => {
    if (err) {
      console.error('Error deleting subject:', err);
      return res.status(500).send('Error deleting subject');
    }

    if (result.affectedRows === 0) {
      return res.status(404).send('Subject not found or you do not have permission to delete it');
    }

    res.send('Subject deleted successfully');
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
