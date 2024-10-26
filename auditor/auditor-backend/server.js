const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Make sure to include this
const connection = require('./db'); // Adjust the path if necessary

const app = express();
const port = process.env.PORT || 5000;

// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));

app.options('*', cors(corsOptions)); // Pre-flight request handling

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});


// Middleware to parse JSON request body
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// auditor login route
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const query = 'SELECT * FROM auditor WHERE email = ? AND password = ?';

  connection.query(query, [email, password], (error, results) => {
    if (error) {
      console.error('Error querying the database:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (results.length > 0) {
      res.status(200).json({ message: 'Login successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  });
});

// get tenants' data route
app.get('/api/tenants', (req, res) => {
  const query = 'SELECT IC, latitude, longitude, status FROM tenant';

  connection.query(query, (error, results) => {
    if (error) {
      console.error('Error fetching tenants:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(200).json(results);
  });
});

app.get('/', (req, res) => {
    res.send('Backend is running...');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
